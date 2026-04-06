import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import { Loader2, Lock, Bell, ShieldCheck, Package, ShoppingBag, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  card, cardInner, sectionGap, gridGap, inputClass,
  SectionHeader, MetricCard, ToggleBlock, FieldGroup, InfoBanner,
} from './SettingsShared';

interface Props {
  settings: Partial<CompanyInfo>;
  u: <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => void;
  canMutate: boolean;
  profileName: string;
  updatePassword: (pwd: string) => Promise<{ error: unknown }>;
}

export const SettingsSecuritySection = ({ settings, u, canMutate, profileName, updatePassword }: Props) => {
  const [pass, setPass] = useState({ n: '', c: '' });
  const [changingPass, setChangingPass] = useState(false);

  const changePassword = async () => {
    if (pass.n.length < 6) return toast.error('Senha mínima de 6 caracteres');
    if (pass.n !== pass.c) return toast.error('As senhas não coincidem');
    setChangingPass(true);
    try {
      const { error } = await updatePassword(pass.n);
      if (error) throw error;
      setPass({ n: '', c: '' });
      toast.success('Senha alterada com sucesso!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Erro ao alterar senha'); }
    finally { setChangingPass(false); }
  };

  return (
    <div className={sectionGap}>
      {/* ── Alertas ── */}
      <div className={cn(card, cardInner, sectionGap)}>
        <SectionHeader icon={Bell} title="Alertas operacionais" description="Configure notificações automáticas para eventos críticos." accentVar="--admin-accent-orange" />

        <div className={cn('grid md:grid-cols-2', gridGap)}>
          <FieldGroup label="Limite estoque baixo">
            <Input className={inputClass} type="number" value={settings.low_stock_threshold || 5} onChange={e => u('low_stock_threshold', Number(e.target.value))} />
          </FieldGroup>
          <FieldGroup label="Email de alertas">
            <Input className={inputClass} type="email" value={settings.notification_email || ''} onChange={e => u('notification_email', e.target.value)} placeholder="financeiro@sualoja.com.br" />
          </FieldGroup>
        </div>

        <div className={cn('grid md:grid-cols-2', gridGap)}>
          <ToggleBlock icon={Package} title="Alerta de estoque baixo" description="Notifica quando produto atinge limite crítico." checked={settings.enable_stock_alerts ?? true} onChange={v => u('enable_stock_alerts', v)} />
          <ToggleBlock icon={ShoppingBag} title="Alerta de novos pedidos" description="Notifica a cada pedido recebido." checked={settings.enable_order_notifications ?? true} onChange={v => u('enable_order_notifications', v)} />
        </div>
      </div>

      {/* ── Conta ── */}
      <div className={cn(card, cardInner, sectionGap)}>
        <SectionHeader icon={ShieldCheck} title="Segurança da conta" description="Altere sua senha e visualize dados do perfil." accentVar="--admin-accent-pink" />

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Usuário" value={profileName || 'Sem nome'} accentVar="--admin-accent-blue" />
          <MetricCard label="Nível" value="Administrador" accentVar="--admin-accent-purple" />
        </div>

        <div className={cn('grid md:grid-cols-2', gridGap)}>
          <FieldGroup label="Nova senha">
            <Input className={inputClass} type="password" value={pass.n} onChange={e => setPass(p => ({ ...p, n: e.target.value }))} placeholder="Mínimo 6 caracteres" />
          </FieldGroup>
          <FieldGroup label="Confirmar senha">
            <Input className={inputClass} type="password" value={pass.c} onChange={e => setPass(p => ({ ...p, c: e.target.value }))} placeholder="Repita a nova senha" />
          </FieldGroup>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className="admin-btn admin-btn-save"
            onClick={changePassword}
            disabled={changingPass || !canMutate || !pass.n}
          >
            {changingPass ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
            Alterar senha
          </Button>
          <InfoBanner accentVar="--admin-accent-blue" icon={Info}>
            A senha é atualizada imediatamente após confirmação.
          </InfoBanner>
        </div>
      </div>
    </div>
  );
};
