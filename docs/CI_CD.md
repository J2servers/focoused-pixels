# Pipeline CI/CD

Pipeline completo de integração e deploy contínuo para Pincel de Luz.

## Workflows

| Workflow | Trigger | Objetivo |
|----------|---------|----------|
| `ci-build-test.yml` | PR/push em `main` ou `staging` | Lint, typecheck, testes, scans, build |
| `ci-quality.yml` | PR/push em `main` | Qualidade (já existente) |
| `ci-security.yml` | PR/push em `main` | Segurança (já existente) |
| `ci-architecture.yml` | PR/push em `main` | Arquitetura (já existente) |
| `deploy-staging.yml` | push em `staging` | Deploy automático em ambiente de homologação |
| `deploy-production.yml` | push em `main` ou release | Deploy automático em produção (com guard) |

## Fluxo Git

```
feature/* ──► PR ──► staging ──► PR ──► main
                       │                  │
                       ▼                  ▼
                 deploy-staging     deploy-production
```

## Secrets necessários (GitHub Actions)

### Comuns
- `SUPABASE_ACCESS_TOKEN` — token pessoal Supabase CLI

### Staging
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_PUBLISHABLE_KEY`
- `STAGING_SUPABASE_PROJECT_ID`
- `STAGING_FTP_HOST`, `STAGING_FTP_USER`, `STAGING_FTP_PASSWORD` (Hostinger)

### Produção
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `SUPABASE_DB_PASSWORD` (para migrations)
- `PRODUCTION_FTP_HOST`, `PRODUCTION_FTP_USER`, `PRODUCTION_FTP_PASSWORD`

### Variables (não secretas)
- `STAGING_URL`, `PRODUCTION_URL` — URLs para smoke tests
- `STAGING_FTP_DIR`, `PRODUCTION_FTP_DIR` — diretórios remotos (default `/public_html/`)

## Etapas executadas

### Build & Test (toda PR)
1. Install deps (`bun install --frozen-lockfile`)
2. Lint (ESLint)
3. TypeScript check
4. Unit tests (Vitest)
5. Scans: any-usage, file-sizes, role-fallbacks, env-exposure
6. Build de produção
7. Upload do artefato `dist/` (7 dias)

### Deploy Staging (push em `staging`)
1. Install + testes
2. Build com vars de staging
3. Deploy de Edge Functions via Supabase CLI
4. Upload `dist/` para Hostinger (FTP)
5. Smoke test (5 retries)

### Deploy Production (push em `main` ou release)
1. **Guard job**: lint + typecheck + tests precisam passar
2. Build com vars de produção
3. Deploy de Edge Functions
4. Aplicação de migrations (`supabase db push`)
5. Deploy frontend via FTP
6. Smoke test
7. Alerta em caso de falha

## Concurrency

- `deploy-staging`: cancela deploys anteriores em andamento
- `deploy-production`: **não cancela** — espera o anterior finalizar (segurança)

## Rollback

1. Reverter commit em `main` e fazer push → pipeline redeploya versão anterior
2. Ou disparar `workflow_dispatch` apontando para um SHA específico
3. Para Edge Functions: `npx supabase functions deploy <name> --project-ref <ref>` localmente

## Configuração inicial

1. Criar branches `main` e `staging` no GitHub
2. Em **Settings → Environments**, criar `staging` e `production` (com required reviewers em produção)
3. Adicionar secrets e variables conforme tabela acima
4. Habilitar branch protection: PR obrigatório + checks `Build & Test`, `CI Quality`, `CI Security` passing
