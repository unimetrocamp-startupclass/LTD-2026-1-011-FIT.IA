import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { NotFoundError, ValidationError } from "../erros/index.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  ErrorSchema,
  HomeParamsSchema,
  HomeResponseSchema,
} from "../schemas/index.js";
import { GetHome } from "../usecases/GetHome.js";

export const homeRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:date",
    schema: {
      operationId: "getHomeData",
      tags: ["Home"],
      summary: "Get home data",
      params: HomeParamsSchema,
      response: {
        200: HomeResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    preHandler: authenticate,
    handler: async (request, reply) => {
      try {
        const getHome = new GetHome();

        const home = await getHome.execute({
          userId: request.user.id,
          date: request.params.date,
        });

        return reply.status(200).send(home);
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
