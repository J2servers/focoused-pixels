/**
 * CartStickyCheckoutBar — fixed bottom CTA on mobile so the
 * "Finalizar compra" action is always reachable without scrolling.
 * Hidden on lg+ where the sticky sidebar already does this job.
 */
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartStickyCheckoutBarProps {
  total: number;
  itemCount: number;
  onCheckout: () => void;
  disabled?: boolean;
}

export function CartStickyCheckoutBar({
  total,
  itemCount,
  onCheckout,
  disabled,
}: CartStickyCheckoutBarProps) {
  return (
    <div
      role="region"
      aria-label="Finalizar compra"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_hsl(var(--foreground)/0.08)] px-3 py-2.5 safe-area-bottom"
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground leading-tight">
            Total ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </p>
          <p className="text-base font-extrabold text-primary tabular-nums leading-tight">
            R$ {total.toFixed(2).replace('.', ',')}
          </p>
        </div>
        <Button
          onClick={onCheckout}
          disabled={disabled}
          className="h-12 px-5 rounded-xl font-bold text-sm gap-2 shadow-md active:scale-[0.97] transition-transform"
        >
          <CreditCard className="h-4 w-4" />
          FINALIZAR COMPRA
        </Button>
      </div>
    </div>
  );
}
