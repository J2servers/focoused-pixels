import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { CashTransactionsTable, StockControlCard, FiscalControlCard } from '@/components/admin/cashflow';
import { useCashTransactions } from '@/hooks/useCashFlow';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const AdminCashFlowPage = () => {
  const { data: transactions = [] } = useCashTransactions();

  const totalEntries = transactions.filter(t => t.type === 'entry').reduce((s, t) => s + t.amount, 0);
  const totalExits = transactions.filter(t => t.type === 'exit').reduce((s, t) => s + t.amount, 0);
  const balance = totalEntries - totalExits;

  return (
    <AdminLayout title="Fluxo de Caixa" requireEditor>
      <div className="space-y-5">
        <AdminPageGuide
          title="💰 Guia do Fluxo de Caixa"
          description="Controle entradas, saídas e saldo financeiro da empresa."
          steps={[
            { title: "Registrar transação", description: "Clique em 'Nova Transação' para adicionar entradas ou saídas com categoria e descrição." },
            { title: "Filtrar período", description: "Use os filtros de data para visualizar o fluxo de caixa de períodos específicos." },
            { title: "Controle de estoque", description: "O card de estoque mostra o valor investido em matérias-primas." },
            { title: "Controle fiscal", description: "Acompanhe impostos e obrigações fiscais no card dedicado." },
            { title: "Exportar dados", description: "Exporte relatórios em CSV ou PDF para contabilidade." },
          ]}
        />

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
