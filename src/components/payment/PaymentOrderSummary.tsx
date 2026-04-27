/**
 * PaymentOrderSummary — Sticky collapsible order summary for the checkout flow.
 *
 * UX principles:
 *  - Always visible at the top so the customer sees what they're paying for.
 *  - Collapsed by default on mobile to save vertical space; opens on tap.
 *  - Trust seals (security, payment brands, LGPD) are always visible to reduce
 *    payment anxiety in the final step.
 */
import { useState } from 'react';
import { ChevronDown, Lock, ShieldCheck, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
}

interface PaymentOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  installments?: number;
  installmentValue?: number;
  className?: string;
}

const formatBRL = (n: number) => `R$ ${n.toFixed(2).replace('.', ',')}`;

export function PaymentOrderSummary({
  items,
  subtotal,
  shippingCost,
  total,
  installments,
  installmentValue,
  className,
}: PaymentOrderSummaryProps) {
  const [open, setOpen] = useState(false);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <section
      aria-label="Resumo do pedido"
      className={cn(
        'rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden',
        className,
      )}
    >
      {/* Header — always visible. Acts as the toggle on mobile. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="order-summary-body"
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/30 active:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="text-left min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">
              Resumo do pedido
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'} ·{' '}
              <span className="text-primary">{formatBRL(total)}</span>
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Body — items + totals */}
      <div
        id="order-summary-body"
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border/60 p-4 space-y-3">
            {/* Items */}
            <ul className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <li
                  key={`${item.name}-${item.size ?? ''}-${i}`}
                  className="flex items-center gap-3 text-sm"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover border border-border shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground line-clamp-1 font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}× {formatBRL(item.price)}
                      {item.size ? ` · ${item.size}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-xs text-muted-foreground italic">
                  Detalhes do pedido indisponíveis.
                </li>
              )}
            </ul>

            {/* Totals */}
            <div className="border-t border-border/60 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5" />
                  Frete
                </span>
                <span className="tabular-nums">
                  {shippingCost > 0 ? formatBRL(shippingCost) : (
                    <span className="text-success font-medium">Grátis</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total — always visible */}
      <div className="border-t border-border/60 px-4 py-3 bg-muted/20 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <div className="text-right">
          <p className="text-lg font-extrabold text-primary tabular-nums leading-none">
            {formatBRL(total)}
          </p>
          {installments && installments > 1 && installmentValue && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ou {installments}× {formatBRL(installmentValue)} sem juros
            </p>
          )}
        </div>
      </div>

      {/* Trust seals */}
      <div className="border-t border-border/60 px-4 py-2.5 flex items-center justify-center gap-3 text-[10px] text-muted-foreground bg-background/40">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-success" />
          <span className="font-medium">Compra 100% segura</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>SSL · LGPD</span>
      </div>
    </section>
  );
}
