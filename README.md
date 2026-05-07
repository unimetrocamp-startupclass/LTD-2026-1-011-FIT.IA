# FIT.IA

> **FIT.IA** é uma API backend para uma plataforma de fitness com inteligência artificial, criada para apoiar a geração de treinos personalizados, o acompanhamento de sessões, a visualização de consistência semanal e a evolução do usuário a partir de métricas de treino.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-black)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com/)

## Visão geral

O **FIT.IA** foi desenvolvido como uma solução backend em **Node.js**, **Fastify**, **TypeScript**, **Prisma** e **PostgreSQL**, com autenticação via **Better Auth** e integração com IA generativa por meio do **Google Gemini** através do AI SDK. O objetivo da aplicação é oferecer uma experiência conversacional em que o usuário informa seus dados físicos, objetivos e restrições, enquanto a IA estrutura um plano semanal de treinos adequado ao seu perfil.[1] [2] [3] [4] [5]

A API foi organizada para atender um produto web de fitness, integrando autenticação, onboarding, criação de planos de treino, consulta do treino do dia, início e conclusão de sessões, cálculo de streak, estatísticas por período e documentação interativa da API.

| Área | Descrição |
|---|---|
| **Produto** | Plataforma de treino personalizada com IA. |
| **Principal recurso** | Personal trainer virtual que cria planos semanais de treino a partir de uma conversa. |
| **Backend** | API REST com Fastify, TypeScript e validação com Zod. |
| **Banco de dados** | PostgreSQL acessado via Prisma ORM. |
| **Autenticação** | Better Auth com provedor Google OAuth. |
| **Documentação** | OpenAPI exposto em `/swagger.json` e interface Scalar em `/docs`. |
| **Deploy** | Configuração pronta para Docker e Render. |

## Funcionalidades

O backend implementa os principais fluxos necessários para uma plataforma de treino personalizada. A jornada começa com a autenticação do usuário, passa pelo cadastro dos dados físicos e segue para a geração e acompanhamento dos treinos.

| Funcionalidade | Descrição |
|---|---|
| **Autenticação de usuários** | Login social com Google e gerenciamento de sessões por Better Auth. |
| **Onboarding físico** | Coleta e atualização de peso, altura, idade e percentual de gordura corporal. |
| **Personal trainer com IA** | Chat autenticado que consulta dados do usuário, coleta informações ausentes e cria planos personalizados. |
| **Criação de planos de treino** | Geração de planos com exatamente sete dias, de segunda a domingo, incluindo dias de descanso. |
| **Treino do dia** | Consulta do treino correspondente a uma data específica. |
| **Sessões de treino** | Registro de início e conclusão de sessões para acompanhamento de aderência. |
| **Consistência semanal** | Mapa de dias com treino iniciado e concluído, útil para heatmaps e dashboards. |
| **Estatísticas por período** | Cálculo de treinos concluídos, taxa de conclusão, tempo total e sequência de treinos. |
| **Documentação interativa** | API Reference em `/docs`, baseada em OpenAPI. |

## Como a IA funciona

A rota de IA atua como um personal trainer virtual. Antes de interagir com o usuário, o assistente consulta os dados físicos cadastrados. Caso alguma informação esteja ausente, ele solicita os dados básicos de onboarding e os salva no perfil do usuário. Quando o usuário pede um plano de treino, a IA pergunta objetivo, disponibilidade semanal e eventuais restrições físicas, então cria um plano persistido no banco.

> O plano gerado deve conter **exatamente sete dias**, de `MONDAY` a `SUNDAY`. Dias sem treino são registrados como descanso, com `isRest: true`, lista vazia de exercícios e duração estimada igual a zero.

A geração do treino segue princípios básicos de organização, como agrupar músculos sinérgicos, evitar treinar o mesmo grupo muscular em dias consecutivos, posicionar exercícios compostos antes dos isoladores e adaptar divisões conforme a disponibilidade semanal do usuário.

| Disponibilidade semanal | Estratégia sugerida pela IA |
|---|---|
| **2 a 3 dias** | Full Body ou ABC. |
| **4 dias** | Upper/Lower ou ABCD. |
| **5 dias** | PPLUL, combinando Push/Pull/Legs com Upper/Lower. |
| **6 dias** | PPL duas vezes na semana. |

## Tecnologias utilizadas

O projeto combina uma stack moderna para APIs performáticas, seguras e tipadas. O **Fastify** é utilizado como framework HTTP, o **Prisma** como camada de acesso ao PostgreSQL, o **Better Auth** como solução de autenticação e o **AI SDK** como camada de integração com modelos generativos.[2] [3] [4] [5]

