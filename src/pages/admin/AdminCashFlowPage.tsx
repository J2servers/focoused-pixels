import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { CashTransactionsTable, StockControlCard, FiscalControlCard } from '@/components/admin/cashflow';
import { useCashTransactions } from '@/hooks/useCashFlow';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const AdminCashFlowPage = () => {
  const { data: transactions = [] } = useCashTransactions();

  const totalEntries = transactions.filter(t => t.type === 'entry').reduce((s, t) => s + t.amount, 0);
  const totalExits = transactions.filter(t => t.type === 'exit').reduce((s, t) => s + t.amount, 0);
  const balance = totalEntries - totalExits;

  return (
    <AdminLayout title="Fluxo de Caixa" requireEditor>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AdminSummaryCard title="Entradas" value={`R$ ${totalEntries.toFixed(2)}`} icon={TrendingUp} variant="green" />
          <AdminSummaryCard title="Saídas" value={`R$ ${totalExits.toFixed(2)}`} icon={TrendingDown} variant="pink" />
          <AdminSummaryCard title="Saldo" value={`R$ ${balance.toFixed(2)}`} icon={Wallet} variant={balance >= 0 ? 'blue' : 'pink'} />
        </div>

        <CashTransactionsTable />

        <div className="grid md:grid-cols-2 gap-4">
          <StockControlCard />
          <FiscalControlCard />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCashFlowPage;
