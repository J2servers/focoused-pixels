## Análise do Painel Admin — Itens Incompletos

### 1. ❌ Página Fluxo de Caixa ausente
Existem componentes (`CashFlowSummaryCards`, `CashTransactionDialog`, etc.) e hook `useCashFlow`, mas **NÃO existe uma página nem rota** para Fluxo de Caixa no admin.

### 2. ❌ Edição de papel do usuário (AdminUsersPage)
O hook `useUpdateUserRole` existe mas **NÃO é utilizado** na página. Só é possível criar e deletar — **não editar a função** do usuário.

### 3. ❌ Produtos sem descrição completa (full_description)
O formulário de produtos **não tem campo para `full_description`** (apenas `short_description`). O campo existe na tabela.

### 4. ❌ Exportação CSV ausente em várias páginas
Apenas AdminOrdersPage tem ExportButtons. Faltam em: Produtos, Categorias, Leads, Cupons, Orçamentos, Avaliações.

### 5. ❌ AdminUsersPage sem e-mail visível
O hook retorna `email: ''` pois não busca da tabela auth. Precisa buscar do profile ou exibir aviso.

### 6. ❌ Fluxo de Caixa no sidebar
Não há link para Caixa no sidebar.

### 7. ❌ Matérias-primas sem página
Existe tabela `raw_materials` e `stock_movements` mas sem página de gestão.

---

## Plano de Implementação (por prioridade)

| # | Tarefa | Impacto |
|---|--------|---------|
| 1 | Criar página AdminCashFlowPage + rota + sidebar | Alto |
| 2 | Adicionar edição de papel no AdminUsersPage | Médio |
| 3 | Adicionar campo full_description no form de produtos | Médio |
| 4 | Adicionar ExportButtons nas páginas que faltam | Médio |
| 5 | Criar página AdminRawMaterialsPage + rota + sidebar | Alto |
| 6 | Corrigir exibição de email no AdminUsersPage | Baixo |