| Tecnologia | Uso no projeto |
|---|---|
| **Node.js 24** | Ambiente de execução da aplicação. |
| **TypeScript 5.9** | Tipagem estática e organização do código. |
| **Fastify 5** | Framework web para criação das rotas da API. |
| **Zod** | Validação de dados e schemas de requisição/resposta. |
| **Prisma 7** | ORM e geração do client de banco de dados. |
| **PostgreSQL 16** | Banco de dados relacional. |
| **Better Auth** | Autenticação, sessões e integração OAuth com Google. |
| **AI SDK** | Integração com modelo generativo e streaming de resposta. |
| **Google Gemini 2.5 Flash** | Modelo utilizado pelo personal trainer virtual. |
| **Scalar API Reference** | Interface de documentação interativa da API. |
| **Docker Compose** | Orquestração local da API e do PostgreSQL. |
| **Render** | Configuração de deploy por `render.yaml`. |

## Estrutura do repositório

Este repositório concentra o backend da aplicação e os arquivos de infraestrutura relacionados à API. A variável `WEB_APP_BASE_URL` indica que o backend foi preparado para integração com uma aplicação web cliente.

```text
.
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── erros/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── usecases/
│   │   └── index.ts
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── env.example
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── tsconfig.json
├── render.yaml
└── README.md
```

| Diretório ou arquivo | Finalidade |
|---|---|
| `backend/src/index.ts` | Inicialização do servidor, plugins, documentação e registro das rotas. |
| `backend/src/routes` | Definição das rotas HTTP da API. |
| `backend/src/usecases` | Regras de negócio da aplicação. |
| `backend/src/schemas` | Schemas Zod usados em validação e documentação. |
| `backend/src/lib` | Configurações compartilhadas, como autenticação, banco e ambiente. |
| `backend/prisma/schema.prisma` | Modelagem do banco de dados. |
| `backend/docker-compose.yml` | Ambiente local com aplicação e PostgreSQL. |
| `render.yaml` | Configuração de deploy no Render. |

## Modelo de dados

O banco de dados foi modelado para relacionar usuários, planos, dias de treino, exercícios e sessões. Também inclui as tabelas necessárias para autenticação e verificação usadas pelo Better Auth.

| Entidade | Responsabilidade |
|---|---|
| `User` | Armazena dados do usuário, autenticação e informações físicas para personalização. |
| `WorkoutPlan` | Representa um plano de treino de um usuário. Apenas um plano ativo é priorizado por vez. |
| `WorkoutDay` | Representa um dia do plano, com dia da semana, duração, imagem e exercícios. |
| `WorkoutExercise` | Representa exercícios de um dia de treino, com séries, repetições, ordem e descanso. |
| `WorkoutSession` | Registra o início e a conclusão de um treino. |
| `Session`, `Account`, `Verification` | Estruturas de autenticação, sessão e verificação. |

## Pré-requisitos

Antes de executar o projeto, é necessário ter um ambiente compatível com a versão definida no `package.json` e com a configuração do Dockerfile.

| Requisito | Versão ou observação |
|---|---|
| **Node.js** | `24` |
| **pnpm** | `10.32.1` |
| **Docker e Docker Compose** | Recomendado para execução local completa. |
| **PostgreSQL** | Pode ser local ou via Docker Compose. |
| **Credenciais Google OAuth** | Necessárias para autenticação social. |
| **Chave Google Generative AI** | Necessária para a rota de IA. |

## Configuração de ambiente

Crie um arquivo `.env` dentro da pasta `backend`, usando `backend/env.example` como referência.

```bash
cd backend
cp env.example .env
```

Um exemplo mínimo para desenvolvimento local com Docker pode seguir o formato abaixo. Ajuste os segredos reais antes de executar a aplicação.

```env
PORT=3333
NODE_ENV=development

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=fit_ia_db

DATABASE_URL=postgresql://postgres:postgres@localhost:5433/fit_ia_db

BETTER_AUTH_SECRET=troque-este-valor-por-um-segredo-forte
API_BASE_URL=http://localhost:3333
WEB_APP_BASE_URL=http://localhost:3000

GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_GENERATIVE_AI_API_KEY=sua-chave-google-generative-ai
```

| Variável | Descrição | Obrigatória |
|---|---|---|
| `PORT` | Porta em que a API será exposta. O padrão utilizado é `3333`. | Não |
| `NODE_ENV` | Ambiente da aplicação: `development`, `production` ou `test`. | Não |
| `POSTGRES_USER` | Usuário do PostgreSQL usado pelo Docker Compose. | Sim, com Docker |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL usado pelo Docker Compose. | Sim, com Docker |
| `POSTGRES_DB` | Nome do banco criado no container PostgreSQL. | Sim, com Docker |
| `DATABASE_URL` | String de conexão com o PostgreSQL. | Sim |
| `BETTER_AUTH_SECRET` | Segredo usado pela autenticação. | Sim |
| `API_BASE_URL` | URL pública ou local da API. | Sim |
| `WEB_APP_BASE_URL` | Origem permitida para CORS e integração com o frontend. | Sim |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth. | Sim |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth. | Sim |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Chave para uso do modelo generativo. | Sim |

