# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Stack

- Node.js (ES modules)
- pnpm como package manager
- TypeScript (target ES2024)
- Fastify com Zod type provider
- Prisma ORM com PostgreSQL (usando pg adapter)
- better-auth para autenticação

## Comandos

```bash
# Desenvolvimento
pnpm dev                    # Inicia servidor dev com watch mode (tsx --watch)

# Build
pnpm build                  # Build com tsup

# Banco de dados
pnpm prisma generate        # Gera o Prisma client (também roda no postinstall)
pnpm prisma migrate dev     # Executa migrations em desenvolvimento
pnpm prisma studio          # Abre o Prisma Studio GUI

# Linting
pnpm eslint .               # Executa ESLint
```

## Arquitetura

### Estrutura de Diretórios

- `src/` - Código fonte da aplicação
  - `lib/db.ts` - Setup do client do banco (Prisma com pg adapter)
  - `entities/` - Interfaces TypeScript para entidades de domínio
  - `errors/` - Arquivos com classes de erro
  - `schemas/` - Schemas Zod para validação de request/response
  - `usecases/` - Classes de lógica de negócio (padrão use case)
  - `generated/` - Prisma client gerado automaticamente (output em `generated/prisma/`)
- `prisma/` - Schema e migrations do Prisma

### Documentação da API

Swagger UI disponível em `/docs` quando o servidor está rodando (porta 4949).

## MCPs

- **SEMPRE** use Context7 para buscar documentações
- **SEMPRE** use Serena para semantic code retrieval e editing tools.
- **SEMPRE** use Perplexity quando precisar de pesquisa web atualizada (APIs recentes, breaking changes, changelogs e dúvidas fora da documentação oficial).
- As chaves MCP devem ser lidas do `.env` (preferencialmente `MCP_PASSWORD`; fallback: `CONTEXT7_API_KEY` e `PERPLEXITY_API_KEY`).
- Antes de iniciar o Codex, garanta que as variáveis do `.env` estejam exportadas no ambiente da sessão atual.

## Docker

- Consulte e siga sempre as regras em `@.codex/rules/docker.md` para qualquer operacao com containers.
- Para desenvolvimento local padrao, priorize executar a API e o banco via Docker Compose.
