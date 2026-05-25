import { FastifyReply, FastifyRequest } from "fastify";
import { decodeProtectedHeader, importJWK, jwtVerify } from "jose";

import { prisma } from "../lib/db.js";
import { env } from "../lib/env.js";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
    };
  }
}

const getBearerToken = (authorization: string | undefined) => {
  if (!authorization) return null;

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) return null;

  return token;
};

const getPublicKey = async (token: string) => {
  const { kid } = decodeProtectedHeader(token);

  if (!kid) return null;

  const key = await prisma.jwks.findUnique({
    where: {
      id: kid,
    },
    select: {
      publicKey: true,
      expiresAt: true,
    },
  });

  if (!key) return null;
  if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) return null;

  return importJWK(JSON.parse(key.publicKey), "EdDSA");
};

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const token = getBearerToken(request.headers.authorization);

  if (!token) {
    return reply.status(401).send({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  try {
    const publicKey = await getPublicKey(token);

    if (!publicKey) {
      return reply.status(401).send({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    const { payload } = await jwtVerify(token, publicKey, {
      issuer: env.WEB_APP_BASE_URL,
      audience: env.API_BASE_URL,
    });

    if (!payload.sub) {
      return reply.status(401).send({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
    }

    request.user = {
      id: payload.sub,
    };
  } catch {
    return reply.status(401).send({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }
};
