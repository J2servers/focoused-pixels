import { QuoteFormData } from '@/pages/CheckoutPage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Shield, MessageCircle } from 'lucide-react';

interface CheckoutStepCommercialProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
}

export function CheckoutStepCommercial({ formData, updateFormData }: CheckoutStepCommercialProps) {
  return (
    <div className="space-y-6">
      {/* Budget & Payment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <DollarSign className="h-5 w-5" />
          <h3 className="font-semibold">Condições Comerciais</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxBudget">Orçamento Máximo (R$)</Label>
            <Input
              id="maxBudget"
              type="number"
              min={0}
              step={0.01}
              value={formData.maxBudget}
              onChange={(e) => updateFormData({ maxBudget: e.target.value })}
              placeholder="0,00"
            />
            <p className="text-xs text-muted-foreground">
              Opcional - nos ajuda a oferecer opções dentro do seu orçamento
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Forma de Pagamento Preferida</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => updateFormData({ paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                <SelectItem value="boleto">Boleto Bancário</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="volumeDiscount"
              checked={formData.requestVolumeDiscount}
              onCheckedChange={(checked) => 
                updateFormData({ requestVolumeDiscount: checked as boolean })
              }
            />
            <div>
              <Label htmlFor="volumeDiscount" className="cursor-pointer">
                Solicitar desconto por quantidade
              </Label>
              <p className="text-xs text-muted-foreground">
                Temos descontos progressivos para pedidos maiores
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="prototype"
              checked={formData.requestPrototype}
              onCheckedChange={(checked) => 
                updateFormData({ requestPrototype: checked as boolean })
              }
            />
            <div>
              <Label htmlFor="prototype" className="cursor-pointer">
                Solicitar amostra ou protótipo
              </Label>
              <p className="text-xs text-muted-foreground">
                Receba uma amostra antes da produção completa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty & Support */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          <h3 className="font-semibold">Garantia e Pós-venda</h3>
        </div>
        
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="warranty"
              checked={formData.acceptWarranty}
              onCheckedChange={(checked) => 
                updateFormData({ acceptWarranty: checked as boolean })
              }
            />
            <div>
              <Label htmlFor="warranty" className="cursor-pointer">
                Aceito os termos de garantia de 30 dias para defeitos de fabricação *
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Nossa garantia cobre defeitos de fabricação por 30 dias após o recebimento.
                Não cobre mau uso, quedas ou alterações no produto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">Preferências de Comunicação</h3>
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="whatsappConfirmation"
            checked={formData.wantWhatsappConfirmation}
            onCheckedChange={(checked) => 
              updateFormData({ wantWhatsappConfirmation: checked as boolean })
            }
          />
          <div>
            <Label htmlFor="whatsappConfirmation" className="cursor-pointer">
              Desejo receber confirmação por WhatsApp após recebimento
            </Label>
            <p className="text-xs text-muted-foreground">
              Entraremos em contato para confirmar que você recebeu o produto
            </p>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Observações Finais</Label>
          <Textarea
            id="additionalNotes"
            value={formData.additionalNotes}
            onChange={(e) => updateFormData({ additionalNotes: e.target.value })}
            placeholder="Alguma instrução extra, preferência de acabamento ou detalhe que devemos saber..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
