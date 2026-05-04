import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { RefreshCw, Webhook, ArrowRightLeft, BarChart3, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cardCls, mutedText } from './primitives';

export function WebhookLogsSection() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => { const { data, error } = await supabase.from('webhook_logs').select('*').order('created_at', { ascending: false }).limit(50); if (error) throw error; return data; },
    refetchInterval: 10000,
  });

  const successCount = useMemo(() => logs.filter(l => l.status_code === 200).length, [logs]);
  const errorCount = useMemo(() => logs.filter(l => l.status_code !== 200).length, [logs]);
  const inboundCount = useMemo(() => logs.filter(l => l.direction === 'inbound').length, [logs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminSummaryCard title="Total de Logs" value={logs.length} icon={BarChart3} variant="purple" />
        <AdminSummaryCard title="Sucesso" value={successCount} icon={CheckCircle} variant="green" />
        <AdminSummaryCard title="Erros" value={errorCount} icon={AlertTriangle} variant="orange" />
        <AdminSummaryCard title="Entrada" value={inboundCount} icon={ArrowRightLeft} variant="blue" />
      </div>

      <Card className={cardCls}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><RefreshCw className="h-4 w-4 text-purple-400" />Últimos 50 webhooks</h3>
            <Badge className="bg-green-500/15 text-green-400 border-0 text-[10px]">Auto-refresh 10s</Badge>
          </div>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/[0.03] animate-pulse rounded" />)}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <Webhook className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-white font-medium">Nenhum webhook registrado</p>
              <p className={`text-sm ${mutedText} mt-1`}>Quando sua API receber ou enviar chamadas, os logs aparecerão aqui</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--admin-bg)/0.3)] border border-white/[0.08] hover:border-purple-500/20 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${log.status_code === 200 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={`text-xs ${mutedText} w-28 shrink-0`}>{format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">{log.event_type}</span>
                  <AdminStatusBadge label={log.direction === 'inbound' ? '⬇ IN' : '⬆ OUT'} variant={log.direction === 'inbound' ? 'info' : 'neutral'} />
                  <span className="flex-1" />
                  <AdminStatusBadge label={String(log.status_code)} variant={log.status_code === 200 ? 'success' : 'danger'} />
                  {log.error_message && <span className="text-xs text-red-400 max-w-[150px] truncate">{log.error_message}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
