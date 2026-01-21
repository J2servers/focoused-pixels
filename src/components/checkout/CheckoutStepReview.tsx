import { QuoteFormData } from '@/pages/CheckoutPage';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Building2, MapPin, Package, Palette, 
  Ruler, DollarSign, Shield, CheckCircle2 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface CheckoutStepReviewProps {
  formData: QuoteFormData;
  cartItems: CartItem[];
  cartTotal: number;
}

const productTypeLabels: Record<string, string> = {
  'letreiro': 'Letreiro personalizado',
  'display-qrcode': 'Display com QR Code',
  'broches': 'Broches / Pins',
  'placas': 'Placas de porta / sinalização',
  'chaveiros': 'Chaveiros personalizados',
  'espelhos': 'Espelhos de mão',
  'caixas': 'Caixas personalizadas',
  'crachas': 'Crachás personalizados',
  'bandejas': 'Bandejas decorativas',
  'mandalas': 'Mandalas decorativas',
  'outro': 'Outro',
};

const materialLabels: Record<string, string> = {
  'acrilico': 'Acrílico',
  'acrilico-led': 'Acrílico com LED',
  'mdf': 'MDF',
  'mdf-pintado': 'MDF Pintado',
  'espelhado': 'Acrílico Espelhado',
  'metal': 'Metal',
  'outro': 'Outro',
};

