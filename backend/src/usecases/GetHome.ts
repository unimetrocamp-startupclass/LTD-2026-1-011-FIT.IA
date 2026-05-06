import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

import { ValidationError } from "../erros/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const weekDayOrder: Record<WeekDay, number> = {
  [WeekDay.MONDAY]: 1,
  [WeekDay.TUESDAY]: 2,
  [WeekDay.WEDNESDAY]: 3,
  [WeekDay.THURSDAY]: 4,
  [WeekDay.FRIDAY]: 5,
  [WeekDay.SATURDAY]: 6,
  [WeekDay.SUNDAY]: 7,
};

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId?: string;
  todayWorkoutDay?: {
    workoutPlanId: string;
    id: string;
    name: string;
    isRest: boolean;
    weekDay: WeekDay;
    estimatedDurationInSeconds: number;
    coverImageUrl?: string;
    exercisesCount: number;
  };
  workoutStreak: number;
  consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    }
  >;
}

interface WorkoutDayDto {
  id: string;
  name: string;
  isRest: boolean;
  weekDay: WeekDay;
  estimatedDurationInSeconds: number;
  coverImageUrl: string | null;
  exercises: Array<{ id: string }>;
}

interface WorkoutSessionDto {
  startedAt: Date;
  completedAt: Date | null;
}

export class GetHome {
  async execute(dto: InputDto): Promise<OutputDto> {
    const currentDate = dayjs.utc(dto.date, "YYYY-MM-DD", true);
    if (!currentDate.isValid()) {
      throw new ValidationError("Invalid date");
    }

    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId: dto.userId, isActive: true },
      select: {
        id: true,
        workoutDays: {
          select: {
            id: true,
            name: true,
            isRest: true,
            weekDay: true,
            estimatedDurationInSeconds: true,
            coverImageUrl: true,
            exercises: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!workoutPlan) {
      return {
        activeWorkoutPlanId: undefined,
        todayWorkoutDay: undefined,
        workoutStreak: 0,
        consistencyByDay: this.buildEmptyConsistency(currentDate),
      };
    }

    const workoutDaysByWeekDay = this.buildWorkoutDaysByWeekDay(
      workoutPlan.workoutDays,
    );
    const todayWeekDay = this.getWeekDayFromDate(currentDate);
    const todayWorkoutDay = workoutDaysByWeekDay.get(todayWeekDay);

    const weekStart = currentDate.startOf("week");
    const weekEnd = currentDate.endOf("week");
    const streakStart = currentDate.subtract(365, "day").startOf("day");
    const streakEnd = currentDate.endOf("day");

    const workoutSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlanId: workoutPlan.id,
        },
        OR: [
          {
            startedAt: {
              gte: weekStart.toDate(),
              lte: weekEnd.toDate(),
            },
          },
          {
            completedAt: {
              not: null,
            },
            startedAt: {
              gte: streakStart.toDate(),
              lte: streakEnd.toDate(),
            },
          },
        ],
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const sessionsByDate = this.groupSessionsByDate(workoutSessions);
    const consistencyByDay = this.calculateConsistencyByDay({
      weekStart,
      sessionsByDate,
    });
    const completedDates = new Set(
      workoutSessions
        .filter((session) => {
          const sessionStartedAt = dayjs.utc(session.startedAt);

          return (
            session.completedAt !== null &&
            sessionStartedAt.valueOf() >= streakStart.valueOf() &&
            sessionStartedAt.valueOf() <= streakEnd.valueOf()
          );
        })
        .map((session) => this.formatDateKey(session.startedAt)),
    );
    const workoutStreak = this.calculateStreak(
      workoutPlan.workoutDays,
      completedDates,
      currentDate,
    );

    return {
      activeWorkoutPlanId: workoutPlan.id,
      todayWorkoutDay: todayWorkoutDay
        ? {
            workoutPlanId: workoutPlan.id,
            id: todayWorkoutDay.id,
            name: todayWorkoutDay.name,
            isRest: todayWorkoutDay.isRest,
            weekDay: todayWorkoutDay.weekDay,
            estimatedDurationInSeconds:
              todayWorkoutDay.estimatedDurationInSeconds,
            coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
            exercisesCount: todayWorkoutDay.exercises.length,
          }
        : undefined,
      workoutStreak,
      consistencyByDay,
    };
  }

