Useful Windows/PowerShell commands:
- List files: `Get-ChildItem -Force`
- Fast file search: `rg --files`
- Fast text search: `rg -n "pattern" src prisma -S`
- Run dev server: `pnpm dev`
- Type check: `pnpm exec tsc --noEmit`
- Prisma generate: `pnpm exec prisma generate`
- Prisma migrate dev: `pnpm exec prisma migrate dev --name <migration_name>`
Package manager is pnpm. package.json currently only defines `dev`.