## Executando com Docker

A forma mais simples de executar o projeto localmente é usando Docker Compose, pois ele sobe a API e o PostgreSQL com a configuração esperada pelo backend.

Se estiver dentro da pasta `backend`, execute:

```bash
docker compose up -d
```

Se estiver na raiz do repositório, execute:

```bash
docker compose -f backend/docker-compose.yml up -d
```

Após a inicialização, a API estará disponível em `http://localhost:3333`, considerando `PORT=3333` no arquivo `.env`.

| Ação | Comando |
|---|---|
| Ver containers em execução | `docker compose ps` |
| Acompanhar logs da API | `docker compose logs -f app` |
| Reiniciar a API | `docker compose restart app` |
| Entrar no container da aplicação | `docker compose exec app sh` |
| Parar os serviços | `docker compose down` |

## Executando sem Docker

Também é possível executar a aplicação diretamente no ambiente local, desde que o PostgreSQL esteja disponível e o arquivo `.env` esteja configurado corretamente.

```bash
cd backend
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm run dev
```

A API será iniciada em:

```text
http://localhost:3333
```

## Banco de dados e Prisma

O Prisma é responsável por gerar o client de acesso ao PostgreSQL e aplicar as migrações do banco.[3] Durante o desenvolvimento, os comandos abaixo são os mais importantes.

| Situação | Comando |
|---|---|
| Gerar Prisma Client | `pnpm exec prisma generate` |
| Criar ou aplicar migrations em desenvolvimento | `pnpm exec prisma migrate dev` |
| Aplicar migrations em produção | `pnpm exec prisma migrate deploy` |
| Sincronizar schema sem migration | `pnpm exec prisma db push` |

Quando a aplicação estiver rodando via Docker, execute os comandos dentro do container:

```bash
docker compose exec app pnpm exec prisma migrate dev
docker compose exec app pnpm exec prisma generate
```

## Scripts disponíveis

Os scripts do projeto estão definidos em `backend/package.json`.

| Script | Comando | Descrição |
|---|---|---|
| Desenvolvimento | `pnpm run dev` | Inicia o servidor com `tsx --watch`, recarregando em alterações. |
| Build | `pnpm run build` | Gera o Prisma Client e compila o TypeScript. |

## Rotas principais da API