  private buildWorkoutDaysByWeekDay(
    workoutDays: WorkoutDayDto[],
  ): Map<WeekDay, WorkoutDayDto> {
    return new Map(
      workoutDays.map((workoutDay) => [workoutDay.weekDay, workoutDay]),
    );
  }

  private buildEmptyConsistency(
    currentDate: dayjs.Dayjs,
  ): OutputDto["consistencyByDay"] {
    const weekStart = currentDate.startOf("week");
    const consistencyByDay: OutputDto["consistencyByDay"] = {};

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dateKey = weekStart.add(dayOffset, "day").format("YYYY-MM-DD");

      consistencyByDay[dateKey] = {
        workoutDayCompleted: false,
        workoutDayStarted: false,
      };
    }

    return consistencyByDay;
  }

  private groupSessionsByDate(
    sessions: WorkoutSessionDto[],
  ): Map<string, WorkoutSessionDto[]> {
    const sessionsByDate = new Map<string, WorkoutSessionDto[]>();

    for (const session of sessions) {
      const dateKey = this.formatDateKey(session.startedAt);
      const dateSessions = sessionsByDate.get(dateKey) ?? [];

      dateSessions.push(session);
      sessionsByDate.set(dateKey, dateSessions);
    }

    return sessionsByDate;
  }

  private calculateConsistencyByDay({
    weekStart,
    sessionsByDate,
  }: {
    weekStart: dayjs.Dayjs;
    sessionsByDate: Map<string, WorkoutSessionDto[]>;
  }): OutputDto["consistencyByDay"] {
    const consistencyByDay: OutputDto["consistencyByDay"] = {};

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dateKey = weekStart.add(dayOffset, "day").format("YYYY-MM-DD");
      const daySessions = sessionsByDate.get(dateKey) ?? [];

      consistencyByDay[dateKey] = {
        workoutDayStarted: daySessions.length > 0,
        workoutDayCompleted: daySessions.some(
          (session) => session.completedAt !== null,
        ),
      };
    }

    return consistencyByDay;
  }

  private calculateStreak(
    workoutDays: WorkoutDayDto[],
    completedDates: Set<string>,
    currentDate: dayjs.Dayjs,
  ): number {
    const planWeekDays = new Set(workoutDays.map((day) => day.weekDay));
    const restWeekDays = new Set(
      workoutDays.filter((day) => day.isRest).map((day) => day.weekDay),
    );

    let streak = 0;
    let day = currentDate;

    for (let i = 0; i < 365; i++) {
      const weekDay = this.getWeekDayFromDate(day);

      if (!planWeekDays.has(weekDay)) {
        day = day.subtract(1, "day");
        continue;
      }

      if (restWeekDays.has(weekDay)) {
        streak++;
        day = day.subtract(1, "day");
        continue;
      }

      const dateKey = day.format("YYYY-MM-DD");
      if (completedDates.has(dateKey)) {
        streak++;
        day = day.subtract(1, "day");
        continue;
      }

      break;
    }

    return streak;
  }

  private getWeekDayFromDate(date: dayjs.Dayjs): WeekDay {
    const dayOrder = date.day() === 0 ? 7 : date.day();

    return (Object.keys(weekDayOrder) as WeekDay[]).find(
      (weekDay) => weekDayOrder[weekDay as WeekDay] === dayOrder,
    ) as WeekDay;
  }

  private formatDateKey(date: Date): string {
    return dayjs.utc(date).format("YYYY-MM-DD");
  }
}
