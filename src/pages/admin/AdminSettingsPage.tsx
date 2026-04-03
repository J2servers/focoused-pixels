import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCompanyInfo, useUpdateCompanyInfo, CompanyInfo } from '@/hooks/useCompanyInfo';
import { usePaymentCredentials, useUpdatePaymentCredentials, PaymentCredentials } from '@/hooks/usePaymentCredentials';
import { useEmailCredentials, useUpdateEmailCredentials, EmailCredentials } from '@/hooks/useEmailCredentials';
import { useSendTestEmail, useTestEmailConnection } from '@/hooks/useEmailGateway';
import { useTestMercadoPago, useTestEfiBank, useTestStripe } from '@/hooks/usePaymentGateway';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowRight, CreditCard, Loader2, Mail, Save, Settings2, ShieldCheck, Sparkles, Store, type LucideIcon } from 'lucide-react';
import { SettingsGeneralSection } from '@/components/admin/settings/SettingsGeneralSection';
import { SettingsPaymentsSection } from '@/components/admin/settings/SettingsPaymentsSection';
import { SettingsEmailSection } from '@/components/admin/settings/SettingsEmailSection';
import { SettingsSecuritySection } from '@/components/admin/settings/SettingsSecuritySection';
import { SettingsOperationsSection } from '@/components/admin/settings/SettingsOperationsSection';
import { glassCard, type SettingsTab } from '@/components/admin/settings/SettingsShared';

interface SectionMeta { value: SettingsTab; title: string; description: string; icon: LucideIcon; gradient: string; glowColor: string; }

const sectionMeta: Record<SettingsTab, SectionMeta> = {
  geral: { value: 'geral', title: 'Workspace Geral', description: 'Status da loja, checkout e mensagens.', icon: Store, gradient: 'from-[hsl(var(--admin-accent-blue))] to-[hsl(var(--admin-accent-cyan))]', glowColor: 'hsl(var(--admin-accent-blue)/0.3)' },
  pagamentos: { value: 'pagamentos', title: 'Pagamentos', description: 'Gateways, credenciais e testes.', icon: CreditCard, gradient: 'from-[hsl(var(--admin-accent-green))] to-[hsl(var(--admin-accent-cyan))]', glowColor: 'hsl(var(--admin-accent-green)/0.3)' },
  email: { value: 'email', title: 'Email Business', description: 'SMTP, testes e modo seguro.', icon: Mail, gradient: 'from-[hsl(var(--admin-accent-orange))] to-[hsl(var(--admin-accent-pink))]', glowColor: 'hsl(var(--admin-accent-orange)/0.3)' },
  seguranca: { value: 'seguranca', title: 'Conta & Alertas', description: 'Alertas e segurança da conta.', icon: ShieldCheck, gradient: 'from-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-purple))]', glowColor: 'hsl(var(--admin-accent-pink)/0.3)' },
  operacoes: { value: 'operacoes', title: 'Operações', description: 'WhatsApp, API, logs e atalhos.', icon: Settings2, gradient: 'from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-blue))]', glowColor: 'hsl(var(--admin-accent-purple)/0.3)' },
};
const sectionOrder: SettingsTab[] = ['geral', 'pagamentos', 'email', 'seguranca', 'operacoes'];

