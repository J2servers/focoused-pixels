import { useState, useEffect } from 'react';
import { AdminLayout, ImageUpload } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Building2, Phone, Globe, FileText, Image, Truck, Settings } from 'lucide-react';
import { useCompanyInfo, useUpdateCompanyInfo, CompanyInfo } from '@/hooks/useCompanyInfo';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';

const AdminCompanyPage = () => {
  const { canEdit } = useAuthContext();
  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateCompany = useUpdateCompanyInfo();

  const [formData, setFormData] = useState<Omit<CompanyInfo, 'id'>>({
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
    free_shipping_minimum: 159,
    free_shipping_message: 'Frete grátis em compras acima de R$ 159',
    installments: 12,
    production_time: '4 a 10 dias úteis',
    warranty: '3 meses',
  });

  useEffect(() => {
    if (companyInfo) {
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
        free_shipping_minimum: companyInfo.free_shipping_minimum || 159,
        free_shipping_message: companyInfo.free_shipping_message || '',
        installments: companyInfo.installments || 12,
        production_time: companyInfo.production_time || '',
        warranty: companyInfo.warranty || '',
      });
    }
  }, [companyInfo]);

  const handleSave = async () => {
    if (!formData.company_name) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    try {
      await updateCompany.mutateAsync({
        id: companyInfo?.id || null,
        data: formData,
      });
      toast.success('Informações salvas com sucesso!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Empresa">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações do Site" requireEditor>
      <div className="max-w-4xl space-y-6">
        {/* Logos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Logotipos
            </CardTitle>
            <CardDescription>Logos exibidos no cabeçalho e rodapé do site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Logo do Cabeçalho (Header)</Label>
                <ImageUpload
                  value={formData.header_logo || ''}
                  onChange={(url) => setFormData({ ...formData, header_logo: url || '' })}
                  folder="logos"
                />
                <p className="text-xs text-muted-foreground">
                  Exibido no topo de todas as páginas
                </p>
              </div>
              <div className="space-y-2">
                <Label>Logo do Rodapé (Footer)</Label>
                <ImageUpload
                  value={formData.footer_logo || ''}
                  onChange={(url) => setFormData({ ...formData, footer_logo: url || '' })}
                  folder="logos"
                />
                <p className="text-xs text-muted-foreground">
                  Exibido no rodapé de todas as páginas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Shipping Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Barra de Frete Grátis
            </CardTitle>
            <CardDescription>Configurações da barra superior do site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="free_shipping_minimum">Valor Mínimo para Frete Grátis (R$)</Label>
                <Input
                  id="free_shipping_minimum"
                  type="number"
                  value={formData.free_shipping_minimum || ''}
                  onChange={(e) => setFormData({ ...formData, free_shipping_minimum: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="free_shipping_message">Mensagem da Barra Superior</Label>
                <Input
                  id="free_shipping_message"
                  value={formData.free_shipping_message || ''}
                  onChange={(e) => setFormData({ ...formData, free_shipping_message: e.target.value })}
                  placeholder="Ex: Frete grátis em compras acima de R$ 159"
                />
              </div>
            </div>
            <div className="p-3 bg-primary text-primary-foreground rounded-md text-center text-sm">
              <span className="mr-2">🚚</span>
              {formData.free_shipping_message || `Frete grátis em compras acima de R$ ${formData.free_shipping_minimum}`}
            </div>
          </CardContent>
        </Card>

        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações da Loja
            </CardTitle>
            <CardDescription>Parcelamento, prazos e garantias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installments">Parcelamento (nº de vezes)</Label>
                <Input
                  id="installments"
                  type="number"
                  value={formData.installments || ''}
                  onChange={(e) => setFormData({ ...formData, installments: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_time">Prazo de Produção</Label>
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

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados Básicos
            </CardTitle>
            <CardDescription>Informações gerais da empresa exibidas no site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa *</Label>
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
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_hours">Horário de Atendimento</Label>
              <Input
                id="business_hours"
                value={formData.business_hours || ''}
                onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                placeholder="Seg-Sex 9h às 18h"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
            <CardDescription>Números de telefone e email para "Fale Conosco"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="whatsapp">WhatsApp (somente números)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="5511999999999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Redes Sociais
            </CardTitle>
            <CardDescription>Links exibidos na barra superior e rodapé</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

        {/* Footer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rodapé e Políticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="copyright_text">Texto de Copyright</Label>
              <Input
                id="copyright_text"
                value={formData.copyright_text || ''}
                onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="privacy_policy">Política de Privacidade</Label>
              <Textarea
                id="privacy_policy"
                value={formData.privacy_policy || ''}
                onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.value })}
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms_of_service">Termos de Uso</Label>
              <Textarea
                id="terms_of_service"
                value={formData.terms_of_service || ''}
                onChange={(e) => setFormData({ ...formData, terms_of_service: e.target.value })}
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returns_policy">Política de Trocas e Devoluções</Label>
              <Textarea
                id="returns_policy"
                value={formData.returns_policy || ''}
                onChange={(e) => setFormData({ ...formData, returns_policy: e.target.value })}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateCompany.isPending || !canEdit()} size="lg">
            {updateCompany.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCompanyPage;
