# Docker

## Objetivo

- Garantir um ambiente de desenvolvimento reproduzivel com `app` + `postgres`.
- Priorizar execucao via Docker Compose quando o usuario pedir para rodar, testar ou depurar a API.

## Regras para o Codex

- Sempre validar se existe stack ativa antes de subir uma nova (`docker compose ps`).
- Sempre usar `docker compose` (na pasta `backend/`) para comandos de ciclo de vida.
- Nunca assumir que o banco local esta ativo fora do Compose.
- Quando alterar `prisma/schema.prisma` ou migrations, executar no container:
  - `docker compose exec app pnpm exec prisma generate`
  - `docker compose exec app pnpm exec prisma migrate deploy`
- Para comandos de desenvolvimento no app, priorizar execucao dentro do container:
  - `docker compose exec app pnpm run dev` (quando necessario)
  - `docker compose logs -f app` para debug.

## Fluxo padrao

1. Subir stack:
   - `docker compose up -d --build`
2. Conferir saude:
   - `docker compose ps`
   - `docker compose logs --tail=100 app`
3. Validar API:
   - `GET http://localhost:3333/health`
4. Encerrar quando necessario:
   - `docker compose down`

## Boas praticas

- Manter `DATABASE_URL` do container apontando para `postgres:5432`.
- Evitar instalar dependencias manualmente dentro do container; atualizar `package.json` e rebuildar imagem.
- Nao commitar segredos reais em `.env`; usar exemplos quando possivel.
