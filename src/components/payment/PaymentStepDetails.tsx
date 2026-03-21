import { useState, useEffect, useCallback } from 'react';
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
  User, Upload, FileImage, X, Type, Loader2, CheckCircle2, Truck, Package, Zap, AlertTriangle, MapPin, Check
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

interface FreightOption {
  method: string;
  price: number;
  originalPrice: number;
  days: string;
  daysMin: number;
  daysMax: number;
}

interface PaymentStepDetailsProps {
  customerForm: CustomerFormData;
  setCustomerForm: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  customText: string;
  setCustomText: (v: string) => void;
  uploadedFiles: { name: string; url: string }[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<{ name: string; url: string }[]>>;
  amount: number;
  shippingCost: number;
  cartWeight?: number;
  onShippingChange: (cost: number, method: string, city: string, state: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const FALLBACK_OPTIONS: FreightOption[] = [
  { method: 'PAC', price: 25.90, originalPrice: 25.90, days: '8 a 12 dias úteis', daysMin: 8, daysMax: 12 },
  { method: 'SEDEX', price: 42.50, originalPrice: 42.50, days: '3 a 5 dias úteis', daysMin: 3, daysMax: 5 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getMethodIcon = (method: string) => {
  if (method.includes('SEDEX 10') || method.includes('Express')) return Zap;
  if (method.includes('SEDEX')) return Truck;
  return Package;
};

export function PaymentStepDetails({
  customerForm,
  setCustomerForm,
  customText,
  setCustomText,
  uploadedFiles,
  setUploadedFiles,
  amount,
  shippingCost,
  cartWeight = 0.5,
  onShippingChange,
  onSubmit,
  isProcessing,
}: PaymentStepDetailsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [freightOptions, setFreightOptions] = useState<FreightOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState(false);
  const [destinationInfo, setDestinationInfo] = useState<{ city: string; state: string } | null>(null);
  const [lastFetchedCep, setLastFetchedCep] = useState('');

  // Auto-fetch freight when CEP has 8 digits
  const fetchFreight = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8 || cleanCep === lastFetchedCep) return;

    setFreightLoading(true);
    setFreightError(false);
    setFreightOptions([]);
    setSelectedMethod(null);
    setLastFetchedCep(cleanCep);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-freight', {
        body: {
          destinationCep: cleanCep,
          productPrice: amount - shippingCost, // subtotal only
          weight: 0.5,
          freeShippingMinimum: 0, // let backend decide
        },
      });

      if (error || data?.error) throw new Error(data?.error || 'API error');

      if (data.results?.length > 0) {
        setFreightOptions(data.results);
        setDestinationInfo({ city: data.destination.city, state: data.destination.state });
        // Auto-fill city and state from API
        setCustomerForm(prev => ({
          ...prev,
          city: data.destination.city || prev.city,
          state: data.destination.state || prev.state,
        }));
      } else {
        throw new Error('No results');
      }
    } catch (err) {
      console.error('Freight fetch error:', err);
      setFreightError(true);
      // Fallback options
      setFreightOptions(FALLBACK_OPTIONS);
      setDestinationInfo(null);
    } finally {
      setFreightLoading(false);
    }
  }, [amount, shippingCost, lastFetchedCep, setCustomerForm]);

  // Watch CEP changes
  useEffect(() => {
    const cleanCep = customerForm.cep.replace(/\D/g, '');
    if (cleanCep.length === 8 && cleanCep !== lastFetchedCep) {
      const timer = setTimeout(() => fetchFreight(customerForm.cep), 500);
      return () => clearTimeout(timer);
    }
  }, [customerForm.cep, fetchFreight, lastFetchedCep]);

  const handleSelectFreight = (option: FreightOption) => {
    setSelectedMethod(option.method);
    onShippingChange(
      option.price,
      option.method,
      destinationInfo?.city || customerForm.city,
      destinationInfo?.state || customerForm.state,
    );
  };

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

  const isValid =
    customerForm.name.trim() &&
    customerForm.phone.trim() &&
    customerForm.street.trim() &&
    customerForm.cep.replace(/\D/g, '').length === 8 &&
    customerForm.city.trim() &&
    customerForm.state.trim() &&
    selectedMethod !== null;

  const subtotal = amount - shippingCost;

  return (
    <div className="space-y-4">
      {/* Address Card */}
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
              <Input id="det-name" placeholder="Seu nome completo" value={customerForm.name}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-phone">WhatsApp *</Label>
              <Input id="det-phone" placeholder="(00) 00000-0000" value={customerForm.phone}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))} maxLength={20} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="det-cpf">CPF (para boleto)</Label>
              <Input id="det-cpf" placeholder="000.000.000-00" value={customerForm.cpf}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, cpf: e.target.value }))} maxLength={14} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-cep">CEP *</Label>
              <Input id="det-cep" placeholder="00000-000" value={customerForm.cep}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                  const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                  setCustomerForm(prev => ({ ...prev, cep: formatted }));
                }} maxLength={10} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="det-street">Rua *</Label>
              <Input id="det-street" placeholder="Nome da rua" value={customerForm.street}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, street: e.target.value }))} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-number">Número *</Label>
              <Input id="det-number" placeholder="Nº" value={customerForm.number}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, number: e.target.value }))} maxLength={10} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="det-complement">Complemento</Label>
              <Input id="det-complement" placeholder="Apto, bloco, sala..." value={customerForm.complement}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, complement: e.target.value }))} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-neighborhood">Bairro *</Label>
              <Input id="det-neighborhood" placeholder="Bairro" value={customerForm.neighborhood}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, neighborhood: e.target.value }))} maxLength={100} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="det-city">Cidade *</Label>
              <Input id="det-city" placeholder="Cidade" value={customerForm.city}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="det-state">Estado (UF) *</Label>
              <Input id="det-state" placeholder="SP" value={customerForm.state}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, state: e.target.value.toUpperCase() }))} maxLength={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Options - Auto-appears after CEP */}
      {(freightLoading || freightOptions.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Escolha o Envio
            </CardTitle>
            {destinationInfo && (
              <CardDescription className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Entrega para {destinationInfo.city} - {destinationInfo.state}
              </CardDescription>
            )}
            {freightError && (
              <div className="flex items-center gap-2 text-xs text-amber-600 mt-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Valores estimados (serviço de cálculo indisponível)
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {freightLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Calculando opções de envio...</span>
              </div>
            ) : (
              freightOptions.map((option) => {
                const Icon = getMethodIcon(option.method);
                const isSelected = selectedMethod === option.method;
                return (
                  <button
                    key={option.method}
                    onClick={() => handleSelectFreight(option)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{option.method}</span>
                        {option.price === 0 && (
                          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-0">GRÁTIS</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{option.days}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-bold text-sm ${option.price === 0 ? 'text-green-600' : ''}`}>
                        {option.price === 0 ? 'Grátis' : formatCurrency(option.price)}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* No CEP hint */}
      {customerForm.cep.replace(/\D/g, '').length < 8 && freightOptions.length === 0 && !freightLoading && (
        <div className="p-3 border border-dashed border-muted-foreground/30 rounded-lg text-center text-sm text-muted-foreground">
          <Truck className="h-5 w-5 mx-auto mb-1 opacity-50" />
          Preencha o CEP acima para ver as opções de envio
        </div>
      )}

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
            <Textarea id="det-customText" placeholder="Ex: Nome da empresa, frase personalizada..."
              value={customText} onChange={(e) => setCustomText(e.target.value)} rows={2} maxLength={1000} className="resize-none" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              Logo, imagem ou QR Code
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
              <input id="det-fileUpload" type="file" accept="image/*,.pdf,.svg,.ai,.eps,.cdr" multiple
                onChange={handleFileUpload} className="hidden" disabled={isUploading} />
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

      {/* Order Summary */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal (itens)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {shippingCost > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Frete ({selectedMethod})
            </span>
            <span>{formatCurrency(shippingCost)}</span>
          </div>
        )}
        {shippingCost === 0 && selectedMethod && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Frete ({selectedMethod})
            </span>
            <span className="font-medium">Grátis</span>
          </div>
        )}
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">{formatCurrency(amount)}</span>
        </div>
      </div>

      <Button onClick={onSubmit} className="w-full" size="lg" disabled={!isValid || isProcessing}>
        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
        {!selectedMethod ? 'Selecione o envio para continuar' : 'Continuar para Pagamento'}
      </Button>
    </div>
  );
}
