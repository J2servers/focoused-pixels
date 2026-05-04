import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Activity, AlertTriangle, CheckCircle2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CronRun {
  id: string;
  job_name: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  metrics: Record<string, unknown> | null;
  error: string | null;
}

interface NotifFailure {
  id: string;
  event_name: string;
  channel: string;
  recipient: string | null;
  attempts: number;
  next_retry_at: string;
  resolved: boolean;
  last_error: string | null;
  created_at: string;
}

const CRON_FUNCTIONS = [
  { name: 'recover-abandoned-carts', label: 'Carrinhos Abandonados (30min)' },
  { name: 'notify-pending-payments', label: 'Pagamentos Pendentes (1h)' },
  { name: 'cron-retry-failed', label: 'Retentativa de Falhas (15min)' },
  { name: 'cron-cleanup', label: 'Limpeza de Logs (diário)' },
  { name: 'cron-low-stock-alert', label: 'Alerta Estoque Baixo (diário)' },
  { name: 'cron-daily-report', label: 'Relatório Diário (08h)' },
  { name: 'cron-reactivate-inactive', label: 'Reativar Inativos (semanal)' },
];

export default function AdminAutomationPage() {
  const [runs, setRuns] = useState<CronRun[]>([]);
  const [failures, setFailures] = useState<NotifFailure[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, f] = await Promise.all([
      supabase.from('system_cron_runs').select('*').order('started_at', { ascending: false }).limit(50),
      supabase.from('notification_failures').select('*').order('created_at', { ascending: false }).limit(30),
    ]);
    if (r.data) setRuns(r.data as CronRun[]);
    if (f.data) setFailures(f.data as NotifFailure[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerCron = async (name: string) => {
    setRunning(name);
    try {
      const { data, error } = await supabase.functions.invoke(name, {
        body: {},
        headers: { 'x-cron-secret': 'internal_cron_call' },
      });
      if (error) throw error;
      toast.success(`Executado: ${name}`, { description: JSON.stringify(data?.metrics ?? data) });
      await load();
    } catch (e) {
      toast.error(`Falha em ${name}`, { description: String((e as Error).message) });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400" /> Automações & Cron Jobs
          </h1>
          <p className="text-white/60 mt-1">Monitoramento de tarefas automáticas e notificações falhadas.</p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      <Card className="p-6 bg-[hsl(250_25%_12%)] border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Disparar Manualmente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CRON_FUNCTIONS.map(c => (
            <Button
              key={c.name}
              onClick={() => triggerCron(c.name)}
              disabled={running === c.name}
              className="justify-start gap-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-white h-auto py-3"
            >
              <PlayCircle className={`w-4 h-4 ${running === c.name ? 'animate-pulse text-cyan-400' : ''}`} />
              <span className="text-left text-sm">{c.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-[hsl(250_25%_12%)] border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Últimas Execuções</h2>
        {runs.length === 0 ? (
          <p className="text-white/50 text-sm">Nenhuma execução registrada ainda.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {runs.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  {r.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> :
                    r.status === 'failed' ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                    <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />}
                  <div>
                    <div className="text-white font-medium text-sm">{r.job_name}</div>
                    <div className="text-white/50 text-xs">{new Date(r.started_at).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={r.status === 'success' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'}>
                    {r.status}
                  </Badge>
                  {r.metrics && <div className="text-xs text-white/40 mt-1 max-w-xs truncate">{JSON.stringify(r.metrics)}</div>}
                  {r.error && <div className="text-xs text-red-400 mt-1 max-w-xs truncate">{r.error}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-[hsl(250_25%_12%)] border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" /> Notificações com Falha
        </h2>
        {failures.length === 0 ? (
          <p className="text-emerald-400 text-sm">✓ Nenhuma falha pendente.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {failures.map(f => (
              <div key={f.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{f.event_name} → {f.channel}</span>
                  <Badge variant={f.resolved ? 'default' : 'destructive'}>
                    {f.resolved ? 'Resolvido' : `${f.attempts} tentativas`}
                  </Badge>
                </div>
                <div className="text-xs text-white/50">Para: {f.recipient ?? '—'}</div>
                {f.last_error && <div className="text-xs text-red-400 mt-1">{f.last_error}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
