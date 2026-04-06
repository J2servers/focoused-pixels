import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoStoriesManager } from '@/components/admin/VideoStoriesManager';
import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Button } from '@/components/ui/button';
import { Loader2, Save, MessageSquare, Settings, FolderOpen, Building2, Palette, Phone, Globe } from 'lucide-react';
import { useCompanyInfoAdmin, useUpdateCompanyInfo, CompanyInfo } from '@/hooks/useCompanyInfo';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { clamp, sanitizeNumber, normalizeHexColor, hexToHsl } from '@/components/admin/company/CompanyFormUtils';
import { CompanyIdentitySection } from '@/components/admin/company/CompanyIdentitySection';
import {
  CompanyConversionSection,
  CompanyDataSection,
  CompanyContactSection,
  CompanyPoliciesSection,
} from '@/components/admin/company/CompanySections';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const AdminCompanyPage = () => {
  const { canEdit } = useAuthContext();
  const { data: companyInfo, isLoading } = useCompanyInfoAdmin();
  const updateCompany = useUpdateCompanyInfo();

  const [formData, setFormData] = useState<Partial<CompanyInfo>>({
    company_name: '', cnpj: '', address: '', phone: '', whatsapp: '', email: '',
    business_hours: '', social_instagram: '', social_facebook: '', social_tiktok: '',
    social_youtube: '', social_linkedin: '', social_pinterest: '', copyright_text: '',
    privacy_policy: '', terms_of_service: '', returns_policy: '',
    footer_logo: '', header_logo: '', footer_logo_height: 48,
    header_logo_height: 64, header_logo_mobile_height: 36,
    primary_color: '#7c3aed', secondary_color: '#10b981', accent_color: '#f59e0b',
    custom_css: '', free_shipping_minimum: 159,
    free_shipping_message: 'Frete grátis em compras acima de R$ 159',
    installments: 12, production_time: '4 a 10 dias úteis', warranty: '3 meses',
  });

  useEffect(() => {
    if (!companyInfo) return;
    setFormData({
      company_name: companyInfo.company_name || '',
      cnpj: companyInfo.cnpj || '', address: companyInfo.address || '',
      phone: companyInfo.phone || '', whatsapp: companyInfo.whatsapp || '',
      email: companyInfo.email || '', business_hours: companyInfo.business_hours || '',
      social_instagram: companyInfo.social_instagram || '',
      social_facebook: companyInfo.social_facebook || '',
      social_tiktok: companyInfo.social_tiktok || '',
      social_youtube: companyInfo.social_youtube || '',
      social_linkedin: companyInfo.social_linkedin || '',
      social_pinterest: companyInfo.social_pinterest || '',
      copyright_text: companyInfo.copyright_text || '',
      privacy_policy: companyInfo.privacy_policy || '',
      terms_of_service: companyInfo.terms_of_service || '',
      returns_policy: companyInfo.returns_policy || '',
      footer_logo: companyInfo.footer_logo || '',
      header_logo: companyInfo.header_logo || '',
      footer_logo_height: companyInfo.footer_logo_height || 48,
      header_logo_height: companyInfo.header_logo_height || 64,
      header_logo_mobile_height: companyInfo.header_logo_mobile_height || 36,
      primary_color: companyInfo.primary_color || '#7c3aed',
      secondary_color: companyInfo.secondary_color || '#10b981',
      accent_color: companyInfo.accent_color || '#f59e0b',
      custom_css: companyInfo.custom_css || '',
      free_shipping_minimum: companyInfo.free_shipping_minimum || 159,
      free_shipping_message: companyInfo.free_shipping_message || '',
      installments: companyInfo.installments || 12,
      production_time: companyInfo.production_time || '',
      warranty: companyInfo.warranty || '',
    });
  }, [companyInfo]);

  useEffect(() => {
    const root = document.documentElement;
    const primary = normalizeHexColor(formData.primary_color, '#7c3aed');
    const secondary = normalizeHexColor(formData.secondary_color, '#10b981');
    const accent = normalizeHexColor(formData.accent_color, '#f59e0b');
    const previous = {
      primary: root.style.getPropertyValue('--primary'),
      secondary: root.style.getPropertyValue('--secondary'),
      accent: root.style.getPropertyValue('--accent'),
    };
    root.style.setProperty('--primary', hexToHsl(primary));
    root.style.setProperty('--secondary', hexToHsl(secondary));
    root.style.setProperty('--accent', hexToHsl(accent));
    return () => {
      root.style.setProperty('--primary', previous.primary);
      root.style.setProperty('--secondary', previous.secondary);
      root.style.setProperty('--accent', previous.accent);
    };
  }, [formData.primary_color, formData.secondary_color, formData.accent_color]);

  const handleSave = async () => {
    if (!formData.company_name) { toast.error('Nome da empresa é obrigatório'); return; }
    const sanitizedData: Partial<CompanyInfo> = {
      ...formData,
      header_logo_height: clamp(formData.header_logo_height, 64, 24, 180),
      header_logo_mobile_height: clamp(formData.header_logo_mobile_height, 36, 20, 140),
      footer_logo_height: clamp(formData.footer_logo_height, 48, 20, 160),
      free_shipping_minimum: sanitizeNumber(formData.free_shipping_minimum, 159),
      installments: sanitizeNumber(formData.installments, 12),
    };
    try {
      await updateCompany.mutateAsync({ id: companyInfo?.id || null, data: sanitizedData });
      toast.success('Empresa e branding salvos com sucesso!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar');
    }
  };

  const freeShippingPreview = useMemo(() => {
    if (formData.free_shipping_message?.trim()) return formData.free_shipping_message;
    return `Frete grátis em compras acima de R$ ${formData.free_shipping_minimum || 0}`;
  }, [formData.free_shipping_message, formData.free_shipping_minimum]);

  const previewColors = useMemo(() => ({
    primary: normalizeHexColor(formData.primary_color, '#7c3aed'),
    secondary: normalizeHexColor(formData.secondary_color, '#10b981'),
    accent: normalizeHexColor(formData.accent_color, '#f59e0b'),
  }), [formData.primary_color, formData.secondary_color, formData.accent_color]);

  const completionScore = useMemo(() => {
    const fields = [formData.company_name, formData.cnpj, formData.email, formData.phone, formData.whatsapp, formData.address, formData.header_logo, formData.footer_logo, formData.privacy_policy, formData.terms_of_service];
    return fields.filter(f => f && String(f).trim()).length;
  }, [formData]);

  if (isLoading) {
    return (
      <AdminLayout title="Empresa e Branding">
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Empresa e Branding" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="🏢 Guia de Empresa e Branding"
          description="Configure dados da empresa, logos, cores e políticas da loja."
          steps={[
            { title: "Dados da empresa", description: "Preencha CNPJ, endereço, telefone, WhatsApp e e-mail de contato." },
            { title: "Logos", description: "Faça upload dos logos do header e footer com controle de altura em pixels." },
            { title: "Cores da marca", description: "Defina as cores primária, secundária e de destaque da sua identidade visual." },
            { title: "Redes sociais", description: "Adicione links do Instagram, Facebook, TikTok, YouTube e LinkedIn." },
            { title: "Políticas", description: "Escreva as políticas de privacidade, termos de uso e política de trocas." },
            { title: "Credibilidade", description: "Configure frete grátis, parcelamento, tempo de produção e garantia." },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-400" />
              </div>
              Empresa e Branding
            </h1>
            <p className="text-white/50 mt-1 text-sm">Logos, cores, contatos, políticas e ajustes de credibilidade da loja</p>
          </div>
          <Button onClick={handleSave} disabled={updateCompany.isPending || !canEdit()} className="admin-btn admin-btn-save" size="lg">
            {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar alterações
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminSummaryCard title="Completude" value={`${completionScore}/10`} icon={Building2} variant={completionScore >= 8 ? 'green' : 'orange'} />
          <AdminSummaryCard title="Cor Primária" value={previewColors.primary} icon={Palette} variant="purple" />
          <AdminSummaryCard title="Contato" value={formData.phone ? '✓ Configurado' : '✗ Pendente'} icon={Phone} variant={formData.phone ? 'green' : 'orange'} />
          <AdminSummaryCard title="Redes Sociais" value={[formData.social_instagram, formData.social_facebook, formData.social_tiktok, formData.social_youtube].filter(Boolean).length.toString()} icon={Globe} variant="blue" />
        </div>

        {/* Quick Links */}
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { title: 'Templates', desc: 'E-mail e WhatsApp.', icon: MessageSquare, to: '/admin/templates' },
            { title: 'Configurações', desc: 'Checkout, pagamentos, alertas.', icon: Settings, to: '/admin/configuracoes' },
            { title: 'Mídia', desc: 'Biblioteca de arquivos.', icon: FolderOpen, to: '/admin/midia' },
          ].map(({ title, desc, icon: Icon, to }) => (
            <div key={to} className="liquid-glass rounded-2xl p-4 hover:bg-white/[0.06] transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-purple-400" /></div>
                <span className="text-sm font-semibold text-white">{title}</span>
              </div>
              <p className="text-xs text-white/50 mb-3">{desc}</p>
              <Button variant="outline" asChild className="w-full border-white/10 text-white hover:bg-white/[0.06]"><Link to={to}>Abrir {title.toLowerCase()}</Link></Button>
            </div>
          ))}
        </div>

        {/* Form Sections */}
        <CompanyIdentitySection formData={formData} setFormData={setFormData} previewColors={previewColors} />
        <CompanyConversionSection formData={formData} setFormData={setFormData} freeShippingPreview={freeShippingPreview} />
        <CompanyDataSection formData={formData} setFormData={setFormData} />
        <CompanyContactSection formData={formData} setFormData={setFormData} />
        <CompanyPoliciesSection formData={formData} setFormData={setFormData} />
        <VideoStoriesManager />

        {/* Bottom Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateCompany.isPending || !canEdit()} className="admin-btn admin-btn-save" size="lg">
            {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar alterações
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCompanyPage;
