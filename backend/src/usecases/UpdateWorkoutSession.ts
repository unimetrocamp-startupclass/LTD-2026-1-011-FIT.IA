import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

import {
  NotFoundError,
  ValidationError,
  WorkoutPlanNotActiveError,
  WorkoutSessionAlreadyCompletedError,
} from "../erros/index.js";
import { prisma } from "../lib/db.js";

dayjs.extend(utc);

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
    const workoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        id: dto.workoutPlanId,
        userId: dto.userId,
      },
      select: { id: true, isActive: true },
    });

    if (!workoutPlan) {
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

    const completedAt = dayjs.utc(dto.completedAt);
    if (!completedAt.isValid()) {
      throw new ValidationError("Invalid completedAt datetime");
    }

    if (completedAt.isBefore(dayjs.utc(workoutSession.startedAt))) {
      throw new ValidationError(
        "completedAt must be on or after session startedAt",
      );
    }

    const updatedWorkoutSession = await prisma.workoutSession.update({
      where: { id: workoutSession.id },
      data: { completedAt: completedAt.toDate() },
      select: {
        id: true,
        completedAt: true,
        startedAt: true,
      },
    });

    return {
      id: updatedWorkoutSession.id,
      completedAt: dayjs.utc(updatedWorkoutSession.completedAt).toISOString(),
      startedAt: dayjs.utc(updatedWorkoutSession.startedAt).toISOString(),
    };
  }
}
