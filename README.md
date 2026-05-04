# Pincel de Luz Personalizados

E-commerce completo para venda de produtos personalizados (gravação a laser/foco-laser), construído como Single Page Application em React + Vite + TypeScript com backend totalmente serverless via Lovable Cloud (Supabase). Cobre toda a operação: catálogo, checkout multi-gateway, ERP de matérias-primas, CRM de leads, automações de marketing, atendimento via WhatsApp e painel administrativo executivo.

> Documentação única do sistema. Para detalhes de deploy, ver `docs/DEPLOY.md`. Para a arquitetura interna, ver `docs/ARCHITECTURE.md`. Para o histórico de refatorações (Ondas 1–34), ver `docs/CHANGELOG.md`.

---

## 1. Propósito

Disponibilizar uma loja virtual de alta conversão para produtos personalizáveis (quadros, placas, presentes em madeira/acrílico com gravação a laser) com:

- **Experiência mobile-first** ocupando 100% do viewport, grid de 3 colunas, sem zoom artificial.
- **Checkout em 3 passos** (Identificação → Entrega → Pagamento) com PIX (5% desc.), Cartão (até 12x, mín. R$ 50/parcela) e Boleto.
- **Operação completa** para o lojista: pedidos, kanban de produção, financeiro, estoque, leads, cupons, automações e atendimento.
- **Segurança nível bancário** para a área administrativa (gateway oculto `/gateway-x7k9m2`, honeypot público, rate-limit, banimento de IP, deterrente de intrusão).

A identidade visual é roxa vibrante (`#7E23B6`) com Neumorphism Maquinado no público e Liquidmorphism Vivo (mesh gradient roxo/azul/ciano + glassmorphism) no admin.

---

## 2. O que o sistema entrega

### 2.1 Loja pública
- **Home dinâmica** com hero banner controlado por admin (`hero_slides`), faixa rainbow de categorias inclinadas, video stories de alta conversão, popups promocionais, mais vendidos, prova social dinâmica.
- **Catálogo** com filtros (categoria, "Maior Desconto"), navegação por chips, paginação, lazy loading abaixo da dobra.
- **Página de produto** com StickyBuyBar, barra de progresso de estoque, urgência visual sem texto (badges pulsantes, barras de cor), galeria, reviews verificados (1–5★, até 4 fotos), cross-selling, metatags dinâmicas, estimativa de entrega (produção + transporte) e formulário de personalização (texto até 400 caracteres + upload de logo até 50 MB).
- **QuickView**: clique na imagem do card abre modal com Buy Now direto.
- **Carrinho** com totais centralizados (`useCartTotals`), barra de frete grátis (`FreeShippingBar`), persistência debounced.
- **Checkout** com cálculo automático de frete via CEP de 8 dígitos (debounce 500 ms, cache TTL 5 min), validação obrigatória de endereço, perfis salvos por cliente.
- **Área do cliente** (`/customer-area`) com pedidos, progresso em tempo real sincronizado com o Kanban, downloads e rastreamento Correios.
- **Autenticação**: e-mail/senha + Google OAuth, validações Zod, split-screen. Facebook não suportado.
- **Wishlist, recently viewed, abandoned cart recovery** (>1h), assistente de IA Luna com markdown de links internos.

### 2.2 Painel administrativo (`/gateway-x7k9m2`)
| Página | Função |
|---|---|
| Dashboard | KPIs consolidados de 15 tabelas via React Query, dark mode persistido |
| Pedidos / Kanban | Stages de produção sincronizadas com a área do cliente |
| Produtos / Categorias | Split-view 2/5 + 3/5, drag-and-drop de imagens para storage |
| Promoções / Cupons | Descontos progressivos, regras por quantidade |
| Hero / Vídeo / Mídia | Slides 100% dinâmicos, bucket `video-stories` |
| Reviews | Moderação, selo de compra verificada |
| Leads | CRM centralizado, tags de cliente e pagamento |
| WhatsApp | Evolution API v2 com failover, templates dinâmicos (1600 chars) |
| Email Templates | Editor split-screen para SMTP Hostinger |
| Cash Flow / Financial | Lucro líquido com Simples Nacional, fluxo de caixa |
| Raw Materials | ERP independente do catálogo, movimentações de estoque |
| Automation / Workflows | Cron jobs com retry (máx. 2, backoff 5 min), Quiet Hours 22h–07h BRT, cooldown 60 min |
| Logs | Auditoria, falhas de notificação |
| Users | RBAC via `user_roles`, sem fallback de admin |
| Settings | Configurações atômicas (saveAll), tema vivid dark |
| Login Customize | Branding da página de login via `login_page_settings` público |
| API Docs | Documentação do webhook bidirecional do CRM |

