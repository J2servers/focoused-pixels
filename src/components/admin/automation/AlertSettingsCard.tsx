import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BTN } from '@/components/admin/AdminButtonStyles';
import { Bell, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AlertSettings {
  id?: string;
  recipient_email: string | null;
  cron_failure_enabled: boolean;
  pending_notification_enabled: boolean;
  pending_threshold_minutes: number;
  cooldown_minutes: number;
}

const DEFAULTS: AlertSettings = {
  recipient_email: '',
  cron_failure_enabled: true,
  pending_notification_enabled: true,
  pending_threshold_minutes: 30,
  cooldown_minutes: 60,
};

export function AlertSettingsCard() {
  const [settings, setSettings] = useState<AlertSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('system_alert_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setSettings({ ...DEFAULTS, ...data });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {
      recipient_email: settings.recipient_email?.trim() || null,
      cron_failure_enabled: settings.cron_failure_enabled,
      pending_notification_enabled: settings.pending_notification_enabled,
      pending_threshold_minutes: Math.max(5, Number(settings.pending_threshold_minutes) || 30),
      cooldown_minutes: Math.max(5, Number(settings.cooldown_minutes) || 60),
    };
    const { error } = settings.id
      ? await supabase.from('system_alert_settings').update(payload).eq('id', settings.id)
      : await supabase.from('system_alert_settings').insert(payload);
    setSaving(false);
    if (error) return toast.error('Erro ao salvar: ' + error.message);
    toast.success('Configurações salvas');
  };

  const sendTest = async () => {
    if (!settings.recipient_email) return toast.error('Defina um e-mail destinatário');
    setTesting(true);
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        action: 'send',
        to: settings.recipient_email,
        subject: '✅ Teste de Alerta — Pincel de Luz',
        html: '<p>Este é um e-mail de teste do sistema de alertas. Se você recebeu, está tudo configurado.</p>',
        from_name: 'Alertas do Sistema',
      },
    });
    setTesting(false);
    if (error) return toast.error('Falha ao enviar: ' + error.message);
    toast.success('E-mail de teste enviado');
  };

  if (loading) return <div className="liquid-glass p-6 text-sm opacity-70">Carregando configurações…</div>;

  return (
    <div className="liquid-glass p-6 space-y-5">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-cyan-300" />
        <h2 className="text-lg font-semibold">Alertas por E-mail</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="alert-email">E-mail destinatário</Label>
          <Input
            id="alert-email"
            type="email"
            placeholder="admin@empresa.com"
            value={settings.recipient_email || ''}
            onChange={(e) => setSettings(s => ({ ...s, recipient_email: e.target.value }))}
          />
        </div>

        <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5">
          <span className="text-sm">Alertar quando um cron falhar</span>
          <Switch
            checked={settings.cron_failure_enabled}
            onCheckedChange={(v) => setSettings(s => ({ ...s, cron_failure_enabled: v }))}
          />
        </label>

        <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white/5">
          <span className="text-sm">Alertar notificações pendentes</span>
          <Switch
            checked={settings.pending_notification_enabled}
            onCheckedChange={(v) => setSettings(s => ({ ...s, pending_notification_enabled: v }))}
          />
        </label>

        <div>
          <Label htmlFor="threshold">Pendente há mais de (min)</Label>
          <Input
            id="threshold"
            type="number"
            min={5}
            value={settings.pending_threshold_minutes}
            onChange={(e) => setSettings(s => ({ ...s, pending_threshold_minutes: Number(e.target.value) }))}
          />
        </div>

        <div>
          <Label htmlFor="cooldown">Cooldown entre alertas (min)</Label>
          <Input
            id="cooldown"
            type="number"
            min={5}
            value={settings.cooldown_minutes}
            onChange={(e) => setSettings(s => ({ ...s, cooldown_minutes: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={saving} className={cn(BTN.add, 'min-h-[48px]')}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar configurações'}
        </Button>
        <Button onClick={sendTest} disabled={testing} variant="outline" className="min-h-[48px]">
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Enviar teste
        </Button>
      </div>

      <p className="text-xs opacity-60">
        O monitor roda automaticamente a cada 10 minutos. Configure o e-mail de SMTP em Configurações → E-mails para garantir o envio.
      </p>
    </div>
  );
}
