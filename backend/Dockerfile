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

# ------- Dependencies -------
FROM base AS deps

RUN pnpm install --frozen-lockfile

# ------- Development -------
FROM deps AS development

ENV NODE_ENV="development"

COPY . .

EXPOSE 3333

CMD ["sh", "-c", "pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm run dev"]

# ------- Build -------
FROM deps AS build

COPY . .

RUN pnpm exec prisma generate && pnpm run build

# ------- Production -------
FROM base AS production

ENV NODE_ENV="production"

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=build /app/dist ./dist

EXPOSE 3333

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/index.js"]
