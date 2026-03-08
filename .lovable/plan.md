

# Plano de Ação Completo — Recriação do Sistema Pincel de Luz

Este documento mapeia **todas as partes do sistema atual** e descreve como recriar cada uma do zero.

---

## Visão Geral da Arquitetura

```text
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│                                                     │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Storefront   │  │ Painel Admin│  │  Auth Flow │ │
│  │  (Loja)       │  │ (Dashboard) │  │ (Login/Reg)│ │
│  └──────────────┘  └─────────────┘  └────────────┘ │
├─────────────────────────────────────────────────────┤
│                 BACKEND (Lovable Cloud)              │
│  Database (18 tabelas) + Edge Functions (7) + RLS   │
└─────────────────────────────────────────────────────┘
```

---

## PARTE 1 — BANCO DE DADOS (18 Tabelas)

| # | Tabela | Função |
|---|--------|--------|
| 1 | `profiles` | Dados do usuário (nome, avatar) |
| 2 | `user_roles` | Permissões (admin/editor/support) |
| 3 | `company_info` | Configurações globais da loja (50+ campos) |
| 4 | `products` | Catálogo de produtos |
| 5 | `categories` | Categorias e subcategorias (hierárquica) |
| 6 | `hero_slides` | Banners do Hero dinâmico |
| 7 | `orders` | Pedidos |
| 8 | `order_items` | Itens de pedido |
| 9 | `quotes` | Orçamentos do checkout |
| 10 | `reviews` | Avaliações de clientes |
| 11 | `leads` | Captação de leads |
| 12 | `coupons` | Cupons de desconto |
| 13 | `promotions` | Promoções por produto/categoria |
| 14 | `cash_transactions` | Fluxo de caixa |
| 15 | `payment_credentials` | Credenciais de gateways |
| 16 | `audit_logs` | Logs de auditoria |
| 17 | `page_views` | Analytics de visitas |
| 18 | `raw_materials` / `stock_movements` | Controle de estoque |
| 19 | `tracking_events` | Rastreio de entregas |
| 20 | `api_keys` | Chaves de API para integração CRM |
| 21 | `webhook_logs` | Logs de webhooks |
| 22 | `promo_popups` | Pop-ups promocionais |
| 23 | `email_templates` | Templates de e-mail |
| 24 | `company_tax_settings` | Config fiscal/impostos |

**Como fazer:** Criar migrations SQL sequenciais com todas as tabelas, enums (`app_role`), funções (`has_role`, `has_admin_access`, `is_admin_or_editor`), triggers (`handle_new_user`, `update_updated_at`, `log_audit_action`) e políticas RLS.

---

## PARTE 2 — AUTENTICAÇÃO E RBAC

- **Componentes:** LoginPage, RegisterPage, AdminLoginPage
- **Hook:** `useAuth.ts` — gerencia sessão, login/cadastro, OAuth Google, reset de senha
- **Contexto:** `AuthContext.tsx` — provê estado de auth globalmente
- **Roles:** admin (acesso total), editor (CRUD produtos), support (visualização)
- **Funções SQL:** `has_role()`, `has_admin_access()`, `is_admin_or_editor()` — SECURITY DEFINER

**Como fazer:** 
1. Criar tabelas `profiles` e `user_roles` com RLS
2. Criar trigger `handle_new_user` para auto-criar perfil
3. Implementar hook `useAuth` com `onAuthStateChange`
4. Criar `AuthContext` e `AuthProvider`
5. Páginas de login com validação Zod e OAuth Google

---

## PARTE 3 — STOREFRONT (Loja Pública)

### 3.1 Layout Global
- **TopBar** — mensagem de frete grátis (dinâmica do `company_info`)
- **MainHeader** — logo, busca, carrinho, menu de categorias
- **Footer** — links institucionais, redes sociais, copyright
- **Providers:** `SiteSettingsProvider` (carrega `company_info` globalmente)

### 3.2 Páginas Públicas

