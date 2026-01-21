import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Building2, Phone, Globe, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';

interface CompanyInfo {
  id: string;
  company_name: string;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  business_hours: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  copyright_text: string | null;
  privacy_policy: string | null;
  terms_of_service: string | null;
  returns_policy: string | null;
  footer_logo: string | null;
}

const AdminCompanyPage = () => {
  const { canEdit } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

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
    copyright_text: '',
    privacy_policy: '',
    terms_of_service: '',
    returns_policy: '',
    footer_logo: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('company_info')
        .select('*')
        .single();

      if (data) {
        setCompanyId(data.id);
        setFormData({
          company_name: data.company_name || '',
          cnpj: data.cnpj || '',
          address: data.address || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          business_hours: data.business_hours || '',
          social_instagram: data.social_instagram || '',
          social_facebook: data.social_facebook || '',
          social_tiktok: data.social_tiktok || '',
          social_youtube: data.social_youtube || '',
          social_linkedin: data.social_linkedin || '',
          copyright_text: data.copyright_text || '',
          privacy_policy: data.privacy_policy || '',
          terms_of_service: data.terms_of_service || '',
          returns_policy: data.returns_policy || '',
          footer_logo: data.footer_logo || '',
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.company_name) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      if (companyId) {
        const { error } = await supabase
          .from('company_info')
          .update(formData)
          .eq('id', companyId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_info')
          .insert(formData);

        if (error) throw error;
      }

      toast.success('Informações salvas com sucesso!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar';
      toast.error(message);
    } finally {
      setIsSaving(false);
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
    <AdminLayout title="Informações da Empresa" requireEditor>
      <div className="max-w-4xl space-y-6">
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
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
                <Label htmlFor="social_tiktok">TikTok</Label>
                <Input
                  id="social_tiktok"
                  value={formData.social_tiktok || ''}
                  onChange={(e) => setFormData({ ...formData, social_tiktok: e.target.value })}
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
              Rodapé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="footer_logo">URL do Logo do Rodapé</Label>
                <Input
                  id="footer_logo"
                  value={formData.footer_logo || ''}
                  onChange={(e) => setFormData({ ...formData, footer_logo: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright_text">Texto de Copyright</Label>
                <Input
                  id="copyright_text"
                  value={formData.copyright_text || ''}
                  onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
                />
              </div>
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
          <Button onClick={handleSave} disabled={isSaving || !canEdit()} size="lg">
            {isSaving ? (
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
