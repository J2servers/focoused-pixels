import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare, Webhook, ScrollText, Users, ArrowRight, type LucideIcon } from 'lucide-react';
import { card, cardInner, sectionGap } from './SettingsShared';

interface OpCard {
  icon: LucideIcon;
  title: string;
  description: string;
  accentVar: string;
  link: string;
  stats: { label: string; value: number }[] | null;
}

export const SettingsOperationsSection = () => {
  const { data: ops, isLoading } = useQuery({
    queryKey: ['settings-ops-summary'],
    queryFn: async () => {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const [wm, ak, wl, al, ur] = await Promise.all([
        supabase.from('whatsapp_messages').select('id, status').order('created_at', { ascending: false }).limit(200),
        supabase.from('api_keys').select('id, is_active'),
        supabase.from('webhook_logs').select('id, error_message, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('audit_logs').select('id, created_at').order('created_at', { ascending: false }).limit(300),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      const msgs = wm.data || [], keys = ak.data || [], hooks = wl.data || [], logs = al.data || [], roles = ur.data || [];
      return {
        whatsappSent: msgs.filter(i => i.status === 'sent').length,
        whatsappErrors: msgs.filter(i => i.status === 'error' || i.status === 'failed').length,
        apiKeysActive: keys.filter(i => i.is_active).length,
        webhookErrors: hooks.filter(i => i.error_message).length,
        auditToday: logs.filter(i => new Date(i.created_at) >= todayStart).length,
        auditTotal: logs.length,
        usersTotal: roles.length,
        adminUsers: roles.filter(i => i.role === 'admin').length,
      };
    },
    refetchInterval: 30000,
  });

  const cards: OpCard[] = [
    { icon: MessageSquare, title: 'WhatsApp', description: 'Mensagens, filas e automações', accentVar: '--admin-accent-green', link: '/admin/whatsapp',
      stats: isLoading ? null : [{ label: 'Enviadas', value: ops?.whatsappSent || 0 }, { label: 'Erros', value: ops?.whatsappErrors || 0 }] },
    { icon: Webhook, title: 'API & CRM', description: 'Chaves de acesso e webhooks', accentVar: '--admin-accent-blue', link: '/admin/api',
      stats: isLoading ? null : [{ label: 'Chaves ativas', value: ops?.apiKeysActive || 0 }, { label: 'Erros webhook', value: ops?.webhookErrors || 0 }] },
    { icon: ScrollText, title: 'Auditoria', description: 'Logs de ações do sistema', accentVar: '--admin-accent-orange', link: '/admin/logs',
      stats: isLoading ? null : [{ label: 'Hoje', value: ops?.auditToday || 0 }, { label: 'Total', value: ops?.auditTotal || 0 }] },
    { icon: Users, title: 'Usuários', description: 'Perfis, papéis e permissões', accentVar: '--admin-accent-purple', link: '/admin/usuarios',
      stats: isLoading ? null : [{ label: 'Total', value: ops?.usersTotal || 0 }, { label: 'Admins', value: ops?.adminUsers || 0 }] },
  ];

  return (
    <div className={sectionGap}>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.title} className={cn(card, cardInner, 'flex flex-col justify-between gap-4')}>
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', `bg-[hsl(var(${c.accentVar})/0.12)]`)}>
                  <c.icon className={`h-4 w-4 text-[hsl(var(${c.accentVar}))]`} />
                </div>
                <h4 className="text-sm font-bold text-white">{c.title}</h4>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{c.description}</p>
            </div>

            {c.stats ? (
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 space-y-1.5">
                {c.stats.map(s => (
                  <div key={s.label} className="flex justify-between text-xs">
                    <span className="text-white/50">{s.label}</span>
                    <span className="font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-white/50" /></div>
            )}

            <Button asChild size="sm" variant="outline" className="w-full justify-between h-9 border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.03]">
              <Link to={c.link}><span>Abrir</span><ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
