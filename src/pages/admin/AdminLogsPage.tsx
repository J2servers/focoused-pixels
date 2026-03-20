import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Search, Calendar, Filter } from 'lucide-react';
import type { Json } from '@/integrations/supabase/types';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  ip_address: string | null;
  created_at: string;
}

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

const AdminLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState(100);

  const fetchLogs = async () => {
    setIsLoading(true);
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionFilter !== 'all') query = query.eq('action', actionFilter);
    if (moduleFilter !== 'all') query = query.eq('table_name', moduleFilter);
    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
    if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);

    const { data } = await query;
    if (data) setLogs(data as unknown as AuditLog[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [actionFilter, moduleFilter, dateFrom, dateTo, limit]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT': return <Badge className="bg-green-500">Criação</Badge>;
      case 'UPDATE': return <Badge className="bg-blue-500">Edição</Badge>;
      case 'DELETE': return <Badge variant="destructive">Exclusão</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

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
      render: (log) => format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
    },
    {
      key: 'action',
      header: 'Ação',
      render: (log) => getActionBadge(log.action),
    },
    {
      key: 'table_name',
      header: 'Módulo',
      render: (log) => TABLE_NAMES[log.table_name] || log.table_name,
    },
    {
      key: 'record_id',
      header: 'ID do Registro',
      render: (log) => (
        <span className="font-mono text-xs">{log.record_id?.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'user_id',
      header: 'Usuário',
      render: (log) => (
        <span className="font-mono text-xs">{log.user_id?.slice(0, 8) || 'Sistema'}...</span>
      ),
    },
  ];

  const uniqueModules = [...new Set(logs.map(l => l.table_name))];

  return (
    <AdminLayout title="Logs de Auditoria">
      <div className="space-y-4">
        {/* Filters */}
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar nos logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[150px]">
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
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos módulos</SelectItem>
                  {uniqueModules.map(m => (
                    <SelectItem key={m} value={m}>{TABLE_NAMES[m] || m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" placeholder="De" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" placeholder="Até" />
              <ExportButtons data={exportData} columns={exportColumns} filename="logs-auditoria" title="Logs de Auditoria" />
            </div>
          </CardContent>
        </Card>

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
