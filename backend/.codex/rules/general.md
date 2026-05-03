# CODEX.md

Este arquivo fornece orientações ao Codex Code (codex.ai/code) ao trabalhar com código neste repositório.

**Regras de API (Fastify), use cases, validação em duas camadas e erros customizados estão detalhadas em `@.codex/rules/architecture.md`.** Este arquivo resume stack, comandos e estrutura; ao implementar rotas ou use cases, aplique sempre os dois documentos em conjunto.

## Stack

- Node.js (ES modules)
- pnpm como package manager
- TypeScript (target ES2024)
- Fastify com `fastify-type-provider-zod` e **Zod v4** (nunca Zod v3)
- Prisma ORM com PostgreSQL (usando pg adapter)
- better-auth para autenticação

## Comandos

```bash
# Desenvolvimento
pnpm dev                    # Servidor dev com watch (tsx --watch)

# Banco de dados
pnpm prisma generate        # Gera o Prisma client (também roda no postinstall)
pnpm prisma migrate dev     # Migrations em desenvolvimento
pnpm prisma studio          # Prisma Studio

# Linting
pnpm eslint .               # ESLint
```

## Commits

- Ao realizar commits, **SEMPRE** siga o padrão Conventional Commits. Exemplo: `feat: add workout session start route`.

## Arquitetura

### Regras de código (rotas × use cases)

- Rotas ficam em `src/routes`: só validação estrutural com Zod, autenticação quando necessário, chamada ao use case e **`try`/`catch`** mapeando exceções para status HTTP. Schemas de request/response e `ErrorSchema` em `src/schemas/index.ts`.
- Use cases ficam em `src/usecases`: **toda** regra de negócio; Prisma chamado diretamente no use case; entrada/saída tipadas como `InputDto` / `OutputDto`; **sem** `try`/`catch` para HTTP. Falhas de negócio → classes em `src/erros/index.ts`; a rota traduz cada tipo de erro para o código adequado (`400`, `404`, `409`, …) e lista esses status em `schema.response`.
- Duas camadas de validação (**rota** = formato/constraints Zod; **use case** = estado, vínculos, transições, ordem temporal). O use case permanece defensivo mesmo se a rota já validar o body.

### Estrutura de Diretórios

- `src/` — código da aplicação
  - `routes/` — definições Fastify; sem regra de negócio
  - `schemas/` — Zod (`src/schemas/index.ts`) para payloads e erros padronizados
  - `usecases/` — casos de uso (classes com `execute`)
  - `erros/` — erros customizados exportados em `src/erros/index.ts`
  - `lib/db.ts` — client Prisma (pg adapter)
  - `lib/auth.ts` — better-auth (`auth.api.getSession` nas rotas protegidas)
  - `entities/` — interfaces TypeScript do domínio (quando existirem)
  - `generated/` — Prisma client (`generated/prisma/`)
- `prisma/` — schema e migrations

### Documentação da API

Swagger UI disponível em `/docs` quando o servidor está rodando (porta 4949).

## MCPs

- **SEMPRE** use Context7 para buscar documentações
- **SEMPRE** use Serena para semantic code retrieval e editing tools.
- **SEMPRE** use Perplexity quando precisar de pesquisa web atualizada (APIs recentes, breaking changes, changelogs e dúvidas fora da documentação oficial).
- As chaves MCP devem ser lidas do `.env` (preferencialmente `MCP_PASSWORD`; fallback: `CONTEXT7_API_KEY` e `PERPLEXITY_API_KEY`).
- Antes de iniciar o Codex, garanta que as variáveis do `.env` estejam exportadas no ambiente da sessão atual.

## Docker

- Consulte e siga sempre as regras em `@.codex/rules/docker.md` para qualquer operação com containers.
- Para desenvolvimento local padrão, priorize executar a API e o banco via Docker Compose.
