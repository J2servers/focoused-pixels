
# 🔄 Reconstrução Total do Admin — Liquidmorphism Vivid

## Estratégia: Rename → Rebuild → Delete
Para cada arquivo: renomear `.old.tsx` → criar novo do zero usando o antigo como referência de funcionalidade → deletar o `.old`.

---

## 🎨 DNA Visual: Liquidmorphism Vivid
- **Background:** gradientes suaves e leves (roxo→azul→ciano em baixa opacidade)
- **Cards:** fundo translúcido (`backdrop-blur-xl`) com bordas gradientes vivas
- **Transparência:** 60-80% de opacidade nos containers, revelando o gradiente de fundo
- **Texto:** alto contraste (branco puro sobre vidro escuro)
- **Botões:** sólidos, vibrantes, sem pulse, com hover suave
- **Inputs:** vidro escuro com bordas luminosas no focus

---

## FASE 1 — Tokens CSS + Base (2 arquivos)
1. `src/index.css` — Novos tokens `--admin-liquid-*`, gradientes de fundo, classes base
2. `src/components/admin/AdminButtonStyles.ts` — Nova paleta de botões sólidos vivid

## FASE 2 — Core Layout (4 arquivos)
3. `AdminLayout.tsx` — Layout com background gradiente + blur
4. `AdminSidebar.tsx` — Sidebar liquidmorphism com grupos colapsáveis
5. `AdminHeader.tsx` — Header translúcido com breadcrumbs
6. `AdminPageGuide.tsx` — Cards de guia com vidro colorido

## FASE 3 — Componentes Reutilizáveis (6 arquivos)
7. `DataTable.tsx` — Tabela com linhas hover translúcidas
8. `AdminSummaryCard.tsx` — KPI cards com gradientes vivos
9. `AdminStatusBadge.tsx` — Badges com glow sutil
10. `AdminFilterBar.tsx` — Barra de filtros em vidro
11. `ExportButtons.tsx` — Botões de exportação vivid
12. `ProductDetailPanel.tsx` — Painel split-view liquid

## FASE 4 — Páginas Principais (6 arquivos)
13. `AdminDashboardPage.tsx` — Dashboard com charts em vidro
14. `AdminProductsPage.tsx` — Produtos split-view liquid
15. `AdminCategoriesPage.tsx` — Categorias split-view liquid
16. `AdminOrdersPage.tsx` — Pedidos com kanban liquid
17. `AdminSettingsPage.tsx` — Configurações em abas liquid
18. `AdminCompanyPage.tsx` — Empresa com seções liquid

## FASE 5 — Páginas Secundárias (8 arquivos)
19. `AdminCouponsPage.tsx`
20. `AdminPromotionsPage.tsx`
21. `AdminHeroPage.tsx`
22. `AdminUsersPage.tsx`
23. `AdminLeadsPage.tsx`
24. `AdminQuotesPage.tsx`
25. `AdminEmailTemplatesPage.tsx`
26. `AdminKanbanPage.tsx`

## FASE 6 — Páginas Especializadas (6 arquivos)
27. `AdminCashFlowPage.tsx` + subcomponentes cashflow
28. `AdminReviewsPage.tsx`
29. `AdminRawMaterialsPage.tsx`
30. `AdminWorkflowsPage.tsx` + subcomponentes workflows
31. `AdminWhatsAppPage.tsx` + subcomponentes whatsapp
32. `AdminWhyChooseUsPage.tsx`

## FASE 7 — Páginas Restantes + Subcomponentes (12 arquivos)
33. `AdminApiDocsPage.tsx`
34. `AdminMediaPage.tsx`
35. `AdminLogsPage.tsx`
36. `AdminLoginPage.tsx`
37. Settings subcomponentes (6 arquivos)
38. Templates subcomponentes (4 arquivos)
39. Company subcomponentes (3 arquivos)
40. Dashboard subcomponentes (7 arquivos)

---

## 📊 Totais
- **~84 arquivos** a reconstruir
- **~7-8 fases** (1 fase por mensagem)
- **Hooks NÃO são alterados** (só UI)
- **Zero tempo de inatividade** (rename protege o original)

## ⚠️ Regras
- Cada arquivo novo é escrito DO ZERO, sem copiar/colar do antigo
- O antigo serve APENAS como referência de funcionalidade (quais hooks, quais dados)
- Nenhum arquivo é deletado até o novo estar 100% funcional e verificado
- Build check (tsc --noEmit) ao final de cada fase
