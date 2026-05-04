# Plano Clean Code — Pincel de Luz

**Princípios aplicados (Robert C. Martin, Clean Code):**
1. **SRP** — Single Responsibility Principle (1 arquivo, 1 motivo para mudar)
2. **DRY** — Don't Repeat Yourself (utils centralizadas em `src/lib/`)
3. **SOC** — Separation of Concerns (UI ≠ lógica ≠ dados)
4. **Nomes expressivos** — funções/variáveis auto-documentadas
5. **Funções pequenas** — alvo <20 linhas, zero side-effects ocultos
6. **Early returns** — eliminar nesting profundo
7. **Limites de arquivo** — Pages <350L, Hooks <180L, Components <300L

---

## 📊 Auditoria Inicial (49.129 LOC em src/)

### Hooks violando limite (180L) — 11 arquivos
| Arquivo | LOC | Problema |
|---|---|---|
| useTemplates.ts | 412 | CRUD + validação + envio + variáveis misturados |
| usePaymentGateway.ts | 361 | 3 gateways + checkout + status no mesmo hook |
| useWorkflows.ts | 335 | Execuções + steps + triggers |
| useCompanyInfo.ts | 328 | Read + write + cache + multiple consumers |
| useProducts.ts | 299 | Listagem + filtros + mutations |
| useFinancialData.ts | 294 | Tax + reports + cashflow agregados |
| usePaymentFlow.ts | 289 | Coordenação multi-step |
| useOrders.ts | 246 | CRUD + filters + delete + status |
| useSiteSettings.ts | 231 | Settings + branding + CRO |
| useAuth.ts | 212 | Auth + role + profile |
| useCashFlow.ts | 205 | Transactions + summary |

### Pages violando limite (350L) — 12 arquivos
- AdminEmailTemplatesPage 548, AdminDashboardPage 496, AdminCouponsPage 483
- ProductPage 464, WhyChooseUsPage 443, AdminProductsPage 440
- AdminWhyChooseUsPage 409, AdminQuotesPage 381, AdminOrdersPage 380
- TrackingPage 371, AdminApiDocsPage 358, AdminLoginCustomizePage 354

### Componentes >300L — 16 arquivos
- VisualWorkflowBuilder 569, TemplateDialogs 525, PaymentStepDetails 490
- AIChatWidget 476, WorkflowSidebar 424, ProductDetailPanel 424
- MobileHeader 371, DynamicMainHeader 370, TemplateCards 364
- WorkflowNodeConfig 364, ImageUpload 363, ProductImageGallery 346
- PaymentStepPayment 326, AdminSidebar 307, ui/chart 303

### Utilitários duplicados detectados
- `normalizePhone` repetido em 4 edge functions + frontend
- `formatCurrency` espalhado em 8+ componentes
- Validação de email/CEP duplicada

---

## 🌊 Ondas de Refatoração

### Onda 1 — Hooks Críticos (em progresso)
- [x] Plano gerado
- [ ] `useTemplates` → `useTemplatesQuery` + `useTemplatesMutations` + `useTemplateVariables`
- [ ] `usePaymentGateway` → split por gateway (`useMercadoPago`, `useEfi`, `useStripe`) + `usePaymentRouter`
- [ ] `useWorkflows` → `useWorkflowsList` + `useWorkflowExecution` + `useWorkflowSteps`
- [ ] `useCompanyInfo` → `useCompanyInfoRead` (público) + `useCompanyInfoMutation` (admin)
- [ ] `useProducts` → `useProductsQuery` + `useProductsMutations` + `useProductFilters`

### Onda 2 — Bibliotecas compartilhadas (DRY)
- [ ] `src/lib/format.ts` — formatCurrency, formatDate, formatPhone
- [ ] `src/lib/validation.ts` — schemas Zod compartilhados (email, phone, CEP)
- [ ] `src/lib/sanitize.ts` — normalizePhone, lowercaseEmail
- [ ] `supabase/functions/_shared/format.ts` — espelho server-side

### Onda 3 — Pages Admin (8 arquivos >350L)
- Extrair seções em sub-componentes (`<Header/>`, `<Filters/>`, `<DataGrid/>`, `<DetailPanel/>`)
- Mover handlers para hooks dedicados

### Onda 4 — Componentes Gigantes (>400L)
- VisualWorkflowBuilder, TemplateDialogs, PaymentStepDetails, AIChatWidget
- Quebrar em pedaços por responsabilidade

### Onda 5 — Pages Public
- ProductPage, WhyChooseUsPage, TrackingPage

### Onda 6 — Polimento Final
- Renomear funções obscuras
- Eliminar comentários redundantes
- Adicionar JSDoc onde necessário
- Verificar consistência de nomes (camelCase, PascalCase)

---

## 📐 Padrões de Convenção

```
hooks/
  feature-name/
    index.ts                 # re-exports
    useFeatureNameQuery.ts   # SELECTs (React Query)
    useFeatureNameMutations.ts # INSERT/UPDATE/DELETE
    types.ts                 # interfaces compartilhadas
```

```
components/feature/
  index.tsx          # orquestrador (<200L)
  FeatureHeader.tsx
  FeatureFilters.tsx
  FeatureList.tsx
  FeatureDetail.tsx
```

**Regra de ouro:** Se um arquivo passa do limite, é sinal de que tem mais de uma responsabilidade.
