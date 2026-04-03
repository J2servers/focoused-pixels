import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmailCredentials } from '@/hooks/useEmailCredentials';
import { Loader2, CheckCircle2, Send, Mail, Server, Shield, Info } from 'lucide-react';
import {
  card, cardInner, sectionGap, gridGap, inputClass,
  SectionHeader, MetricCard, ToggleBlock, FieldGroup, InfoBanner,
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
  const checklist = useMemo(() =>
    [!!emailSettings.business_email, !!emailSettings.smtp_host, !!emailSettings.smtp_username, !!emailSettings.smtp_password, !!emailSettings.test_recipient].filter(Boolean).length,
    [emailSettings.business_email, emailSettings.smtp_host, emailSettings.smtp_password, emailSettings.smtp_username, emailSettings.test_recipient]
  );

  const fields = [
    { k: 'business_email' as const, l: 'Email remetente', t: 'email', p: 'contato@sualoja.com.br' },
    { k: 'sender_name' as const, l: 'Nome remetente', p: 'Pincel de Luz' },
    { k: 'smtp_host' as const, l: 'Host SMTP', p: 'smtp.hostinger.com' },
    { k: 'smtp_port' as const, l: 'Porta', t: 'number' },
    { k: 'smtp_username' as const, l: 'Usuário SMTP', p: 'contato@sualoja.com.br' },
    { k: 'smtp_password' as const, l: 'Senha SMTP', t: 'password' },
    { k: 'reply_to_email' as const, l: 'Reply-to', t: 'email' },
    { k: 'test_recipient' as const, l: 'Email de teste', t: 'email', p: 'teste@email.com' },
  ];

  return (
    <div className={sectionGap}>
      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Checklist" value={`${checklist}/5`} accentVar={checklist >= 5 ? '--admin-accent-green' : '--admin-accent-orange'} />
        <MetricCard label="Modo" value={emailSettings.test_mode ? 'Teste' : 'Produção'} accentVar="--admin-accent-blue" />
        <MetricCard label="Envio" value={emailSettings.email_enabled ? 'Ativo' : 'Desligado'} accentVar={emailSettings.email_enabled ? '--admin-accent-green' : '--admin-accent-pink'} />
      </div>

      {/* SMTP Credentials */}
      <div className={cn(card, cardInner, sectionGap)}>
        <SectionHeader icon={Server} title="Credenciais SMTP" description="Servidor de email para envio de mensagens transacionais." accentVar="--admin-accent-orange" />

        <div className={cn('grid md:grid-cols-2', gridGap)}>
          {fields.map(f => (
            <FieldGroup key={f.k} label={f.l}>
              <Input
                className={inputClass}
                type={f.t || 'text'}
                value={String(emailSettings[f.k] || '')}
                onChange={e => ue(f.k, f.t === 'number' ? Number(e.target.value) as any : e.target.value)}
                placeholder={f.p}
              />
            </FieldGroup>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className={cn(card, cardInner, sectionGap)}>
        <SectionHeader icon={Shield} title="Controle de envio" description="Habilite envio real, modo teste e conexão segura." accentVar="--admin-accent-blue" />

        <div className={cn('grid md:grid-cols-3', gridGap)}>
          <ToggleBlock icon={Mail} title="Envio real" description="Liga emails automáticos." checked={emailSettings.email_enabled ?? false} onChange={v => ue('email_enabled', v)} />
          <ToggleBlock title="Modo de teste" description="Redireciona para email teste." checked={emailSettings.test_mode ?? true} onChange={v => ue('test_mode', v)} />
          <ToggleBlock icon={Shield} title="SSL/TLS" description="Conexão segura (porta 465)." checked={emailSettings.smtp_secure ?? true} onChange={v => ue('smtp_secure', v)} />
        </div>

        <InfoBanner accentVar="--admin-accent-blue" icon={Info}>
          No modo teste, todos os emails transacionais são redirecionados para o destinatário de teste configurado acima.
        </InfoBanner>

        <div className={cn('grid md:grid-cols-2', gridGap)}>
          <Button
            variant="outline"
            className="h-11 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]"
            onClick={handleTestSmtp}
            disabled={!canMutate || testSmtpPending || updateEmailPending}
          >
            {(testSmtpPending || updateEmailPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Testar conexão SMTP
          </Button>
          <Button
            variant="outline"
            className="h-11 border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]"
            onClick={handleSendTest}
            disabled={!canMutate || sendTestPending || updateEmailPending}
          >
            {(sendTestPending || updateEmailPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar email de teste
          </Button>
        </div>
      </div>
    </div>
  );
};
