import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  glassCard,
  inputClass,
  labelClass,
  StatPill,
  ToggleBlock,
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
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Alertas operacionais</h3>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Quem recebe avisos críticos.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label className={labelClass}>Limite estoque baixo</Label><Input className={inputClass} type="number" value={settings.low_stock_threshold || 5} onChange={e => u('low_stock_threshold', Number(e.target.value))} /></div>
            <div className="space-y-2"><Label className={labelClass}>Email alertas</Label><Input className={inputClass} type="email" value={settings.notification_email || ''} onChange={e => u('notification_email', e.target.value)} placeholder="financeiro@loja.com.br" /></div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ToggleBlock title="Alerta de estoque" description="Aviso na zona crítica." checked={settings.enable_stock_alerts ?? true} onChange={v => u('enable_stock_alerts', v)} />
            <ToggleBlock title="Alerta de pedidos" description="Notifica novos pedidos." checked={settings.enable_order_notifications ?? true} onChange={v => u('enable_order_notifications', v)} />
          </div>
        </div>

        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Conta e acesso</h3>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Perfil e senha segura.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill label="Usuário" value={profileName || 'Sem nome'} accentVar="--admin-accent-blue" />
            <StatPill label="Proteção" value="Senha forte" accentVar="--admin-accent-pink" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label className={labelClass}>Nova senha</Label><Input className={inputClass} type="password" value={pass.n} onChange={e => setPass({ ...pass, n: e.target.value })} /></div>
            <div className="space-y-2"><Label className={labelClass}>Confirmar</Label><Input className={inputClass} type="password" value={pass.c} onChange={e => setPass({ ...pass, c: e.target.value })} /></div>
          </div>
          <Button className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.3)]" onClick={changePassword} disabled={changingPass || !canMutate}>
            {changingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Alterar senha
          </Button>
        </div>
      </div>
    </div>
  );
};
