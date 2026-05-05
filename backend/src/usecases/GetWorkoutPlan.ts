import { NotFoundError } from "../erros/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
}

interface OutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    id: string;
    weekDay: WeekDay;
    name: string;
    isRest: boolean;
    coverImageUrl?: string;
    estimatedDurationInSeconds: number;
    exercisesCount: number;
  }>;
}

const weekDayOrder: Record<WeekDay, number> = {
  [WeekDay.MONDAY]: 1,
  [WeekDay.TUESDAY]: 2,
  [WeekDay.WEDNESDAY]: 3,
  [WeekDay.THURSDAY]: 4,
  [WeekDay.FRIDAY]: 5,
  [WeekDay.SATURDAY]: 6,
  [WeekDay.SUNDAY]: 7,
};

export class GetWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: dto.workoutPlanId,
        userId: dto.userId,
      },
      select: {
        id: true,
        name: true,
        workoutDays: {
          select: {
            id: true,
            weekDay: true,
            name: true,
            isRest: true,
            coverImageUrl: true,
            estimatedDurationInSeconds: true,
            _count: {
              select: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundError("Workout plan not found");
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      workoutDays: workoutPlan.workoutDays
        .toSorted(
          (leftWorkoutDay, rightWorkoutDay) =>
            weekDayOrder[leftWorkoutDay.weekDay] -
            weekDayOrder[rightWorkoutDay.weekDay],
        )
        .map((workoutDay) => ({
          id: workoutDay.id,
          weekDay: workoutDay.weekDay,
          name: workoutDay.name,
          isRest: workoutDay.isRest,
          coverImageUrl: workoutDay.coverImageUrl ?? undefined,
          estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
          exercisesCount: workoutDay._count.exercises,
        })),
    };
  }
}
