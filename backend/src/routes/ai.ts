import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ValidationError } from "../erros/index.js";
import { auth } from "../lib/auth.js";
import {
  UserTrainDataBodySchema,
  WorkoutDayInputSchema,
} from "../schemas/index.js";
import { CreateWorkoutPlan } from "../usecases/CreateWorkoutPlan.js";
import { GetUserTrainData } from "../usecases/GetUserTrainData.js";
import { ListWorkoutPlans } from "../usecases/ListWorkoutPlans.js";
import { UpsertUserTrainData } from "../usecases/UpsertUserTrainData.js";

const SYSTEM_PROMPT = `Você é um personal trainer virtual especialista em montagem de planos de treino personalizados.

## Personalidade
- Tom amigável, motivador e acolhedor.
- Linguagem simples e direta, sem jargões técnicos. Seu público principal são pessoas leigas em musculação.
- Respostas curtas e objetivas.

## Regras de Interação
1. SEMPRE chame a tool getUserTrainData antes de qualquer interação com o usuário. Isso é obrigatório.
2. Se o usuário não tem dados cadastrados, ou getUserTrainData retornou null:
   - Pergunte nome, peso em kg, altura em cm, idade e percentual de gordura corporal.
   - O percentual de gordura corporal é um inteiro de 0 a 100, onde 100 representa 100%.
   - Faça perguntas simples e diretas, tudo em uma única mensagem.
   - Após receber os dados, salve com a tool updateUserTrainData.
   - IMPORTANTE: converta o peso de kg para gramas, multiplicando por 1000, antes de salvar.
3. Se o usuário já tem dados cadastrados, cumprimente-o pelo nome de forma amigável.

## Criação de Plano de Treino
Quando o usuário quiser criar um plano de treino:
- Pergunte o objetivo, quantos dias por semana ele pode treinar e se tem restrições físicas ou lesões.
- Faça poucas perguntas, simples e diretas.
- O plano DEVE ter exatamente 7 dias, de MONDAY a SUNDAY.
- Dias sem treino devem ter isRest: true, exercises: [] e estimatedDurationInSeconds: 0.
- Chame a tool createWorkoutPlan para salvar o plano.

### Divisões de Treino
- 2-3 dias/semana: Full Body ou ABC (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas+Ombros).
- 4 dias/semana: Upper/Lower (recomendado, cada grupo 2x/semana) ou ABCD (A: Peito+Tríceps, B: Costas+Bíceps, C: Pernas, D: Ombros+Abdômen).
- 5 dias/semana: PPLUL, Push/Pull/Legs + Upper/Lower (superior 3x, inferior 2x/semana).
- 6 dias/semana: PPL 2x, Push/Pull/Legs repetido.

### Princípios Gerais de Montagem
- Músculos sinérgicos juntos, como peito+tríceps e costas+bíceps.
- Exercícios compostos primeiro, isoladores depois.
- 4 a 8 exercícios por sessão.
- 3-4 séries por exercício.
- 8-12 reps para hipertrofia e 4-6 reps para força.
- Descanso entre séries: 60-90s para hipertrofia e 120-180s para compostos pesados.
- Evite treinar o mesmo grupo muscular em dias consecutivos.
- Use nomes descritivos para cada dia, como "Superior A - Peito e Costas" ou "Descanso".

### Imagens de Capa (coverImageUrl)
SEMPRE forneça um coverImageUrl para cada dia de treino. Escolha com base no foco muscular:

Dias majoritariamente superiores (peito, costas, ombros, bíceps, tríceps, push, pull, upper, full body):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO3y8pQ6GBg8iqe9pP2JrHjwd1nfKtVSQskI0v
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOW3fJmqZe4yoUcwvRPQa8kmFprzNiC30hqftL

Dias majoritariamente inferiores (pernas, glúteos, quadríceps, posterior, panturrilha, legs, lower):
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCOgCHaUgNGronCvXmSzAMs1N3KgLdE5yHT6Ykj
- https://gw8hy3fdcv.ufs.sh/f/ccoBDpLoAPCO85RVu3morROwZk5NPhs1jzH7X8TyEvLUCGxY

Alterne entre as duas opções de cada categoria para variar. Dias de descanso usam imagem de superior.`;

export const aiRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["AI"],
      summary: "Chat with AI personal trainer",
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const userId = session.user.id;
      const { messages } = request.body as { messages: UIMessage[] };
      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        stopWhen: stepCountIs(10),
        tools: {
          getUserTrainData: tool({
            description:
              "Busca os dados de treino do usuário autenticado. Retorna null se não houver dados cadastrados.",
            inputSchema: z.object({}),
            execute: async () => {
              const getUserTrainData = new GetUserTrainData();
              try {
                return await getUserTrainData.execute({ userId });
              } catch (error) {
                if (error instanceof ValidationError) {
                  return null;
                }
                throw error;
              }
            },
          }),
          updateUserTrainData: tool({
            description:
              "Cria ou atualiza os dados de treino do usuário autenticado. O peso deve ser em gramas; bodyFatPercentage é um inteiro de 0 a 100.",
            inputSchema: UserTrainDataBodySchema.extend({
              weightInGrams: z
                .number()
                .int()
                .positive()
                .describe("Peso em gramas. Exemplo: 70kg = 70000."),
              heightInCentimeters: z
                .number()
                .int()
                .positive()
                .describe("Altura em centímetros."),
              age: z.number().int().positive().describe("Idade do usuário."),
              bodyFatPercentage: z
                .number()
                .int()
                .min(0)
                .max(100)
                .describe(
                  "Percentual de gordura corporal como inteiro de 0 a 100. 100 representa 100%.",
                ),
            }),
            execute: async (input) => {
              const upsertUserTrainData = new UpsertUserTrainData();
              return upsertUserTrainData.execute({
                userId,
                ...input,
              });
            },
          }),
          getWorkoutPlans: tool({
            description: "Lista os planos de treino do usuário autenticado.",
            inputSchema: z.object({}),
            execute: async () => {
              const listWorkoutPlans = new ListWorkoutPlans();
              return listWorkoutPlans.execute({ userId });
            },
          }),
          createWorkoutPlan: tool({
            description:
              "Cria um novo plano de treino completo para o usuário.",
            inputSchema: z.object({
              name: z
                .string()
                .trim()
                .min(1)
                .describe("Nome do plano de treino"),
              workoutDays: z
                .array(WorkoutDayInputSchema)
                .length(7)
                .describe(
                  "Array com exatamente 7 dias de treino (MONDAY a SUNDAY)",
                ),
            }),
            execute: async (input) => {
              const createdWorkoutPlan = new CreateWorkoutPlan();
              return createdWorkoutPlan.execute({
                userId,
                name: input.name,
                workoutDays: input.workoutDays,
              });
            },
          }),
        },
      });

      const response = result.toUIMessageStreamResponse();
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      return reply.send(response.body);
    },
  });
};
