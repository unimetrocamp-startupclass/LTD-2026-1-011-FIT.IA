import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";
import z from "zod";

import { WeekDay } from "../generated/prisma/enums.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateSchema = z
  .string()
  .regex(dateRegex)
  .refine((date) => dayjs.utc(date, "YYYY-MM-DD", true).isValid());

const positiveIntegerSchema = z.number().int().positive();
const nonnegativeIntegerSchema = z.number().int().nonnegative();

const consistencyByDaySchema = z.record(
  z.iso.date(),
  z.object({
    workoutDayCompleted: z.boolean(),
    workoutDayStarted: z.boolean(),
  }),
);

const workoutExerciseSchema = z.object({
  id: z.uuid(),
  workoutDayId: z.uuid(),
  name: z.string(),
  sets: positiveIntegerSchema,
  reps: positiveIntegerSchema,
  order: nonnegativeIntegerSchema,
  restTimeInSeconds: positiveIntegerSchema,
});

const workoutDaySummarySchema = z.object({
  id: z.uuid(),
  weekDay: z.enum(WeekDay),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.url().optional(),
  estimatedDurationInSeconds: positiveIntegerSchema,
  exercisesCount: nonnegativeIntegerSchema,
});

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
  workoutDays: z.array(
    z.object({
      name: z.string().trim().min(1),
      weekDay: z.enum(WeekDay),
      isRest: z.boolean().default(false),
      coverImageUrl: z.url().optional(),
      estimatedDurationInSeconds: z.number().min(1),
      exercises: z.array(
        z.object({
          name: z.string().trim().min(1),
          sets: z.number().min(1),
          reps: z.number().min(1),
          order: z.number().min(0),
          restTimeInSeconds: z.number().min(1),
        }),
      ),
    }),
  ),
});

export const GetWorkoutPlanParamsSchema = z.object({
  workoutPlanId: z.uuid(),
});

export const ListWorkoutPlansQuerySchema = z.object({
  active: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const ListWorkoutPlansResponseSchema = z.object({
  workoutPlans: z.array(
    z.object({
      id: z.uuid(),
      name: z.string(),
      isActive: z.boolean(),
      workoutDays: z.array(
        z.object({
          id: z.uuid(),
          workoutPlanId: z.uuid(),
          name: z.string(),
          isRest: z.boolean(),
          weekDay: z.enum(WeekDay),
          coverImageUrl: z.url().optional(),
          estimatedDurationInSeconds: positiveIntegerSchema,
          exercises: z.array(workoutExerciseSchema),
        }),
      ),
    }),
  ),
});

export const ListWorkoutPlansSchema = ListWorkoutPlansResponseSchema;

export const GetWorkoutPlanResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  workoutDays: z.array(workoutDaySummarySchema),
});

export const GetWorkoutPlanSchema = GetWorkoutPlanResponseSchema;

export const GetWorkoutDayParamsSchema = z.object({
  workoutPlanId: z.uuid(),
  workoutDayId: z.uuid(),
});

export const GetWorkoutDayResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.url().optional(),
  estimatedDurationInSeconds: positiveIntegerSchema,
  exercises: z.array(workoutExerciseSchema),
  weekDay: z.enum(WeekDay),
  sessions: z.array(
    z.object({
      id: z.uuid(),
      workoutDayId: z.uuid(),
      startedAt: dateSchema,
      completedAt: dateSchema.optional(),
    }),
  ),
});

export const GetWorkoutDaySchema = GetWorkoutDayResponseSchema;

export const StartWorkoutSessionParamsSchema = z.object({
  workoutPlanId: z.uuid(),
  workoutDayId: z.uuid(),
});

export const StartWorkoutSessionResponseSchema = z.object({
  userWorkoutSessionId: z.uuid(),
});

export const StartWorkoutSessionSchema = StartWorkoutSessionResponseSchema;

export const UpdateWorkoutSessionParamsSchema = z.object({
  workoutPlanId: z.uuid(),
  workoutDayId: z.uuid(),
  workoutSessionId: z.uuid(),
});

export const UpdateWorkoutSessionBodySchema = z.object({
  completedAt: z.iso.datetime(),
});

export const UpdateWorkoutSessionResponseSchema = z.object({
  id: z.uuid(),
  completedAt: z.iso.datetime(),
  startedAt: z.iso.datetime(),
});

export const UpdateWorkoutSessionSchema = UpdateWorkoutSessionResponseSchema;

export const HomeParamsSchema = z.object({
  date: dateSchema,
});

export const HomeResponseSchema = z.object({
  activeWorkoutPlanId: z.uuid(),
  todayWorkoutDay: z.object({
    workoutPlanId: z.uuid(),
    id: z.uuid(),
    name: z.string(),
    isRest: z.boolean(),
    weekDay: z.enum(WeekDay),
    estimatedDurationInSeconds: z.number(),
    coverImageUrl: z.url().optional(),
    exercisesCount: z.number(),
  }),
  workoutStreak: z.number(),
  consistencyByDay: consistencyByDaySchema,
});

export const HomeDataSchema = HomeResponseSchema;

export const StatsQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
});

export const StatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: consistencyByDaySchema,
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});

export const StatsSchema = StatsResponseSchema;

export const UserTrainDataBodySchema = z.object({
  weightInGrams: positiveIntegerSchema,
  heightInCentimeters: positiveIntegerSchema,
  age: positiveIntegerSchema,
  bodyFatPercentage: nonnegativeIntegerSchema.max(100),
});

export const UserTrainDataResponseSchema = UserTrainDataBodySchema.extend({
  userId: z.string(),
  userName: z.string(),
});

export const UpsertUserTrainDataBodySchema = UserTrainDataBodySchema;

export const UserTrainDataSchema = UserTrainDataResponseSchema;

export const UpsertUserTrainDataSchema = UserTrainDataBodySchema.extend({
  userId: z.string(),
});

export const WorkoutExerciseInputSchema = z.object({
  order: z.number().int().nonnegative().describe("Ordem do exercício no dia"),
  name: z.string().trim().min(1).describe("Nome do exercício"),
  sets: z.number().int().positive().describe("Número de séries"),
  reps: z.number().int().positive().describe("Número de repetições"),
  restTimeInSeconds: z
    .number()
    .int()
    .positive()
    .describe("Tempo de descanso entre séries em segundos"),
});

export const WorkoutDayInputSchema = z.object({
  name: z.string().trim().min(1).describe("Nome do dia"),
  weekDay: z.enum(WeekDay).describe("Dia da semana"),
  isRest: z.boolean().describe("Se é dia de descanso"),
  estimatedDurationInSeconds: z
    .number()
    .int()
    .nonnegative()
    .describe("Duração estimada em segundos; 0 para dias de descanso"),
  coverImageUrl: z
    .string()
    .url()
    .describe("URL da imagem de capa conforme o foco muscular do dia"),
  exercises: z
    .array(WorkoutExerciseInputSchema)
    .describe("Lista de exercícios; vazia para dias de descanso"),
});