| Página | Rota | Descrição |
|--------|------|-----------|
| Home | `/` | Hero slider + categorias + produtos destaque |
| Categoria | `/categoria/:slug` | Grid de produtos filtrado |
| Produto | `/produto/:slug` | Galeria, preço, avaliações, WhatsApp |
| Carrinho | `/carrinho` | Lista de itens, cupom, total |
| Checkout | `/checkout` | 5 etapas (Cliente, Produto, Especificações, Comercial, Revisão) |
| Busca | `/busca` | Busca com filtros |
| Pagamento | `/pagamento` | PIX, Cartão, Boleto |
| Rastreio | `/rastreio` | Consulta status de entrega |
| Sobre | `/sobre` | Página institucional |
| FAQ | `/faq` | Perguntas frequentes |
| Privacidade | `/privacidade` | Política de privacidade |
| Termos | `/termos` | Termos de uso |
| Área do Cliente | `/minha-area` | Pedidos e dados do cliente |
| Login/Cadastro | `/login`, `/cadastro` | Autenticação de clientes |

### 3.3 Componentes de Conversão
- **HeroConversion** — Slider dinâmico com framer-motion, dados de `hero_slides`
- **ProductCardOptimized** — Card com hover, preço, desconto, quick view
- **TrustBar** — Selos de confiança com marquee
- **SocialProofSection** — Reviews aprovadas
- **GuaranteesSection** — Ícones de garantias
- **FreeShippingProgress** — Barra de progresso para frete grátis
- **ViewingNowBadge** — "X pessoas vendo agora"
- **BestSellersSection** — Produtos mais vendidos

### 3.4 Funcionalidades do Storefront
- **Carrinho** (`useCart.ts`) — Zustand com persistência em localStorage
- **Cupons** (`useCoupons.ts`) — Validação e aplicação de descontos
- **Reviews** — Envio com fotos (upload para bucket `review-images`)
- **Cookie Banner** — LGPD compliance
- **WhatsApp Button** — Flutuante, mensagem dinâmica
- **AI Chat Widget** — Assistente virtual configurável
- **PromoPopup** — Pop-ups ativados por tempo/scroll
- **QuickViewModal** — Visualização rápida de produto
- **MiniCart** — Preview do carrinho no header

**Como fazer:** Criar cada componente consumindo dados via hooks do TanStack Query + Supabase client.

---

## PARTE 4 — PAINEL ADMINISTRATIVO (17 páginas)

### 4.1 Estrutura
- **AdminLayout** — Sidebar + Header, verificação de role
- **AdminSidebar** — Navegação colapsável, responsiva
- **AdminHeader** — Título da página, perfil do usuário

### 4.2 Páginas Admin

| Página | Rota | Funcionalidade |
|--------|------|----------------|
| Dashboard | `/admin` | Receita, pedidos, visitas, rankings, alertas de estoque |
| Pedidos | `/admin/pedidos` | Listagem, filtros, status, rastreio |
| Orçamentos | `/admin/orcamentos` | Orçamentos recebidos, conversão em pedido |
| Kanban | `/admin/kanban` | 6 estágios de produção (drag visual) |
| Produtos | `/admin/produtos` | CRUD completo com galeria, custos, estoque |
| Categorias | `/admin/categorias` | Pai + Subcategorias, imagens |
| Cupons | `/admin/cupons` | Criar/editar cupons de desconto |
| Promoções | `/admin/promocoes` | Promoções por produto/categoria |
| Hero Banners | `/admin/hero` | Gerenciar slides do hero |
| Avaliações | `/admin/avaliacoes` | Moderar reviews de clientes |
| Leads | `/admin/leads` | Lista de leads capturados |
| Empresa | `/admin/empresa` | Dados da empresa, logos, redes sociais |
| Usuários | `/admin/usuarios` | Gerenciar usuários e roles |
| Logs | `/admin/logs` | Logs de auditoria |
| Configurações | `/admin/configuracoes` | 12 abas (SEO, Aparência, Checkout, IA, Pagamentos...) |
| API Docs | `/admin/api` | Documentação da API de integração CRM |
| Login Admin | `/admin/login` | Acesso ao painel |

### 4.3 Dashboard — Cards e Widgets
- `FinancialSummaryCards` — Receita bruta/líquida, pedidos do mês
- `SiteVisitsCard` — Gráfico de visitas (recharts)
- `ProductRankingCard` — Top produtos vendidos
- `LowStockAlert` — Produtos com estoque baixo
- `TaxInfoCard` — Info fiscal (Simples Nacional)
- `ProductMarginTable` — Margem de lucro por produto

### 4.4 Fluxo de Caixa
- `CashFlowSummaryCards` — Entradas, saídas, saldo
- `CashTransactionsTable` — Tabela de transações
- `CashTransactionDialog` — Modal para criar/editar
- `FiscalControlCard` — Resumo fiscal
- `StockControlCard` — Resumo de inventário

