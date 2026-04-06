import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { CashFlowSummaryCards, CashTransactionDialog, CashTransactionsTable, StockControlCard, FiscalControlCard } from '@/components/admin/cashflow';
import { Button } from '@/components/ui/button';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { useCashTransactions, useCreateCashTransaction, useDeleteCashTransaction } from '@/hooks/useCashFlow';
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EXPORT_COLUMNS = [
  { key: 'type_label', header: 'Tipo' },
  { key: 'category', header: 'Categoria' },
  { key: 'description', header: 'Descrição' },
  { key: 'amount_fmt', header: 'Valor' },
  { key: 'payment_method', header: 'Método' },
  { key: 'date_fmt', header: 'Data' },
];

const AdminCashFlowPage = () => {
  const { data: transactions = [], isLoading } = useCashTransactions();
  const createTx = useCreateCashTransaction();
  const deleteTx = useDeleteCashTransaction();
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalEntries = transactions.filter(t => t.type === 'entry').reduce((s, t) => s + t.amount, 0);
  const totalExits = transactions.filter(t => t.type === 'exit').reduce((s, t) => s + t.amount, 0);
  const balance = totalEntries - totalExits;

  const exportData = transactions.map(t => ({
    ...t,
    type_label: t.type === 'entry' ? 'Entrada' : 'Saída',
    amount_fmt: `R$ ${t.amount.toFixed(2)}`,
    date_fmt: format(new Date(t.transaction_date), 'dd/MM/yyyy', { locale: ptBR }),
  }));

  return (
    <AdminLayout title="Fluxo de Caixa" requireEditor>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[hsl(var(--admin-text))]">Fluxo de Caixa</h2>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Controle de entradas e saídas financeiras</p>
          </div>
          <div className="flex gap-2">
            <ExportButtons data={exportData} columns={EXPORT_COLUMNS} filename="fluxo-caixa" title="Fluxo de Caixa" />
            <Button onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />Nova Transação
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminSummaryCard title="Entradas" value={`R$ ${totalEntries.toFixed(2)}`} icon={TrendingUp} variant="green" />
          <AdminSummaryCard title="Saídas" value={`R$ ${totalExits.toFixed(2)}`} icon={TrendingDown} variant="pink" />
          <AdminSummaryCard title="Saldo" value={`R$ ${balance.toFixed(2)}`} icon={Wallet} variant={balance >= 0 ? 'blue' : 'pink'} />
        </div>

        <CashTransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          onDelete={(id) => deleteTx.mutate(id)}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <StockControlCard />
          <FiscalControlCard />
        </div>

        <CashTransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={async (data) => {
            await createTx.mutateAsync(data);
            setDialogOpen(false);
          }}
          isPending={createTx.isPending}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCashFlowPage;
