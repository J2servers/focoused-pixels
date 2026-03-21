import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
  type LucideIcon,
} from 'lucide-react';

type SettingsTab = 'geral' | 'pagamentos' | 'email' | 'seguranca' | 'operacoes';

interface OperationsSummary {
  whatsappConnected: number;
  whatsappErrors: number;
  whatsappSent: number;
  apiKeysActive: number;
  apiKeysTotal: number;
  webhookErrors: number;
  webhookToday: number;
  auditToday: number;
  auditTotal: number;
  usersTotal: number;
  adminUsers: number;
  editorUsers: number;
}

interface SectionMeta {
  value: SettingsTab;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  accentText: string;
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
  accentClass: string;
  accentTextClass: string;
}

const surfaceCardClass = 'rounded-[28px] border border-slate-300/90 bg-white/96 shadow-[0_20px_54px_rgba(60,64,67,0.14)] backdrop-blur';
const softBlockClass = 'rounded-[24px] border border-slate-300 bg-white shadow-[0_12px_30px_rgba(60,64,67,0.10)]';
const inputClassName = 'h-11 rounded-2xl border-slate-300 bg-white text-slate-950 shadow-none placeholder:text-slate-700 focus-visible:ring-[#1a73e8]/45';
const textareaClassName = 'min-h-[112px] rounded-2xl border-slate-300 bg-white text-slate-950 shadow-none placeholder:text-slate-700 focus-visible:ring-[#1a73e8]/45';
const selectClassName = 'h-11 rounded-2xl border-slate-300 bg-white text-slate-950 shadow-none';
const primaryButtonClass = 'border-[#1a73e8] bg-[#1a73e8] text-white shadow-[0_14px_28px_rgba(26,115,232,0.28)] hover:border-[#1558b0] hover:bg-[#1558b0]';
const secondaryButtonClass = 'border-slate-300 bg-white text-slate-800 shadow-none hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950';

const sectionMeta: Record<SettingsTab, SectionMeta> = {
  geral: {
    value: 'geral',
    title: 'Workspace Geral',
    description: 'Status da loja, checkout e mensagens principais.',
    icon: Store,
    accent: 'from-[#1a73e8] via-[#8ab4f8] to-[#d2e3fc]',
    accentSoft: 'bg-[#e8f0fe]',
    accentText: 'text-[#174ea6]',
  },
  pagamentos: {
    value: 'pagamentos',
    title: 'Pagamentos e Bancos',
    description: 'Gateways, credenciais, boleto e testes de conexão.',
    icon: CreditCard,
    accent: 'from-[#188038] via-[#34a853] to-[#d7f8dd]',
    accentSoft: 'bg-[#e6f4ea]',
    accentText: 'text-[#137333]',
  },
  email: {
    value: 'email',
    title: 'Email Business',
    description: 'SMTP Hostinger, testes e modo de seguranca.',
    icon: Mail,
    accent: 'from-[#f29900] via-[#fbbc04] to-[#feefc3]',
    accentSoft: 'bg-[#fef7e0]',
    accentText: 'text-[#b06000]',
  },
  seguranca: {
    value: 'seguranca',
    title: 'Conta e Alertas',
    description: 'Alertas operacionais e seguranca da conta.',
    icon: ShieldCheck,
    accent: 'from-[#d93025] via-[#ea4335] to-[#f9dedc]',
    accentSoft: 'bg-[#fce8e6]',
    accentText: 'text-[#c5221f]',
  },
  operacoes: {
    value: 'operacoes',
    title: 'Operacoes Tecnicas',
    description: 'WhatsApp, API, logs, usuários e atalhos do sistema.',
    icon: Settings2,
    accent: 'from-[#9334e6] via-[#a142f4] to-[#eadcff]',
    accentSoft: 'bg-[#f3e8ff]',
    accentText: 'text-[#7b1fa2]',
  },
};

const sectionOrder: SettingsTab[] = ['geral', 'pagamentos', 'email', 'seguranca', 'operacoes'];

const storeStatusLabel = (status?: string | null) => {
  switch (status) {
    case 'closed':
      return 'Fechada';
    case 'vacation':
      return 'Ferias';
    case 'coming_soon':
      return 'Em breve';
    default:
      return 'Aberta';
  }
};

