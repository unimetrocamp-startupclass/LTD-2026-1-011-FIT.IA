# GEMINI.md

Este arquivo orienta o Gemini CLI ao trabalhar com o codigo deste repositorio.

## Visao Geral

API de treinos construida com Fastify 5, TypeScript, Prisma 7 e Better-Auth.
Roda em Node.js 24.x com pnpm 10.30.0.

## Comandos

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Iniciar PostgreSQL
docker-compose up -d

# Migrations do Prisma
pnpm exec prisma migrate dev
pnpm exec prisma generate

# Lint
pnpm exec eslint .

# Formatacao
pnpm exec prettier --write .
```

## Regras do Projeto

@.codex/rules/general.md
@.codex/rules/architecture.md
@.codex/rules/typescript.md
@.codex/rules/docker.md

## MCPs (Context7, Serena e Perplexity)

- A configuracao dos MCPs do Gemini CLI fica em `/.gemini/settings.json`.
- Servidores usados neste projeto:
  - `serena` (busca semantica e navegacao de codigo)
  - `context7` (documentacao oficial atualizada)
  - `perplexity` (pesquisa web atualizada)
- Chaves MCP deste projeto:
  - `MCP_PASSWORD` (fonte principal)
  - `CONTEXT7_API_KEY` e `PERPLEXITY_API_KEY` (fallback)

## Como iniciar no PowerShell (carregar `.env` na sessao)

```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $name, $value = $_ -split '=', 2
  [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
}
```

Depois de carregar as variaveis, execute o Gemini CLI na raiz do projeto.
