import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

import { NotFoundError, ValidationError } from "../erros/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

interface InputDto {
  userId: string;
  date: string;
}

interface OutputDto {
  activeWorkoutPlanId: string;
  todayWorkoutDay: {
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

const weekDaysByDayjsIndex = [
  WeekDay.SUNDAY,
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
] as const;

export class GetHome {
  async execute(dto: InputDto): Promise<OutputDto> {
    const referenceDate = dayjs.utc(dto.date, "YYYY-MM-DD", true);
    if (!referenceDate.isValid()) {
      throw new ValidationError("Invalid date");
    }

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true,
      },
      include: {
        workoutDays: {
          include: {
            _count: {
              select: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    if (!activeWorkoutPlan) {
      throw new NotFoundError("Active workout plan not found");
    }

    const todayWeekDay = weekDaysByDayjsIndex[referenceDate.day()];
    const todayWorkoutDay = activeWorkoutPlan.workoutDays.find(
      (workoutDay) => workoutDay.weekDay === todayWeekDay,
    );

    if (!todayWorkoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const weekStart = referenceDate.startOf("week");
    const weekEnd = referenceDate.endOf("week");

    const weeklySessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlanId: activeWorkoutPlan.id,
        },
        startedAt: {
          gte: weekStart.toDate(),
          lte: weekEnd.toDate(),
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const consistencyByDay = this.buildConsistencyByDay({
      weekStart,
      weeklySessions,
    });

    const completedSessionDates = await this.getCompletedSessionDates(
      activeWorkoutPlan.id,
    );

    return {
      activeWorkoutPlanId: activeWorkoutPlan.id,
      todayWorkoutDay: {
        workoutPlanId: activeWorkoutPlan.id,
        id: todayWorkoutDay.id,
        name: todayWorkoutDay.name,
        isRest: todayWorkoutDay.isRest,
        weekDay: todayWorkoutDay.weekDay,
        estimatedDurationInSeconds: todayWorkoutDay.estimatedDurationInSeconds,
        coverImageUrl: todayWorkoutDay.coverImageUrl ?? undefined,
        exercisesCount: todayWorkoutDay._count.exercises,
      },
      workoutStreak: this.calculateWorkoutStreak({
        referenceDate,
        completedSessionDates,
      }),
      consistencyByDay,
    };
  }

  private buildConsistencyByDay({
    weekStart,
    weeklySessions,
  }: {
    weekStart: dayjs.Dayjs;
    weeklySessions: Array<{
      startedAt: Date;
      completedAt: Date | null;
    }>;
  }): OutputDto["consistencyByDay"] {
    const consistencyByDay: OutputDto["consistencyByDay"] = {};

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dateKey = weekStart.add(dayOffset, "day").format("YYYY-MM-DD");
      consistencyByDay[dateKey] = {
        workoutDayCompleted: false,
        workoutDayStarted: false,
      };
    }

    for (const workoutSession of weeklySessions) {
      const dateKey = dayjs.utc(workoutSession.startedAt).format("YYYY-MM-DD");
      const consistency = consistencyByDay[dateKey];

      if (!consistency) {
        continue;
      }

      // UTC calendar day merge is deterministic: completed and started are OR'ed,
      // so any completed session wins over sessions that were only started.
      consistency.workoutDayStarted = true;
      consistency.workoutDayCompleted =
        consistency.workoutDayCompleted || workoutSession.completedAt !== null;
    }

    return consistencyByDay;
  }

  private async getCompletedSessionDates(
    workoutPlanId: string,
  ): Promise<Set<string>> {
    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlanId,
        },
        completedAt: {
          not: null,
        },
      },
      select: {
        startedAt: true,
      },
    });

    return new Set(
      completedSessions.map((workoutSession) =>
        dayjs.utc(workoutSession.startedAt).format("YYYY-MM-DD"),
      ),
    );
  }

  private calculateWorkoutStreak({
    referenceDate,
    completedSessionDates,
  }: {
    referenceDate: dayjs.Dayjs;
    completedSessionDates: Set<string>;
  }): number {
    let streak = 0;
    let currentDate = referenceDate;

    while (completedSessionDates.has(currentDate.format("YYYY-MM-DD"))) {
      streak++;
      currentDate = currentDate.subtract(1, "day");
    }

    return streak;
  }
}