### 2.3 Backend (Supabase / Lovable Cloud)
- **45+ tabelas** com RLS rigorosa usando `auth.jwt() ->> 'email'` (nunca `auth.users`).
- **25 Edge Functions** Deno: `payment-mercadopago`, `payment-efi`, `payment-stripe`, `payment-webhook`, `calculate-freight`, `whatsapp-evolution`, `notify-customer`, `send-email`, `ai-assistant`, `crm-webhook`, 6 cron jobs (`boleto-reminder-cron`, `cron-cleanup`, `cron-daily-report`, `cron-low-stock-alert`, `cron-reactivate-inactive`, `cron-retry-failed`), `recover-abandoned-carts`, `track-correios`, `admin-gate-check`, etc.
- **Credenciais isoladas** em `payment_credentials`, `email_credentials`, `ai_credentials`, `whatsapp_instances` com RLS dedicada. Service-role keys via Supabase Vault para `pg_cron`.
- **Trigger de profile** atômico no signup.
- **Realtime** habilitado nas tabelas críticas (pedidos, kanban).

---

## 3. Como foi construído (decisões e padrões)

### 3.1 Arquitetura de código
- **Camadas puras** em `src/lib/`: `format`, `sanitize`, `installments`, `freight`, `order`, `pendingPayment`, `idempotency`, `whatsapp-templates`, `cep`, `cpf`, `cnpj`, `orderStatus`, `pricing`, `totals`, `delivery`, `rate-limit`, `secure-storage`, `logger`. Tudo testado isoladamente, sem efeitos colaterais.
- **Hooks compostos** em `src/hooks/`: `useCart`, `useCartTotals`, `useCheckoutTotals`, `usePaymentFlow`, `useFreightCalculator`, `usePaymentGateway`, `useDashboardMetrics`, etc. Limite estrito: **hooks < 180 linhas, páginas < 350 linhas** (Rule Zero).
- **UI** em `src/components/` agrupada por domínio (cart, payment, product, admin, layout, ui shadcn).
- **Refatoração padronizada**: renomear para `.old.tsx` → reconstruir → deletar. Zero código órfão.
- **Forbidden**: `any` em TypeScript, cores cruas em componentes (somente tokens HSL semânticos), `console.*` em produção (usar `lib/logger`).

### 3.2 Design System
- Tokens HSL em `index.css` e `tailwind.config.ts` (`--primary`, `--background`, `--gradient-primary`, `--shadow-elegant`).
- Variantes via `cva` em todos os botões/badges.
- Animações nativas CSS preferidas a framer-motion.
- Mobile: 100% viewport, sem margens laterais, `overflow-x: clip`, navbar bubble flutuante com bolha animada por mola.
- Desktop: bordas neon gradiente (roxo/ciano); mobile: bordas estáticas 0,45 px sólidas.
- Modais: fundo `hsl(250 25% 12%)` com texto claro (contraste global).

### 3.3 Pagamentos & checkout
- IDs de pedido gerados **localmente com `crypto.randomUUID()` + `PLYYMMDD-XXXXXX`** ANTES da chamada ao gateway, garantindo rastreabilidade mesmo em falha.
- Idempotency keys, circuit breaker e rate limiting em `useOrderCreator`.
- PIX vida 15 min, Promise.allSettled para resiliência, polling com backoff.
- Boleto: endereço estruturado obrigatório (compliance Mercado Pago).
- Cartão: parcelamento centralizado em `lib/installments` (máx. 12x, mín. R$ 50/parcela).
- Webhook: matching por `txid` com fallback para `order_number`.

