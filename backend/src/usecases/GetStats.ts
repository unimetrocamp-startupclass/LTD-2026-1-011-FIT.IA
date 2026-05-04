import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

import { NotFoundError, ValidationError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

interface InputDto {
  userId: string;
  from: string;
  to: string;
}

interface OutputDto {
  workoutStreak: number;
  consistencyByDay: Record<
    string,
    {
      workoutDayCompleted: boolean;
      workoutDayStarted: boolean;
    }
  >;
  completedWorkoutsCount: number;
  conclusionRate: number;
  totalTimeInSeconds: number;
}

interface WorkoutSessionStats {
  startedAt: Date;
  completedAt: Date | null;
}

interface CompletedWorkoutSessionStats {
  startedAt: Date;
  completedAt: Date;
}

export class GetStats {
  async execute(dto: InputDto): Promise<OutputDto> {
    const from = dayjs.utc(dto.from, "YYYY-MM-DD", true);
    const to = dayjs.utc(dto.to, "YYYY-MM-DD", true);

    if (!from.isValid() || !to.isValid()) {
      throw new ValidationError("Invalid date range");
    }

    if (from.isAfter(to)) {
      throw new ValidationError("From date must be before or equal to to date");
    }

    const rangeStart = from.startOf("day");
    const rangeEnd = to.endOf("day");

    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: dto.userId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!activeWorkoutPlan) {
      throw new NotFoundError("Active workout plan not found");
    }

    const workoutSessions = await prisma.workoutSession.findMany({
      where: {
        workoutDay: {
          workoutPlanId: activeWorkoutPlan.id,
        },
        startedAt: {
          gte: rangeStart.toDate(),
          lte: rangeEnd.toDate(),
        },
      },
      select: {
        startedAt: true,
        completedAt: true,
      },
    });

    const consistencyByDay = this.buildConsistencyByDay(workoutSessions);
    const completedSessions = workoutSessions.filter(
      (
        workoutSession,
      ): workoutSession is CompletedWorkoutSessionStats =>
        workoutSession.completedAt !== null,
    );
    const completedWorkoutsCount = completedSessions.length;

    return {
      workoutStreak: this.calculateWorkoutStreak({
        from,
        to,
        completedSessionDates: this.getCompletedSessionDates(completedSessions),
      }),
      consistencyByDay,
      completedWorkoutsCount,
      conclusionRate:
        workoutSessions.length === 0
          ? 0
          : completedWorkoutsCount / workoutSessions.length,
      totalTimeInSeconds: this.calculateTotalTimeInSeconds(completedSessions),
    };
  }

  private buildConsistencyByDay(
    workoutSessions: WorkoutSessionStats[],
  ): OutputDto["consistencyByDay"] {
    const consistencyByDay: OutputDto["consistencyByDay"] = {};

    for (const workoutSession of workoutSessions) {
      const dateKey = dayjs.utc(workoutSession.startedAt).format("YYYY-MM-DD");
      consistencyByDay[dateKey] ??= {
        workoutDayCompleted: false,
        workoutDayStarted: false,
      };

      consistencyByDay[dateKey].workoutDayStarted = true;
      consistencyByDay[dateKey].workoutDayCompleted =
        consistencyByDay[dateKey].workoutDayCompleted ||
        workoutSession.completedAt !== null;
    }

    return consistencyByDay;
  }

  private calculateTotalTimeInSeconds(
    workoutSessions: CompletedWorkoutSessionStats[],
  ): number {
    return workoutSessions.reduce((totalTimeInSeconds, workoutSession) => {
      return (
        totalTimeInSeconds +
        dayjs
          .utc(workoutSession.completedAt)
          .diff(dayjs.utc(workoutSession.startedAt), "second")
      );
    }, 0);
  }

  private getCompletedSessionDates(
    completedSessions: CompletedWorkoutSessionStats[],
  ): Set<string> {
    return new Set(
      completedSessions.map((workoutSession) =>
        dayjs.utc(workoutSession.startedAt).format("YYYY-MM-DD"),
      ),
    );
  }

  private calculateWorkoutStreak({
    from,
    to,
    completedSessionDates,
  }: {
    from: dayjs.Dayjs;
    to: dayjs.Dayjs;
    completedSessionDates: Set<string>;
  }): number {
    let currentStreak = 0;
    let maxStreak = 0;
    let currentDate = from;

    while (currentDate.isBefore(to) || currentDate.isSame(to, "day")) {
      if (completedSessionDates.has(currentDate.format("YYYY-MM-DD"))) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }

      currentDate = currentDate.add(1, "day");
    }

    return maxStreak;
  }
}