export function CheckoutStepReview({ formData, cartItems, cartTotal }: CheckoutStepReviewProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-medium">Revise os dados antes de enviar</p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Confira se todas as informações estão corretas. Você pode voltar para editar qualquer seção.
        </p>
      </div>

      {/* Customer Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-5 w-5" />
          <h3 className="font-semibold">Dados Pessoais</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Nome:</span>{' '}
            <span className="font-medium">{formData.customerName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">E-mail:</span>{' '}
            <span className="font-medium">{formData.customerEmail}</span>
          </div>
          <div>
            <span className="text-muted-foreground">WhatsApp:</span>{' '}
            <span className="font-medium">{formData.customerPhone}</span>
          </div>
          {formData.purpose && (
            <div>
              <span className="text-muted-foreground">Finalidade:</span>{' '}
              <span className="font-medium capitalize">{formData.purpose}</span>
            </div>
          )}
        </div>
      </div>

      {/* Business Info */}
      {(formData.customerCompany || formData.customerCnpj) && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="h-5 w-5" />
              <h3 className="font-semibold">Dados Empresariais</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {formData.customerCompany && (
                <div>
                  <span className="text-muted-foreground">Empresa:</span>{' '}
                  <span className="font-medium">{formData.customerCompany}</span>
                </div>
              )}
              {formData.customerCnpj && (
                <div>
                  <span className="text-muted-foreground">CNPJ:</span>{' '}
                  <span className="font-medium">{formData.customerCnpj}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delivery Info */}
      {(formData.deliveryAddress || formData.deliveryCep || formData.deliveryDeadline) && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <h3 className="font-semibold">Entrega</h3>
            </div>
            <div className="space-y-2 text-sm">
              {formData.deliveryAddress && (
                <div>
                  <span className="text-muted-foreground">Endereço:</span>{' '}
                  <span className="font-medium">{formData.deliveryAddress}</span>
                </div>
              )}
              <div className="grid sm:grid-cols-3 gap-2">
                {formData.deliveryCep && (
                  <div>
                    <span className="text-muted-foreground">CEP:</span>{' '}
                    <span className="font-medium">{formData.deliveryCep}</span>
                  </div>
                )}
                {formData.deliveryDeadline && (
                  <div>
                    <span className="text-muted-foreground">Prazo:</span>{' '}
                    <span className="font-medium">
                      {format(formData.deliveryDeadline, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                )}
                {formData.shippingMethod && (
                  <div>
                    <span className="text-muted-foreground">Envio:</span>{' '}
                    <span className="font-medium uppercase">{formData.shippingMethod}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Products */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Package className="h-5 w-5" />
          <h3 className="font-semibold">Produtos</h3>
        </div>
        
        {formData.productTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.productTypes.map((type) => (
              <Badge key={type} variant="secondary">
                {productTypeLabels[type] || type}
              </Badge>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-sm text-muted-foreground">Produtos do carrinho:</p>
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground"> x{item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {formData.ledOption && (
          <div className="text-sm">
            <span className="text-muted-foreground">Opção LED:</span>{' '}
            <span className="font-medium capitalize">{formData.ledOption.replace('-', ' ')}</span>
          </div>
        )}

        {formData.qrCodeCount > 0 && formData.productTypes.includes('display-qrcode') && (
          <div className="text-sm">
            <span className="text-muted-foreground">QR Codes:</span>{' '}
            <span className="font-medium">{formData.qrCodeCount} ({formData.qrCodeType || 'não especificado'})</span>
          </div>
        )}

        {formData.brocheStyle && (
          <div className="text-sm">
            <span className="text-muted-foreground">Estilo Broche:</span>{' '}
            <span className="font-medium capitalize">{formData.brocheStyle}</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Specifications */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Ruler className="h-5 w-5" />
          <h3 className="font-semibold">Especificações</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {formData.customText && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Texto:</span>{' '}
              <span className="font-medium">"{formData.customText}"</span>
            </div>
          )}
          {formData.preferredColors && (
            <div>
              <span className="text-muted-foreground">Cores:</span>{' '}
              <span className="font-medium">{formData.preferredColors}</span>
            </div>
          )}
          {formData.dimensions && (
            <div>
              <span className="text-muted-foreground">Medidas:</span>{' '}
              <span className="font-medium">{formData.dimensions}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Quantidade:</span>{' '}
            <span className="font-medium">{formData.quantity} unidade(s)</span>
          </div>
          {formData.material && (
            <div>
              <span className="text-muted-foreground">Material:</span>{' '}
              <span className="font-medium">{materialLabels[formData.material] || formData.material}</span>
            </div>
          )}
          {formData.thickness && (
            <div>
              <span className="text-muted-foreground">Espessura:</span>{' '}
              <span className="font-medium">{formData.thickness}</span>
            </div>
          )}
          {formData.borderFinish && (
            <div>
              <span className="text-muted-foreground">Acabamento:</span>{' '}
              <span className="font-medium capitalize">{formData.borderFinish}</span>
            </div>
          )}
        </div>

        {formData.logoUrl && (
          <div className="mt-3">
            <span className="text-sm text-muted-foreground">Logo enviado:</span>
            <img
              src={formData.logoUrl}
              alt="Logo"
              className="mt-2 max-h-20 object-contain rounded border"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Commercial */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <DollarSign className="h-5 w-5" />
          <h3 className="font-semibold">Condições Comerciais</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {formData.maxBudget && (
            <div>
              <span className="text-muted-foreground">Orçamento máximo:</span>{' '}
              <span className="font-medium">R$ {parseFloat(formData.maxBudget).toFixed(2)}</span>
            </div>
          )}
          {formData.paymentMethod && (
            <div>
              <span className="text-muted-foreground">Pagamento:</span>{' '}
              <span className="font-medium uppercase">{formData.paymentMethod}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.requestVolumeDiscount && (
            <Badge variant="outline">Desconto por quantidade</Badge>
          )}
          {formData.requestPrototype && (
            <Badge variant="outline">Solicita protótipo</Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Warranty & Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          <h3 className="font-semibold">Garantia e Observações</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${formData.acceptWarranty ? 'text-success' : 'text-muted-foreground'}`} />
            <span>Termos de garantia {formData.acceptWarranty ? 'aceitos' : 'não aceitos'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-4 w-4 ${formData.wantWhatsappConfirmation ? 'text-success' : 'text-muted-foreground'}`} />
            <span>Confirmação via WhatsApp {formData.wantWhatsappConfirmation ? 'solicitada' : 'não solicitada'}</span>
          </div>
        </div>
        {formData.additionalNotes && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <span className="text-muted-foreground">Observações:</span>
            <p className="mt-1">{formData.additionalNotes}</p>
          </div>
        )}
      </div>

      {/* Cart Total */}
      {cartTotal > 0 && (
        <>
          <Separator />
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total estimado do carrinho:</span>
              <span className="text-xl font-bold text-primary">
                R$ {cartTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              * O valor final será confirmado após análise do orçamento
            </p>
          </div>
        </>
      )}
    </div>
  );
}
