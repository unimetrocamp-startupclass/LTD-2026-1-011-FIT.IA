import "dotenv/config";

import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";

import { auth } from "./lib/auth.js";
import { homeRoutes } from "./routes/home.js";
import { statsRoutes } from "./routes/stats.js";
import { workoutPlanRoutes } from "./routes/workout-plan.js";

const buildApiDescription =
  () => `API backend do Fit.IA (Fastify + Prisma + Better Auth).

---

## URLs locais (padrão)

| Recurso | URL |
|---------|-----|
| API | http://localhost:3333 |
| Docs | http://localhost:3333/docs |
| Health | http://localhost:3333/health |

---

## 1) Execução com Docker (app + postgres)

Pré-requisito: Docker + Docker Compose.

### 1.1 Subir stack

**Se estiver em \`backend/\`:**
\`\`\`bash
docker compose up -d
\`\`\`

**Se estiver na raiz do repositório:**
\`\`\`bash
docker compose -f backend/docker-compose.yml up -d
\`\`\`

### 1.2 Prisma e banco (dentro do container)

| Situação | Comando |
|----------|---------|
| Criar/aplicar migration (dev) | \`docker compose exec app pnpm exec prisma migrate dev\` |
| Gerar Prisma Client | \`docker compose exec app pnpm exec prisma generate\` |
| Sincronizar sem migration | \`docker compose exec app pnpm exec prisma db push\` |
| Produção (migrations existentes) | \`docker compose exec app pnpm exec prisma migrate deploy\` |

### 1.3 Comandos úteis

| Ação | Comando |
|------|---------|
| Ver containers | \`docker compose ps\` |
| Logs da aplicação | \`docker compose logs -f app\` |
| Reiniciar app | \`docker compose restart app\` |
| Entrar no container app | \`docker compose exec app sh\` |
| Parar stack | \`docker compose down\` |

---

## 2) Execução sem Docker (Node local)

Pré-requisitos:
- Node.js 24
- pnpm 10.32.1
- PostgreSQL local **ou** somente o postgres via Docker

### 2.1 Banco

**Opção A (apenas postgres via Docker):**
\`\`\`bash
docker compose up -d postgres
\`\`\`
Na raiz: \`docker compose -f backend/docker-compose.yml up -d postgres\`

**Opção B (PostgreSQL local):** ajustar \`DATABASE_URL\` no \`.env\`.

### 2.2 Setup da aplicação

\`\`\`bash
cd backend
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
\`\`\`

### 2.3 Rodar em desenvolvimento

\`\`\`bash
cd backend
pnpm run dev
\`\`\`

---

## 3) Variáveis de ambiente (\`backend/.env\`)

| Variável | Descrição | Exemplo/Default | Obrigatória |
|----------|-----------|-----------------|-------------|
| \`PORT\` | Porta da API | \`3333\` | Não |
| \`DATABASE_URL\` | String de conexão PostgreSQL | \`postgresql://postgres:postgres@localhost:5433/fit_ia_db\` | Sim |
| \`POSTGRES_USER\` | Usuário do postgres (docker compose) | \`postgres\` | Docker |
| \`POSTGRES_PASSWORD\` | Senha do postgres (docker compose) | \`postgres\` | Docker |
| \`POSTGRES_DB\` | Nome do banco (docker compose) | \`fit_ia_db\` | Docker |
| \`BETTER_AUTH_SECRET\` | Segredo do Better Auth | — | Sim (auth) |
| \`BETTER_AUTH_URL\` | URL base da API | \`http://localhost:3333\` | Sim (auth) |`;

const app = Fastify({
  logger: true,
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

//Config da Documentação
await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "API do Fit.IA",
      description: buildApiDescription(),
      version: "1.0.0",
    },
    servers: [
      {
        description: "Localhost",
        url: "http://localhost:3333",
      },
    ],
  },
  transform: jsonSchemaTransform,
});

await app.register(fastifyCors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});

await app.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    sources: [
      {
        title: "Fit.IA API",
        slug: "fit-ia-api",
        url: "/swagger.json",
      },
      {
        title: "Auth API",
        slug: "auth-api",
        url: "/api/auth/open-api/generate-schema",
      },
    ],
  },
});

//Routes
await app.register(homeRoutes, { prefix: "/home" });
await app.register(statsRoutes, { prefix: "/stats" });
await app.register(workoutPlanRoutes, { prefix: "/workout-plans" });

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/swagger.json",
  schema: {
    hide: true,
  },
  handler: async () => {
    return app.swagger();
  },
});

app.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/",
  // Define your schema
  schema: {
    description: "Hello World",
    tags: ["Hello World"],
    response: {
      200: z.object({
        message: z.string(),
      }),
    },
  },
  handler: () => {
    return {
      message: "Bem-vindo a API do FIT.IA",
    };
  },
});

//Configuração para que toda rota que tiver o /auth passar pela autenticação do Better Auth'
app.route({
  method: ["GET", "POST"],
  url: "/api/auth/*",
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`);

      // Convert Fastify headers to standard Headers object
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });
      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      });
      // Process authentication request
      const response = await auth.handler(req);
      // Forward response to client
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    } catch (error) {
      app.log.error(error);
      reply.status(500).send({
        error: "Internal authentication error",
        code: "AUTH_FAILURE",
      });
    }
  },
});

app.get("/health", () => {
  return "Ok";
});

try {
  await app.listen({
    port: Number(process.env.PORT) || 3333,
    host: "0.0.0.0",
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
