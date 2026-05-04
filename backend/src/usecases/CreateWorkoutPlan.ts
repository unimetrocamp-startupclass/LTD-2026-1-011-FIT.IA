import { NotFoundError } from "../erros/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    coverImageUrl?: string | null;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      order: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

interface OutputDto {
  id: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    coverImageUrl?: string;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      order: number;
      restTimeInSeconds: number;
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

export class CreateWorkoutPlan {
  async execute(dto: InputDto): Promise<OutputDto> {
    return prisma.$transaction(async (tx) => {
      const existingWorkoutPlan = await tx.workoutPlan.findFirst({
        where: {
          userId: dto.userId,
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (existingWorkoutPlan) {
        await tx.workoutPlan.update({
          where: { id: existingWorkoutPlan.id },
          data: { isActive: false },
        });
      }

      const workoutPlan = await tx.workoutPlan.create({
        data: {
          userId: dto.userId,
          id: crypto.randomUUID(),
          name: dto.name,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              coverImageUrl: workoutDay.coverImageUrl ?? undefined,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
      });

      const result = await tx.workoutPlan.findUnique({
        where: {
          id: workoutPlan.id,
        },
        select: {
          id: true,
          name: true,
          workoutDays: {
            select: {
              name: true,
              weekDay: true,
              isRest: true,
              coverImageUrl: true,
              estimatedDurationInSeconds: true,
              exercises: {
                orderBy: {
                  order: "asc",
                },
                select: {
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
      if (!result) {
        throw new NotFoundError("Workout plan not found");
      }

      return {
        id: result.id,
        name: result.name,
        workoutDays: result.workoutDays
          .toSorted(
            (leftWorkoutDay, rightWorkoutDay) =>
              weekDayOrder[leftWorkoutDay.weekDay] -
              weekDayOrder[rightWorkoutDay.weekDay],
          )
          .map((workoutDay) => ({
            name: workoutDay.name,
            weekDay: workoutDay.weekDay,
            isRest: workoutDay.isRest,
            coverImageUrl: workoutDay.coverImageUrl ?? undefined,
            estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
            exercises: workoutDay.exercises.map((exercise) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              order: exercise.order,
              restTimeInSeconds: exercise.restTimeInSeconds,
            })),
          })),
      };
    });
  }
}
