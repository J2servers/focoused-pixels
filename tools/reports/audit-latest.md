# 🔍 Relatório de Auditoria do Projeto — 2026-05-02 (Re-scan)

## Resumo Executivo

| Scanner | Status | Achados |
|---|---|---|
| 🔒 Secrets no frontend | ✅ LIMPO | 0 |
| 🔑 Fallback de role | ✅ LIMPO | 0 |
| 📏 Arquivos acima do limite | ⚠️ 57 violações | 12 críticos · 13 high · 32 medium |
| 🔤 Uso de `any` | ⚠️ 124 ocorrências | concentradas em hooks e edge functions |
| 🏗️ Arquitetura | ⚠️ 17 problemas | queries diretas em UI |
| 🛡️ RLS fraca em migrations | ⚠️ 25 patterns | 9 em tabelas sensíveis (histórico) |
| 🔐 Scan de segurança | ✅ Tratado | findings públicos justificados |
| 🧪 Testes | ✅ 23/23 passando | 5 suites |

## 🔴 Top 12 Arquivos Críticos (>2x do limite)

| Arquivo | Linhas | Limite | Excesso | Categoria |
|---|---:|---:|---:|---|
| `src/pages/admin/AdminLoginPage.tsx` | 862 | 350 | +512 | Page |
| `src/pages/CategoryPage.tsx` | 728 | 350 | +378 | Page |
| `src/pages/CustomerAreaPage.tsx` | 707 | 350 | +357 | Page |
| `src/components/ui/sidebar.tsx` | 638 | 220 | +418 | Component (shadcn — ignorar) |
| `src/components/admin/workflows/VisualWorkflowBuilder.tsx` | 570 | 220 | +350 | Component |
| `src/hooks/usePaymentFlow.ts` | 538 | 180 | +358 | Hook |
| `src/components/admin/templates/TemplateDialogs.tsx` | 526 | 220 | +306 | Component |
| `src/components/payment/PaymentStepDetails.tsx` | 491 | 220 | +271 | Component |
| `src/components/chat/AIChatWidget.tsx` | 477 | 220 | +257 | Component |
| `src/hooks/useDashboardMetrics.ts` | 470 | 180 | +290 | Hook |
| `src/pages/CartPage.tsx` | ~400 | 350 | +50 | Page |
| `src/pages/admin/AdminEmailTemplatesPage.tsx` | 549 | 350 | +199 | Page (high) |

## 🔤 Hotspots de `any` (top 10)

| Ocorrências | Arquivo |
|---:|---|
| 16 | `supabase/functions/execute-workflow/index.ts` |
| 15 | `src/hooks/usePageViews.ts` |
| 15 | `src/hooks/useWorkflows.ts` |
| 11 | `src/hooks/useTemplates.ts` |
| 11 | `src/pages/admin/AdminDashboardPage.tsx` |
| 10 | `src/pages/admin/AdminLoginPage.tsx` |
| 9 | `src/hooks/useDashboardMetrics.ts` |
| 9 | `supabase/functions/crm-webhook/index.ts` |
| 7 | `src/pages/admin/AdminOrdersPage.tsx` |
| 5 | `src/hooks/useCompanyInfo.ts` |

## 🏗️ Queries Diretas em UI (17 problemas)

Componentes chamando `supabase.from(...)` diretamente em vez de via hook/service:

- `src/components/admin/UniversalSearch.tsx`
- `src/components/admin/dashboard/RealActivityFeed.tsx`
- `src/components/admin/settings/SettingsOperationsSection.tsx`
- `src/components/admin/whatsapp/WhatsAppMessageLog.tsx` *(também: mixed concerns)*
- `src/components/conversion/SocialProofSection.tsx`
- `src/components/product/NotifyWhenAvailable.tsx`
- `src/components/reviews/ProductReviews.tsx`
- *(+ 10 outros componentes admin/conversion)*

## 🟢 Controles Implementados

1. **6 scanners customizados** em `tools/audit/`
2. **4 workflows CI** em `.github/workflows/`
   - `ci-quality.yml` — lint, typecheck, testes
   - `ci-security.yml` — secrets, roles, RLS, dependências
   - `ci-architecture.yml` — tamanho de arquivos, arquitetura
   - `ci-autofix-candidate.yml` — correções seguras automáticas
3. **Script de autofix seguro** em `tools/fix/safe-autofix.mjs`
4. **23 testes unitários** cobrindo cart, auth, utils, exports
5. **Proteção contra senhas vazadas** ativada

## 📋 Plano de Remediação (Ordenado por Risco)

### Onda 1 — Hooks críticos (em andamento)
- [x] Atualizar relatório com números reais
- [ ] `usePaymentFlow.ts` (538L) → quebrar em `usePaymentState`, `usePaymentInstallments`, `usePaymentSubmit`
- [ ] `useDashboardMetrics.ts` (470L) → já existe `useDashboardMetricsHelpers.ts`; finalizar extração

### Onda 2 — Pages admin críticas
- [ ] `AdminLoginPage.tsx` (862L) → extrair painel de honeypot, deterrent matrix, form
- [ ] `AdminEmailTemplatesPage.tsx` (549L)
- [ ] `AdminDashboardPage.tsx` (497L)

### Onda 3 — Pages frontend críticas
- [ ] `CategoryPage.tsx` (728L) → extrair filtros, grid, hero
- [ ] `CustomerAreaPage.tsx` (707L) → extrair tabs (orders, profile, addresses)

### Onda 4 — Componentes pesados
- [ ] `VisualWorkflowBuilder.tsx`, `TemplateDialogs.tsx`, `AIChatWidget.tsx`, `PaymentStepDetails.tsx`

### Onda 5 — Type safety
- [ ] Eliminar 124 `any` (priorizar hooks: `usePageViews`, `useWorkflows`, `useTemplates`)

### Onda 6 — Arquitetura
- [ ] Mover queries diretas dos 17 componentes para hooks dedicados

## Findings de Segurança Justificados

| Finding | Decisão | Razão |
|---|---|---|
| Orders INSERT pública | ✅ Intencional | Pedidos anônimos permitidos |
| Quotes INSERT pública | ✅ Intencional | Formulário público |
| Reviews INSERT pública | ✅ Intencional | Aprovação admin |
| Leads INSERT pública | ✅ Intencional | Newsletter |
| `company_info_public` SELECT true | ✅ Correto | Tabela espelho sem campos sensíveis |
| `sidebar.tsx` 638L | ✅ Ignorar | Shadcn UI (terceiro) |
