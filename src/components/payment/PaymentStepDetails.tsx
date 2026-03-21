import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  User, Upload, FileImage, X, Type, Loader2, CheckCircle2
} from 'lucide-react';

interface CustomerFormData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

interface PaymentStepDetailsProps {
  customerForm: CustomerFormData;
  setCustomerForm: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  customText: string;
  setCustomText: (v: string) => void;
  uploadedFiles: { name: string; url: string }[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<{ name: string; url: string }[]>>;
  amount: number;
  onSubmit: () => void;
  isProcessing: boolean;
}

export function PaymentStepDetails({
  customerForm,
  setCustomerForm,
  customText,
  setCustomText,
  uploadedFiles,
  setUploadedFiles,
  amount,
  onSubmit,
  isProcessing,
}: PaymentStepDetailsProps) {
  const [isUploading, setIsUploading] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'ai', 'eps', 'cdr'];

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Arquivo ${file.name} muito grande (máx. 10MB)`);
          continue;
        }
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          toast.error(`Tipo não permitido: .${ext}`);
          continue;
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `customer-uploads/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('order-files').upload(filePath, file);
        if (uploadError) {
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }
        const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(filePath);
        setUploadedFiles(prev => [...prev, { name: file.name, url: urlData.publicUrl }]);
        toast.success(`${file.name} enviado!`);
      }
    } catch {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isValid = customerForm.name.trim() && customerForm.phone.trim() && customerForm.street.trim() && customerForm.cep.trim() && customerForm.city.trim() && customerForm.state.trim();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados de Entrega
          </CardTitle>
          <CardDescription>Informe onde devemos enviar seu pedido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="det-name">Nome Completo *</Label>
              <Input
                id="det-name"
                placeholder="Seu nome completo"
                value={customerForm.name}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-phone">WhatsApp *</Label>
              <Input
                id="det-phone"
                placeholder="(00) 00000-0000"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                maxLength={20}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="det-cpf">CPF (para boleto)</Label>
              <Input
                id="det-cpf"
                placeholder="000.000.000-00"
                value={customerForm.cpf}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, cpf: e.target.value }))}
                maxLength={14}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-cep">CEP *</Label>
              <Input
                id="det-cep"
                placeholder="00000-000"
                value={customerForm.cep}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, cep: e.target.value }))}
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="det-address">Endereço Completo *</Label>
            <Textarea
              id="det-address"
              placeholder="Rua, número, complemento, bairro, cidade, estado"
              value={customerForm.address}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customization section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Personalização
            <Badge variant="outline" className="text-xs ml-auto">Opcional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="det-customText" className="flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5" />
              Texto para gravação
            </Label>
            <Textarea
              id="det-customText"
              placeholder="Ex: Nome da empresa, frase personalizada..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={2}
              maxLength={1000}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Logo, imagem ou QR Code
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
              <input
                id="det-fileUpload"
                type="file"
                accept="image/*,.pdf,.svg,.ai,.eps,.cdr"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="det-fileUpload" className="cursor-pointer space-y-1">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 mx-auto text-muted-foreground animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                )}
                <p className="text-xs text-muted-foreground">
                  {isUploading ? 'Enviando...' : 'Clique para enviar (máx. 10MB)'}
                </p>
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm">
                    <FileImage className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate flex-1 text-xs">{file.name}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary + Continue */}
      <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
        <span className="text-sm">Valor a pagar:</span>
        <span className="font-bold text-lg">{formatCurrency(amount)}</span>
      </div>

      <Button
        onClick={onSubmit}
        className="w-full"
        size="lg"
        disabled={!isValid || isProcessing}
      >
        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        Continuar para Pagamento
      </Button>
    </div>
  );
}

