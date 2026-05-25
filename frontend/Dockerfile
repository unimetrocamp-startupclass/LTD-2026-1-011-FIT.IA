FROM node:24-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

FROM base AS deps

RUN pnpm install --frozen-lockfile

FROM deps AS development

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "pnpm exec prisma generate && pnpm exec next dev --hostname 0.0.0.0"]

FROM deps AS build

COPY . .

ARG NEXT_PUBLIC_BASE_URL=https://fitia.onrender.com
ARG NEXT_PUBLIC_API_URL=https://fitia-api-u7u9.onrender.com
ARG SERVER_API_URL=https://fitia-api-u7u9.onrender.com

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV SERVER_API_URL=$SERVER_API_URL

RUN export DATABASE_URL="postgresql://user:password@localhost:5432/database" \
  BETTER_AUTH_SECRET="build-time-secret-with-enough-length-123456789" \
  GOOGLE_CLIENT_ID="build-time-google-client-id" \
  GOOGLE_CLIENT_SECRET="build-time-google-client-secret" \
  && pnpm exec prisma generate \
  && pnpm run build

FROM deps AS production

ENV NODE_ENV="production"

COPY --from=build /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
