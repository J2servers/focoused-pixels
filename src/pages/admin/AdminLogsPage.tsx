import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
}

const AdminLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) setLogs(data);
      setIsLoading(false);
    };

    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Badge className="bg-green-500">Criação</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-500">Edição</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">Exclusão</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getTableName = (table: string) => {
    const names: Record<string, string> = {
      products: 'Produtos',
      categories: 'Categorias',
      promotions: 'Promoções',
      hero_slides: 'Hero Slides',
      company_info: 'Empresa',
    };
    return names[table] || table;
  };

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
      render: (log) => getTableName(log.table_name),
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

  return (
    <AdminLayout title="Logs de Auditoria">
      <DataTable
        data={logs}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar logs..."
        emptyMessage="Nenhum log registrado ainda"
      />
    </AdminLayout>
  );
};

export default AdminLogsPage;
