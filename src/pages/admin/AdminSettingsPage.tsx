import { useEffect, useState } from 'react';
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
import { Bot, CreditCard, Loader2, Mail, Save, Settings2, ShieldCheck, Store, type LucideIcon } from 'lucide-react';
import { SettingsGeneralSection } from '@/components/admin/settings/SettingsGeneralSection';
import { SettingsPaymentsSection } from '@/components/admin/settings/SettingsPaymentsSection';
import { SettingsEmailSection } from '@/components/admin/settings/SettingsEmailSection';
import { SettingsSecuritySection } from '@/components/admin/settings/SettingsSecuritySection';
import { SettingsOperationsSection } from '@/components/admin/settings/SettingsOperationsSection';
import { SettingsAISection } from '@/components/admin/settings/SettingsAISection';
import { type SettingsTab } from '@/components/admin/settings/SettingsShared';

/* ─── Tab Config ─── */
interface TabMeta { label: string; icon: LucideIcon; accentVar: string; }
const TABS: Record<SettingsTab, TabMeta> = {
  geral:       { label: 'Geral',       icon: Store,       accentVar: '--admin-accent-blue' },
  pagamentos:  { label: 'Pagamentos',  icon: CreditCard,  accentVar: '--admin-accent-green' },
  email:       { label: 'Email',       icon: Mail,        accentVar: '--admin-accent-orange' },
  seguranca:   { label: 'Segurança',   icon: ShieldCheck, accentVar: '--admin-accent-pink' },
  operacoes:   { label: 'Operações',   icon: Settings2,   accentVar: '--admin-accent-purple' },
  ia:          { label: 'IA',          icon: Bot,         accentVar: '--admin-accent-purple' },
};
const TAB_ORDER: SettingsTab[] = ['geral', 'pagamentos', 'email', 'seguranca', 'operacoes', 'ia'];

const AdminSettingsPage = () => {
  const { profile, updatePassword, canEdit } = useAuthContext();
  const { data: companyInfo, isLoading: l1 } = useCompanyInfo();
  const { data: paymentCreds, isLoading: l2 } = usePaymentCredentials();
  const { data: emailCreds, isLoading: l3 } = useEmailCredentials();
  const updateCompany = useUpdateCompanyInfo();
  const updatePayment = useUpdatePaymentCredentials();
  const updateEmail = useUpdateEmailCredentials();
  const testSmtp = useTestEmailConnection();
  const sendTest = useSendTestEmail();
  const testMP = useTestMercadoPago();
  const testEFI = useTestEfiBank();
  const testStripe = useTestStripe();

  const [settings, setSettings] = useState<Partial<CompanyInfo>>({});
  const [payment, setPayment] = useState<Partial<PaymentCredentials>>({});
  const [email, setEmail] = useState<Partial<EmailCredentials>>({});
  const [tab, setTab] = useState<SettingsTab>('geral');

  useEffect(() => { if (companyInfo) setSettings(companyInfo); }, [companyInfo]);
  useEffect(() => { if (paymentCreds) setPayment(paymentCreds); }, [paymentCreds]);
  useEffect(() => { if (emailCreds) setEmail(emailCreds); }, [emailCreds]);

  const u  = <K extends keyof CompanyInfo>(k: K, v: CompanyInfo[K]) => setSettings(p => ({ ...p, [k]: v }));
  const up = <K extends keyof PaymentCredentials>(k: K, v: PaymentCredentials[K]) => setPayment(p => ({ ...p, [k]: v }));
  const ue = <K extends keyof EmailCredentials>(k: K, v: EmailCredentials[K]) => setEmail(p => ({ ...p, [k]: v }));

  const saving = updateCompany.isPending || updatePayment.isPending || updateEmail.isPending;
  const canMutate = canEdit();

  const saveAll = async () => {
    try {
      await Promise.all([
        updateCompany.mutateAsync({ id: companyInfo?.id || null, data: settings }),
        updatePayment.mutateAsync({ id: paymentCreds?.id || null, data: payment }),
        updateEmail.mutateAsync({ id: emailCreds?.id || null, data: email }),
      ]);
      toast.success('Configurações salvas com sucesso!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Erro ao salvar'); }
  };

  const persistEmail = () => updateEmail.mutateAsync({ id: emailCreds?.id || null, data: email });

  const handleTestSmtp = async () => {
    try { await persistEmail(); const r = await testSmtp.mutateAsync(); toast.success(`SMTP OK — ${r.provider}:${r.port}`); }
    catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Falha SMTP'); }
  };

  const handleSendTest = async () => {
    try {
      await persistEmail();
      const r = await sendTest.mutateAsync({
        to: email.test_recipient || undefined,
        subject: 'Teste - Pincel de Luz',
        html: '<div style="font-family:sans-serif;padding:24px;background:#1a1a2e;color:#e0e0e0;border-radius:12px"><h2 style="color:#a78bfa">✓ Teste OK</h2><p>SMTP configurado corretamente.</p></div>',
        from_name: email.sender_name || undefined,
      });
      toast.success(`Email enviado → ${r.effectiveTo}`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Falha ao enviar'); }
  };

  const runTest = async (name: string, fn: () => Promise<any>) => {
    try { const r = await fn(); if (r?.success) toast.success(`${name} OK`); else toast.error(`${name} falhou`); }
    catch { toast.error(`${name} falhou`); }
  };

  if (l1 || l2 || l3) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent-purple))]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações">
      <div className="space-y-5">
        {/* ── Header Bar ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[hsl(var(--admin-text))]">Configurações</h2>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">
              Gerencie loja, pagamentos, email, segurança e operações.
            </p>
          </div>
          <Button
            className="h-10 shrink-0 bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.25)] hover:shadow-xl transition-shadow"
            onClick={saveAll}
            disabled={saving || !canMutate}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar tudo
          </Button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] p-1">
          {TAB_ORDER.map(t => {
            const meta = TABS[t];
            const Icon = meta.icon;
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-md shadow-[hsl(var(--admin-accent-purple)/0.3)]'
                    : 'text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg)/0.5)]'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{meta.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div className="min-w-0">
          {tab === 'geral' && <SettingsGeneralSection settings={settings} u={u} />}
          {tab === 'pagamentos' && <SettingsPaymentsSection payment={payment} up={up} canMutate={canMutate} testMP={testMP} testEFI={testEFI} testStripe={testStripe} runTest={runTest} />}
          {tab === 'email' && <SettingsEmailSection emailSettings={email} ue={ue} canMutate={canMutate} handleTestSmtp={handleTestSmtp} handleSendTest={handleSendTest} testSmtpPending={testSmtp.isPending} sendTestPending={sendTest.isPending} updateEmailPending={updateEmail.isPending} />}
          {tab === 'seguranca' && <SettingsSecuritySection settings={settings} u={u} canMutate={canMutate} profileName={profile?.full_name || ''} updatePassword={updatePassword} />}
          {tab === 'operacoes' && <SettingsOperationsSection />}
          {tab === 'ia' && <SettingsAISection settings={settings} u={u} />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
