import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AdminLayout, AdminSummaryCard } from '@/components/admin';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { BTN } from '@/components/admin/AdminButtonStyles';
import { RefreshCw, Activity, AlertTriangle, CheckCircle2, PlayCircle, Zap, Clock, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AlertSettingsCard } from '@/components/admin/automation/AlertSettingsCard';

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
  { name: 'recover-abandoned-carts', label: 'Carrinhos Abandonados', schedule: 'A cada 30 min' },
  { name: 'notify-pending-payments', label: 'Pagamentos Pendentes', schedule: 'A cada 1 hora' },
  { name: 'cron-retry-failed', label: 'Retentativa de Falhas', schedule: 'A cada 15 min' },
  { name: 'cron-cleanup', label: 'Limpeza de Logs', schedule: 'Diário' },
  { name: 'cron-low-stock-alert', label: 'Alerta Estoque Baixo', schedule: 'Diário' },
  { name: 'cron-daily-report', label: 'Relatório Diário', schedule: 'Diário · 08h' },
  { name: 'cron-reactivate-inactive', label: 'Reativar Inativos', schedule: 'Semanal' },
];

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'neutral' =>
  s === 'success' ? 'success' : s === 'failed' ? 'danger' : s === 'running' ? 'warning' : 'neutral';

const statusIcon = (s: string) =>
  s === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
  s === 'failed' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
  <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />;

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

  const successCount = runs.filter(r => r.status === 'success').length;
  const failedCount = runs.filter(r => r.status === 'failed').length;
  const pendingFailures = failures.filter(f => !f.resolved).length;

  return (
    <AdminLayout title="Automações & Crons" requireAdmin>
      <div className="space-y-5">
        <AdminPageGuide
          title="⚙️ Guia de Automações & Crons"
          description="Monitore tarefas agendadas e dispare execuções manualmente."
          steps={[
            { title: 'Disparar manualmente', description: 'Use os botões para executar qualquer cron sob demanda.' },
            { title: 'Histórico de execuções', description: 'Veja status, métricas e erros das últimas 50 execuções.' },
            { title: 'Notificações falhadas', description: 'Acompanhe envios que falharam e tentativas de reenvio.' },
            { title: 'Atualizar', description: 'Use o botão atualizar para recarregar os dados em tempo real.' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSummaryCard title="Execuções (últimas)" value={runs.length} icon={Activity} variant="purple" />
          <AdminSummaryCard title="Sucesso" value={successCount} icon={CheckCircle2} variant="green" />
          <AdminSummaryCard title="Falhas" value={failedCount} icon={AlertTriangle} variant="orange" />
          <AdminSummaryCard title="Notificações pendentes" value={pendingFailures} icon={Bell} variant="pink" />
        </div>

        <div className="flex justify-end">
          <Button onClick={load} disabled={loading} className={cn(BTN.view, 'gap-2')}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Atualizar
          </Button>
        </div>

        <AlertSettingsCard />

        <section className="rounded-xl liquid-glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Disparar Manualmente</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CRON_FUNCTIONS.map(c => (
              <button
                key={c.name}
                onClick={() => triggerCron(c.name)}
                disabled={running === c.name}
                className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-cyan-400/30 transition-all p-3 text-left disabled:opacity-60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                  <PlayCircle className={cn('w-5 h-5 text-cyan-400', running === c.name && 'animate-pulse')} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white truncate">{c.label}</div>
                  <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {c.schedule}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl liquid-glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Últimas Execuções</h2>
          </div>
          {runs.length === 0 ? (
            <p className="text-white/50 text-sm py-4 text-center">Nenhuma execução registrada ainda.</p>
          ) : (
            <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
              {runs.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcon(r.status)}
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm truncate">{r.job_name}</div>
                      <div className="text-white/50 text-xs">{new Date(r.started_at).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 max-w-[50%]">
                    <AdminStatusBadge label={r.status} variant={statusVariant(r.status)} />
                    {r.metrics && <div className="text-xs text-white/40 mt-1 truncate">{JSON.stringify(r.metrics)}</div>}
                    {r.error && <div className="text-xs text-red-400 mt-1 truncate">{r.error}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl liquid-glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Notificações com Falha</h2>
          </div>
          {failures.length === 0 ? (
            <p className="text-emerald-400 text-sm py-4 text-center">✓ Nenhuma falha pendente.</p>
          ) : (
            <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
              {failures.map(f => (
                <div key={f.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-white text-sm font-medium truncate">{f.event_name} → {f.channel}</span>
                    <AdminStatusBadge
                      label={f.resolved ? 'Resolvido' : `${f.attempts} tentativas`}
                      variant={f.resolved ? 'success' : 'danger'}
                    />
                  </div>
                  <div className="text-xs text-white/50">Para: {f.recipient ?? '—'}</div>
                  {f.last_error && <div className="text-xs text-red-400 mt-1 truncate">{f.last_error}</div>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
