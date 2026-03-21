import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCompanyInfo, useUpdateCompanyInfo, CompanyInfo } from '@/hooks/useCompanyInfo';
import { usePaymentCredentials, useUpdatePaymentCredentials, PaymentCredentials } from '@/hooks/usePaymentCredentials';
import { useEmailCredentials, useUpdateEmailCredentials, EmailCredentials } from '@/hooks/useEmailCredentials';
import { useSendTestEmail, useTestEmailConnection } from '@/hooks/useEmailGateway';
import { useTestMercadoPago, useTestEfiBank, useTestStripe } from '@/hooks/usePaymentGateway';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowRight,
  Bug,
  CheckCircle2,
  CreditCard,
  FolderOpen,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Save,
  ScrollText,
  Send,
  Settings2,
  ShieldCheck,
  Store,
  Users,
  Webhook,
  XCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

/* ─── Types ─── */
type SettingsTab = 'geral' | 'pagamentos' | 'email' | 'seguranca' | 'operacoes';

interface SectionMeta {
  value: SettingsTab;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
}

interface GatewayField {
  key: keyof PaymentCredentials;
  label: string;
  type?: string;
  placeholder?: string;
}

interface GatewayCardConfig {
  id: string;
  label: string;
  description: string;
  enabledKey: keyof PaymentCredentials;
  sandboxKey?: keyof PaymentCredentials;
  fields: GatewayField[];
  accentVar: string;
}

/* ─── Vivid Dark Theme Utilities ─── */
const glassCard = 'rounded-2xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] backdrop-blur-xl';
const glassCardHover = cn(glassCard, 'transition-all duration-300 hover:border-[hsl(var(--admin-accent-purple)/0.4)] hover:shadow-lg hover:shadow-[hsl(var(--admin-accent-purple)/0.1)]');
const inputClass = 'h-11 rounded-xl border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-[hsl(var(--admin-accent-purple)/0.5)] focus-visible:border-[hsl(var(--admin-accent-purple)/0.5)]';
const textareaClass = 'min-h-[112px] rounded-xl border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-[hsl(var(--admin-accent-purple)/0.5)]';
const selectClass = 'h-11 rounded-xl border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]';
const labelClass = 'text-sm font-medium text-[hsl(var(--admin-text-muted))]';

const sectionMeta: Record<SettingsTab, SectionMeta> = {
  geral: {
    value: 'geral',
    title: 'Workspace Geral',
    description: 'Status da loja, checkout e mensagens.',
    icon: Store,
    gradient: 'from-[hsl(var(--admin-accent-blue))] to-[hsl(var(--admin-accent-cyan))]',
    glowColor: 'hsl(var(--admin-accent-blue)/0.3)',
  },
  pagamentos: {
    value: 'pagamentos',
    title: 'Pagamentos',
    description: 'Gateways, credenciais e testes.',
    icon: CreditCard,
    gradient: 'from-[hsl(var(--admin-accent-green))] to-[hsl(var(--admin-accent-cyan))]',
    glowColor: 'hsl(var(--admin-accent-green)/0.3)',
  },
  email: {
    value: 'email',
    title: 'Email Business',
    description: 'SMTP, testes e modo seguro.',
    icon: Mail,
    gradient: 'from-[hsl(var(--admin-accent-orange))] to-[hsl(var(--admin-accent-pink))]',
    glowColor: 'hsl(var(--admin-accent-orange)/0.3)',
  },
  seguranca: {
    value: 'seguranca',
    title: 'Conta & Alertas',
    description: 'Alertas e segurança da conta.',
    icon: ShieldCheck,
    gradient: 'from-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-purple))]',
    glowColor: 'hsl(var(--admin-accent-pink)/0.3)',
  },
  operacoes: {
    value: 'operacoes',
    title: 'Operações',
    description: 'WhatsApp, API, logs e atalhos.',
    icon: Settings2,
    gradient: 'from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-blue))]',
    glowColor: 'hsl(var(--admin-accent-purple)/0.3)',
  },
};

