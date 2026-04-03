import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface AuditLog {
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

interface UseAdminLogsOptions {
  actionFilter?: string;
  moduleFilter?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export function useAdminLogs(options: UseAdminLogsOptions = {}) {
  const { actionFilter = 'all', moduleFilter = 'all', dateFrom = '', dateTo = '', limit = 100 } = options;

  return useQuery({
    queryKey: ['admin-logs', actionFilter, moduleFilter, dateFrom, dateTo, limit],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (actionFilter !== 'all') query = query.eq('action', actionFilter);
      if (moduleFilter !== 'all') query = query.eq('table_name', moduleFilter);
      if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00`);
      if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AuditLog[];
    },
  });
}
