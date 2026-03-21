import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { AdminLayout, ImageUpload } from '@/components/admin';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Separator } from '@/components/ui/separator';

import { Badge } from '@/components/ui/badge';

import {

  Loader2,

  Save,

  Building2,

  Phone,

  Globe,

  FileText,

  Image,

  Truck,

  Settings,

  Palette,

  MessageSquare,

  Mail,

  FolderOpen,

} from 'lucide-react';

import { useCompanyInfo, useUpdateCompanyInfo, CompanyInfo } from '@/hooks/useCompanyInfo';

import { toast } from 'sonner';

import { useAuthContext } from '@/contexts/AuthContext';



const clamp = (value: number | null | undefined, fallback: number, min: number, max: number) => {

  const parsed = Number(value);

  if (Number.isNaN(parsed)) return fallback;

  return Math.min(max, Math.max(min, parsed));

};



const sanitizeNumber = (value: number | null | undefined, fallback: number) => {

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;

};



const normalizeHexColor = (value: string | null | undefined, fallback: string) => {

  if (!value) return fallback;

  const candidate = value.trim();

  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate) ? candidate : fallback;

};



const hexToHsl = (hex: string) => {

  const normalized = hex.replace('#', '');

  const chunk = normalized.length === 3

    ? normalized.split('').map((char) => char + char).join('')

    : normalized;



  const r = parseInt(chunk.slice(0, 2), 16) / 255;

  const g = parseInt(chunk.slice(2, 4), 16) / 255;

  const b = parseInt(chunk.slice(4, 6), 16) / 255;



  const max = Math.max(r, g, b);

  const min = Math.min(r, g, b);

  let h = 0;

  let s = 0;

  const l = (max + min) / 2;



  if (max !== min) {

    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {

      case r:

        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;

        break;

      case g:

        h = ((b - r) / d + 2) / 6;

        break;

      default:

        h = ((r - g) / d + 4) / 6;

        break;

    }

  }



  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;

};



interface LogoEditorRowProps {

  label: string;

  description: string;

  value: string;

  onChange: (url: string | null) => void;

  children: ReactNode;

}



const LogoEditorRow = ({ label, description, value, onChange, children }: LogoEditorRowProps) => (

  <div className="rounded-2xl border p-4">

    <div className="grid gap-4 lg:grid-cols-[220px,1fr] lg:items-start">

      <div className="space-y-2">

        <Label>{label}</Label>

        <ImageUpload

          value={value}

          onChange={onChange}

          folder="logos"

          className="max-w-[220px]"

          aspectRatio="aspect-[4/3]"

          placeholder="Enviar logo"

        />

      </div>

      <div className="space-y-3">

        <p className="text-sm text-muted-foreground">{description}</p>

        {children}

      </div>

    </div>

  </div>

);