### 3.4 Segurança
- **Admin gate** `/gateway-x7k9m2` (5 tentativas/IP, banimento após 20, timing gate de 2s).
- **Honeypot** `/admin/login` que dispara matriz de extração de dados do intruso ao falhar.
- **Sanitização** Zod + regex estrita, e-mails lowercased, telefones com prefixo `55`.
- **Roles** em tabela separada `user_roles` (jamais em `profiles`); função `has_role` `SECURITY DEFINER`.
- **Sem registro público** de admin. Reset de senha apenas interno.
- **Tabelas públicas** (`*_public`) com `security_invoker` para esconder colunas sensíveis.
- **CORS** das Edge Functions permite `x-supabase-client-*`.
- **Cron** usa `service_role` armazenado no Vault.

### 3.5 Marketing & CRO
- Prova dinâmica, badges de urgência, wishlist, cross-selling, carrinhos abandonados (debounce, detecção >1h, recuperação automatizada).
- Funil de vendas com BI visual.
- EventTracker para profundidade de scroll (25/50/75/100%).
- Sistema centralizado de notificações orquestra 10 eventos via `notify-customer`.
- Templates dinâmicos de WhatsApp e e-mail consumidos pelo backend.

### 3.6 Qualidade
- **146 testes unitários** passando (Vitest) cobrindo `lib/*` e UI crítica do carrinho.
- **TypeScript strict**, zero erros aceitos.
- **Pipeline de detecção** bloqueia arquivos grandes e uso de `any`.
- **Auditoria operacional**: validação ponta-a-ponta antes do release.

---

## 4. Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind v3, shadcn/ui, React Query, React Router |
| Backend | Lovable Cloud (Supabase: Postgres, Auth, Storage, Edge Functions Deno, Realtime, pg_cron, Vault) |
| Pagamentos | Mercado Pago, EFI, Stripe |
| Mensageria | Hostinger SMTP, Evolution API (WhatsApp) |
| IA | Lovable AI Gateway (Gemini/GPT) com fallback nativo |
| Frete | Integração CEP/transportadora em tempo real, cache TTL |
| Deploy | Lovable Publish + opção Hostinger SPA (`.htaccess`) |

---

## 5. Estrutura de pastas (resumo)

```
src/
  pages/           Públicas + admin/ (split por domínio)
  components/      cart, payment, product, admin, layout, ui (shadcn)
  hooks/           Hooks compostos (<180L)
  lib/             Funções puras testáveis
  integrations/    supabase/{client,types}.ts (auto-gerados, NÃO editar)
  test/            Vitest (146 testes)
supabase/
  functions/       25 Edge Functions Deno
  config.toml      Configs por função
docs/
  ARCHITECTURE.md  Detalhes técnicos
  DEPLOY.md        Lovable Publish + Hostinger
  CHANGELOG.md     Ondas 1–34 de refatoração
```

---

## 6. Como rodar

```bash
bun install
bun run dev          # http://localhost:5173
bunx vitest run      # roda os 146 testes
```

O backend já está provisionado via Lovable Cloud — não há `.env` para configurar manualmente. Edge Functions são publicadas automaticamente.

---

## 7. Estado atual

✅ Loja pública 100% funcional (mobile + desktop)  
✅ Checkout 3 passos com PIX/Cartão/Boleto resilientes  
✅ Admin completo (24 páginas) com Liquidmorphism Vivo  
✅ ERP de matérias-primas independente  
✅ CRM bidirecional com webhook autenticado SHA-256  
✅ 6 cron jobs com retry, backoff, Quiet Hours  
✅ 146 testes unitários verdes, 0 erros TS  
✅ Segurança militar no admin gate  

🚧 Próximas ondas (35+): IndexedDB para `useCart`, fatiamento adicional de `usePaymentFlow`, expansão de testes de integração.
