import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout, AdminSummaryCard } from '@/components/admin';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/button';
import { BTN } from '@/components/admin/AdminButtonStyles';
import { RefreshCw, AlertTriangle, Activity, CheckCircle2, Gauge, Bug, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemError {
  id: string;
  level: 'fatal' | 'error' | 'warning' | 'info';
  source: string;
  message: string;
  stack: string | null;
  url: string | null;
  occurrences: number;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

interface SystemMetric {
  metric_name: string;
  metric_value: number;
  rating: string | null;
  created_at: string;
}

interface MetricStat { name: string; p50: number; p75: number; p95: number; count: number; goodPct: number }

const levelVariant = (l: string): 'success' | 'danger' | 'warning' | 'neutral' | 'info' =>
  l === 'fatal' ? 'danger' : l === 'error' ? 'danger' : l === 'warning' ? 'warning' : 'info';

const ratingColor = (r?: string | null) =>
  r === 'good' ? 'text-emerald-400' : r === 'needs-improvement' ? 'text-yellow-400' : r === 'poor' ? 'text-red-400' : 'text-white/50';

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * p)] ?? 0;
}

function formatMetric(name: string, v: number): string {
  if (name === 'CLS') return v.toFixed(3);
  return `${Math.round(v)} ms`;
}

export default function AdminMonitoringPage() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');

  const load = useCallback(async () => {
    setLoading(true);
    const errQ = supabase.from('system_errors').select('*').order('created_at', { ascending: false }).limit(100);
    if (filter === 'unresolved') errQ.eq('resolved', false);
    const sevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [e, m] = await Promise.all([
      errQ,
      supabase.from('system_metrics').select('metric_name, metric_value, rating, created_at').gte('created_at', sevenDays).limit(5000),
    ]);
    if (e.data) setErrors(e.data as SystemError[]);
    if (m.data) setMetrics(m.data as SystemMetric[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id: string) => {
    const { error } = await supabase.from('system_errors').update({ resolved: true, resolved_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error('Falha ao resolver'); return; }
    toast.success('Erro marcado como resolvido');
    load();
  };

  const unresolved = errors.filter(e => !e.resolved).length;
  const fatalCount = errors.filter(e => e.level === 'fatal' && !e.resolved).length;
  const last24h = errors.filter(e => Date.now() - new Date(e.created_at).getTime() < 86400000).length;

  const grouped: Record<string, number[]> = {};
  for (const m of metrics) (grouped[m.metric_name] ??= []).push(m.metric_value);
  const metricStats: MetricStat[] = Object.entries(grouped).map(([name, values]) => {
    const goodCount = metrics.filter(m => m.metric_name === name && m.rating === 'good').length;
    return {
      name,
      count: values.length,
      p50: percentile(values, 0.5),
      p75: percentile(values, 0.75),
      p95: percentile(values, 0.95),
      goodPct: values.length ? Math.round((goodCount / values.length) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <AdminLayout title="Monitoramento" requireAdmin>
      <div className="space-y-5">
        <AdminPageGuide
          title="📊 Guia de Monitoramento"
          description="Acompanhe erros e performance do sistema em tempo real."
          steps={[
            { title: 'Erros não resolvidos', description: 'Mostra apenas erros pendentes. Marque como resolvido ao corrigir.' },
            { title: 'Web Vitals', description: 'LCP, FID, CLS, TTFB, FCP — medidos em campo nos últimos 7 dias.' },
            { title: 'Deduplicação', description: 'Erros repetidos no mesmo dia somam ocorrências, não duplicam.' },
            { title: 'Retenção', description: 'Erros resolvidos > 30 dias e métricas > 14 dias são limpos automaticamente.' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSummaryCard title="Erros não resolvidos" value={unresolved} icon={Bug} variant="orange" />
          <AdminSummaryCard title="Fatais ativos" value={fatalCount} icon={AlertTriangle} variant="pink" />
          <AdminSummaryCard title="Últimas 24h" value={last24h} icon={Activity} variant="purple" />
          <AdminSummaryCard title="Métricas (7 dias)" value={metrics.length} icon={Gauge} variant="cyan" />
        </div>

        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setFilter('unresolved')} className={cn(filter === 'unresolved' ? BTN.create : BTN.view)}>
              Não resolvidos
            </Button>
            <Button size="sm" onClick={() => setFilter('all')} className={cn(filter === 'all' ? BTN.create : BTN.view)}>
              Todos
            </Button>
          </div>
          <Button onClick={load} disabled={loading} className={cn(BTN.view, 'gap-2')}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Atualizar
          </Button>
        </div>

        <section className="rounded-xl liquid-glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Web Vitals & Performance (7 dias)</h2>
          </div>
          {metricStats.length === 0 ? (
            <p className="text-white/50 text-sm py-4 text-center">Nenhuma métrica coletada ainda. Aguarde tráfego real.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {metricStats.map(s => (
                <div key={s.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{s.name}</span>
                    <span className={cn('text-xs font-medium', s.goodPct >= 75 ? 'text-emerald-400' : s.goodPct >= 50 ? 'text-yellow-400' : 'text-red-400')}>
                      {s.goodPct}% bom
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><div className="text-white/50">p50</div><div className="text-white font-mono">{formatMetric(s.name, s.p50)}</div></div>
                    <div><div className="text-white/50">p75</div><div className="text-white font-mono">{formatMetric(s.name, s.p75)}</div></div>
                    <div><div className="text-white/50">p95</div><div className="text-white font-mono">{formatMetric(s.name, s.p95)}</div></div>
                  </div>
                  <div className="text-white/40 text-xs mt-2">{s.count} amostras</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl liquid-glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Erros do Sistema</h2>
          </div>
          {errors.length === 0 ? (
            <p className="text-emerald-400 text-sm py-4 text-center">✓ Nenhum erro registrado.</p>
          ) : (
            <div className="space-y-2 max-h-[36rem] overflow-y-auto pr-1">
              {errors.map(e => (
                <div key={e.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <AdminStatusBadge label={e.level} variant={levelVariant(e.level)} />
                      <span className="text-xs text-white/50">{e.source}</span>
                      {e.occurrences > 1 && <span className="text-xs text-yellow-400 font-bold">×{e.occurrences}</span>}
                      {e.resolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-xs text-white/40 shrink-0">
                      {format(new Date(e.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                  <div className="text-white text-sm font-medium break-words">{e.message}</div>
                  {e.url && <div className="text-xs text-white/40 truncate mt-1">{e.url}</div>}
                  {e.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-white/50 cursor-pointer hover:text-white/70">Stack trace</summary>
                      <pre className="text-xs text-white/60 mt-1 overflow-x-auto whitespace-pre-wrap font-mono bg-black/30 p-2 rounded">{e.stack}</pre>
                    </details>
                  )}
                  {!e.resolved && (
                    <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={() => resolve(e.id)} className={BTN.save}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Marcar resolvido
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
