/**
 * DeliveryEstimate - Shows estimated delivery date based on freight
 * Improvements: #19 Delivery date display, #20 Production + transit calc, #21 Visual timeline
 */
import { Calendar, Package, Truck } from 'lucide-react';
import { format, addBusinessDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeliveryEstimateProps {
  freightDays?: string;
  productionDays?: string;
}

export function DeliveryEstimate({ freightDays, productionDays = '4 a 10 dias úteis' }: DeliveryEstimateProps) {
  if (!freightDays) return null;

  // Parse days from strings like "3 a 5 dias úteis" or "5 dias úteis"
  const parseDays = (str: string): { min: number; max: number } => {
    const nums = str.match(/\d+/g)?.map(Number) || [5];
    return { min: nums[0], max: nums[nums.length - 1] };
  };

  const prod = parseDays(productionDays);
  const transit = parseDays(freightDays);

  const today = new Date();
  const minDate = addBusinessDays(today, prod.min + transit.min);
  const maxDate = addBusinessDays(today, prod.max + transit.max);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2.5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Calendar className="h-4 w-4 text-primary" />
        Previsão de entrega
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Package className="h-3 w-3" />
          <span>Produção: {productionDays}</span>
        </div>
        <span>+</span>
        <div className="flex items-center gap-1.5">
          <Truck className="h-3 w-3" />
          <span>Entrega: {freightDays}</span>
        </div>
      </div>

      <p className="text-sm font-semibold text-foreground">
        📦 Receba entre{' '}
        <span className="text-primary">
          {format(minDate, "d 'de' MMM", { locale: ptBR })}
        </span>
        {' '}e{' '}
        <span className="text-primary">
          {format(maxDate, "d 'de' MMM", { locale: ptBR })}
        </span>
      </p>
    </div>
  );
}
