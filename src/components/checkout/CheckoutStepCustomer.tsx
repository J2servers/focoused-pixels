import { QuoteFormData } from '@/pages/CheckoutPage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, User, Building2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CheckoutStepCustomerProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
}

export function CheckoutStepCustomer({ formData, updateFormData }: CheckoutStepCustomerProps) {
  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <User className="h-5 w-5" />
          <h3 className="font-semibold">Informações Pessoais</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nome Completo *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => updateFormData({ customerName: e.target.value })}
              placeholder="Seu nome completo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerEmail">E-mail *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => updateFormData({ customerEmail: e.target.value })}
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerPhone">WhatsApp *</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => updateFormData({ customerPhone: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Finalidade do Pedido</Label>
            <Select
              value={formData.purpose}
              onValueChange={(value) => updateFormData({ purpose: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a finalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empresa">Uso empresarial</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="presente">Presente</SelectItem>
                <SelectItem value="decoracao">Decoração</SelectItem>
                <SelectItem value="revenda">Revenda</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-5 w-5" />
          <h3 className="font-semibold">Dados Empresariais (Opcional)</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerCompany">Empresa/Marca</Label>
            <Input
              id="customerCompany"
              value={formData.customerCompany}
              onChange={(e) => updateFormData({ customerCompany: e.target.value })}
              placeholder="Nome da empresa"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerCnpj">CNPJ</Label>
            <Input
              id="customerCnpj"
              value={formData.customerCnpj}
              onChange={(e) => updateFormData({ customerCnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <MapPin className="h-5 w-5" />
          <h3 className="font-semibold">Entrega</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Endereço Completo</Label>
            <Textarea
              id="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={(e) => updateFormData({ deliveryAddress: e.target.value })}
              placeholder="Rua, número, complemento, bairro, cidade, estado"
              rows={2}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryCep">CEP</Label>
              <Input
                id="deliveryCep"
                value={formData.deliveryCep}
                onChange={(e) => updateFormData({ deliveryCep: e.target.value })}
                placeholder="00000-000"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Prazo Desejado</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.deliveryDeadline && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deliveryDeadline
                      ? format(formData.deliveryDeadline, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deliveryDeadline || undefined}
                    onSelect={(date) => updateFormData({ deliveryDeadline: date || null })}
                    disabled={(date) => date < new Date()}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Método de Envio</Label>
              <Select
                value={formData.shippingMethod}
                onValueChange={(value) => updateFormData({ shippingMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedex">SEDEX</SelectItem>
                  <SelectItem value="pac">PAC</SelectItem>
                  <SelectItem value="transportadora">Transportadora</SelectItem>
                  <SelectItem value="retirada">Retirada no local</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
