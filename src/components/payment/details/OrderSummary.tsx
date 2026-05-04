import { Separator } from '@/components/ui/separator';
import { Truck } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface Props {
  subtotal: number;
  shippingCost: number;
  selectedMethod: string | null;
  amount: number;
}

export function OrderSummary({ subtotal, shippingCost, selectedMethod, amount }: Props) {
  return (
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
  );
}
