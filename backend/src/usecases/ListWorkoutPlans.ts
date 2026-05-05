import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  active?: boolean;
}

interface OutputDto {
  workoutPlans: Array<{
    id: string;
    name: string;
    isActive: boolean;
    workoutDays: Array<{
      id: string;
      workoutPlanId: string;
      name: string;
      isRest: boolean;
      weekDay: WeekDay;
      coverImageUrl?: string;
      estimatedDurationInSeconds: number;
      exercises: Array<{
        id: string;
        workoutDayId: string;
        name: string;
        sets: number;
        reps: number;
        order: number;
        restTimeInSeconds: number;
      }>;
    }>;
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

export class ListWorkoutPlans {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlans = await prisma.workoutPlan.findMany({
      where: {
        userId: dto.userId,
        ...(dto.active !== undefined ? { isActive: dto.active } : {}),
      },
      orderBy: [
        {
          isActive: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        name: true,
        isActive: true,
        workoutDays: {
          select: {
            id: true,
            workoutPlanId: true,
            name: true,
            isRest: true,
            weekDay: true,
            coverImageUrl: true,
            estimatedDurationInSeconds: true,
            exercises: {
              orderBy: {
                order: "asc",
              },
              select: {
                id: true,
                workoutDayId: true,
                name: true,
                sets: true,
                reps: true,
                order: true,
                restTimeInSeconds: true,
              },
            },
          },
        },
      },
    });

    return {
      workoutPlans: workoutPlans.map((workoutPlan) => ({
        id: workoutPlan.id,
        name: workoutPlan.name,
        isActive: workoutPlan.isActive,
        workoutDays: workoutPlan.workoutDays
          .toSorted(
            (leftWorkoutDay, rightWorkoutDay) =>
              weekDayOrder[leftWorkoutDay.weekDay] -
              weekDayOrder[rightWorkoutDay.weekDay],
          )
          .map((workoutDay) => ({
            id: workoutDay.id,
            workoutPlanId: workoutDay.workoutPlanId,
            name: workoutDay.name,
            isRest: workoutDay.isRest,
            weekDay: workoutDay.weekDay,
            coverImageUrl: workoutDay.coverImageUrl ?? undefined,
            estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
            exercises: workoutDay.exercises.map((exercise) => ({
              id: exercise.id,
              workoutDayId: exercise.workoutDayId,
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              order: exercise.order,
              restTimeInSeconds: exercise.restTimeInSeconds,
            })),
          })),
      })),
    };
  }
}
