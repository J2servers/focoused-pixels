import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { CustomerFormData } from './types';
import { formatCpf, isValidCpf, cpfDigits } from '@/lib/cpf';

interface Props {
  customerForm: CustomerFormData;
  setCustomerForm: React.Dispatch<React.SetStateAction<CustomerFormData>>;
}

export function AddressFormCard({ customerForm, setCustomerForm }: Props) {
  const upd = <K extends keyof CustomerFormData>(key: K, value: CustomerFormData[K]) =>
    setCustomerForm(prev => ({ ...prev, [key]: value }));

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados de Entrega
        </CardTitle>
        <CardDescription>Comece pelo CEP — preenchemos seu endereço automaticamente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="det-name">Nome Completo *</Label>
            <Input id="det-name" placeholder="Seu nome completo" value={customerForm.name}
              onChange={(e) => upd('name', e.target.value)} maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="det-phone">WhatsApp *</Label>
            <Input id="det-phone" placeholder="(00) 00000-0000" value={customerForm.phone}
              onChange={(e) => upd('phone', e.target.value)} maxLength={20} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="det-cpf">CPF (para boleto)</Label>
            <Input id="det-cpf" placeholder="000.000.000-00" value={customerForm.cpf}
              onChange={(e) => upd('cpf', e.target.value)} maxLength={14} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="det-cep">CEP *</Label>
            <Input id="det-cep" placeholder="00000-000" value={customerForm.cep}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                const formatted = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                upd('cep', formatted);
              }} maxLength={10} />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="det-street">Rua *</Label>
            <Input id="det-street" placeholder="Nome da rua" value={customerForm.street}
              onChange={(e) => upd('street', e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="det-number">Número *</Label>
            <Input id="det-number" placeholder="Nº" value={customerForm.number}
              onChange={(e) => upd('number', e.target.value)} maxLength={10} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="det-complement">Complemento</Label>
            <Input id="det-complement" placeholder="Apto, bloco, sala..." value={customerForm.complement}
              onChange={(e) => upd('complement', e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="det-neighborhood">Bairro *</Label>
            <Input id="det-neighborhood" placeholder="Bairro" value={customerForm.neighborhood}
              onChange={(e) => upd('neighborhood', e.target.value)} maxLength={100} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="det-city">Cidade *</Label>
            <Input id="det-city" placeholder="Cidade" value={customerForm.city}
              onChange={(e) => upd('city', e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="det-state">Estado (UF) *</Label>
            <Input id="det-state" placeholder="SP" value={customerForm.state}
              onChange={(e) => upd('state', e.target.value.toUpperCase())} maxLength={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
