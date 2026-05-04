# Changelog — Refatorações em ondas

Histórico das ondas executadas pela equipe sênior. Cada onda agrega múltiplos commits.

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
