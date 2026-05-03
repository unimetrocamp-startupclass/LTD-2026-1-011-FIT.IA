import {
  NotFoundError,
  ValidationError,
  WorkoutPlanNotActiveError,
  WorkoutSessionAlreadyCompletedError,
} from "../erros/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  workoutSessionId: string;
  completedAt: string;
}

interface OutputDto {
  id: string;
  completedAt: string;
  startedAt: string;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
      select: { userId: true, isActive: true },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError("Workout plan is not active");
    }

    const workoutDay = await prisma.workoutDay.findFirst({
      where: {
        id: dto.workoutDayId,
        workoutPlanId: dto.workoutPlanId,
      },
      select: { id: true },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const workoutSession = await prisma.workoutSession.findFirst({
      where: {
        id: dto.workoutSessionId,
        workoutDayId: dto.workoutDayId,
      },
      select: { id: true, startedAt: true, completedAt: true },
    });

    if (!workoutSession) {
      throw new NotFoundError("Workout session not found");
    }

    if (workoutSession.completedAt !== null) {
      throw new WorkoutSessionAlreadyCompletedError();
    }

    const completedAt = new Date(dto.completedAt);
    if (Number.isNaN(completedAt.getTime())) {
      throw new ValidationError("Invalid completedAt datetime");
    }

    if (completedAt.getTime() < workoutSession.startedAt.getTime()) {
      throw new ValidationError(
        "completedAt must be on or after session startedAt",
      );
    }

    const updatedWorkoutSession = await prisma.workoutSession.update({
      where: { id: workoutSession.id },
      data: { completedAt },
      select: {
        id: true,
        completedAt: true,
        startedAt: true,
      },
    });

    return {
      id: updatedWorkoutSession.id,
      completedAt: updatedWorkoutSession.completedAt!.toISOString(),
      startedAt: updatedWorkoutSession.startedAt.toISOString(),
    };
  }
}
