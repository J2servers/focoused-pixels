import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Building2, Phone, FileText, Truck } from 'lucide-react';
import type { CompanyInfo } from '@/hooks/useCompanyInfo';

interface Props {
  formData: Partial<CompanyInfo>;
  setFormData: (data: Partial<CompanyInfo>) => void;
  freeShippingPreview: string;
}

export const CompanyConversionSection = ({ formData, setFormData, freeShippingPreview }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Conversão e experiência da loja</CardTitle>
      <CardDescription>Mensagens de prova de valor e regras comerciais.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="free_shipping_minimum">Valor mínimo para frete grátis (R$)</Label>
          <Input id="free_shipping_minimum" type="number" value={formData.free_shipping_minimum || ''}
            onChange={(e) => setFormData({ ...formData, free_shipping_minimum: Number(e.target.value) })} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="free_shipping_message">Mensagem da barra superior</Label>
          <Input id="free_shipping_message" value={formData.free_shipping_message || ''}
            onChange={(e) => setFormData({ ...formData, free_shipping_message: e.target.value })}
            placeholder="Frete grátis em compras acima de R$ 159" />
        </div>
      </div>
      <div className="p-3 rounded-md text-sm text-center bg-primary text-primary-foreground">{freeShippingPreview}</div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="installments">Parcelamento (vezes)</Label>
          <Input id="installments" type="number" value={formData.installments || ''}
            onChange={(e) => setFormData({ ...formData, installments: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="production_time">Prazo de produção</Label>
          <Input id="production_time" value={formData.production_time || ''}
            onChange={(e) => setFormData({ ...formData, production_time: e.target.value })}
            placeholder="4 a 10 dias úteis" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warranty">Garantia</Label>
          <Input id="warranty" value={formData.warranty || ''}
            onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
            placeholder="3 meses" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CompanyDataSection = ({ formData, setFormData }: { formData: Partial<CompanyInfo>; setFormData: (d: Partial<CompanyInfo>) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Dados da empresa</CardTitle>
      <CardDescription>Informações institucionais para reforçar confiança.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Nome da empresa *</Label>
          <Input id="company_name" value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input id="cnpj" value={formData.cnpj || ''}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Endereço completo</Label>
        <Textarea id="address" value={formData.address || ''}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="business_hours">Horário de atendimento</Label>
        <Input id="business_hours" value={formData.business_hours || ''}
          onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
          placeholder="Seg-Sex 9h às 18h" />
      </div>
    </CardContent>
  </Card>
);

export const CompanyContactSection = ({ formData, setFormData }: { formData: Partial<CompanyInfo>; setFormData: (d: Partial<CompanyInfo>) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contato e redes sociais</CardTitle>
      <CardDescription>Canais para atendimento rápido e suporte.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'phone', label: 'Telefone', placeholder: '(11) 99999-9999' },
          { id: 'whatsapp', label: 'WhatsApp (somente números)', placeholder: '5511999999999' },
          { id: 'email', label: 'E-mail', placeholder: '' },
        ].map(({ id, label, placeholder }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} value={(formData as Record<string, any>)[id] || ''}
              onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
              placeholder={placeholder} />
          </div>
        ))}
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'social_instagram', label: 'Instagram' },
          { id: 'social_facebook', label: 'Facebook' },
          { id: 'social_youtube', label: 'YouTube' },
          { id: 'social_pinterest', label: 'Pinterest' },
          { id: 'social_tiktok', label: 'TikTok' },
          { id: 'social_linkedin', label: 'LinkedIn' },
        ].map(({ id, label }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} value={(formData as Record<string, any>)[id] || ''}
              onChange={(e) => setFormData({ ...formData, [id]: e.target.value })} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const CompanyPoliciesSection = ({ formData, setFormData }: { formData: Partial<CompanyInfo>; setFormData: (d: Partial<CompanyInfo>) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Rodapé e políticas</CardTitle>
      <CardDescription>Base legal e institucional.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="copyright_text">Texto de copyright</Label>
        <Input id="copyright_text" value={formData.copyright_text || ''}
          onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })} />
      </div>
      <Separator />
      {[
        { id: 'privacy_policy', label: 'Política de privacidade' },
        { id: 'terms_of_service', label: 'Termos de uso' },
        { id: 'returns_policy', label: 'Política de trocas e devoluções' },
      ].map(({ id, label }) => (
        <div key={id} className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <Textarea id={id} value={(formData as Record<string, any>)[id] || ''}
            onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
            className="min-h-[150px]" />
        </div>
      ))}
    </CardContent>
  </Card>
);
