import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, CheckCircle2, Mail, MessageSquare, Sparkles, Zap } from 'lucide-react';
import { SYSTEM_EVENTS } from '@/components/admin/templates/TemplateConstants';
import type { EmailTemplate, WhatsAppTemplate } from '@/components/admin/templates/TemplateConstants';

interface Metrics {
  emailActive: number;
  emailTotal: number;
  whatsActive: number;
  whatsTotal: number;
  totalSends: number;
  coveredCount: number;
  uncoveredEvents: readonly unknown[];
}

interface Props {
  metrics: Metrics;
  emailTemplates: EmailTemplate[];
  whatsTemplates: WhatsAppTemplate[];
  installSuggestedEmails: () => void;
  installSuggestedWhats: () => void;
}

export function MetricsAndCoverage({
  metrics, emailTemplates, whatsTemplates, installSuggestedEmails, installSuggestedWhats,
}: Props) {
  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <AdminSummaryCard title="E-mails Ativos" value={`${metrics.emailActive}/${metrics.emailTotal}`} icon={Mail} variant="blue" />
        <AdminSummaryCard title="WhatsApp Ativos" value={`${metrics.whatsActive}/${metrics.whatsTotal}`} icon={MessageSquare} variant="green" />
        <AdminSummaryCard title="Total de Envios" value={metrics.totalSends} icon={Activity} variant="purple" />
        <AdminSummaryCard title="Eventos Cobertos" value={`${metrics.coveredCount}/${SYSTEM_EVENTS.length}`} icon={CheckCircle2} variant="green" />
        <AdminSummaryCard
          title="Sem Template"
          value={metrics.uncoveredEvents.length}
          icon={AlertTriangle}
          variant={metrics.uncoveredEvents.length > 0 ? 'orange' : 'green'}
        />
      </div>

      <Card className="liquid-glass rounded-2xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple)/0.2)] to-[hsl(var(--admin-accent-pink)/0.1)] flex items-center justify-center border border-purple-500/20">
                <Zap className="h-4.5 w-4.5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Matriz de Cobertura de Eventos</h3>
                <p className="text-[11px] text-white/50">{metrics.coveredCount}/{SYSTEM_EVENTS.length} eventos cobertos</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="admin-btn admin-btn-save h-7 text-xs !min-h-0 !px-2" onClick={installSuggestedEmails}>
                <Sparkles className="h-3 w-3 mr-1.5" />Instalar e-mails
              </Button>
              <Button size="sm" className="admin-btn admin-btn-save h-7 text-xs !min-h-0 !px-2" onClick={installSuggestedWhats}>
                <Sparkles className="h-3 w-3 mr-1.5" />Instalar WhatsApp
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {SYSTEM_EVENTS.map((ev) => {
              const hasEmail = emailTemplates.some((t) => t.name === ev.value);
              const hasWhats = whatsTemplates.some((t) => t.name === ev.value);
              const both = hasEmail && hasWhats;
              const partial = hasEmail || hasWhats;
              return (
                <div
                  key={ev.value}
                  className={`p-3 rounded-xl border transition-all ${
                    both
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : partial
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-red-500/5 border-red-500/15'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{ev.icon}</span>
                    <span className="text-xs font-medium text-white truncate">{ev.label}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge className={`text-[9px] border-0 px-1.5 py-0 ${hasEmail ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-white/20'}`}>
                      <Mail className="h-2.5 w-2.5 mr-0.5" />{hasEmail ? '✓' : '✗'}
                    </Badge>
                    <Badge className={`text-[9px] border-0 px-1.5 py-0 ${hasWhats ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-white/20'}`}>
                      <MessageSquare className="h-2.5 w-2.5 mr-0.5" />{hasWhats ? '✓' : '✗'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
