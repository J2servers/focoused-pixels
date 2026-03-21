/**
 * FirstPurchaseBanner - Shows first-purchase discount on login/register pages
 */
import { Gift, Percent, Truck } from 'lucide-react';

export function FirstPurchaseBanner() {
  return (
    <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-sm">Bônus de Primeira Compra!</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Percent className="h-4 w-4 text-accent shrink-0" />
          <span><strong>10% OFF</strong> no primeiro pedido</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4 text-accent shrink-0" />
          <span><strong>Frete Grátis</strong> na primeira compra</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Cadastre-se agora e aproveite esses benefícios exclusivos!
      </p>
    </div>
  );
}

