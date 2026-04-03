import { useState } from 'react';
import { AdminLayout, DataTable, Column, AdminFilterBar } from '@/components/admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { useAdminLogs, type AuditLog } from '@/hooks/useAdminLogs';

const TABLE_NAMES: Record<string, string> = {
  products: 'Produtos',
  categories: 'Categorias',
  promotions: 'Promoções',
  hero_slides: 'Hero Slides',
  company_info: 'Empresa',
  orders: 'Pedidos',
  coupons: 'Cupons',
  reviews: 'Avaliações',
  leads: 'Leads',
  quotes: 'Orçamentos',
};

const getActionBadge = (action: string) => {
  switch (action) {
    case 'INSERT': return <AdminStatusBadge label="Criação" variant="success" />;
    case 'UPDATE': return <AdminStatusBadge label="Edição" variant="info" />;
    case 'DELETE': return <AdminStatusBadge label="Exclusão" variant="danger" />;
    default: return <AdminStatusBadge label={action} variant="neutral" />;
  }
};

const AdminLogsPage = () => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState(100);

  const { data: logs = [], isLoading } = useAdminLogs({ actionFilter, moduleFilter, dateFrom, dateTo, limit });

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      log.table_name.toLowerCase().includes(term) ||
      log.record_id?.toLowerCase().includes(term) ||
      log.user_id?.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term)
    );
  });

  const exportColumns = [
    { key: 'created_at_fmt', header: 'Data/Hora' },
    { key: 'action', header: 'Ação' },
    { key: 'table_name_fmt', header: 'Módulo' },
    { key: 'record_id', header: 'ID do Registro' },
    { key: 'user_id', header: 'Usuário' },
    { key: 'ip_address', header: 'IP' },
  ];

  const exportData = filteredLogs.map(log => ({
    ...log,
    created_at_fmt: format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    table_name_fmt: TABLE_NAMES[log.table_name] || log.table_name,
  }));

  const columns: Column<AuditLog>[] = [
    {
      key: 'created_at',
      header: 'Data/Hora',
      sortable: true,
      render: (log) => (
        <span className="text-sm text-[hsl(var(--admin-text-muted))]">
          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Ação',
      render: (log) => getActionBadge(log.action),
    },
    {
      key: 'table_name',
      header: 'Módulo',
      render: (log) => (
        <span className="text-white">{TABLE_NAMES[log.table_name] || log.table_name}</span>
      ),
    },
    {
      key: 'record_id',
      header: 'ID do Registro',
      render: (log) => (
        <span className="font-mono text-xs text-[hsl(var(--admin-text-muted))]">{log.record_id?.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'user_id',
      header: 'Usuário',
      render: (log) => (
        <span className="font-mono text-xs text-[hsl(var(--admin-text-muted))]">{log.user_id?.slice(0, 8) || 'Sistema'}...</span>
      ),
    },
  ];

  const uniqueModules = [...new Set(logs.map(l => l.table_name))];

  return (
    <AdminLayout title="Logs de Auditoria">
      <div className="space-y-4">
        <AdminFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar nos logs...">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ações</SelectItem>
              <SelectItem value="INSERT">Criação</SelectItem>
              <SelectItem value="UPDATE">Edição</SelectItem>
              <SelectItem value="DELETE">Exclusão</SelectItem>
            </SelectContent>
          </Select>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[160px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos módulos</SelectItem>
              {uniqueModules.map(m => (
                <SelectItem key={m} value={m}>{TABLE_NAMES[m] || m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white" placeholder="De" />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white" placeholder="Até" />
          <ExportButtons data={exportData} columns={exportColumns} filename="logs-auditoria" title="Logs de Auditoria" />
        </AdminFilterBar>

        <DataTable
          data={filteredLogs}
          columns={columns}
          isLoading={isLoading}
          searchPlaceholder="Buscar logs..."
          emptyMessage="Nenhum log registrado ainda"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminLogsPage;
