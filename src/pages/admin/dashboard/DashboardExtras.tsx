import { MetricCard as M } from '@/components/admin/dashboard';
import {
  Landmark, UserPlus, Users, FileText, RefreshCw, Webhook, AlertTriangle, Heart, Layers,
} from 'lucide-react';
import type { DashboardMetricsData } from './types';

export function DashboardExtras({ m }: { m: DashboardMetricsData }) {
  return (
    <div className="col-span-12 grid grid-cols-12 gap-2">
      <M label="Boleto (R$)" value={m.boletoTotal} icon={Landmark} color="bg-slate-600" format="currency" />
      <M label="Leads Semana" value={m.leadsSemana} icon={UserPlus} color="bg-violet-600" />
      <M label="Leads Mês" value={m.leadsMes} icon={UserPlus} color="bg-purple-600" />
      <M label="Desinscritos" value={m.leadsDesinscritos} icon={Users} color="bg-gray-600" />
      <M label="Clientes Mês" value={m.newCustomersMonth} icon={UserPlus} color="bg-rose-600" />
      <M label="Orç. Hoje" value={m.orcamentosHoje} icon={FileText} color="bg-violet-700" />
      <M label="Orç. Mês" value={m.orcamentosMes} icon={FileText} color="bg-purple-700" />
      <M label="Mov. Hoje" value={m.movimentacoesHoje} icon={RefreshCw} color="bg-blue-600" />
      <M label="Webhooks" value={m.webhooksRecebidos} icon={Webhook} color="bg-indigo-600" />
      <M label="WH Erros" value={m.webhooksErro} icon={AlertTriangle} color={m.webhooksErro > 0 ? 'bg-red-600' : 'bg-green-600'} />
      <M label="Inscritos" value={m.leadsInscritos} icon={Heart} color="bg-green-600" />
      <M label="Categorias" value={m.totalCategorias} icon={Layers} color="bg-indigo-600" href="/admin/categorias" />
    </div>
  );
}