const sectionOrder: SettingsTab[] = ['geral', 'pagamentos', 'email', 'seguranca', 'operacoes'];

const paymentMethodLabel = (m: string) => {
  switch (m) { case 'pix': return 'PIX'; case 'credit_card': return 'Cartão'; case 'boleto': return 'Boleto'; default: return m; }
};

/* ─── Stat Pill ─── */
const StatPill = ({ label, value, accentVar }: { label: string; value: string; accentVar: string }) => (
  <div className={cn('rounded-xl px-4 py-3 border', `border-[hsl(var(${accentVar})/0.2)] bg-[hsl(var(${accentVar})/0.08)]`)}>
    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(${accentVar}))]`}>{label}</p>
    <p className="mt-1 text-lg font-bold text-[hsl(var(--admin-text))]">{value}</p>
  </div>
);

/* ─── Toggle Block ─── */
const ToggleBlock = ({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.6)] p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-[hsl(var(--admin-text))]">{title}</p>
        <p className="text-sm text-[hsl(var(--admin-text-muted))]">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  </div>
);

/* ─── Info Banner ─── */
const InfoBanner = ({ children, accentVar = '--admin-accent-orange' }: { children: React.ReactNode; accentVar?: string }) => (
  <div className={cn('rounded-xl border p-4 text-sm', `border-[hsl(var(${accentVar})/0.25)] bg-[hsl(var(${accentVar})/0.06)] text-[hsl(var(${accentVar}))]`)}>
    {children}
  </div>
);

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const AdminSettingsPage = () => {
  const { profile, updatePassword, canEdit, isAdmin } = useAuthContext();
  const { data: companyInfo, isLoading: loadingCompany } = useCompanyInfo();
  const { data: paymentCreds, isLoading: loadingPayment } = usePaymentCredentials();
  const { data: emailCreds, isLoading: loadingEmail } = useEmailCredentials();
  const updateCompany = useUpdateCompanyInfo();
  const updatePayment = useUpdatePaymentCredentials();
  const updateEmail = useUpdateEmailCredentials();
  const testEmailConnection = useTestEmailConnection();
  const sendTestEmail = useSendTestEmail();
  const testMP = useTestMercadoPago();
  const testEFI = useTestEfiBank();
  const testStripe = useTestStripe();

  const [settings, setSettings] = useState<Partial<CompanyInfo>>({});
  const [payment, setPayment] = useState<Partial<PaymentCredentials>>({});
  const [emailSettings, setEmailSettings] = useState<Partial<EmailCredentials>>({});
  const [pass, setPass] = useState({ n: '', c: '' });
  const [changingPass, setChangingPass] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');

  useEffect(() => { if (companyInfo) setSettings(companyInfo); }, [companyInfo]);
  useEffect(() => { if (paymentCreds) setPayment(paymentCreds); }, [paymentCreds]);
  useEffect(() => { if (emailCreds) setEmailSettings(emailCreds); }, [emailCreds]);

  const u = <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => setSettings(prev => ({ ...prev, [key]: value }));
  const up = <K extends keyof PaymentCredentials>(key: K, value: PaymentCredentials[K]) => setPayment(prev => ({ ...prev, [key]: value }));
  const ue = <K extends keyof EmailCredentials>(key: K, value: EmailCredentials[K]) => setEmailSettings(prev => ({ ...prev, [key]: value }));

  /* Operations summary – only queries tables that exist */
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
        apiKeysTotal: keys.length,
        webhookErrors: wh.filter(i => i.error_message).length,
        webhookToday: wh.filter(i => new Date(i.created_at) >= todayStart).length,
        auditToday: au.filter(i => new Date(i.created_at) >= todayStart).length,
        auditTotal: au.length,
        usersTotal: roles.length,
        adminUsers: roles.filter(i => i.role === 'admin').length,
        editorUsers: roles.filter(i => i.role === 'editor').length,
      };
    },
    refetchInterval: 30000,
  });

  const isSavingAny = updateCompany.isPending || updatePayment.isPending || updateEmail.isPending;
  const canMutate = canEdit();
  const adminAccess = isAdmin();
  const activeSection = sectionMeta[activeTab];
  const methodsEnabled = payment.payment_methods_enabled || [];

  const toggleMethod = (method: string) => {
    const current = payment.payment_methods_enabled || ['pix', 'credit_card', 'boleto'];
    up('payment_methods_enabled', current.includes(method) ? current.filter(i => i !== method) : [...current, method]);
  };

  const saveAll = async () => {
    try {
      await Promise.all([
        updateCompany.mutateAsync({ id: companyInfo?.id || null, data: settings }),
        updatePayment.mutateAsync({ id: paymentCreds?.id || null, data: payment }),
        updateEmail.mutateAsync({ id: emailCreds?.id || null, data: emailSettings }),
      ]);
      toast.success('Configurações salvas com sucesso!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const persistEmail = async () => {
    await updateEmail.mutateAsync({ id: emailCreds?.id || null, data: emailSettings });
  };

  const handleTestSmtp = async () => {
    try { await persistEmail(); const r = await testEmailConnection.mutateAsync(); toast.success(`SMTP conectado em ${r.provider}:${r.port}`); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Falha no teste SMTP'); }
  };

  const handleSendTest = async () => {
    try {
      await persistEmail();
      const r = await sendTestEmail.mutateAsync({
        to: emailSettings.test_recipient || undefined,
        subject: 'Teste de envio - Pincel de Luz',
        html: '<div style="font-family:sans-serif;padding:24px;background:#1a1a2e;color:#e0e0e0;border-radius:12px;"><h2 style="color:#a78bfa;">Teste de email</h2><p>Se você recebeu esta mensagem, o SMTP está configurado corretamente.</p></div>',
        from_name: emailSettings.sender_name || undefined,
      });
      toast.success(`Email enviado para ${r.effectiveTo}`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Falha ao enviar'); }
  };

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

  const runTest = async (name: string, fn: () => Promise<any>) => {
    try { const r = await fn(); if (r?.success) toast.success(`${name} OK`); else toast.error(`${name} falhou`); }
    catch { toast.error(`${name} falhou`); }
  };

  const emailChecklist = useMemo(() =>
    [!!emailSettings.business_email, !!emailSettings.smtp_host, !!emailSettings.smtp_username, !!emailSettings.smtp_password, !!emailSettings.test_recipient].filter(Boolean).length,
    [emailSettings.business_email, emailSettings.smtp_host, emailSettings.smtp_password, emailSettings.smtp_username, emailSettings.test_recipient]
  );

  const gatewayCards: GatewayCardConfig[] = [
    { id: 'mercadopago', label: 'Mercado Pago', description: 'PIX, boleto e cartão.', enabledKey: 'mercadopago_enabled', sandboxKey: 'mercadopago_sandbox', accentVar: '--admin-accent-blue',
      fields: [{ key: 'mercadopago_public_key', label: 'Public Key', placeholder: 'APP_USR-...' }, { key: 'mercadopago_access_token', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' }] },
    { id: 'efi', label: 'EFI Bank', description: 'PIX direto via EFI.', enabledKey: 'efi_enabled', sandboxKey: 'efi_sandbox', accentVar: '--admin-accent-green',
      fields: [{ key: 'efi_client_id', label: 'Client ID' }, { key: 'efi_client_secret', label: 'Client Secret', type: 'password' }, { key: 'efi_pix_key', label: 'Chave PIX', placeholder: 'email, telefone ou chave' }] },
    { id: 'pagseguro', label: 'PagSeguro', description: 'Conta e token de reserva.', enabledKey: 'pagseguro_enabled', sandboxKey: 'pagseguro_sandbox', accentVar: '--admin-accent-orange',
      fields: [{ key: 'pagseguro_email', label: 'Email', type: 'email' }, { key: 'pagseguro_token', label: 'Token', type: 'password' }] },
    { id: 'stripe', label: 'Stripe', description: 'Cartão internacional.', enabledKey: 'stripe_enabled', sandboxKey: 'stripe_sandbox', accentVar: '--admin-accent-purple',
      fields: [{ key: 'stripe_public_key', label: 'Public Key' }, { key: 'stripe_secret_key', label: 'Secret Key', type: 'password' }] },
    { id: 'asaas', label: 'Asaas', description: 'Cobranças recorrentes.', enabledKey: 'asaas_enabled', sandboxKey: 'asaas_sandbox', accentVar: '--admin-accent-pink',
      fields: [{ key: 'asaas_api_key', label: 'API Key', type: 'password' }] },
  ];

  const paymentTestMap: Record<string, { pending: boolean; success: boolean; action: () => void }> = {
    mercadopago: { pending: testMP.isPending, success: testMP.isSuccess, action: () => runTest('Mercado Pago', testMP.mutateAsync) },
    efi: { pending: testEFI.isPending, success: testEFI.isSuccess, action: () => runTest('EFI', testEFI.mutateAsync) },
    stripe: { pending: testStripe.isPending, success: testStripe.isSuccess, action: () => runTest('Stripe', testStripe.mutateAsync) },
  };

  /* ─── Loading ─── */
  if (loadingCompany || loadingPayment || loadingEmail) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent-purple))]" />
        </div>
      </AdminLayout>
    );
  }

  /* ═══════════════════ SECTION RENDERERS ═══════════════════ */

  const renderGeneral = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Store status */}
        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Workspace da operação</h3>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Disponibilidade da loja e modo manutenção.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className={labelClass}>Status da loja</Label>
              <Select value={settings.store_status || 'open'} onValueChange={v => u('store_status', v)}>
                <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text))]">
                  <SelectItem value="open">Aberta</SelectItem>
                  <SelectItem value="closed">Fechada</SelectItem>
                  <SelectItem value="vacation">Férias</SelectItem>
                  <SelectItem value="coming_soon">Em breve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Mensagem de status</Label>
              <Input className={inputClass} value={settings.store_closed_message || ''} onChange={e => u('store_closed_message', e.target.value)} placeholder="Voltamos em breve" />
            </div>
          </div>
          <ToggleBlock title="Modo manutenção" description="Bloqueia acesso à loja temporariamente." checked={settings.maintenance_mode ?? false} onChange={v => u('maintenance_mode', v)} />
          {settings.maintenance_mode && (
            <div className="space-y-2">
              <Label className={labelClass}>Mensagem de manutenção</Label>
              <Textarea className={textareaClass} value={settings.maintenance_message || ''} onChange={e => u('maintenance_message', e.target.value)} />
            </div>
          )}
        </div>

        {/* Journey summary */}
        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Jornada do cliente</h3>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Resumo vivo do checkout.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatPill label="Checkout" value={settings.enable_guest_checkout ? 'Convidado' : 'Login exigido'} accentVar="--admin-accent-blue" />
            <StatPill label="Pedido mínimo" value={`R$ ${Number(settings.min_order_value || 0).toFixed(2)}`} accentVar="--admin-accent-green" />
          </div>
          <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] p-4">
            <p className="text-sm font-medium text-[hsl(var(--admin-text))]">Mensagem de sucesso</p>
            <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))] leading-6">{settings.checkout_success_message || 'Não configurada.'}</p>
          </div>
          <InfoBanner>Receita e gráficos só consideram pedidos com pagamento confirmado.</InfoBanner>
        </div>
      </div>

      {/* Checkout config */}
      <div className={cn(glassCard, 'p-6 space-y-5')}>
        <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Checkout e conversão</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2"><Label className={labelClass}>Pedido mínimo (R$)</Label><Input className={inputClass} type="number" value={settings.min_order_value || 0} onChange={e => u('min_order_value', Number(e.target.value))} /></div>
          <div className="space-y-2"><Label className={labelClass}>Recuperação carrinho (h)</Label><Input className={inputClass} type="number" value={settings.abandoned_cart_reminder_hours || 24} onChange={e => u('abandoned_cart_reminder_hours', Number(e.target.value))} /></div>
          <div className="space-y-2 xl:col-span-2"><Label className={labelClass}>Mensagem de sucesso</Label><Input className={inputClass} value={settings.checkout_success_message || ''} onChange={e => u('checkout_success_message', e.target.value)} /></div>
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>Template WhatsApp</Label>
          <Textarea className={textareaClass} rows={3} value={settings.whatsapp_message_template || ''} onChange={e => u('whatsapp_message_template', e.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleBlock title="Checkout convidado" description="Compra sem criar conta." checked={settings.enable_guest_checkout ?? true} onChange={v => u('enable_guest_checkout', v)} />
          <ToggleBlock title="Telefone obrigatório" description="Mantém WhatsApp pronto no pós-venda." checked={settings.require_phone_on_checkout ?? true} onChange={v => u('require_phone_on_checkout', v)} />
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Payment matrix */}
        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <div>
            <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Matriz de pagamentos</h3>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">Gateway principal e meios habilitados.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className={labelClass}>Gateway principal</Label>
              <Select value={payment.payment_gateway_primary || 'mercadopago'} onValueChange={v => up('payment_gateway_primary', v)}>
                <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text))]">
                  {['mercadopago', 'efi', 'stripe', 'pagseguro', 'asaas'].map(g => <SelectItem key={g} value={g}>{g === 'mercadopago' ? 'Mercado Pago' : g === 'efi' ? 'EFI' : g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <StatPill label="Credenciais" value={`${[payment.mercadopago_public_key, payment.mercadopago_access_token, payment.efi_client_id, payment.efi_client_secret, payment.efi_pix_key, payment.pagseguro_email, payment.pagseguro_token, payment.stripe_public_key, payment.stripe_secret_key, payment.asaas_api_key].filter(Boolean).length} preenchidas`} accentVar="--admin-accent-green" />
          </div>

          <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[hsl(var(--admin-text))]">Formas de pagamento</p>
              <span className="rounded-full bg-[hsl(var(--admin-accent-blue)/0.15)] px-3 py-1 text-xs font-bold text-[hsl(var(--admin-accent-blue))]">{methodsEnabled.length} ativas</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {['pix', 'credit_card', 'boleto'].map(m => (
                <label key={m} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.4)] px-4 py-3 text-sm font-medium text-[hsl(var(--admin-text-muted))] transition hover:border-[hsl(var(--admin-accent-purple)/0.4)]">
                  <Checkbox checked={methodsEnabled.includes(m)} onCheckedChange={() => toggleMethod(m)} />
                  <span>{paymentMethodLabel(m)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2"><Label className={labelClass}>Desconto PIX (%)</Label><Input className={inputClass} type="number" value={payment.pix_discount_percent ?? 5} onChange={e => up('pix_discount_percent', Number(e.target.value))} /></div>
            <div className="space-y-2"><Label className={labelClass}>Dias boleto</Label><Input className={inputClass} type="number" value={payment.boleto_extra_days ?? 3} onChange={e => up('boleto_extra_days', Number(e.target.value))} /></div>
            <div className="space-y-2"><Label className={labelClass}>Parcelas máx</Label><Input className={inputClass} type="number" value={payment.max_installments ?? 12} onChange={e => up('max_installments', Number(e.target.value))} /></div>
            <div className="space-y-2"><Label className={labelClass}>Parcela mín (R$)</Label><Input className={inputClass} type="number" value={payment.min_installment_value ?? 50} onChange={e => up('min_installment_value', Number(e.target.value))} /></div>
          </div>
        </div>

        {/* Test status */}
        <div className={cn(glassCard, 'p-6 space-y-5')}>
          <h3 className="text-lg font-bold text-[hsl(var(--admin-text))]">Status dos gateways</h3>
          <div className="grid gap-3">
            {[
              { label: 'Mercado Pago', success: testMP.isSuccess, pending: testMP.isPending, action: () => runTest('Mercado Pago', testMP.mutateAsync) },
              { label: 'EFI Bank', success: testEFI.isSuccess, pending: testEFI.isPending, action: () => runTest('EFI', testEFI.mutateAsync) },
              { label: 'Stripe', success: testStripe.isSuccess, pending: testStripe.isPending, action: () => runTest('Stripe', testStripe.mutateAsync) },
            ].map(gw => (
              <div key={gw.label} className="flex items-center justify-between rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg)/0.5)] p-4">
                <div className="flex items-center gap-3">
                  {gw.success ? <CheckCircle2 className="h-5 w-5 text-[hsl(var(--admin-accent-green))]" /> : <XCircle className="h-5 w-5 text-[hsl(var(--admin-text-muted))]" />}
                  <div>
                    <p className="font-medium text-[hsl(var(--admin-text))]">{gw.label}</p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">{gw.success ? 'Conectado' : 'Pendente'}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-accent-purple)/0.5)]" onClick={gw.action} disabled={!canMutate || gw.pending}>
                  {gw.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Testar'}
                </Button>
              </div>
            ))}
          </div>
          <InfoBanner>Boleto só libera pedido após compensação confirmada.</InfoBanner>
        </div>
      </div>

      {/* Gateway credential cards */}
      <div className="grid gap-5 xl:grid-cols-2">
        {gatewayCards.map(gw => {
          const testStatus = paymentTestMap[gw.id];
          const enabled = Boolean(payment[gw.enabledKey]);
          const sandbox = gw.sandboxKey ? Boolean(payment[gw.sandboxKey]) : false;
          return (
            <div key={gw.id} className={cn(glassCard, 'p-6 space-y-4')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={cn('inline-block rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider', `bg-[hsl(var(${gw.accentVar})/0.12)] text-[hsl(var(${gw.accentVar}))]`)}>{gw.label}</span>
                  <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">{gw.description}</p>
                </div>
                {testStatus && (
                  <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium', testStatus.success ? 'bg-[hsl(var(--admin-accent-green)/0.12)] text-[hsl(var(--admin-accent-green))]' : 'bg-[hsl(var(--admin-card-border)/0.3)] text-[hsl(var(--admin-text-muted))]')}>
                    {testStatus.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {testStatus.success ? 'OK' : 'pendente'}
                  </span>
                )}
              </div>
              <ToggleBlock title={`Ativar ${gw.label}`} description="Libera gateway no checkout." checked={enabled} onChange={v => up(gw.enabledKey, v as any)} />
              <div className="grid gap-4 md:grid-cols-2">
                {gw.fields.map(f => (
                  <div key={String(f.key)} className={f.key === 'efi_pix_key' ? 'space-y-2 md:col-span-2' : 'space-y-2'}>
                    <Label className={labelClass}>{f.label}</Label>
                    <Input className={inputClass} type={f.type || 'text'} value={String(payment[f.key] || '')} onChange={e => up(f.key, e.target.value as any)} placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
              {gw.sandboxKey && <ToggleBlock title="Modo sandbox" description="Homologação e testes." checked={sandbox} onChange={v => up(gw.sandboxKey!, v as any)} />}
              {testStatus && (
                <Button size="sm" variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]" onClick={testStatus.action} disabled={!canMutate || testStatus.pending}>
                  {testStatus.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Testar agora
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEmail = () => (
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
            <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-accent-cyan)/0.5)]" onClick={handleTestSmtp} disabled={!canMutate || testEmailConnection.isPending || updateEmail.isPending}>
              {(testEmailConnection.isPending || updateEmail.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Testar SMTP
            </Button>
            <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-accent-orange)/0.5)]" onClick={handleSendTest} disabled={!canMutate || sendTestEmail.isPending || updateEmail.isPending}>
              {(sendTestEmail.isPending || updateEmail.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar teste
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
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
            <StatPill label="Usuário" value={profile?.full_name || 'Sem nome'} accentVar="--admin-accent-blue" />
            <StatPill label="Proteção" value="Senha forte" accentVar="--admin-accent-pink" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label className={labelClass}>Nova senha</Label><Input className={inputClass} type="password" value={pass.n} onChange={e => setPass({ ...pass, n: e.target.value })} /></div>
            <div className="space-y-2"><Label className={labelClass}>Confirmar</Label><Input className={inputClass} type="password" value={pass.c} onChange={e => setPass({ ...pass, c: e.target.value })} /></div>
          </div>
          <Button className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.3)] hover:shadow-xl" onClick={changePassword} disabled={changingPass}>
            {changingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Alterar senha
          </Button>
        </div>
      </div>
    </div>
  );

  const renderOperations = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: MessageSquare, title: 'WhatsApp', desc: 'Mensagens e filas.', accentVar: '--admin-accent-green', link: '/admin/whatsapp', stats: loadingOps ? null : [
            { l: 'Enviadas', v: opsSummary?.whatsappSent || 0 }, { l: 'Erros', v: opsSummary?.whatsappErrors || 0 }] },
          { icon: Webhook, title: 'API e CRM', desc: 'Chaves e webhooks.', accentVar: '--admin-accent-blue', link: '/admin/api', stats: loadingOps ? null : [
            { l: 'Chaves ativas', v: opsSummary?.apiKeysActive || 0 }, { l: 'Erros webhook', v: opsSummary?.webhookErrors || 0 }] },
          { icon: ScrollText, title: 'Logs', desc: 'Auditoria técnica.', accentVar: '--admin-accent-orange', link: '/admin/logs', stats: loadingOps ? null : [
            { l: 'Hoje', v: opsSummary?.auditToday || 0 }, { l: 'Total', v: opsSummary?.auditTotal || 0 }] },
          { icon: Users, title: 'Usuários', desc: 'Perfis e papéis.', accentVar: '--admin-accent-purple', link: '/admin/usuarios', stats: loadingOps ? null : [
            { l: 'Total', v: opsSummary?.usersTotal || 0 }, { l: 'Admins', v: opsSummary?.adminUsers || 0 }] },
        ].map(card => (
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
              ['Central técnica', 'WhatsApp, API, logs e usuários organizados para manutenção rápida.'],
              ['Branding separado', 'Empresa dedicada à identidade, cores e logos.'],
              ['Comunicação viva', 'Templates para mensagens e automações.'],
              ['Financeiro fiel', 'Receita ignora pedidos sem pagamento confirmado.'],
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
              <Button key={href} variant="outline" asChild className="w-full justify-between border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-accent-purple)/0.4)]">
                <Link to={href}>{label}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            ))}
          </div>

          <InfoBanner accentVar="--admin-accent-orange">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /><strong>Atenção</strong></div>
            <p>Valide failover do WhatsApp antes de depender da redundância em produção.</p>
          </InfoBanner>

          <InfoBanner accentVar="--admin-accent-cyan">
            <div className="flex items-center gap-2 mb-2"><Bug className="h-4 w-4" /><strong>Checklist</strong></div>
            <p>1. Testar gateways e SMTP. 2. Confirmar faturamento. 3. Validar boleto e logs.</p>
          </InfoBanner>
        </div>
      </div>
    </div>
  );

  const renderActive = () => {
    switch (activeTab) {
      case 'pagamentos': return renderPayments();
      case 'email': return renderEmail();
      case 'seguranca': return renderSecurity();
      case 'operacoes': return renderOperations();
      default: return renderGeneral();
    }
  };

  /* ═══════════════════ MAIN RENDER ═══════════════════ */
  const statusLabel = settings.store_status === 'closed' ? 'Fechada' : settings.store_status === 'vacation' ? 'Férias' : settings.store_status === 'coming_soon' ? 'Em breve' : 'Aberta';

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--admin-card-border))] bg-gradient-to-br from-[hsl(var(--admin-card))] to-[hsl(var(--admin-bg))] p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-10 h-48 w-48 rounded-full bg-[hsl(var(--admin-accent-purple)/0.08)] blur-3xl" />
            <div className="absolute right-0 top-8 h-56 w-56 rounded-full bg-[hsl(var(--admin-accent-blue)/0.06)] blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[hsl(var(--admin-accent-pink)/0.06)] blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.12)] px-4 py-2 text-sm font-bold text-[hsl(var(--admin-accent-purple))]">
                  <Sparkles className="h-4 w-4" />
                  Central de Configurações
                </div>
                <h2 className="text-2xl font-bold text-[hsl(var(--admin-text))] md:text-3xl">
                  Controle total do seu sistema
                </h2>
                <p className="max-w-xl text-sm text-[hsl(var(--admin-text-muted))] leading-relaxed">
                  Navegação por módulos, feedback visual em tempo real e salve tudo com um clique.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { l: 'Loja', v: statusLabel, a: '--admin-accent-blue' },
                    { l: 'Gateway', v: payment.payment_gateway_primary || 'mercadopago', a: '--admin-accent-green' },
                    { l: 'Email', v: emailSettings.email_enabled ? (emailSettings.test_mode ? 'Teste' : 'Real') : 'Off', a: '--admin-accent-orange' },
                    { l: 'Permissão', v: canMutate ? 'Editar' : 'Leitura', a: '--admin-accent-purple' },
                  ].map(p => (
                    <span key={p.l} className={cn('rounded-lg px-3 py-1.5 text-xs font-bold', `bg-[hsl(var(${p.a})/0.1)] text-[hsl(var(${p.a}))]`)}>
                      {p.l}: {p.v}
                    </span>
                  ))}
                </div>
              </div>

              <Button className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.4)] hover:shadow-xl transition-all shrink-0" onClick={saveAll} disabled={isSavingAny || !canMutate}>
                {isSavingAny ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar tudo
              </Button>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
          {/* Sidebar navigation */}
          <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <div className={cn(glassCard, 'p-4 space-y-2')}>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] px-2">Módulos</p>
              {sectionOrder.map(tab => {
                const meta = sectionMeta[tab];
                const Icon = meta.icon;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
                      isActive
                        ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg`
                        : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-text))]'
                    )}
                    style={isActive ? { boxShadow: `0 8px 24px ${meta.glowColor}` } : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{meta.title}</p>
                      <p className={cn('text-xs leading-snug', isActive ? 'text-white/70' : 'text-[hsl(var(--admin-text-muted))]')}>{meta.description}</p>
                    </div>
                    {isActive && <span className="ml-auto rounded-md bg-white/20 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold">ativo</span>}
                  </button>
                );
              })}
            </div>

            {/* Quick links */}
            <div className={cn(glassCard, 'p-4 space-y-2')}>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] px-2">Áreas</p>
              {[
                ['/admin/empresa', 'Empresa'],
                ['/admin/templates', 'Templates'],
                ['/admin/whatsapp', 'WhatsApp'],
                ['/admin/api', 'API e CRM'],
                ['/admin/logs', 'Logs'],
                ['/admin/usuarios', 'Usuários'],
              ].map(([href, label]) => (
                <Button key={href} variant="ghost" asChild className="w-full justify-between text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-sidebar-hover))] h-9">
                  <Link to={href}><span className="text-sm">{label}</span><ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Active section content */}
          <div className="min-w-0">{renderActive()}</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