const paymentMethodLabel = (method: string) => {
  switch (method) {
    case 'pix':
      return 'PIX';
    case 'credit_card':
      return 'Cartao';
    case 'boleto':
      return 'Boleto';
    default:
      return method;
  }
};

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

  useEffect(() => {
    if (companyInfo) setSettings(companyInfo);
  }, [companyInfo]);

  useEffect(() => {
    if (paymentCreds) setPayment(paymentCreds);
  }, [paymentCreds]);

  useEffect(() => {
    if (emailCreds) setEmailSettings(emailCreds);
  }, [emailCreds]);

  const u = <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => setSettings((prev) => ({ ...prev, [key]: value }));
  const up = <K extends keyof PaymentCredentials>(key: K, value: PaymentCredentials[K]) => setPayment((prev) => ({ ...prev, [key]: value }));
  const ue = <K extends keyof EmailCredentials>(key: K, value: EmailCredentials[K]) => setEmailSettings((prev) => ({ ...prev, [key]: value }));

  const { data: operationsSummary, isLoading: loadingOperations } = useQuery<OperationsSummary>({
    queryKey: ['settings-operations-summary'],
    queryFn: async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [whatsappInstances, whatsappMessages, apiKeys, webhookLogs, auditLogs, userRoles] = await Promise.all([
        supabase.from('whatsapp_instances').select('id, status'),
        supabase.from('whatsapp_messages').select('id, status').order('created_at', { ascending: false }).limit(200),
        supabase.from('api_keys').select('id, is_active'),
        supabase.from('webhook_logs').select('id, error_message, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('audit_logs').select('id, created_at').order('created_at', { ascending: false }).limit(300),
        supabase.from('user_roles').select('user_id, role'),
      ]);

      const instances = whatsappInstances.data || [];
      const messages = whatsappMessages.data || [];
      const keys = apiKeys.data || [];
      const webhooks = webhookLogs.data || [];
      const audits = auditLogs.data || [];
      const roles = userRoles.data || [];

      return {
        whatsappConnected: instances.filter((item) => item.status === 'connected' || item.status === 'open').length,
        whatsappErrors: messages.filter((item) => item.status === 'error' || item.status === 'failed').length,
        whatsappSent: messages.filter((item) => item.status === 'sent').length,
        apiKeysActive: keys.filter((item) => item.is_active).length,
        apiKeysTotal: keys.length,
        webhookErrors: webhooks.filter((item) => item.error_message).length,
        webhookToday: webhooks.filter((item) => new Date(item.created_at) >= todayStart).length,
        auditToday: audits.filter((item) => new Date(item.created_at) >= todayStart).length,
        auditTotal: audits.length,
        usersTotal: roles.length,
        adminUsers: roles.filter((item) => item.role === 'admin').length,
        editorUsers: roles.filter((item) => item.role === 'editor').length,
      };
    },
    refetchInterval: 30000,
  });

  const isSavingAny = updateCompany.isPending || updatePayment.isPending || updateEmail.isPending;
  const canMutate = canEdit();
  const adminAccess = isAdmin();
  const activeSection = sectionMeta[activeTab];

  const toggleMethod = (method: string) => {
    const current = payment.payment_methods_enabled || ['pix', 'credit_card', 'boleto'];
    up(
      'payment_methods_enabled',
      current.includes(method) ? current.filter((item) => item !== method) : [...current, method],
    );
  };

  const saveAll = async () => {
    try {
      await Promise.all([
        updateCompany.mutateAsync({ id: companyInfo?.id || null, data: settings }),
        updatePayment.mutateAsync({ id: paymentCreds?.id || null, data: payment }),
        updateEmail.mutateAsync({ id: emailCreds?.id || null, data: emailSettings }),
      ]);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  const persistEmailSettings = async () => {
    await updateEmail.mutateAsync({ id: emailCreds?.id || null, data: emailSettings });
  };

  const handleTestEmailConnection = async () => {
    try {
      await persistEmailSettings();
      const result = await testEmailConnection.mutateAsync();
      toast.success(`SMTP conectado em ${result.provider}:${result.port}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Falha no teste SMTP');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      await persistEmailSettings();
      const result = await sendTestEmail.mutateAsync({
        to: emailSettings.test_recipient || undefined,
        subject: 'Teste de envio - Hostinger Business',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#eff6ff;">
            <div style="background:#ffffff;border:1px solid #bfdbfe;border-radius:16px;padding:24px;">
              <h2 style="margin:0 0 12px;color:#1d4ed8;">Teste de email da area administrativa</h2>
              <p style="margin:0 0 8px;color:#1e3a8a;">Se voce recebeu esta mensagem, o Hostinger Business esta configurado corretamente.</p>
              <p style="margin:0;color:#334155;">A loja Pincel de Luz acabou de validar o envio por SMTP.</p>
            </div>
          </div>
        `,
        from_name: emailSettings.sender_name || undefined,
      });
      toast.success(`Email de teste enviado para ${result.effectiveTo}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar email de teste');
    }
  };

  const changePassword = async () => {
    if (pass.n.length < 6) return toast.error('Senha minima de 6 caracteres');
    if (pass.n !== pass.c) return toast.error('As senhas não coincidem');

    setChangingPass(true);
    try {
      const { error } = await updatePassword(pass.n);
      if (error) throw error;
      setPass({ n: '', c: '' });
      toast.success('Senha alterada com sucesso!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao alterar senha');
    } finally {
      setChangingPass(false);
    }
  };

  const runMercadoPagoTest = async () => {
    try {
      const result = await testMP.mutateAsync();
      if (result?.success) {
        toast.success('Mercado Pago OK');
      } else {
        toast.error('Mercado Pago falhou');
      }
    } catch {
      toast.error('Mercado Pago falhou');
    }
  };

  const runEfiTest = async () => {
    try {
      const result = await testEFI.mutateAsync();
      if (result?.success) {
        toast.success('EFI OK');
      } else {
        toast.error('EFI falhou');
      }
    } catch {
      toast.error('EFI falhou');
    }
  };

  const runStripeTest = async () => {
    try {
      const result = await testStripe.mutateAsync();
      if (result?.success) {
        toast.success('Stripe OK');
      } else {
        toast.error('Stripe falhou');
      }
    } catch {
      toast.error('Stripe falhou');
    }
  };

  const paymentStatusMap = {
    mercadopago: { success: testMP.isSuccess, pending: testMP.isPending, action: runMercadoPagoTest },
    efi: { success: testEFI.isSuccess, pending: testEFI.isPending, action: runEfiTest },
    stripe: { success: testStripe.isSuccess, pending: testStripe.isPending, action: runStripeTest },
  };

  const methodsEnabled = payment.payment_methods_enabled || [];
  const paymentCredentialsFilled = [
    payment.mercadopago_public_key,
    payment.mercadopago_access_token,
    payment.efi_client_id,
    payment.efi_client_secret,
    payment.efi_pix_key,
    payment.pagseguro_email,
    payment.pagseguro_token,
    payment.stripe_public_key,
    payment.stripe_secret_key,
    payment.asaas_api_key,
  ].filter(Boolean).length;

  const emailChecklist = useMemo(
    () => [
      !!emailSettings.business_email,
      !!emailSettings.smtp_host,
      !!emailSettings.smtp_username,
      !!emailSettings.smtp_password,
      !!emailSettings.test_recipient,
    ].filter(Boolean).length,
    [emailSettings.business_email, emailSettings.smtp_host, emailSettings.smtp_password, emailSettings.smtp_username, emailSettings.test_recipient],
  );

  const heroStats = [
    { label: 'Loja', value: storeStatusLabel(settings.store_status), tone: 'bg-[#e8f0fe] text-[#174ea6]' },
    { label: 'Gateway', value: payment.payment_gateway_primary || 'mercadopago', tone: 'bg-[#e6f4ea] text-[#137333]' },
    { label: 'Email', value: emailSettings.email_enabled ? (emailSettings.test_mode ? 'Teste ativo' : 'Envio real') : 'Desligado', tone: 'bg-[#fef7e0] text-[#b06000]' },
    { label: 'Operações', value: loadingOperations ? 'Atualizando' : `${operationsSummary?.whatsappConnected || 0} instâncias online`, tone: 'bg-[#f3e8ff] text-[#7b1fa2]' },
  ];

  const gatewayCards: GatewayCardConfig[] = [
    {
      id: 'mercadopago',
      label: 'Mercado Pago',
      description: 'PIX, boleto e cartao com checkout principal.',
      enabledKey: 'mercadopago_enabled',
      sandboxKey: 'mercadopago_sandbox',
      accentClass: 'bg-[#e8f0fe]',
      accentTextClass: 'text-[#174ea6]',
      fields: [
        { key: 'mercadopago_public_key', label: 'Public Key', placeholder: 'APP_USR-...' },
        { key: 'mercadopago_access_token', label: 'Access Token', type: 'password', placeholder: 'APP_USR-...' },
      ],
    },
    {
      id: 'efi',
      label: 'EFI Bank',
      description: 'PIX direto via EFI com chave propria.',
      enabledKey: 'efi_enabled',
      sandboxKey: 'efi_sandbox',
      accentClass: 'bg-[#e6f4ea]',
      accentTextClass: 'text-[#137333]',
      fields: [
        { key: 'efi_client_id', label: 'Client ID' },
        { key: 'efi_client_secret', label: 'Client Secret', type: 'password' },
        { key: 'efi_pix_key', label: 'Chave PIX', placeholder: 'email, telefone ou chave aleatoria' },
      ],
    },
    {
      id: 'pagseguro',
      label: 'PagSeguro',
      description: 'Conta e token para homologacao ou reserva.',
      enabledKey: 'pagseguro_enabled',
      sandboxKey: 'pagseguro_sandbox',
      accentClass: 'bg-[#fef7e0]',
      accentTextClass: 'text-[#b06000]',
      fields: [
        { key: 'pagseguro_email', label: 'Email da conta', type: 'email' },
        { key: 'pagseguro_token', label: 'Token', type: 'password' },
      ],
    },
    {
      id: 'stripe',
      label: 'Stripe',
      description: 'Cartao internacional e checkout cloud.',
      enabledKey: 'stripe_enabled',
      sandboxKey: 'stripe_sandbox',
      accentClass: 'bg-[#f3e8ff]',
      accentTextClass: 'text-[#7b1fa2]',
      fields: [
        { key: 'stripe_public_key', label: 'Public Key' },
        { key: 'stripe_secret_key', label: 'Secret Key', type: 'password' },
      ],
    },
    {
      id: 'asaas',
      label: 'Asaas',
      description: 'Cobrancas recorrentes e conta reserva.',
      enabledKey: 'asaas_enabled',
      sandboxKey: 'asaas_sandbox',
      accentClass: 'bg-[#fce8e6]',
      accentTextClass: 'text-[#c5221f]',
      fields: [{ key: 'asaas_api_key', label: 'API Key', type: 'password' }],
    },
  ];

  if (loadingCompany || loadingPayment || loadingEmail) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  const renderGeneralSection = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className={surfaceCardClass}>
          <CardHeader>
            <CardTitle className="text-[28px] text-slate-900">Workspace da operação</CardTitle>
            <CardDescription className="text-slate-700">
              Controle a disponibilidade da loja, mensagens do cliente e regras base do checkout em um painel visual unico.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-700">Status da loja</Label>
              <Select value={settings.store_status || 'open'} onValueChange={(value) => u('store_status', value)}>
                <SelectTrigger className={selectClassName}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberta</SelectItem>
                  <SelectItem value="closed">Fechada</SelectItem>
                  <SelectItem value="vacation">Ferias</SelectItem>
                  <SelectItem value="coming_soon">Em breve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Mensagem de status</Label>
              <Input className={inputClassName} value={settings.store_closed_message || ''} onChange={(event) => u('store_closed_message', event.target.value)} placeholder="Ex.: voltamos em algumas horas" />
            </div>
            <div className="md:col-span-2 rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">Modo manutenção</p>
                  <p className="text-sm text-slate-700">Bloqueia a loja temporariamente enquanto a equipe corrige ou publica novidades.</p>
                </div>
                <Switch checked={settings.maintenance_mode ?? false} onCheckedChange={(value) => u('maintenance_mode', value)} />
              </div>
              <div className="mt-4 space-y-2">
                <Label className="text-slate-700">Mensagem de manutenção</Label>
                <Textarea className={textareaClassName} value={settings.maintenance_message || ''} onChange={(event) => u('maintenance_message', event.target.value)} placeholder="Explique o motivo e quando a loja volta a operar." />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(surfaceCardClass, 'overflow-hidden')}>
          <div className="h-1.5 bg-gradient-to-r from-[#1a73e8] via-[#34a853] via-[52%] to-[#fbbc04]" />
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Leitura rápida da jornada</CardTitle>
            <CardDescription className="text-slate-700">Resumo vivo do que o cliente encontra antes, durante e depois do checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] bg-[#e8f0fe] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#174ea6]">Checkout</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{settings.enable_guest_checkout ? 'Convidado liberado' : 'Login exigido'}</p>
                <p className="mt-2 text-sm text-slate-700">Telefone {settings.require_phone_on_checkout ? 'obrigatório' : 'opcional'} na finalização.</p>
              </div>
              <div className="rounded-[22px] bg-[#e6f4ea] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#137333]">Pedido minimo</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">R$ {Number(settings.min_order_value || 0).toFixed(2)}</p>
                <p className="mt-2 text-sm text-slate-700">Abaixo deste valor a compra não fecha.</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-300 bg-white p-4">
              <p className="text-sm font-medium text-slate-900">Mensagem de sucesso atual</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{settings.checkout_success_message || 'Ainda não configurada. Defina uma mensagem clara para confirmar ao cliente que o pedido entrou na fila.'}</p>
            </div>
            <div className="rounded-[24px] border border-[#fbbc04]/40 bg-[#fef7e0] p-4 text-sm text-[#7c4a03]">
              Receita, ticket médio e gráficos financeiros só consideram pedidos com pagamento confirmado. Pedidos aguardando boleto ou outra confirmação continuam no sistema, mas não viram faturamento.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={surfaceCardClass}>
        <CardHeader>
          <CardTitle className="text-slate-900">Checkout e conversão</CardTitle>
          <CardDescription className="text-slate-700">Defina políticas comerciais, automações e a mensagem-padrão do WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Pedido mínimo (R$)</Label>
              <Input className={inputClassName} type="number" value={settings.min_order_value || 0} onChange={(event) => u('min_order_value', Number(event.target.value))} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Recuperação de carrinho (horas)</Label>
              <Input className={inputClassName} type="number" value={settings.abandoned_cart_reminder_hours || 24} onChange={(event) => u('abandoned_cart_reminder_hours', Number(event.target.value))} />
            </div>
            <div className="space-y-2 xl:col-span-2">
              <Label className="text-slate-700">Mensagem de sucesso</Label>
              <Input className={inputClassName} value={settings.checkout_success_message || ''} onChange={(event) => u('checkout_success_message', event.target.value)} placeholder="Seu pedido foi recebido e esta sendo processado." />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Template geral de WhatsApp</Label>
            <Textarea className={textareaClassName} rows={4} value={settings.whatsapp_message_template || ''} onChange={(event) => u('whatsapp_message_template', event.target.value)} placeholder="Use variaveis e um texto acolhedor para a confirmacao do pedido." />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">Checkout convidado</p>
                  <p className="text-sm text-slate-700">Permite compra sem criar conta antes do pagamento.</p>
                </div>
                <Switch checked={settings.enable_guest_checkout ?? true} onCheckedChange={(value) => u('enable_guest_checkout', value)} />
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">Telefone obrigatório</p>
                  <p className="text-sm text-slate-700">Mantém WhatsApp e suporte prontos no pós-venda.</p>
                </div>
                <Switch checked={settings.require_phone_on_checkout ?? true} onCheckedChange={(value) => u('require_phone_on_checkout', value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentsSection = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className={surfaceCardClass}>
          <CardHeader>
            <CardTitle className="text-[28px] text-slate-900">Matriz de pagamentos</CardTitle>
            <CardDescription className="text-slate-700">Escolha o gateway principal, libere meios de pagamento e veja o pulso do financeiro técnico.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Gateway principal</Label>
                <Select value={payment.payment_gateway_primary || 'mercadopago'} onValueChange={(value) => up('payment_gateway_primary', value)}>
                  <SelectTrigger className={selectClassName}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                    <SelectItem value="efi">EFI</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="pagseguro">PagSeguro</SelectItem>
                    <SelectItem value="asaas">Asaas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-[22px] bg-[#e6f4ea] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#137333]">Credenciais preenchidas</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{paymentCredentialsFilled}</p>
                <p className="mt-2 text-sm text-slate-700">Campos sensíveis prontos para conexões e homologações.</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-300 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">Formas habilitadas no checkout</p>
                  <p className="text-sm text-slate-700">Ative somente o que está pronto para uso em produção ou em testes internos.</p>
                </div>
                <div className="rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-medium text-[#174ea6]">{methodsEnabled.length} ativas</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['pix', 'credit_card', 'boleto'].map((method) => (
                  <label key={method} className="flex cursor-pointer items-center gap-3 rounded-[20px] border border-slate-300 bg-[#f2f6ff] px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
                    <Checkbox checked={methodsEnabled.includes(method)} onCheckedChange={() => toggleMethod(method)} />
                    <span>{paymentMethodLabel(method)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Desconto no PIX (%)</Label>
                <Input className={inputClassName} type="number" value={payment.pix_discount_percent ?? 5} onChange={(event) => up('pix_discount_percent', Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Dias extras do boleto</Label>
                <Input className={inputClassName} type="number" value={payment.boleto_extra_days ?? 3} onChange={(event) => up('boleto_extra_days', Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Parcelamento máximo</Label>
                <Input className={inputClassName} type="number" value={payment.max_installments ?? 12} onChange={(event) => up('max_installments', Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Parcela mínima (R$)</Label>
                <Input className={inputClassName} type="number" value={payment.min_installment_value ?? 50} onChange={(event) => up('min_installment_value', Number(event.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(surfaceCardClass, 'overflow-hidden')}>
          <div className="grid gap-px bg-slate-200 md:grid-cols-3">
            {[
              { label: 'Mercado Pago', success: testMP.isSuccess },
              { label: 'EFI', success: testEFI.isSuccess },
              { label: 'Stripe', success: testStripe.isSuccess },
            ].map((item) => (
              <div key={item.label} className="bg-white p-5">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{item.label}</span>
                  {item.success ? <CheckCircle2 className="h-4 w-4 text-[#137333]" /> : <XCircle className="h-4 w-4 text-slate-400" />}
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{item.success ? 'Conectado' : 'Pendente'}</p>
                <p className="mt-2 text-sm text-slate-700">Use os testes abaixo para validar credenciais antes de liberar o checkout.</p>
              </div>
            ))}
          </div>
          <CardContent className="pt-6">
            <div className="grid gap-3 md:grid-cols-3">
              <Button variant="outline" className={secondaryButtonClass} onClick={runMercadoPagoTest} disabled={!canMutate || testMP.isPending}>
                {testMP.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Testar Mercado Pago
              </Button>
              <Button variant="outline" className={secondaryButtonClass} onClick={runEfiTest} disabled={!canMutate || testEFI.isPending}>
                {testEFI.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Testar EFI
              </Button>
              <Button variant="outline" className={secondaryButtonClass} onClick={runStripeTest} disabled={!canMutate || testStripe.isPending}>
                {testStripe.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Testar Stripe
              </Button>
            </div>
            <div className="mt-4 rounded-[24px] border border-[#fbbc04]/40 bg-[#fef7e0] p-4 text-sm text-[#7c4a03]">
              Boleto só libera o pedido após compensação. Quando o sistema reconhecer o pagamento confirmado, ele envia a mensagem de liberação e o pedido segue para produção ou envio.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {gatewayCards.map((gateway) => {
          const status = paymentStatusMap[gateway.id as keyof typeof paymentStatusMap];
          const enabled = Boolean(payment[gateway.enabledKey]);
          const sandboxEnabled = gateway.sandboxKey ? Boolean(payment[gateway.sandboxKey]) : false;

          return (
            <Card key={gateway.id} className={surfaceCardClass}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]', gateway.accentClass, gateway.accentTextClass)}>
                      {gateway.label}
                    </div>
                    <CardTitle className="mt-3 text-xl text-slate-900">Credenciais {gateway.label}</CardTitle>
                    <CardDescription className="mt-2 text-slate-700">{gateway.description}</CardDescription>
                  </div>
                  {status ? (
                    <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium', status.success ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-slate-100 text-slate-700')}>
                      {status.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {status.success ? 'validado' : 'não testado'}
                    </div>
                  ) : (
                    <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">manual</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">Ativar {gateway.label}</p>
                      <p className="text-sm text-slate-700">Libera este gateway para aparecer e ser escolhido na operação.</p>
                    </div>
                    <Switch checked={enabled} onCheckedChange={(value) => up(gateway.enabledKey, value as PaymentCredentials[keyof PaymentCredentials])} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {gateway.fields.map((field) => (
                    <div key={String(field.key)} className={field.key === 'efi_pix_key' ? 'space-y-2 md:col-span-2' : 'space-y-2'}>
                      <Label className="text-slate-700">{field.label}</Label>
                      <Input
                        className={inputClassName}
                        type={field.type || 'text'}
                        value={String(payment[field.key] || '')}
                        onChange={(event) => up(field.key, event.target.value as PaymentCredentials[keyof PaymentCredentials])}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>

                {gateway.sandboxKey && (
                  <div className="rounded-[24px] border border-slate-300 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">Modo sandbox</p>
                        <p className="text-sm text-slate-700">Use para homologação e testes controlados.</p>
                      </div>
                      <Switch checked={sandboxEnabled} onCheckedChange={(value) => up(gateway.sandboxKey!, value as PaymentCredentials[keyof PaymentCredentials])} />
                    </div>
                  </div>
                )}

                {status && (
                  <Button variant="outline" className={secondaryButtonClass} onClick={status.action} disabled={!canMutate || status.pending}>
                    {status.pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Testar agora
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderEmailSection = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className={surfaceCardClass}>
          <CardHeader>
            <CardTitle className="text-[28px] text-slate-900">Email Business Hostinger</CardTitle>
            <CardDescription className="text-slate-700">Configure SMTP com rota segura, testes internos e liberação gradual para emails transacionais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Email Business</Label>
                <Input className={inputClassName} type="email" value={emailSettings.business_email || ''} onChange={(event) => ue('business_email', event.target.value)} placeholder="contato@sualoja.com.br" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Nome do remetente</Label>
                <Input className={inputClassName} value={emailSettings.sender_name || ''} onChange={(event) => ue('sender_name', event.target.value)} placeholder="Pincel de Luz" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Host SMTP</Label>
                <Input className={inputClassName} value={emailSettings.smtp_host || ''} onChange={(event) => ue('smtp_host', event.target.value)} placeholder="smtp.hostinger.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Porta</Label>
                <Input className={inputClassName} type="number" value={emailSettings.smtp_port || 465} onChange={(event) => ue('smtp_port', Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Usuário SMTP</Label>
                <Input className={inputClassName} value={emailSettings.smtp_username || ''} onChange={(event) => ue('smtp_username', event.target.value)} placeholder="contato@sualoja.com.br" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Senha SMTP</Label>
                <Input className={inputClassName} type="password" value={emailSettings.smtp_password || ''} onChange={(event) => ue('smtp_password', event.target.value)} placeholder="Senha do email business" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Reply-to</Label>
                <Input className={inputClassName} type="email" value={emailSettings.reply_to_email || ''} onChange={(event) => ue('reply_to_email', event.target.value)} placeholder="respostas@sualoja.com.br" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Destinatário de teste</Label>
                <Input className={inputClassName} type="email" value={emailSettings.test_recipient || ''} onChange={(event) => ue('test_recipient', event.target.value)} placeholder="voce@seudominio.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(surfaceCardClass, 'overflow-hidden')}>
          <div className="grid gap-px bg-slate-200 md:grid-cols-3">
            {[
              { label: 'Checklist', value: `${emailChecklist}/5`, description: 'Base SMTP pronta para testes.' },
              { label: 'Modo', value: emailSettings.test_mode ? 'Teste' : 'Real', description: 'Roteamento atual dos emails.' },
              { label: 'Envio', value: emailSettings.email_enabled ? 'Ativo' : 'Desligado', description: 'Disparos automáticos do sistema.' },
            ].map((item) => (
              <div key={item.label} className="bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b06000]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
                <p className="mt-2 text-sm text-slate-700">{item.description}</p>
              </div>
            ))}
          </div>
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">Habilitar envio real</p>
                    <p className="text-sm text-slate-700">Liga emails automáticos da loja.</p>
                  </div>
                  <Switch checked={emailSettings.email_enabled ?? false} onCheckedChange={(value) => ue('email_enabled', value)} />
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">Modo de teste</p>
                    <p className="text-sm text-slate-700">Redireciona tudo para o email de teste.</p>
                  </div>
                  <Switch checked={emailSettings.test_mode ?? true} onCheckedChange={(value) => ue('test_mode', value)} />
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">Conexão segura</p>
                    <p className="text-sm text-slate-700">Ative para Hostinger na porta 465.</p>
                  </div>
                  <Switch checked={emailSettings.smtp_secure ?? true} onCheckedChange={(value) => ue('smtp_secure', value)} />
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#fbbc04]/40 bg-[#fef7e0] p-4 text-sm text-[#7c4a03]">
              Quando o modo de teste estiver ativo, emails transacionais tambem serao redirecionados para o destinatario de teste. Isso protege clientes durante homologacao.
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Button variant="outline" className={secondaryButtonClass} onClick={handleTestEmailConnection} disabled={!canMutate || testEmailConnection.isPending || updateEmail.isPending}>
                {testEmailConnection.isPending || updateEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Testar conexão SMTP
              </Button>
              <Button variant="outline" className={secondaryButtonClass} onClick={handleSendTestEmail} disabled={!canMutate || sendTestEmail.isPending || updateEmail.isPending}>
                {sendTestEmail.isPending || updateEmail.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar email de teste
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className={surfaceCardClass}>
          <CardHeader>
            <CardTitle className="text-[28px] text-slate-900">Alertas operacionais</CardTitle>
            <CardDescription className="text-slate-700">Defina quem recebe avisos críticos e quanto tempo o time tem para reagir.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Limite de estoque baixo</Label>
                <Input className={inputClassName} type="number" value={settings.low_stock_threshold || 5} onChange={(event) => u('low_stock_threshold', Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Email para alertas</Label>
                <Input className={inputClassName} type="email" value={settings.notification_email || ''} onChange={(event) => u('notification_email', event.target.value)} placeholder="financeiro@sualoja.com.br" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">Alerta de estoque</p>
                    <p className="text-sm text-slate-700">Dispara aviso quando itens entram na zona crítica.</p>
                  </div>
                  <Switch checked={settings.enable_stock_alerts ?? true} onCheckedChange={(value) => u('enable_stock_alerts', value)} />
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-300 bg-[#f2f6ff] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">Alerta de pedidos</p>
                    <p className="text-sm text-slate-700">Notifica a equipe quando entram novos pedidos ou mudanças relevantes.</p>
                  </div>
                  <Switch checked={settings.enable_order_notifications ?? true} onCheckedChange={(value) => u('enable_order_notifications', value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={surfaceCardClass}>
          <CardHeader>
            <CardTitle className="text-[28px] text-slate-900">Conta e acesso</CardTitle>
            <CardDescription className="text-slate-700">Seu perfil visível, senha segura e orientações rápidas para manter o admin protegido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-[#e8f0fe] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#174ea6]">Usuario</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{profile?.full_name || 'Sem nome'}</p>
                <p className="mt-2 text-sm text-slate-700">{profile?.email || 'sem-email'}</p>
              </div>
              <div className="rounded-[24px] bg-[#fce8e6] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c5221f]">Proteção</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Senha forte</p>
                <p className="mt-2 text-sm text-slate-700">Recomende troca periódica para manter o painel seguro.</p>
              </div>
            </div>
            <Separator className="bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Nova senha</Label>
                <Input className={inputClassName} type="password" value={pass.n} onChange={(event) => setPass({ ...pass, n: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Confirmar senha</Label>
                <Input className={inputClassName} type="password" value={pass.c} onChange={(event) => setPass({ ...pass, c: event.target.value })} />
              </div>
            </div>
            <Button className={primaryButtonClass} onClick={changePassword} disabled={changingPass}>
              {changingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Alterar senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOperationsSection = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className={surfaceCardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <MessageSquare className="h-5 w-5 text-[#137333]" />
              WhatsApp
            </CardTitle>
            <CardDescription className="text-slate-700">Instâncias, filas e failover.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingOperations ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <>
                <div className="rounded-[22px] border border-slate-300 bg-[#f2f6ff] p-4 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Online</span><strong>{operationsSummary?.whatsappConnected || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Enviadas</span><strong>{operationsSummary?.whatsappSent || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Erros</span><strong>{operationsSummary?.whatsappErrors || 0}</strong></div>
                </div>
                <Button asChild className={primaryButtonClass}>
                  <Link to="/admin/whatsapp">Abrir central do WhatsApp</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className={surfaceCardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <Webhook className="h-5 w-5 text-[#174ea6]" />
              API e CRM
            </CardTitle>
            <CardDescription className="text-slate-700">Chaves, integrações e webhooks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingOperations ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <>
                <div className="rounded-[22px] border border-slate-300 bg-[#f2f6ff] p-4 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Chaves ativas</span><strong>{operationsSummary?.apiKeysActive || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Total</span><strong>{operationsSummary?.apiKeysTotal || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Erros webhook</span><strong>{operationsSummary?.webhookErrors || 0}</strong></div>
                </div>
                <Button asChild className={primaryButtonClass}>
                  <Link to="/admin/api">Abrir API e CRM</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className={surfaceCardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <ScrollText className="h-5 w-5 text-[#b06000]" />
              Logs
            </CardTitle>
            <CardDescription className="text-slate-700">Auditoria técnica e histórico vivo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingOperations ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <>
                <div className="rounded-[22px] border border-slate-300 bg-[#f2f6ff] p-4 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Auditoria hoje</span><strong>{operationsSummary?.auditToday || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Webhooks hoje</span><strong>{operationsSummary?.webhookToday || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Linhas carregadas</span><strong>{operationsSummary?.auditTotal || 0}</strong></div>
                </div>
                <Button asChild className={primaryButtonClass}>
                  <Link to="/admin/logs">Abrir logs</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className={surfaceCardClass}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-slate-900">
              <Users className="h-5 w-5 text-[#7b1fa2]" />
              Usuários
            </CardTitle>
            <CardDescription className="text-slate-700">Perfis, papéis e acesso da equipe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingOperations ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <>
                <div className="rounded-[22px] border border-slate-300 bg-[#f2f6ff] p-4 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Total</span><strong>{operationsSummary?.usersTotal || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Admins</span><strong>{operationsSummary?.adminUsers || 0}</strong></div>
                  <div className="mt-2 flex justify-between"><span>Editores</span><strong>{operationsSummary?.editorUsers || 0}</strong></div>
                </div>
                <Button asChild className={primaryButtonClass} disabled={!adminAccess}>
                  <Link to="/admin/usuarios">Abrir usuários</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className={surfaceCardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-5 w-5 text-[#174ea6]" />
              Garantia de acesso operacional
            </CardTitle>
            <CardDescription className="text-slate-700">Mesmo com a nova organização, tudo o que era vital continua acessível em algum ponto do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              ['Central técnica', 'WhatsApp, API, logs e usuários estão organizados nesta página para manutenção rápida.'],
              ['Branding separado', 'Empresa continua dedicada à identidade, cores, logos e configurações institucionais.'],
              ['Comunicação viva', 'Templates segue dedicado a mensagens, modelos e automações de comunicação.'],
              ['Financeiro fiel', 'Receita e gráficos ignoram pedidos sem pagamento confirmado para evitar distorção.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[22px] border border-slate-300 bg-[#f2f6ff] p-4">
                <p className="font-medium text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className={surfaceCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FolderOpen className="h-5 w-5 text-[#137333]" />
                Atalhos externos
              </CardTitle>
              <CardDescription className="text-slate-700">Rotas que continuam fora desta tela para preservar contexto de uso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                ['/admin/empresa', 'Empresa'],
                ['/admin/templates', 'Templates'],
                ['/admin/midia', 'Midia'],
                ['/admin/pedidos', 'Pedidos'],
              ].map(([href, label]) => (
                <Button key={href} variant="outline" asChild className={cn(secondaryButtonClass, 'w-full justify-between')}>
                  <Link to={href}>
                    {label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-[#fbbc04]/40 bg-[#fef7e0] shadow-[0_18px_50px_rgba(251,188,4,0.14)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#7c4a03]">
                <AlertTriangle className="h-5 w-5" />
                Pontos de atenção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#7c4a03]">
              <p>Use a central do WhatsApp para validar failover real entre instâncias antes de depender da redundância em produção.</p>
              <p>Se houver erro de webhook ou SMTP, revise API/CRM e Email Business antes de publicar a nova build.</p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border border-[#d2e3fc] bg-[#e8f0fe] shadow-[0_18px_50px_rgba(26,115,232,0.12)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#174ea6]">
                <Bug className="h-5 w-5" />
                Checklist rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#174ea6]">
              <p>1. Testar gateways e SMTP.</p>
              <p>2. Confirmar que o faturamento s? mostra pedidos pagos.</p>
              <p>3. Validar boleto, WhatsApp e logs antes da build final.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'pagamentos':
        return renderPaymentsSection();
      case 'email':
        return renderEmailSection();
      case 'seguranca':
        return renderSecuritySection();
      case 'operacoes':
        return renderOperationsSection();
      case 'geral':
      default:
        return renderGeneralSection();
    }
  };

  return (
    <AdminLayout title="Configurações">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#f1f5ff] p-4 text-slate-900 shadow-[0_22px_84px_rgba(15,23,42,0.26)] md:p-6 xl:p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[36px]">
          <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-[#1a73e8]/15 blur-3xl" />
          <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-[#34a853]/12 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-[#fbbc04]/12 blur-3xl" />
          <div className="absolute bottom-8 right-12 h-48 w-48 rounded-full bg-[#ea4335]/10 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          <Card className="overflow-hidden rounded-[32px] border border-slate-300 bg-white/96 shadow-[0_24px_70px_rgba(60,64,67,0.12)]">
            <div className={cn('h-2 bg-gradient-to-r', activeSection.accent)} />
            <CardContent className="p-6 md:p-7">
              <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
                <div className="space-y-4">
                  <div className={cn('inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold', activeSection.accentSoft, activeSection.accentText)}>
                    <activeSection.icon className="h-4 w-4" />
                    Tema Google Workspace para configurações
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Central de configurações recriada por completo</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 md:text-base">
                      A nova tela foi pensada como um workspace interativo: navegação lateral viva, módulos coloridos por contexto e leitura rápida do que está ativo, pendente ou em teste.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {heroStats.map((item) => (
                      <div key={item.label} className={cn('rounded-full px-4 py-2 text-sm font-medium', item.tone)}>
                        <span className="opacity-80">{item.label}: </span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={cn(softBlockClass, 'bg-gradient-to-br from-white to-[#edf4ff] p-5')}>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#174ea6]">Seção ativa</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{activeSection.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{activeSection.description}</p>
                  </div>
                  <div className={cn(softBlockClass, 'bg-gradient-to-br from-white to-[#eef9f1] p-5')}>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#137333]">Permissão</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{canMutate ? 'Edição liberada' : 'Leitura somente'}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">Use o botão salvar para persistir empresa, pagamentos e email em uma única ação.</p>
                  </div>
                  <div className={cn(softBlockClass, 'bg-gradient-to-br from-white to-[#fff8e5] p-5 sm:col-span-2')}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b06000]">Ação principal</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">Salvar tudo sem perder contexto</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">Os formulários continuam unificados. Empresa e Templates seguem em páginas próprias, mas todos os caminhos permanecem acessíveis.</p>
                      </div>
                      <Button className={primaryButtonClass} onClick={saveAll} disabled={isSavingAny || !canMutate}>
                        {isSavingAny ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Salvar tudo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)]">
            <div className="space-y-6 xl:sticky xl:top-4 xl:self-start">
              <Card className={surfaceCardClass}>
                <CardHeader>
                  <CardTitle className="text-slate-900">Navegação por workspace</CardTitle>
                  <CardDescription className="text-slate-700">Cada bloco reorganiza um conjunto de configurações com visual e feedback próprios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sectionOrder.map((tab) => {
                    const meta = sectionMeta[tab];
                    const Icon = meta.icon;
                    const isActive = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-[24px] border px-4 py-4 text-left transition-all duration-200',
                          isActive
                            ? 'border-transparent bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                        )}
                      >
                        <div className={cn('mt-0.5 rounded-2xl p-2.5', isActive ? 'bg-white/12 text-white' : `${meta.accentSoft} ${meta.accentText}`)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{meta.title}</p>
                            {isActive && <span className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">ativo</span>}
                          </div>
                          <p className={cn('mt-1 text-sm leading-6', isActive ? 'text-slate-200' : 'text-slate-700')}>{meta.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className={surfaceCardClass}>
                <CardHeader>
                  <CardTitle className="text-slate-900">Áreas preservadas</CardTitle>
                  <CardDescription className="text-slate-700">Nada foi perdido. Apenas redistribuído para o contexto certo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    ['/admin/empresa', 'Empresa'],
                    ['/admin/templates', 'Templates'],
                    ['/admin/whatsapp', 'WhatsApp'],
                    ['/admin/api', 'API e CRM'],
                    ['/admin/logs', 'Logs'],
                    ['/admin/usuarios', 'Usuários'],
                  ].map(([href, label]) => (
                    <Button key={href} variant="outline" asChild className={cn(secondaryButtonClass, 'w-full justify-between')}>
                      <Link to={href}>
                        {label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="min-w-0">{renderActiveSection()}</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
