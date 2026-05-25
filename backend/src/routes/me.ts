import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { NotFoundError, ValidationError } from "../erros/index.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  ErrorSchema,
  UpsertUserTrainDataBodySchema,
  UpsertUserTrainDataSchema,
  UserTrainDataSchema,
} from "../schemas/index.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

export const meRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/me",
    schema: {
      operationId: "getUserTrainData",
      tags: ["Me"],
      summary: "Get user train data",
      response: {
        200: UserTrainDataSchema.nullable(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authenticate,
    handler: async (request, reply) => {
      try {
        const getUserTrainData = new GetUserTrainData();
        const result = await getUserTrainData.execute({
          userId: request.user.id,
        });

        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof ValidationError) {
          return reply.status(200).send(null);
        }
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/me",
    schema: {
      operationId: "upsertUserTrainData",
      tags: ["Me"],
      summary: "Upsert user train data",
      body: UpsertUserTrainDataBodySchema,
      response: {
        200: UpsertUserTrainDataSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authenticate,
    handler: async (request, reply) => {
      try {
        const upsertUserTrainData = new UpsertUserTrainData();
        const result = await upsertUserTrainData.execute({
          userId: request.user.id,
          weightInGrams: request.body.weightInGrams,
          heightInCentimeters: request.body.heightInCentimeters,
          age: request.body.age,
          bodyFatPercentage: request.body.bodyFatPercentage,
        });

        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof ValidationError) {
          return reply.status(400).send({
            error: error.message,
            code: "VALIDATION_ERROR",
          });
        }
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            error: error.message,
            code: "NOT_FOUND_ERROR",
          });
        }
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