A documentação interativa pode ser acessada em `/docs`, enquanto o documento OpenAPI bruto fica disponível em `/swagger.json`. A rota raiz retorna uma mensagem de boas-vindas, e `/health` pode ser usada para verificação simples de saúde da aplicação.

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/` | Retorna mensagem de boas-vindas da API. | Não |
| `GET` | `/health` | Verifica se a aplicação está respondendo. | Não |
| `GET` | `/docs` | Interface de documentação interativa da API. | Não |
| `GET` | `/swagger.json` | Especificação OpenAPI da API. | Não |
| `GET/POST` | `/api/auth/*` | Rotas de autenticação gerenciadas pelo Better Auth. | Conforme fluxo |
| `POST` | `/ai` | Chat com personal trainer virtual. | Sim |
| `GET` | `/me` | Consulta dados físicos do usuário autenticado. | Sim |
| `PUT` | `/me` | Cria ou atualiza dados físicos do usuário autenticado. | Sim |
| `GET` | `/home/:date` | Retorna treino do dia, streak e consistência semanal. | Sim |
| `GET` | `/stats?from=YYYY-MM-DD&to=YYYY-MM-DD` | Retorna estatísticas do usuário em um intervalo. | Sim |
| `POST` | `/workout-plans` | Cria um plano de treino. | Sim |
| `GET` | `/workout-plans` | Lista planos de treino do usuário. | Sim |
| `GET` | `/workout-plans/:workoutPlanId` | Consulta um plano específico. | Sim |
| `GET` | `/workout-plans/:workoutPlanId/days/:workoutDayId` | Consulta um dia específico do plano. | Sim |
| `POST` | `/workout-plans/:workoutPlanId/days/:workoutDayId/sessions` | Inicia uma sessão de treino. | Sim |
| `PATCH` | `/workout-plans/:workoutPlanId/days/:workoutDayId/sessions/:workoutSessionId` | Conclui ou atualiza uma sessão de treino. | Sim |

## Exemplos de requisição

Os exemplos abaixo assumem que o usuário já está autenticado e que os cookies ou headers de sessão foram enviados pelo cliente.

### Atualizar dados físicos do usuário

```http
PUT /me
Content-Type: application/json
```

```json
{
  "weightInGrams": 70000,
  "heightInCentimeters": 175,
  "age": 28,
  "bodyFatPercentage": 18
}
```

### Criar um plano de treino manualmente

```http
POST /workout-plans
Content-Type: application/json
```

```json
{
  "name": "Plano Upper Lower",
  "workoutDays": [
    {
      "name": "Upper A",
      "weekDay": "MONDAY",
      "isRest": false,
      "estimatedDurationInSeconds": 3600,
      "coverImageUrl": "https://example.com/upper.png",
      "exercises": [
        {
          "name": "Supino reto",
          "sets": 4,
          "reps": 8,
          "order": 0,
          "restTimeInSeconds": 120
        }
      ]
    }
  ]
}
```

> No fluxo conversacional da IA, o plano gerado deve conter **sete dias**, contemplando todos os dias de `MONDAY` a `SUNDAY`, inclusive os dias de descanso.

### Consultar estatísticas

```http
GET /stats?from=2026-05-01&to=2026-05-31
```

A resposta inclui métricas como sequência de treinos, quantidade de treinos concluídos, taxa de conclusão, tempo total em segundos e consistência por dia.

## Autenticação

A autenticação é configurada com **Better Auth** e provedor social do Google.[4] O backend utiliza `API_BASE_URL` como base da autenticação, `WEB_APP_BASE_URL` como origem confiável e as credenciais `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` para o fluxo OAuth.

As rotas protegidas verificam a sessão do usuário antes de executar os casos de uso. Em caso de sessão ausente, a API retorna erro `401 Unauthorized`.

## Deploy

O arquivo `render.yaml` define um serviço web chamado `fitia-api`, com runtime Docker, Dockerfile localizado em `backend/Dockerfile` e contexto em `backend`. Essa configuração permite publicar a API no Render usando variáveis de ambiente sincronizadas pela plataforma.[6]

| Configuração | Valor |
|---|---|
| Serviço | `fitia-api` |
| Runtime | Docker |
| Dockerfile | `./backend/Dockerfile` |
| Contexto | `./backend` |
| Plano | Free |
| Porta padrão | `3333` |

Antes de publicar em produção, configure as variáveis sensíveis na plataforma, especialmente `DATABASE_URL`, `BETTER_AUTH_SECRET`, credenciais Google OAuth e chave do Google Generative AI.

## Boas práticas de desenvolvimento

Durante a evolução do projeto, recomenda-se manter a separação entre rotas, schemas e casos de uso. Essa organização facilita testes, documentação e manutenção, além de preservar a clareza entre camada HTTP, validação e regra de negócio.

| Prática | Recomendação |
|---|---|
| **Variáveis sensíveis** | Nunca versionar `.env` com segredos reais. |
| **Banco de dados** | Criar migrations para mudanças estruturais no schema. |
| **Validação** | Manter contratos de entrada e saída centralizados nos schemas Zod. |
| **IA** | Preservar regras de segurança e consistência do plano no prompt do sistema. |
| **Autenticação** | Garantir que rotas de usuário sempre validem sessão antes de acessar dados. |
| **Deploy** | Revisar variáveis obrigatórias antes de promover para produção. |

## Roadmap sugerido

As próximas evoluções podem ampliar a experiência do produto e melhorar a confiabilidade da plataforma.

| Prioridade | Melhoria sugerida |
|---|---|
| Alta | Adicionar testes automatizados para casos de uso críticos. |
| Alta | Criar pipeline de CI para build, lint e validação de migrations. |
| Média | Documentar exemplos completos de autenticação no frontend. |
| Média | Adicionar seed de desenvolvimento para facilitar testes locais. |
| Média | Expandir métricas de evolução corporal e progressão de carga. |
| Baixa | Adicionar badges de cobertura e status de deploy. |

## Licença

O `package.json` informa licença **ISC**. Caso o projeto acadêmico ou institucional exija outro modelo, recomenda-se adicionar um arquivo `LICENSE` na raiz do repositório.

## Referências

[1]: https://github.com/unimetrocamp-startupclass/LTD-2026-1-011-FIT.IA "Repositório FIT.IA no GitHub"
[2]: https://fastify.dev/ "Fastify"
[3]: https://www.prisma.io/docs "Prisma Documentation"
[4]: https://www.better-auth.com/ "Better Auth"
[5]: https://ai-sdk.dev/ "AI SDK"
[6]: https://render.com/docs/blueprint-spec "Render Blueprint Specification"