const AdminCompanyPage = () => {

  const { canEdit } = useAuthContext();

  const { data: companyInfo, isLoading } = useCompanyInfo();

  const updateCompany = useUpdateCompanyInfo();



  const [formData, setFormData] = useState<Partial<CompanyInfo>>({

    company_name: '',

    cnpj: '',

    address: '',

    phone: '',

    whatsapp: '',

    email: '',

    business_hours: '',

    social_instagram: '',

    social_facebook: '',

    social_tiktok: '',

    social_youtube: '',

    social_linkedin: '',

    social_pinterest: '',

    copyright_text: '',

    privacy_policy: '',

    terms_of_service: '',

    returns_policy: '',

    footer_logo: '',

    header_logo: '',

    footer_logo_height: 48,

    header_logo_height: 64,

    header_logo_mobile_height: 36,

    primary_color: '#7c3aed',

    secondary_color: '#10b981',

    accent_color: '#f59e0b',

    custom_css: '',

    free_shipping_minimum: 159,

    free_shipping_message: 'Frete grátis em compras acima de R$ 159',
    installments: 12,

    production_time: '4 a 10 dias úteis',
    warranty: '3 meses',

  });



  useEffect(() => {

    if (!companyInfo) return;



    setFormData({

      company_name: companyInfo.company_name || '',

      cnpj: companyInfo.cnpj || '',

      address: companyInfo.address || '',

      phone: companyInfo.phone || '',

      whatsapp: companyInfo.whatsapp || '',

      email: companyInfo.email || '',

      business_hours: companyInfo.business_hours || '',

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

    if (!formData.company_name) {

      toast.error('Nome da empresa é obrigatório');
      return;

    }



    const sanitizedData: Partial<CompanyInfo> = {

      ...formData,

      header_logo_height: clamp(formData.header_logo_height, 64, 24, 180),

      header_logo_mobile_height: clamp(formData.header_logo_mobile_height, 36, 20, 140),

      footer_logo_height: clamp(formData.footer_logo_height, 48, 20, 160),

      free_shipping_minimum: sanitizeNumber(formData.free_shipping_minimum, 159),

      installments: sanitizeNumber(formData.installments, 12),

    };



    try {

      await updateCompany.mutateAsync({

        id: companyInfo?.id || null,

        data: sanitizedData,

      });

      toast.success('Empresa e branding salvos com sucesso!');

    } catch (error: unknown) {

      const message = error instanceof Error ? error.message : 'Erro ao salvar';

      toast.error(message);

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



  if (isLoading) {

    return (

      <AdminLayout title="Empresa e Branding">

        <div className="flex items-center justify-center h-64">

          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />

        </div>

      </AdminLayout>

    );

  }



  return (

    <AdminLayout title="Empresa e Branding" requireEditor>

      <div className="space-y-6">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-lg font-semibold text-white">Central de marca e dados da empresa</h2>

            <p className="text-sm text-[hsl(var(--admin-text-muted))]">

              Aqui ficam logos, cores, contatos, políticas e ajustes que impactam a credibilidade da loja.
            </p>

          </div>

          <Button onClick={handleSave} disabled={updateCompany.isPending || !canEdit()} size="lg">

            {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}

            Salvar alterações
          </Button>

        </div>



        <div className="grid gap-3 md:grid-cols-3">

          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">

            <CardHeader className="pb-3">

              <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Templates</CardTitle>

              <CardDescription>Edite mensagens de e-mail e WhatsApp.</CardDescription>

            </CardHeader>

            <CardContent>

              <Button variant="outline" asChild className="w-full">

                <Link to="/admin/templates">Abrir templates</Link>

              </Button>

            </CardContent>

          </Card>



          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">

            <CardHeader className="pb-3">

              <CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Configurações</CardTitle>
              <CardDescription>Checkout, operação, pagamentos e alertas.</CardDescription>
            </CardHeader>

            <CardContent>

              <Button variant="outline" asChild className="w-full">

                <Link to="/admin/configuracoes">Abrir configurações</Link>
              </Button>

            </CardContent>

          </Card>



          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">

            <CardHeader className="pb-3">

              <CardTitle className="text-sm flex items-center gap-2"><FolderOpen className="h-4 w-4" /> Mídia avançada</CardTitle>
              <CardDescription>Biblioteca removida do menu principal.</CardDescription>

            </CardHeader>

            <CardContent>

              <Button variant="outline" asChild className="w-full">

                <Link to="/admin/midia">Abrir biblioteca</Link>

              </Button>

            </CardContent>

          </Card>

        </div>



        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Identidade Visual</CardTitle>

            <CardDescription>Upload e tamanho das logos, paleta da marca e preview rápido.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            <div className="space-y-4">

              <LogoEditorRow

                label="Logo do cabeçalho"
                description="Upload menor, com tamanhos e previews ao lado para desktop e mobile."

                value={formData.header_logo || ''}

                onChange={(url) => setFormData({ ...formData, header_logo: url || '' })}

              >

                <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">

                  <div className="space-y-2">

                    <Label htmlFor="header_logo_height">Altura desktop (px)</Label>

                    <Input

                      id="header_logo_height"

                      type="number"

                      min={24}

                      max={180}

                      value={formData.header_logo_height || 64}

                      onChange={(e) => setFormData({ ...formData, header_logo_height: Number(e.target.value) })}

                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="header_logo_mobile_height">Altura mobile (px)</Label>

                    <Input

                      id="header_logo_mobile_height"

                      type="number"

                      min={20}

                      max={140}

                      value={formData.header_logo_mobile_height || 36}

                      onChange={(e) => setFormData({ ...formData, header_logo_mobile_height: Number(e.target.value) })}

                    />

                  </div>

                </div>

                <div className="grid gap-3 md:grid-cols-2">

                  <div className="rounded-lg border p-3">

                    <p className="mb-2 text-xs text-muted-foreground">Preview desktop</p>

                    <div className="min-h-[56px] rounded bg-muted/30 px-3 flex items-center">

                      {formData.header_logo ? (

                        <img

                          src={formData.header_logo}

                          alt="Logo header"

                          style={{ height: `${clamp(formData.header_logo_height, 64, 24, 180)}px` }}

                          className="max-w-full w-auto object-contain"

                        />

                      ) : (

                        <Badge variant="secondary">Sem logo</Badge>

                      )}

                    </div>

                  </div>

                  <div className="rounded-lg border p-3">

                    <p className="mb-2 text-xs text-muted-foreground">Preview mobile</p>

                    <div className="min-h-[56px] rounded bg-muted/30 px-3 flex items-center">

                      {formData.header_logo ? (

                        <img

                          src={formData.header_logo}

                          alt="Logo mobile"

                          style={{ height: `${clamp(formData.header_logo_mobile_height, 36, 20, 140)}px` }}

                          className="max-w-full w-auto object-contain"

                        />

                      ) : (

                        <Badge variant="secondary">Sem logo</Badge>

                      )}

                    </div>

                  </div>

                </div>

              </LogoEditorRow>



              <LogoEditorRow

                label="Logo do rodape"

                description="Preview menor e configuração ao lado para evitar ocupar espaço desnecessário."

                value={formData.footer_logo || ''}

                onChange={(url) => setFormData({ ...formData, footer_logo: url || '' })}

              >

                <div className="grid gap-4 xl:grid-cols-[0.7fr,1.3fr] xl:items-end">

                  <div className="space-y-2">

                    <Label htmlFor="footer_logo_height">Altura do rodape (px)</Label>

                    <Input

                      id="footer_logo_height"

                      type="number"

                      min={20}

                      max={160}

                      value={formData.footer_logo_height || 48}

                      onChange={(e) => setFormData({ ...formData, footer_logo_height: Number(e.target.value) })}

                    />

                  </div>

                  <div className="rounded-lg border p-3">

                    <p className="mb-2 text-xs text-muted-foreground">Preview rodapé</p>

                    <div className="min-h-[56px] rounded bg-muted/30 px-3 flex items-center">

                      {formData.footer_logo ? (

                        <img

                          src={formData.footer_logo}

                          alt="Logo rodape"

                          style={{ height: `${clamp(formData.footer_logo_height, 48, 20, 160)}px` }}

                          className="max-w-full w-auto object-contain"

                        />

                      ) : (

                        <Badge variant="secondary">Sem logo</Badge>

                      )}

                    </div>

                  </div>

                </div>

              </LogoEditorRow>

            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="space-y-2">

                <Label htmlFor="primary_color">Cor primaria</Label>

                <div className="flex gap-2">

                  <Input

                    id="primary_color"

                    type="color"

                    value={formData.primary_color || '#7c3aed'}

                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}

                    className="w-14 h-10 p-1"

                  />

                  <Input

                    value={formData.primary_color || '#7c3aed'}

                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}

                  />

                </div>

              </div>



              <div className="space-y-2">

                <Label htmlFor="secondary_color">Cor secundaria</Label>

                <div className="flex gap-2">

                  <Input

                    id="secondary_color"

                    type="color"

                    value={formData.secondary_color || '#10b981'}

                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}

                    className="w-14 h-10 p-1"

                  />

                  <Input

                    value={formData.secondary_color || '#10b981'}

                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}

                  />

                </div>

              </div>



              <div className="space-y-2">

                <Label htmlFor="accent_color">Cor de destaque</Label>

                <div className="flex gap-2">

                  <Input

                    id="accent_color"

                    type="color"

                    value={formData.accent_color || '#f59e0b'}

                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}

                    className="w-14 h-10 p-1"

                  />

                  <Input

                    value={formData.accent_color || '#f59e0b'}

                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}

                  />

                </div>

              </div>

            </div>



            <div className="rounded-xl border p-4 space-y-4">

              <div className="flex items-center justify-between gap-3 flex-wrap">

                <div>

                  <p className="text-sm font-medium">Preview ativo da identidade</p>

                  <p className="text-xs text-muted-foreground">As cores abaixo agora reagem imediatamente nesta área e no preview visual da página.</p>

                </div>

                <div className="flex items-center gap-2">

                  <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: previewColors.primary }} />

                  <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: previewColors.secondary }} />

                  <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: previewColors.accent }} />

                </div>

              </div>



              <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">

                <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${previewColors.primary}, ${previewColors.secondary})` }}>

                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">Loja personalizada</p>

                  <h3 className="mt-2 text-2xl font-semibold">{formData.company_name || 'Pincel de Luz'}</h3>

                  <p className="mt-2 max-w-xl text-sm text-white/80">

                    Header, destaques promocionais e componentes visuais principais passam a refletir esta combinação de cores após salvar.

                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: previewColors.accent, color: '#111827' }}>

                      Cor de destaque

                    </span>

                    <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium">

                      Identidade visual

                    </span>

                  </div>

                </div>



                <div className="rounded-2xl border p-4 space-y-3">

                  <div className="rounded-xl p-3 text-sm font-medium text-white" style={{ backgroundColor: previewColors.primary }}>

                    Botão principal

                  </div>

                  <div className="rounded-xl p-3 text-sm font-medium text-white" style={{ backgroundColor: previewColors.secondary }}>

                    Selo secundario

                  </div>

                  <div className="rounded-xl p-3 text-sm font-medium" style={{ backgroundColor: previewColors.accent, color: '#111827' }}>

                    Destaque promocional

                  </div>

                </div>

              </div>

            </div>



            <div className="space-y-2">

              <Label htmlFor="custom_css">CSS personalizado (opcional)</Label>

              <Textarea

                id="custom_css"

                value={formData.custom_css || ''}

                onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}

                placeholder="/* Ajustes finos de marca */"

                className="font-mono text-xs min-h-[120px]"

              />

            </div>



          </CardContent>

        </Card>



        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Conversão e experiência da loja</CardTitle>

            <CardDescription>Mensagens de prova de valor e regras comerciais exibidas para o cliente.</CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              <div className="space-y-2">

                <Label htmlFor="free_shipping_minimum">Valor mínimo para frete grátis (R$)</Label>

                <Input

                  id="free_shipping_minimum"

                  type="number"

                  value={formData.free_shipping_minimum || ''}

                  onChange={(e) => setFormData({ ...formData, free_shipping_minimum: Number(e.target.value) })}

                />

              </div>

              <div className="space-y-2 md:col-span-2">

                <Label htmlFor="free_shipping_message">Mensagem da barra superior</Label>

                <Input

                  id="free_shipping_message"

                  value={formData.free_shipping_message || ''}

                  onChange={(e) => setFormData({ ...formData, free_shipping_message: e.target.value })}

                  placeholder="Frete grátis em compras acima de R$ 159"

                />

              </div>

            </div>

            <div className="p-3 rounded-md text-sm text-center bg-primary text-primary-foreground">

              {freeShippingPreview}

            </div>



            <Separator />



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="space-y-2">

                <Label htmlFor="installments">Parcelamento (vezes)</Label>

                <Input

                  id="installments"

                  type="number"

                  value={formData.installments || ''}

                  onChange={(e) => setFormData({ ...formData, installments: Number(e.target.value) })}

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="production_time">Prazo de produção</Label>

                <Input

                  id="production_time"

                  value={formData.production_time || ''}

                  onChange={(e) => setFormData({ ...formData, production_time: e.target.value })}

                  placeholder="4 a 10 dias úteis"

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="warranty">Garantia</Label>

                <Input

                  id="warranty"

                  value={formData.warranty || ''}

                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}

                  placeholder="3 meses"

                />

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Dados da empresa</CardTitle>

            <CardDescription>Informacoes institucionais para reforcar confianca na compra.</CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">

                <Label htmlFor="company_name">Nome da empresa *</Label>

                <Input

                  id="company_name"

                  value={formData.company_name}

                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="cnpj">CNPJ</Label>

                <Input

                  id="cnpj"

                  value={formData.cnpj || ''}

                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}

                />

              </div>

            </div>



            <div className="space-y-2">

              <Label htmlFor="address">Endereço completo</Label>

              <Textarea

                id="address"

                value={formData.address || ''}

                onChange={(e) => setFormData({ ...formData, address: e.target.value })}

              />

            </div>



            <div className="space-y-2">

              <Label htmlFor="business_hours">Horário de atendimento</Label>

              <Input

                id="business_hours"

                value={formData.business_hours || ''}

                onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}

                placeholder="Seg-Sex 9h as 18h"

              />

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contato e redes sociais</CardTitle>

            <CardDescription>Canais para atendimento rápido e suporte ao cliente.</CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="space-y-2">

                <Label htmlFor="phone">Telefone</Label>

                <Input

                  id="phone"

                  value={formData.phone || ''}

                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}

                  placeholder="(11) 99999-9999"

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="whatsapp">WhatsApp (somente numeros)</Label>

                <Input

                  id="whatsapp"

                  value={formData.whatsapp || ''}

                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}

                  placeholder="5511999999999"

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="email">E-mail</Label>

                <Input

                  id="email"

                  type="email"

                  value={formData.email || ''}

                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}

                />

              </div>

            </div>



            <Separator />



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">

                <Label htmlFor="social_instagram">Instagram</Label>

                <Input

                  id="social_instagram"

                  value={formData.social_instagram || ''}

                  onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}

                  placeholder="https://instagram.com/..."

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="social_facebook">Facebook</Label>

                <Input

                  id="social_facebook"

                  value={formData.social_facebook || ''}

                  onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}

                  placeholder="https://facebook.com/..."

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="social_youtube">YouTube</Label>

                <Input

                  id="social_youtube"

                  value={formData.social_youtube || ''}

                  onChange={(e) => setFormData({ ...formData, social_youtube: e.target.value })}

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="social_pinterest">Pinterest</Label>

                <Input

                  id="social_pinterest"

                  value={formData.social_pinterest || ''}

                  onChange={(e) => setFormData({ ...formData, social_pinterest: e.target.value })}

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="social_tiktok">TikTok</Label>

                <Input

                  id="social_tiktok"

                  value={formData.social_tiktok || ''}

                  onChange={(e) => setFormData({ ...formData, social_tiktok: e.target.value })}

                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="social_linkedin">LinkedIn</Label>

                <Input

                  id="social_linkedin"

                  value={formData.social_linkedin || ''}

                  onChange={(e) => setFormData({ ...formData, social_linkedin: e.target.value })}

                />

              </div>

            </div>

          </CardContent>

        </Card>



        <Card>

          <CardHeader>

            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Rodapé e políticas</CardTitle>

            <CardDescription>Base legal e institucional para aumentar confianca da marca.</CardDescription>

          </CardHeader>

          <CardContent className="space-y-4">

            <div className="space-y-2">

              <Label htmlFor="copyright_text">Texto de copyright</Label>

              <Input

                id="copyright_text"

                value={formData.copyright_text || ''}

                onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}

              />

            </div>



            <Separator />



            <div className="space-y-2">

              <Label htmlFor="privacy_policy">Política de privacidade</Label>

              <Textarea

                id="privacy_policy"

                value={formData.privacy_policy || ''}

                onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.value })}

                className="min-h-[150px]"

              />

            </div>



            <div className="space-y-2">

              <Label htmlFor="terms_of_service">Termos de uso</Label>

              <Textarea

                id="terms_of_service"

                value={formData.terms_of_service || ''}

                onChange={(e) => setFormData({ ...formData, terms_of_service: e.target.value })}

                className="min-h-[150px]"

              />

            </div>



            <div className="space-y-2">

              <Label htmlFor="returns_policy">Política de trocas e devoluções</Label>

              <Textarea

                id="returns_policy"

                value={formData.returns_policy || ''}

                onChange={(e) => setFormData({ ...formData, returns_policy: e.target.value })}

                className="min-h-[150px]"

              />

            </div>

          </CardContent>

        </Card>



        <div className="flex justify-end">

          <Button onClick={handleSave} disabled={updateCompany.isPending || !canEdit()} size="lg">

            {updateCompany.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}

            Salvar alterações

          </Button>

        </div>

      </div>

    </AdminLayout>

  );

};



export default AdminCompanyPage;

















