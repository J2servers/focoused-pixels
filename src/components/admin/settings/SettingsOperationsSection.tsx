import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare, Webhook, ScrollText, Users, ShieldCheck, FolderOpen, ArrowRight, AlertTriangle, Bug } from 'lucide-react';
import { glassCard, InfoBanner } from './SettingsShared';

export const SettingsOperationsSection = () => {
  const { data: opsSummary, isLoading: loadingOps } = useQuery({
    queryKey: ['settings-ops-summary'],
    queryFn: async () => {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const [whatsappMessages, apiKeys, webhookLogs, auditLogs, userRoles] = await Promise.all([
        supabase.from('whatsapp_messages').select('id, status').order('created_at', { ascending: false }).limit(200),
        supabase.from('api_keys').select('id, is_active'),
        supabase.from('webhook_logs').select('id, error_message, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('audit_logs').select('id, created_at').order('created_at', { ascending: false }).limit(300),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      const msgs = whatsappMessages.data || [];
      const keys = apiKeys.data || [];
      const wh = webhookLogs.data || [];
      const au = auditLogs.data || [];
      const roles = userRoles.data || [];
      return {
        whatsappSent: msgs.filter(i => i.status === 'sent').length,
        whatsappErrors: msgs.filter(i => i.status === 'error' || i.status === 'failed').length,
        apiKeysActive: keys.filter(i => i.is_active).length,
        webhookErrors: wh.filter(i => i.error_message).length,
        auditToday: au.filter(i => new Date(i.created_at) >= todayStart).length,
        auditTotal: au.length,
        usersTotal: roles.length,
        adminUsers: roles.filter(i => i.role === 'admin').length,
      };
    },
    refetchInterval: 30000,
  });

  const cards = [
    { icon: MessageSquare, title: 'WhatsApp', desc: 'Mensagens e filas.', accentVar: '--admin-accent-green', link: '/admin/whatsapp', stats: loadingOps ? null : [
      { l: 'Enviadas', v: opsSummary?.whatsappSent || 0 }, { l: 'Erros', v: opsSummary?.whatsappErrors || 0 }] },
    { icon: Webhook, title: 'API e CRM', desc: 'Chaves e webhooks.', accentVar: '--admin-accent-blue', link: '/admin/api', stats: loadingOps ? null : [
      { l: 'Chaves ativas', v: opsSummary?.apiKeysActive || 0 }, { l: 'Erros webhook', v: opsSummary?.webhookErrors || 0 }] },
    { icon: ScrollText, title: 'Logs', desc: 'Auditoria técnica.', accentVar: '--admin-accent-orange', link: '/admin/logs', stats: loadingOps ? null : [
      { l: 'Hoje', v: opsSummary?.auditToday || 0 }, { l: 'Total', v: opsSummary?.auditTotal || 0 }] },
    { icon: Users, title: 'Usuários', desc: 'Perfis e papéis.', accentVar: '--admin-accent-purple', link: '/admin/usuarios', stats: loadingOps ? null : [
      { l: 'Total', v: opsSummary?.usersTotal || 0 }, { l: 'Admins', v: opsSummary?.adminUsers || 0 }] },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <div key={card.title} className={cn(glassCard, 'p-5 space-y-4')}>
            <div className="flex items-center gap-2">
              <card.icon className={`h-5 w-5 text-[hsl(var(${card.accentVar}))]`} />
              <h4 className="font-bold text-[hsl(var(--admin-text))]">{card.title}</h4>
            </div>
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">{card.desc}</p>
            {card.stats ? (
              <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] p-3 space-y-2 text-sm">
                {card.stats.map(s => (
                  <div key={s.l} className="flex justify-between text-[hsl(var(--admin-text-muted))]">
                    <span>{s.l}</span>
                    <strong className="text-[hsl(var(--admin-text))]">{s.v}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--admin-text-muted))]" />
            )}
            <Button asChild size="sm" className={`bg-gradient-to-r from-[hsl(var(${card.accentVar}))] to-[hsl(var(${card.accentVar})/0.7)] text-white w-full`}>
              <Link to={card.link}>Abrir {card.title.toLowerCase()}</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className={cn(glassCard, 'p-6 space-y-4')}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[hsl(var(--admin-accent-cyan))]" />
            <h4 className="font-bold text-[hsl(var(--admin-text))]">Garantia operacional</h4>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['Central técnica', 'WhatsApp, API, logs e usuários organizados.'],
              ['Branding separado', 'Identidade, cores e logos dedicados.'],
              ['Comunicação viva', 'Templates para automações.'],
              ['Financeiro fiel', 'Receita só com pagamento confirmado.'],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.4)] p-4">
                <p className="font-medium text-[hsl(var(--admin-text))]">{t}</p>
                <p className="mt-1 text-sm text-[hsl(var(--admin-text-muted))] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className={cn(glassCard, 'p-5 space-y-3')}>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-[hsl(var(--admin-accent-green))]" />
              <h4 className="font-bold text-[hsl(var(--admin-text))]">Atalhos</h4>
            </div>
            {[
              ['/admin/empresa', 'Empresa'],
              ['/admin/templates', 'Templates'],
              ['/admin/midia', 'Mídia'],
              ['/admin/pedidos', 'Pedidos'],
            ].map(([href, label]) => (
              <Button key={href} variant="outline" asChild className="w-full justify-between border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
                <Link to={href}>{label}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            ))}
          </div>

          <InfoBanner accentVar="--admin-accent-orange">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /><strong>Atenção</strong></div>
            <p>Valide failover do WhatsApp antes de depender da redundância.</p>
          </InfoBanner>

          <InfoBanner accentVar="--admin-accent-cyan">
            <div className="flex items-center gap-2 mb-2"><Bug className="h-4 w-4" /><strong>Checklist</strong></div>
            <p>1. Testar gateways. 2. Confirmar faturamento. 3. Validar logs.</p>
          </InfoBanner>
        </div>
      </div>
    </div>
  );
};
