import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmailCredentials } from '@/hooks/useEmailCredentials';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import {
  glassCard,
  inputClass,
  labelClass,
  StatPill,
  ToggleBlock,
  InfoBanner,
} from './SettingsShared';

interface Props {
  emailSettings: Partial<EmailCredentials>;
  ue: <K extends keyof EmailCredentials>(key: K, value: EmailCredentials[K]) => void;
  canMutate: boolean;
  handleTestSmtp: () => void;
  handleSendTest: () => void;
  testSmtpPending: boolean;
  sendTestPending: boolean;
  updateEmailPending: boolean;
}

export const SettingsEmailSection = ({ emailSettings, ue, canMutate, handleTestSmtp, handleSendTest, testSmtpPending, sendTestPending, updateEmailPending }: Props) => {
  const emailChecklist = useMemo(() =>
    [!!emailSettings.business_email, !!emailSettings.smtp_host, !!emailSettings.smtp_username, !!emailSettings.smtp_password, !!emailSettings.test_recipient].filter(Boolean).length,
    [emailSettings.business_email, emailSettings.smtp_host, emailSettings.smtp_password, emailSettings.smtp_username, emailSettings.test_recipient]
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Email Business SMTP</h3>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Configure SMTP para emails transacionais.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { k: 'business_email' as const, l: 'Email Business', t: 'email', p: 'contato@sualoja.com.br' },
              { k: 'sender_name' as const, l: 'Nome remetente', p: 'Pincel de Luz' },
              { k: 'smtp_host' as const, l: 'Host SMTP', p: 'smtp.hostinger.com' },
              { k: 'smtp_port' as const, l: 'Porta', t: 'number' },
              { k: 'smtp_username' as const, l: 'Usuário SMTP', p: 'contato@sualoja.com.br' },
              { k: 'smtp_password' as const, l: 'Senha SMTP', t: 'password' },
              { k: 'reply_to_email' as const, l: 'Reply-to', t: 'email' },
              { k: 'test_recipient' as const, l: 'Destinatário teste', t: 'email' },
            ].map(f => (
              <div key={f.k} className="space-y-2">
                <Label className={labelClass}>{f.l}</Label>
                <Input className={inputClass} type={f.t || 'text'} value={String(emailSettings[f.k] || '')} onChange={e => ue(f.k, f.t === 'number' ? Number(e.target.value) as any : e.target.value)} placeholder={f.p} />
              </div>
            ))}
          </div>
        </div>

        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatPill label="Checklist" value={`${emailChecklist}/5`} accentVar="--admin-accent-orange" />
            <StatPill label="Modo" value={emailSettings.test_mode ? 'Teste' : 'Real'} accentVar="--admin-accent-blue" />
            <StatPill label="Envio" value={emailSettings.email_enabled ? 'Ativo' : 'Off'} accentVar="--admin-accent-green" />
          </div>
          <div className="grid gap-3">
            <ToggleBlock title="Habilitar envio real" description="Liga emails automáticos." checked={emailSettings.email_enabled ?? false} onChange={v => ue('email_enabled', v)} />
            <ToggleBlock title="Modo de teste" description="Redireciona tudo para email teste." checked={emailSettings.test_mode ?? true} onChange={v => ue('test_mode', v)} />
            <ToggleBlock title="Conexão segura (SSL)" description="Ative para Hostinger porta 465." checked={emailSettings.smtp_secure ?? true} onChange={v => ue('smtp_secure', v)} />
          </div>
          <InfoBanner>No modo teste, emails transacionais vão para o destinatário de teste.</InfoBanner>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]" onClick={handleTestSmtp} disabled={!canMutate || testSmtpPending || updateEmailPending}>
              {(testSmtpPending || updateEmailPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Testar SMTP
            </Button>
            <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]" onClick={handleSendTest} disabled={!canMutate || sendTestPending || updateEmailPending}>
              {(sendTestPending || updateEmailPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar teste
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
