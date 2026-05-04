# File Groups

Use this list as the manual navigation layer for Graphify and Obsidian.

## Grupo 0 - Core/Entrada

Entry points, HTTP route registration, and request/response boundary files.

| Arquivo | Representa |
| --- | --- |
| `src/index.ts` | App bootstrap, plugins, route prefixes, docs, auth proxy, health check |
| `src/routes/home.ts` | `GET /home/:date` HTTP boundary |
| `src/routes/workout-plan.ts` | Workout plan and workout session HTTP boundary |

## Grupo 1 - Logica/Servicos

Use cases and service-level domain behavior.

| Arquivo | Representa |
| --- | --- |
| `src/usecases/CreateWorkoutPlan.ts` | Create active workout plan and nested workout days/exercises |
| `src/usecases/GetHome.ts` | Home payload, active day, streak, weekly consistency |
| `src/usecases/GetWorkoutPlan.ts` | Fetch a user-owned workout plan with day exercise counts |
| `src/usecases/StartWorkoutSession.ts` | Start workout session for a workout day |
| `src/usecases/UpdateWorkoutSession.ts` | Complete/update a workout session |
| `src/lib/auth.ts` | Better Auth service configuration |

## Grupo 2 - Dados/Modelos

Database schema, migrations, Prisma client, and generated model files.

| Arquivo | Representa |
| --- | --- |
| `prisma/schema.prisma` | Database domain model source of truth |
| `prisma/migrations/migration_lock.toml` | Prisma migration provider lock |
| `prisma/migrations/20260314190950_init/migration.sql` | Initial database migration |
| `prisma/migrations/20260314212611_add_better_auth/migration.sql` | Better Auth tables migration |
| `prisma/migrations/20260503152000_add_workout_day_cover_image_url/migration.sql` | Workout day cover image migration |
| `prisma/migrations/20260503170000_add_unique_workout_session_workout_day_id/migration.sql` | Unique workout session per day migration |
| `src/lib/db.ts` | Prisma/Postgres database client |
| `src/generated/prisma/client.ts` | Generated Prisma client entry |
| `src/generated/prisma/models.ts` | Generated Prisma model barrel |
| `src/generated/prisma/enums.ts` | Generated Prisma enums |
| `src/generated/prisma/commonInputTypes.ts` | Generated Prisma input types |
| `src/generated/prisma/browser.ts` | Generated browser Prisma entry |
| `src/generated/prisma/internal/class.ts` | Generated Prisma internal client class |
| `src/generated/prisma/internal/prismaNamespace.ts` | Generated Prisma namespace |
| `src/generated/prisma/internal/prismaNamespaceBrowser.ts` | Generated Prisma browser namespace |
| `src/generated/prisma/models/Account.ts` | Generated Better Auth account model |
| `src/generated/prisma/models/Session.ts` | Generated Better Auth session model |
| `src/generated/prisma/models/User.ts` | Generated user model |
| `src/generated/prisma/models/Verification.ts` | Generated Better Auth verification model |
| `src/generated/prisma/models/WorkoutDay.ts` | Generated workout day model |
| `src/generated/prisma/models/WorkoutExercise.ts` | Generated workout exercise model |
| `src/generated/prisma/models/WorkoutPlan.ts` | Generated workout plan model |
| `src/generated/prisma/models/WorkoutSession.ts` | Generated workout session model |

## Grupo 3 - Config/Utils

Project configuration, runtime setup, shared schemas, and utility-like support files.

| Arquivo | Representa |
| --- | --- |
| `src/schemas/index.ts` | Shared Zod request/response schemas |
| `src/erros/index.ts` | Shared custom errors |
| `package.json` | Package metadata and scripts |
| `pnpm-lock.yaml` | Dependency lockfile |
| `tsconfig.json` | TypeScript compiler configuration |
| `eslint.config.js` | ESLint configuration |
| `prisma.config.ts` | Prisma configuration |
| `docker-compose.yml` | Local app/Postgres stack |
| `Dockerfile` | Container image build |
| `.dockerignore` | Docker build ignore rules |
| `.gitignore` | Git ignore rules |
| `.npmrc` | npm/pnpm configuration |

## Grupo 4 - Docs/Testes

Documentation, agent rules, task prompts, and test/spec-like planning files.

| Arquivo | Representa |
| --- | --- |
| `AGENTS.md` | Agent and Graphify operating rules |
| `docs/API_PROMPT.md` | API route prompt template |
| `task/01.md` | Start workout session route task |
| `task/02.md` | Update workout session route task |
| `task/03.md` | Home route task |
| `task/04.md` | Get workout plan route task |

## Grupo 5 - Sem grupo

Files that are generated artifacts, local tool state, or do not fit the functional groups above.

| Arquivo | Representa |
| --- | --- |
| `.codex/hooks.json` | Local Codex hook configuration |
| `graphify-out/` | Generated Graphify outputs and Obsidian vault |
| `dist/` | Generated TypeScript build output |
| `node_modules/` | Installed dependencies |
