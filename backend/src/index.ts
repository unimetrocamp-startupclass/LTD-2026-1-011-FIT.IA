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
      description: `API para o projeto de treinos do Fit.IA.

---

## Links rápidos

| Recurso        | URL                       |
|----------------|---------------------------|
| API            | http://localhost:3333     |
| Documentação   | http://localhost:3333/docs |
| Health Check   | http://localhost:3333/health |

---

## Configuração inicial

**Arquivo \`.env\`:** Crie \`backend/.env\` (na pasta \`backend/\`, raiz do pacote Node) com as variáveis necessárias (veja a seção "Variáveis de ambiente" ao final).

> **Importante:** Comandos \`pnpm\` e \`docker compose\` abaixo assumem o diretório \`backend/\` como pasta atual, **ou** uso do ficheiro compose a partir da raiz do repositório (exemplos abaixo).

---

## 1. Rodar com Docker (recomendado)

**Pré-requisitos:** Docker e Docker Compose instalados.

> **Nota:** Use \`docker compose\` (com espaço) ou \`docker-compose\` (com hífen), conforme sua instalação.

### 1.1 Iniciar

**Opção A — a partir da pasta \`backend/\`:**

\`\`\`bash
cd backend
docker compose up -d
\`\`\`

**Opção B — a partir da raiz do repositório Git:**

\`\`\`bash
docker compose -f backend/docker-compose.yml up -d
\`\`\`

> **Seções 1.2 a 1.6:** se estiver na **raiz do repositório** (sem \`cd backend\`), prefixe os comandos com \`docker compose -f backend/docker-compose.yml\` em vez de \`docker compose\` apenas.

### 1.2 Migrations e mudanças no Prisma

**Fluxo ao alterar o schema:**

1. Edite o arquivo \`prisma/schema.prisma\`
2. Rode: \`docker compose exec app pnpm exec prisma migrate dev\`
3. Reinicie o app se o \`tsx --watch\` não recarregar: \`docker compose restart app\`

| Situação | Comando |
|----------|---------|
| Primeira vez ou alterações no schema | \`docker compose exec app pnpm exec prisma migrate dev\` |
| Regenerar o Prisma Client | \`docker compose exec app pnpm exec prisma generate\` |
| Sincronizar schema sem migrations (\`db push\`) | \`docker compose exec app pnpm exec prisma db push\` |
| Produção (migrations já criadas) | \`docker compose exec app pnpm exec prisma migrate deploy\` |

### 1.3 Parar

\`\`\`bash
docker compose down
\`\`\`

### 1.4 Aplicar atualizações

| Tipo de mudança | Comando | Observação |
|-----------------|---------|------------|
| Copiar código para container sem rebuild | Em \`backend/\`: \`docker compose cp .\\src app:/app/src\`. Na raiz do repo: \`docker compose -f backend/docker-compose.yml cp .\\backend\\src app:/app/src\` | Atualiza os arquivos no container em execução; se não houver recarga automática, rode \`docker compose restart app\` (adicione \`-f backend/docker-compose.yml\` se estiver na raiz) |
| Dockerfile ou dependências | \`docker compose up -d --build\` | Reconstrói a imagem |

### 1.5 Novas dependências

O container mantém seu próprio \`node_modules\`. Ao adicionar pacotes:

1. **Host:** \`pnpm add nome-do-pacote\`
2. **Container:** \`docker compose exec app pnpm install\`
3. **Reiniciar:** \`docker compose restart app\`

### 1.6 Comandos úteis

| Ação                 | Comando |
|----------------------|---------|
| Status dos containers | \`docker compose ps\` |
| Logs (tempo real)    | \`docker compose logs -f app\` |
| Reiniciar app        | \`docker compose restart app\` |
| Shell do container   | \`docker compose exec app sh\` |
| Resetar banco        | \`docker compose exec app pnpm exec prisma migrate reset\` |

---

## 2. Rodar sem Docker

**Pré-requisitos:**
- **Node.js 24** (ou superior; use \`nvm\` ou \`fnm\` se não tiver)
- **pnpm** — instale com: \`corepack enable && corepack prepare pnpm@10.32.1 --activate\`
- **PostgreSQL** — instalado localmente ou via Docker (somente o banco)

### 2.1 Banco de dados

Escolha uma opção:

- **Opção A (Docker só para Postgres):** em \`backend/\`: \`docker compose up -d postgres\`. Na raiz do repo: \`docker compose -f backend/docker-compose.yml up -d postgres\` — usa porta 5433
- **Opção B (PostgreSQL nativo):** Instale o PostgreSQL e ajuste a \`DATABASE_URL\` no \`.env\`

### 2.2 Setup

\`\`\`bash
cd backend
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
\`\`\`

**Comandos Prisma (sem Docker):**

| Situação | Comando |
|----------|---------|
| Regenerar o Prisma Client | \`pnpm exec prisma generate\` ou \`npx prisma generate\` |
| Sincronizar schema sem migrations | \`pnpm exec prisma db push\` ou \`npx prisma db push\` |

### 2.3 Variáveis no \`.env\`

| Variável         | Valor exemplo |
|------------------|---------------|
| \`PORT\`         | 3333 |
| \`DATABASE_URL\` | postgresql://postgres:postgres@localhost:5433/fit_ia_db |

### 2.4 Iniciar

\`\`\`bash
cd backend
pnpm run dev
\`\`\`

---

## 3. Variáveis de ambiente

Crie o arquivo \`.env\` em \`backend/.env\`:

| Variável              | Descrição                | Padrão    | Obrigatória |
|-----------------------|--------------------------|-----------|-------------|
| \`PORT\`              | Porta do servidor        | 3333      | Não         |
| \`DATABASE_URL\`      | Conexão PostgreSQL       | —         | Sim         |
| \`POSTGRES_USER\`     | Usuário PostgreSQL       | postgres  | Docker      |
| \`POSTGRES_PASSWORD\` | Senha PostgreSQL         | postgres  | Docker      |
| \`POSTGRES_DB\`       | Nome do banco            | fit_ia_db | Docker      |
| \`BETTER_AUTH_SECRET\`| Segredo para autenticação| —         | Se usar auth|
| \`BETTER_AUTH_URL\`   | URL base da API          | http://localhost:3333 | Se usar auth |`,
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
      message: "teste",
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
