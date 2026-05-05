import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout, AdminSummaryCard } from '@/components/admin';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/button';
import { BTN } from '@/components/admin/AdminButtonStyles';
import { RefreshCw, Search, AlertTriangle, CheckCircle2, FileSearch, Download, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Issue {
  severity: 'critical' | 'warning' | 'info';
  category: 'duplicate' | 'canonical' | 'robots' | '404' | 'redirect' | 'metadata' | 'sitemap';
  url: string;
  message: string;
  details?: string;
}

interface Report {
  id: string;
  created_at: string;
  summary: Record<string, number | string>;
  issues: Issue[];
  total_issues: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  duration_ms: number | null;
}

const sevVariant = (s: Issue['severity']): 'danger' | 'warning' | 'info' =>
  s === 'critical' ? 'danger' : s === 'warning' ? 'warning' : 'info';

const CAT_LABEL: Record<Issue['category'], string> = {
  duplicate: 'Duplicado', canonical: 'Canonical', robots: 'Robots',
  '404': '404', redirect: 'Redirect', metadata: 'Metadados', sitemap: 'Sitemap',
};

export default function AdminSeoAuditPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<'all' | Issue['severity']>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('seo_audit_reports').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setReports(data as unknown as Report[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const runAudit = async () => {
    setRunning(true);
    toast.info('Auditoria iniciada — pode levar 30-60s...');
    const { error } = await supabase.functions.invoke('seo-audit');
    setRunning(false);
    if (error) { toast.error(`Falha: ${error.message}`); return; }
    toast.success('Auditoria concluída!');
    load();
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase.from('seo_audit_reports').delete().eq('id', id);
    if (error) { toast.error('Falha ao excluir'); return; }
    toast.success('Relatório excluído');
    load();
  };

  const exportJson = (r: Report) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `seo-audit-${format(new Date(r.created_at), 'yyyyMMdd-HHmm')}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const latest = reports[0];
  const filteredIssues = latest?.issues.filter(i => filter === 'all' || i.severity === filter) || [];

  return (
    <AdminLayout title="Auditoria SEO" requireAdmin>
      <div className="space-y-5">
        <AdminPageGuide
          title="🔍 Guia de Auditoria SEO"
          description="Verifica metadados duplicados, canonical, robots.txt, erros 404 e cadeias de redirect em todo o site."
          steps={[
            { title: 'Executar', description: 'Clique em "Executar Auditoria" para escanear até 80 URLs (sitemap + produtos + categorias).' },
            { title: 'Severidade', description: 'Crítico = corrija agora. Aviso = recomendado. Info = melhoria opcional.' },
            { title: 'Histórico', description: 'Os últimos 20 relatórios ficam salvos para acompanhar a evolução.' },
            { title: 'Exportar', description: 'Baixe o relatório em JSON para compartilhar ou arquivar.' },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminSummaryCard title="Críticos" value={latest?.critical_count ?? 0} icon={AlertTriangle} variant="pink" />
          <AdminSummaryCard title="Avisos" value={latest?.warning_count ?? 0} icon={AlertTriangle} variant="orange" />
          <AdminSummaryCard title="Informativos" value={latest?.info_count ?? 0} icon={FileSearch} variant="cyan" />
          <AdminSummaryCard title="Páginas verificadas" value={(latest?.summary?.pages_checked as number) ?? 0} icon={CheckCircle2} variant="purple" />
        </div>

        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'critical', 'warning', 'info'] as const).map(f => (
              <Button key={f} size="sm" onClick={() => setFilter(f)} className={cn(filter === f ? BTN.create : BTN.view)}>
                {f === 'all' ? 'Todos' : f === 'critical' ? 'Críticos' : f === 'warning' ? 'Avisos' : 'Info'}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={load} disabled={loading} className={cn(BTN.view, 'gap-2')}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Atualizar
            </Button>
            <Button
              onClick={async () => {
                toast.info('Regenerando sitemap...');
                const { data, error } = await supabase.functions.invoke('sitemap-generator');
                if (error) { toast.error(`Falha: ${error.message}`); return; }
                const r = data as { url_count?: number; product_count?: number; category_count?: number };
                toast.success(`Sitemap regenerado: ${r.url_count} URLs (${r.product_count} produtos, ${r.category_count} categorias)`);
              }}
              className={cn(BTN.view, 'gap-2')}
            >
              <RefreshCw className="w-4 h-4" /> Regenerar Sitemap
            </Button>
            <Button onClick={runAudit} disabled={running} className={cn(BTN.create, 'gap-2')}>
              <Search className={cn('w-4 h-4', running && 'animate-pulse')} />
              {running ? 'Executando...' : 'Executar Auditoria'}
            </Button>
          </div>
        </div>

        <section className="rounded-xl liquid-glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">
                Último relatório
                {latest && <span className="text-sm text-white/50 ml-2">· {format(new Date(latest.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>}
              </h2>
            </div>
            {latest && (
              <Button size="sm" onClick={() => exportJson(latest)} className={cn(BTN.view, 'gap-2')}>
                <Download className="w-4 h-4" /> Exportar
              </Button>
            )}
          </div>

          {!latest ? (
            <p className="text-white/50 text-sm py-6 text-center">Nenhuma auditoria executada. Clique em "Executar Auditoria" acima.</p>
          ) : filteredIssues.length === 0 ? (
            <p className="text-emerald-400 text-sm py-6 text-center">✓ Nenhum problema nesta categoria.</p>
          ) : (
            <div className="space-y-2 max-h-[40rem] overflow-y-auto pr-1">
              {filteredIssues.map((iss, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <AdminStatusBadge label={iss.severity} variant={sevVariant(iss.severity)} />
                      <span className="text-xs text-white/50">{CAT_LABEL[iss.category]}</span>
                    </div>
                  </div>
                  <div className="text-white text-sm font-medium break-words">{iss.message}</div>
                  <div className="text-xs text-cyan-400/80 truncate mt-1">{iss.url}</div>
                  {iss.details && (
                    <div className="text-xs text-white/50 mt-1 break-words font-mono">{iss.details}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl liquid-glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Histórico de relatórios</h2>
          </div>
          {reports.length === 0 ? (
            <p className="text-white/50 text-sm py-4 text-center">Sem relatórios.</p>
          ) : (
            <div className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.03]">
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium">
                      {format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div className="text-xs text-white/50 flex gap-3 mt-1 flex-wrap">
                      <span className="text-red-400">{r.critical_count} críticos</span>
                      <span className="text-yellow-400">{r.warning_count} avisos</span>
                      <span className="text-cyan-400">{r.info_count} info</span>
                      <span>· {(r.summary?.pages_checked as number) ?? 0} páginas</span>
                      {r.duration_ms && <span>· {(r.duration_ms / 1000).toFixed(1)}s</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => exportJson(r)} className={cn(BTN.view, 'gap-1')}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" onClick={() => deleteReport(r.id)} className={cn(BTN.delete, 'gap-1')}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
