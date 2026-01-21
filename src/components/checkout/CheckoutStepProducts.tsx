import { QuoteFormData } from '@/pages/CheckoutPage';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Package, Lightbulb, QrCode, Award } from 'lucide-react';

interface CheckoutStepProductsProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
}

const productOptions = [
  { id: 'letreiro', label: 'Letreiro personalizado' },
  { id: 'display-qrcode', label: 'Display com QR Code' },
  { id: 'broches', label: 'Broches / Pins' },
  { id: 'placas', label: 'Placas de porta / sinalização' },
  { id: 'chaveiros', label: 'Chaveiros personalizados' },
  { id: 'espelhos', label: 'Espelhos de mão personalizados' },
  { id: 'caixas', label: 'Caixas personalizadas' },
  { id: 'crachas', label: 'Crachás personalizados' },
  { id: 'bandejas', label: 'Bandejas decorativas' },
  { id: 'mandalas', label: 'Mandalas decorativas' },
  { id: 'outro', label: 'Outro (descrever abaixo)' },
];

export function CheckoutStepProducts({ formData, updateFormData }: CheckoutStepProductsProps) {
  const handleProductToggle = (productId: string) => {
    const current = formData.productTypes;
    const updated = current.includes(productId)
      ? current.filter((p) => p !== productId)
      : [...current, productId];
    updateFormData({ productTypes: updated });
  };

  const showLedOptions = formData.productTypes.some(p => 
    ['letreiro'].includes(p)
  );

  const showQrCodeOptions = formData.productTypes.some(p => 
    ['display-qrcode'].includes(p)
  );

  const showBrocheOptions = formData.productTypes.some(p => 
    ['broches'].includes(p)
  );

  const showOtherDescription = formData.productTypes.includes('outro');

  return (
    <div className="space-y-6">
      {/* Product Types */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Package className="h-5 w-5" />
          <h3 className="font-semibold">Tipo de Produto Desejado</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Selecione todos os tipos de produtos que deseja orçar
        </p>
        
        <div className="grid sm:grid-cols-2 gap-3">
          {productOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <Checkbox
                id={option.id}
                checked={formData.productTypes.includes(option.id)}
                onCheckedChange={() => handleProductToggle(option.id)}
              />
              <Label
                htmlFor={option.id}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* LED Options */}
      {showLedOptions && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb className="h-5 w-5" />
            <h3 className="font-semibold">Opções de Letreiro</h3>
          </div>
          
          <RadioGroup
            value={formData.ledOption}
            onValueChange={(value) => updateFormData({ ledOption: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="com-led" id="com-led" />
              <Label htmlFor="com-led">Com LED</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sem-led" id="sem-led" />
              <Label htmlFor="sem-led">Sem LED</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neon-led" id="neon-led" />
              <Label htmlFor="neon-led">Estilo Neon LED</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="relevo-3d" id="relevo-3d" />
              <Label htmlFor="relevo-3d">Com relevo 3D</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="placa-fundo" id="placa-fundo" />
              <Label htmlFor="placa-fundo">Com placa de fundo</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* QR Code Options */}
      {showQrCodeOptions && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <QrCode className="h-5 w-5" />
            <h3 className="font-semibold">Opções de QR Code</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quantidade de QR Codes</Label>
              <RadioGroup
                value={formData.qrCodeCount.toString()}
                onValueChange={(value) => updateFormData({ qrCodeCount: parseInt(value) })}
                className="flex flex-wrap gap-4"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex items-center space-x-2">
                    <RadioGroupItem value={num.toString()} id={`qr-${num}`} />
                    <Label htmlFor={`qr-${num}`}>{num} QR Code{num > 1 ? 's' : ''}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Tipo de QR Code</Label>
              <RadioGroup
                value={formData.qrCodeType}
                onValueChange={(value) => updateFormData({ qrCodeType: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cardapio" id="qr-cardapio" />
                  <Label htmlFor="qr-cardapio">Cardápio Digital</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wifi" id="qr-wifi" />
                  <Label htmlFor="qr-wifi">Wi-Fi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maps" id="qr-maps" />
                  <Label htmlFor="qr-maps">Google Maps</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instagram" id="qr-instagram" />
                  <Label htmlFor="qr-instagram">Instagram</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="whatsapp" id="qr-whatsapp" />
                  <Label htmlFor="qr-whatsapp">WhatsApp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pix" id="qr-pix" />
                  <Label htmlFor="qr-pix">PIX</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outro" id="qr-outro" />
                  <Label htmlFor="qr-outro">Outro Link</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Links para os QR Codes</Label>
              {formData.qrCodeLinks.map((link, index) => (
                <Input
                  key={index}
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...formData.qrCodeLinks];
                    newLinks[index] = e.target.value;
                    updateFormData({ qrCodeLinks: newLinks });
                  }}
                  placeholder={`Link do QR Code ${index + 1}`}
                  className="mb-2"
                />
              ))}
              {formData.qrCodeLinks.length < formData.qrCodeCount && (
                <button
                  type="button"
                  onClick={() => updateFormData({ qrCodeLinks: [...formData.qrCodeLinks, ''] })}
                  className="text-sm text-primary hover:underline"
                >
                  + Adicionar link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broche Options */}
      {showBrocheOptions && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-primary">
            <Award className="h-5 w-5" />
            <h3 className="font-semibold">Estilo de Broche</h3>
          </div>
          
          <RadioGroup
            value={formData.brocheStyle}
            onValueChange={(value) => updateFormData({ brocheStyle: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="espelhado" id="broche-espelhado" />
              <Label htmlFor="broche-espelhado">Linha Espelhado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="escovado" id="broche-escovado" />
              <Label htmlFor="broche-escovado">Linha Escovado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="colorido" id="broche-colorido" />
              <Label htmlFor="broche-colorido">Linha Colorido</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Other Description */}
      {showOtherDescription && (
        <div className="space-y-2">
          <Label htmlFor="otherDescription">Descreva o produto desejado</Label>
          <Textarea
            id="otherDescription"
            value={formData.otherProductDescription}
            onChange={(e) => updateFormData({ otherProductDescription: e.target.value })}
            placeholder="Descreva detalhadamente o tipo de produto que você precisa..."
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