**Como fazer:** Cada página usa `AdminLayout` wrapper + hooks específicos (`useOrders`, `useProducts`, `useCashFlow`, `useFinancialData`, `usePageViews`, `useLeads`).

---

## PARTE 5 — EDGE FUNCTIONS (7 funções)

| Função | Descrição |
|--------|-----------|
| `ai-assistant` | Chat IA com modelos Lovable AI |
| `payment-mercadopago` | Processamento PIX/Cartão/Boleto via MP |
| `payment-efi` | Processamento via EFI Bank (Gerencianet) |
| `payment-stripe` | Processamento via Stripe |
| `payment-webhook` | Webhook unificado para atualizar status de pagamento |
| `track-correios` | Proxy para API dos Correios (rastreio) |
| `crm-webhook` | API bidirecional para integração CRM |

**Como fazer:** Cada função em `supabase/functions/<nome>/index.ts`, com CORS headers, `verify_jwt = false` no `config.toml`, e validação manual de auth quando necessário.

---

## PARTE 6 — HOOKS DE DADOS (16 hooks)

| Hook | Tabela/Fonte |
|------|-------------|
| `useAuth` | auth + profiles + user_roles |
| `useProducts` | products + categories |
| `useCart` | localStorage (Zustand) |
| `useCashFlow` | cash_transactions |
| `useCompanyInfo` | company_info |
| `useCoupons` | coupons |
| `useCustomerOrders` | orders |
| `useFinancialData` | orders + order_items + company_tax_settings |
| `useLeads` | leads |
| `useOrders` | orders + order_items |
| `usePageViews` | page_views |
| `usePaymentCredentials` | payment_credentials |
| `usePaymentGateway` | Edge Functions de pagamento |
| `usePromotions` | promotions |
| `useSiteSettings` | company_info (via provider) |

**Como fazer:** Cada hook usa TanStack Query (`useQuery`/`useMutation`) + Supabase client para CRUD.

---

## PARTE 7 — SISTEMA DE PAGAMENTOS

1. **Configuração** — Admin configura credenciais em `/admin/configuracoes` aba Pagamentos
2. **Checkout** — Cliente escolhe método (PIX 5% desc, Cartão 12x, Boleto)
3. **Processamento** — Edge Function cria cobrança no gateway
4. **Webhook** — Gateway notifica → Edge Function atualiza status do pedido
5. **Feedback** — Páginas de sucesso/erro/pendente

---

## PARTE 8 — MOBILE

- `MobileHeader` — Header compacto
- `MobileBottomNav` — Navegação inferior fixa
- `MobileHeroCarousel` — Carousel otimizado
- `MobileCategoryGrid` — Grid de categorias
- `MobileProductCard` — Cards otimizados para toque
- `MobileFloatingContact` — Botão WhatsApp flutuante

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

```text
Fase 1: Fundação
  ├── 1.1 Banco de dados (migrations com todas as tabelas + RLS)
  ├── 1.2 Autenticação (useAuth, AuthContext, login/cadastro)
  └── 1.3 Hooks base (useProducts, useCompanyInfo, useSiteSettings)

Fase 2: Storefront
  ├── 2.1 Layout (Header, Footer, TopBar dinâmicos)
  ├── 2.2 Home (Hero, categorias, produtos)
  ├── 2.3 Páginas de produto e categoria
  ├── 2.4 Carrinho e checkout
  └── 2.5 Componentes de conversão (Trust, Reviews, etc.)

Fase 3: Painel Admin
  ├── 3.1 Layout Admin (Sidebar, Header, AdminLayout)
  ├── 3.2 Dashboard com cards financeiros
  ├── 3.3 CRUD de produtos e categorias
  ├── 3.4 Gestão de pedidos e Kanban
  ├── 3.5 Configurações (12 abas)
  └── 3.6 Módulos auxiliares (Leads, Reviews, Cupons, Promoções)

Fase 4: Integrações
  ├── 4.1 Edge Functions de pagamento
  ├── 4.2 Rastreio Correios
  ├── 4.3 Chat IA
  └── 4.4 API CRM

Fase 5: Mobile & Polish
  ├── 5.1 Componentes mobile
  ├── 5.2 Responsividade total
  └── 5.3 Analytics, cookies, SEO
```

---

Este plano cobre **100% do sistema atual**: 24+ tabelas, 25+ páginas, 7 Edge Functions, 16 hooks, 3 roles de acesso, 5 gateways de pagamento, e todos os componentes de storefront e admin.

