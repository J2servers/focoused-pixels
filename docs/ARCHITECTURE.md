# Arquitetura — Pincel de Luz Personalizados

## Visão geral em camadas

```
┌──────────────────────────────────────────────────────────────┐
│  UI (src/pages, src/components)                              │
│  - Páginas finas (<350L), componentes por domínio            │
│  - shadcn/ui + tokens HSL semânticos                         │
└──────────────────────────────────────────────────────────────┘
                          │ React Query / hooks
┌──────────────────────────────────────────────────────────────┐
│  Hooks (src/hooks) — orquestração                            │
│  useCart, useCartTotals, useCheckoutTotals, usePaymentFlow,  │
│  useFreightCalculator, usePaymentGateway, useDashboardMetrics│
│  Limite: 180 linhas/hook                                     │
└──────────────────────────────────────────────────────────────┘
                          │ chamadas puras
┌──────────────────────────────────────────────────────────────┐
│  Bibliotecas puras (src/lib) — sem efeitos                   │
│  format, sanitize, installments, freight, order,             │
│  pendingPayment, idempotency, whatsapp-templates,            │
│  cep, cpf, cnpj, orderStatus, pricing, totals, delivery,     │
│  rate-limit, secure-storage, logger                          │
│  Cobertura Vitest: 146 testes                                │
└──────────────────────────────────────────────────────────────┘
                          │ Supabase JS client
┌──────────────────────────────────────────────────────────────┐
│  Lovable Cloud (Supabase)                                    │
│  Postgres + RLS · Auth · Storage · Realtime · pg_cron · Vault│
│  Edge Functions Deno (25)                                    │
└──────────────────────────────────────────────────────────────┘
```

## Banco de dados (45+ tabelas)

### Catálogo & vendas
`products`, `products_public`, `categories`, `coupons`, `coupons_public`, `promotions`, `reviews`, `reviews_public`, `orders`, `order_items`, `quotes`, `tracking_events`.

### Clientes & auth
`profiles`, `user_roles`, `customer_checkout_profiles`, `login_attempts`, `ip_blocklist`, `login_page_settings`, `audit_logs`.

### Marketing & CRO
`leads`, `abandoned_cart_sessions`, `abandoned_cart_reminders`, `hero_slides`, `video_stories`, `promo_popups`, `page_views`.

### ERP & financeiro
`raw_materials`, `stock_movements`, `cash_transactions`, `company_tax_settings`, `company_info`, `company_info_public`.

### Comunicação
`email_templates`, `email_credentials`, `whatsapp_templates`, `whatsapp_instances`, `whatsapp_messages`, `notification_failures`, `webhook_logs`.

### Infra/automação
`api_keys`, `payment_credentials`, `ai_credentials`, `automation_workflows`, `workflow_executions`, `system_cron_runs`.

### Padrões de segurança
- RLS sempre habilitada. Identificação por `auth.jwt() ->> 'email'` (nunca via `auth.users`).
- Roles em tabela separada com função `has_role(_user_id, _role) SECURITY DEFINER` para evitar recursão.
- Views `*_public` com `security_invoker = true` escondem colunas sensíveis.
- Validações em **triggers** (não CHECK), porque CHECK precisa ser imutável.
- Service-role keys de cron jobs ficam no **Supabase Vault**.

## Edge Functions (25)

| Categoria | Funções |
|---|---|
| Pagamento | `payment-mercadopago`, `payment-efi`, `payment-stripe`, `payment-webhook` |
| Frete & rastreio | `calculate-freight`, `track-correios` |
| Comunicação | `send-email`, `notify-customer`, `whatsapp-evolution`, `notify-pending-payments` |
| IA & CRM | `ai-assistant`, `crm-webhook` |
| Carrinho abandonado | `upsert-abandoned-cart`, `recover-abandoned-carts`, `trigger-abandoned-cart-recovery`, `abandoned-cart-insights` |
| Cron | `boleto-reminder-cron`, `cron-cleanup`, `cron-daily-report`, `cron-low-stock-alert`, `cron-reactivate-inactive`, `cron-retry-failed` |
| Workflow & segurança | `execute-workflow`, `admin-gate-check`, `admin-reset-password` |

CORS permite `x-supabase-client-*`. Auth headers injetados manualmente como `Bearer`; validação por `auth.getClaims`.

## Fluxo de checkout

1. **Carrinho** → `useCart` persiste em `localStorage` debounced; `useCartTotals` calcula subtotal/desconto/frete grátis.
2. **Identificação** → validação Zod (CPF módulo 11, telefone com `55`, e-mail lowercased).
3. **Entrega** → CEP 8 dígitos dispara `calculate-freight` (debounce 500 ms, cache TTL 5 min em `lib/freight`).
4. **Pagamento**:
   - `lib/order.generateOrderNumber` cria `PLYYMMDD-XXXXXX` localmente.
   - `useOrderCreator` insere o pedido com idempotency key.
   - `usePaymentGateway` chama a Edge Function correspondente (PIX/Cartão/Boleto).
   - PIX: vida 15 min, polling com backoff em `usePixPolling`.
   - Cartão: parcelas via `lib/installments` (máx 12, mín R$ 50).
   - Boleto: endereço estruturado obrigatório.
5. **Webhook** atualiza status (matching por `txid` → fallback `order_number`).
6. **Notify** dispara e-mail (Hostinger SMTP) e WhatsApp (Evolution API v2 com failover).

## Convenções de código

- TypeScript strict; `any` proibido.
- Hooks ≤ 180 linhas, páginas ≤ 350 linhas.
- Cores apenas via tokens HSL.
- `console.*` proibido — usar `lib/logger`.
- Refatoração: `.old.tsx` → reconstruir → deletar.
- Sem dependências hardcoded de contato/logo: tudo de `company_info` (`ORDER BY updated_at DESC LIMIT 1`).
