import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { NotFoundError, ValidationError } from "../erros/index.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  ErrorSchema,
  StatsQuerySchema,
  StatsResponseSchema,
} from "../schemas/index.js";
import { GetStats } from "../usecases/GetStats.js";

export const statsRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      operationId: "getStats",
      tags: ["Stats"],
      summary: "Get user workout stats",
      querystring: StatsQuerySchema,
      response: {
        200: StatsResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authenticate,
    handler: async (request, reply) => {
      try {
        const getStats = new GetStats();

        const stats = await getStats.execute({
          userId: request.user.id,
          from: request.query.from,
          to: request.query.to,
        });

        return reply.status(200).send(stats);
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
