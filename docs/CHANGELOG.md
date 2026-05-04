# Changelog — Refatorações em ondas

Histórico das ondas executadas pela equipe sênior. Cada onda agrega múltiplos commits.

## Onda 37 — Limpeza final & cobertura (Onda 3 do plano)
- Eliminados todos os `any` remanescentes em `src/` (SettingsPaymentsSection, SettingsEmailSection, WorkflowSidebar) com tipos derivados de `PaymentCredentials`/`EmailCredentials`/`WorkflowStep`.
- Cron `cleanup_old_telemetry_daily` agendado (03:30 UTC) para retenção de `page_views`, `audit_logs` e `notification_failures`.
- Novos testes: `webhook-crypto.test.ts` (HMAC RFC 4231, timing-safe, sanitizePhone), `crm-helpers.test.ts` (order number), `checkout-details-validation.test.ts` (CPF + CEP + envio).
- **Suíte: 152 testes em 25 arquivos, todos passando.**

## Onda 36 — Arquitetura & integridade (Onda 2 do plano)
- **Banco**: FKs em `order_items`/`orders`/`categories`, 18 índices novos, função `cleanup_old_telemetry`.
- **Edges**: novo `_shared/logger.ts` (JSON estruturado), `_shared/mp/{config,limits}.ts`, `_shared/webhook/{crypto,crm}.ts`. Substituídos 100+ `console.*` e todos os `any` em edges.
- **Frontend**: hooks `useUniversalSearch`, `useNotifyWhenAvailable`. CPF obrigatório e validado (mod-11) em `PaymentStepDetails`. Race em `useAuthSession` corrigida.

## Onda 35 — Bloqueadores críticos (Onda 1 do plano)
- Triggers `validate_order_totals`, `adjust_stock_on_order_item`, `restore_stock_on_order_cancel`.
- Função `record_login_attempt` (SECURITY DEFINER) substituindo policy quebrada.
- 4 views públicas recriadas com `security_invoker=true`.
- `execute-workflow` modularizada: 1129L → ~300L + 6 módulos em `_shared/workflow/`.

## Onda 34 — Hardening de checkout
- Removidos duplicados `generateOrderNumber` e `sanitizePhone` em `hooks/payment/types.ts` (re-export de `lib/order` + `lib/sanitize` + `lib/format`).
- Novos módulos: `lib/cep.ts`, `lib/cpf.ts` (módulo 11 completo), `lib/cnpj.ts` (módulo 11 + pesos W1/W2), `lib/orderStatus.ts` (labels + classes HSL).
- Novos testes: `cpf-cnpj-cep.test.ts`, `orderStatus.test.ts`. **Suíte: 146 testes passando.**

## Onda 33 — Storage helpers & templates
- `lib/pendingPayment.ts`: wrappers SSR-safe para `sessionStorage`.
- `lib/whatsapp-templates.ts`: mensagens de carrinho, cotação, recuperação.
- `generateOrderNumber` reconciliado para `PLYYMMDD-XXXXXX`.
- `useFreightCalculator` migrado para `fetchViaCep` cacheado.
- 15 novos testes (idempotency, pendingPayment, whatsapp-templates).

## Ondas 26–32 — Modularização freight/order/totals
- `lib/freight.ts` (cache TTL 5 min, parsing tipado, `cheapestQuote`/`fastestQuote`, `applyFreeShippingThreshold`).
- `lib/order.ts` (geração de número, address lines, production notes).
- `useCheckoutTotals` compõe `useCartTotals` + credenciais para preview de parcelas.
- `useFreightCalculator` migrado para `lib/logger`.

## Ondas 22–25 — Parcelamento & UI consistente
- `lib/installments.ts` (máx 12x, mín R$ 50, `maxInstallmentPreview`).
- `CartStickyCheckoutBar` usa `formatCurrency` + pluralização.
- `FreeShippingBar` integrado ao `ProductPage`.
- 18 novos testes de UI/lib.

## Ondas anteriores (1–21)
- Implementação inicial: catálogo, checkout 3 passos, admin Liquidmorphism, segurança gateway, ERP, CRM webhook, automações, IA Luna, neumorphism mobile, etc.
- Ver memórias em `mem://` para detalhes por feature.