const AdminSettingsPage = () => {
  const { profile, updatePassword, canEdit } = useAuthContext();
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('geral');

  useEffect(() => { if (companyInfo) setSettings(companyInfo); }, [companyInfo]);
  useEffect(() => { if (paymentCreds) setPayment(paymentCreds); }, [paymentCreds]);
  useEffect(() => { if (emailCreds) setEmailSettings(emailCreds); }, [emailCreds]);

  const u = <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => setSettings(prev => ({ ...prev, [key]: value }));
  const up = <K extends keyof PaymentCredentials>(key: K, value: PaymentCredentials[K]) => setPayment(prev => ({ ...prev, [key]: value }));
  const ue = <K extends keyof EmailCredentials>(key: K, value: EmailCredentials[K]) => setEmailSettings(prev => ({ ...prev, [key]: value }));

  const isSavingAny = updateCompany.isPending || updatePayment.isPending || updateEmail.isPending;
  const canMutate = canEdit();

  const saveAll = async () => {
    try {
      await Promise.all([
        updateCompany.mutateAsync({ id: companyInfo?.id || null, data: settings }),
        updatePayment.mutateAsync({ id: paymentCreds?.id || null, data: payment }),
        updateEmail.mutateAsync({ id: emailCreds?.id || null, data: emailSettings }),
      ]);
      toast.success('Configurações salvas com sucesso!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erro ao salvar'); }
  };

  const persistEmail = async () => { await updateEmail.mutateAsync({ id: emailCreds?.id || null, data: emailSettings }); };

  const handleTestSmtp = async () => {
    try { await persistEmail(); const r = await testEmailConnection.mutateAsync(); toast.success(`SMTP conectado em ${r.provider}:${r.port}`); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Falha no teste SMTP'); }
  };

  const handleSendTest = async () => {
    try {
      await persistEmail();
      const r = await sendTestEmail.mutateAsync({ to: emailSettings.test_recipient || undefined, subject: 'Teste - Pincel de Luz', html: '<div style="font-family:sans-serif;padding:24px;background:#1a1a2e;color:#e0e0e0;border-radius:12px;"><h2 style="color:#a78bfa;">Teste</h2><p>SMTP configurado corretamente.</p></div>', from_name: emailSettings.sender_name || undefined });
      toast.success(`Email enviado para ${r.effectiveTo}`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Falha ao enviar'); }
  };

  const runTest = async (name: string, fn: () => Promise<any>) => {
    try { const r = await fn(); if (r?.success) toast.success(`${name} OK`); else toast.error(`${name} falhou`); }
    catch { toast.error(`${name} falhou`); }
  };

  if (loadingCompany || loadingPayment || loadingEmail) {
    return <AdminLayout title="Configurações"><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent-purple))]" /></div></AdminLayout>;
  }

  const statusLabel = settings.store_status === 'closed' ? 'Fechada' : settings.store_status === 'vacation' ? 'Férias' : settings.store_status === 'coming_soon' ? 'Em breve' : 'Aberta';

  const renderActive = () => {
    switch (activeTab) {
      case 'pagamentos': return <SettingsPaymentsSection payment={payment} up={up} canMutate={canMutate} testMP={testMP} testEFI={testEFI} testStripe={testStripe} runTest={runTest} />;
      case 'email': return <SettingsEmailSection emailSettings={emailSettings} ue={ue} canMutate={canMutate} handleTestSmtp={handleTestSmtp} handleSendTest={handleSendTest} testSmtpPending={testEmailConnection.isPending} sendTestPending={sendTestEmail.isPending} updateEmailPending={updateEmail.isPending} />;
      case 'seguranca': return <SettingsSecuritySection settings={settings} u={u} canMutate={canMutate} profileName={profile?.full_name || ''} updatePassword={updatePassword} />;
      case 'operacoes': return <SettingsOperationsSection />;
      default: return <SettingsGeneralSection settings={settings} u={u} />;
    }
  };

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--admin-card-border))] bg-gradient-to-br from-[hsl(var(--admin-card))] to-[hsl(var(--admin-bg))] p-6 md:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-20 -top-10 h-48 w-48 rounded-full bg-[hsl(var(--admin-accent-purple)/0.08)] blur-3xl" />
            <div className="absolute right-0 top-8 h-56 w-56 rounded-full bg-[hsl(var(--admin-accent-blue)/0.06)] blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.12)] px-4 py-2 text-sm font-bold text-[hsl(var(--admin-accent-purple))]">
                <Sparkles className="h-4 w-4" />Central de Configurações
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--admin-text))] md:text-3xl">Controle total do seu sistema</h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { l: 'Loja', v: statusLabel, a: '--admin-accent-blue' },
                  { l: 'Gateway', v: payment.payment_gateway_primary || 'mercadopago', a: '--admin-accent-green' },
                  { l: 'Email', v: emailSettings.email_enabled ? (emailSettings.test_mode ? 'Teste' : 'Real') : 'Off', a: '--admin-accent-orange' },
                ].map(p => (
                  <span key={p.l} className={cn('rounded-lg px-3 py-1.5 text-xs font-bold', `bg-[hsl(var(${p.a})/0.1)] text-[hsl(var(${p.a}))]`)}>{p.l}: {p.v}</span>
                ))}
              </div>
            </div>
            <Button className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg shrink-0" onClick={saveAll} disabled={isSavingAny || !canMutate}>
              {isSavingAny ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar tudo
            </Button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
          <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <div className={cn(glassCard, 'p-4 space-y-2')}>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] px-2">Módulos</p>
              {sectionOrder.map(tab => {
                const meta = sectionMeta[tab];
                const Icon = meta.icon;
                const isActive = activeTab === tab;
                return (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                    className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200',
                      isActive ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg` : 'text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-[hsl(var(--admin-text))]'
                    )}
                    style={isActive ? { boxShadow: `0 8px 24px ${meta.glowColor}` } : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{meta.title}</p>
                      <p className={cn('text-xs leading-snug', isActive ? 'text-white/70' : 'text-[hsl(var(--admin-text-muted))]')}>{meta.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className={cn(glassCard, 'p-4 space-y-2')}>
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] px-2">Áreas</p>
              {[['/admin/empresa', 'Empresa'], ['/admin/templates', 'Templates'], ['/admin/whatsapp', 'WhatsApp'], ['/admin/api', 'API e CRM'], ['/admin/logs', 'Logs'], ['/admin/usuarios', 'Usuários']].map(([href, label]) => (
                <Button key={href} variant="ghost" asChild className="w-full justify-between text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-sidebar-hover))] h-9">
                  <Link to={href}><span className="text-sm">{label}</span><ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="min-w-0">{renderActive()}</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
