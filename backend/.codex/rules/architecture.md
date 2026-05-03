## Fastify: Rotas de API

- **SEMPRE** siga os princípios do REST para criar rotas. Exemplo: `GET /workout-plans`, `GET /workout-plans/:id/days`.
- **SEMPRE** crie os arquivos das rotas em @src/routes.
- **SEMPRE** use `fastify-type-provider-zod` para definir os schemas de request e response de uma rota.
- **SEMPRE** use Zod v4, **NUNCA** use o Zod v3.
- **SEMPRE** defina `tags` e `summary` dentro do `schema` da rota para documentar a API.
- **SEMPRE** crie os schemas das operações de criação e atualização dentro de @src/schemas/index.ts.
- **SEMPRE** use o @src/schemas/index.ts para tipar respostas de erro.
- Sempre que usar o enum `WeekDay` em schemas Zod, importe `WeekDay` do Prisma (`@src/generated/prisma/enums.js`) e valide com `z.enum(WeekDay)`.
- Uma rota **NUNCA** deve conter regras de negócio, apenas validações de dados (com o Zod) e de autenticação (se necessário).
- Quando uma rota precisar ser protegida (acessível apenas por usuários autenticados), **SEMPRE** use o `auth.api.getSession` (@src/lib/auth.ts) para recuperar a sessão do usuário.
- Uma rota deve **SEMPRE** instanciar e chamar um use case.
- **SEMPRE** trate os erros lançados pelo use case.

## Validações: rota × use case

Há duas camadas obrigatórias; omitir uma delas deixa falhas ou inconsistências sem cobertura.

1. **Rota (@src/routes)** — validação **estrutural e de formato** com Zod (tipos do body/params/query, UUIDs, `z.iso.datetime()`, limites numéricos, strings não vazias, etc.). A rota **não** implementa regras de domínio.
2. **Use case (@src/usecases)** — **regras de negócio** que dependem de estado no banco ou de relacionamentos: recurso existe e pertence ao usuário, plano ativo, transições de estado (por exemplo sessão já concluída), **ordem temporal** (`completedAt` não antes de `startedAt`), unicidade já refletida no modelo, etc. Quando falhar, lance sempre um erro customizado definido em @src/erros/index.ts (crie classes novas quando necessário) e **mapeie** esse erro para o status HTTP correto na rota (400 vs 409 vs 404, etc.). O objeto `schema.response` da rota deve declarar todos os status de erro relevantes (`400`, `404`, `409`, …).

O use case deve permanecer defensivo mesmo quando a rota valida formato: outros chamadores futuros ou testes podem invocá-lo diretamente.

### Exemplo:

```ts
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { NotFoundError } from "../erros/index.js";
import { auth } from "../lib/auth.js";
import { ErrorSchema, WorkoutPlanSchema } from "../schemas/index.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";

export const workoutPlanRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Workout Plan"],
      summary: "Create a workout plan",
      body: WorkoutPlanSchema.omit({ id: true }),
      response: {
        201: WorkoutPlanSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session) {
          return reply.status(401).send({
            error: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }
        const createWorkoutPlan = new CreateWorkoutPlan();
        const result = await createWorkoutPlan.execute({
          userId: session.user.id,
          name: request.body.name,
          workoutDays: request.body.workoutDays,
        });
        return reply.status(201).send(result);
      } catch (error) {
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
};
```

## Use Cases

- Todas as regras de negócio devem estar concentradas dentro de um use case.
- Todos os use cases devem ser criados em @src/usecases.
- Todos os use cases devem ser classes, com um método `execute`.
- Todos os use cases devem ser nomeados com verbos.
- Quando um use case receber um parâmetro, ele deve **SEMPRE** ser um DTO (`InputDto`), que é uma interface definida no mesmo arquivo.
- O retorno de um use case deve **SEMPRE** ser tipado com uma interface `OutputDto`, definida no mesmo arquivo. O use case deve mapear o resultado do banco para o `OutputDto`, **NUNCA** retornando o model do Prisma diretamente. Isso garante desacoplamento entre a camada de negócio e o banco de dados.
- Ao precisar interagir com o banco de dados, um use case deve **SEMPRE** chamar o Prisma diretamente, e não um repository.
- Nos use cases **NUNCA** use `try`/`catch` para converter falhas HTTP ou engolir exceções. Quem trata erro no sentido HTTP (bloco `try`/`catch` no handler e `reply.status`) é **sempre** a rota @src/routes. Os use cases **devem** lançar erros customizados quando uma regra de negócio falha.
- Caso um use case lance uma exceção por falha de negócio, deve ser **SEMPRE** um erro customizado. Essas classes ficam em @src/erros/index.ts. Caso um erro necessário não exista, crie-o na mesma pasta e exporte-o no `index`.

### Exemplo:

```ts
import { NotFoundError } from "../erros/index.js";
import { WeekDay } from "../generated/prisma/enums.js";
import { prisma } from "../lib/db.js";

// Data Transfer Object
interface InputDto {
  userId: string;
  name: string;
  workoutDays: Array<{
    name: string;
    weekDay: WeekDay;
    isRest: boolean;
    estimatedDurationInSeconds: number;
    exercises: Array<{
      order: number;
      name: string;
      sets: number;
      reps: number;
      restTimeInSeconds: number;
    }>;
  }>;
}

export class CreateWorkoutPlan {
  async execute(dto: InputDto) {
    const existingWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: {
        isActive: true,
      },
    });
    // Transaction - Atomicidade
    return prisma.$transaction(async (tx) => {
      if (existingWorkoutPlan) {
        await tx.workoutPlan.update({
          where: { id: existingWorkoutPlan.id },
          data: { isActive: false },
        });
      }
      const workoutPlan = await tx.workoutPlan.create({
        data: {
          id: crypto.randomUUID(),
          name: dto.name,
          userId: dto.userId,
          isActive: true,
          workoutDays: {
            create: dto.workoutDays.map((workoutDay) => ({
              name: workoutDay.name,
              weekDay: workoutDay.weekDay,
              isRest: workoutDay.isRest,
              estimatedDurationInSeconds: workoutDay.estimatedDurationInSeconds,
              exercises: {
                create: workoutDay.exercises.map((exercise) => ({
                  name: exercise.name,
                  order: exercise.order,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restTimeInSeconds: exercise.restTimeInSeconds,
                })),
              },
            })),
          },
        },
      });
      const result = await tx.workoutPlan.findUnique({
        where: { id: workoutPlan.id },
        include: {
          workoutDays: {
            include: {
              exercises: true,
            },
          },
        },
      });
      if (!result) {
        throw new NotFoundError("Workout plan not found");
      }
      return result;
    });
  }
}
```
