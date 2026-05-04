import { Button } from '@/components/ui/button';
import { Shield, Clock, CreditCard, Package, ShoppingBag, Zap } from 'lucide-react';
import { Section } from './sectionPrimitives';
import { NotifyWhenAvailable } from '@/components/product/NotifyWhenAvailable';

interface CtaProps {
  inStock: boolean;
  productId: string;
  productName: string;
  onBuyNow: () => void;
  onAddToCart: () => void;
}

export function ProductCtaBlock({ inStock, productId, productName, onBuyNow, onAddToCart }: CtaProps) {
  if (!inStock) return <NotifyWhenAvailable productName={productName} productId={productId} inStock={inStock} />;
  return (
    <Section label="Ações de compra" className="space-y-3">
      <Button onClick={onBuyNow} size="lg" className="w-full h-13 sm:h-14 text-base sm:text-lg font-bold gap-2 rounded-xl">
        <Zap className="h-5 w-5" />
        COMPRAR AGORA
      </Button>
      <Button onClick={onAddToCart} size="lg" variant="outline" className="w-full h-12 sm:h-13 text-base font-semibold gap-2 rounded-xl">
        <ShoppingBag className="h-5 w-5" />
        ADICIONAR AO CARRINHO
      </Button>
    </Section>
  );
}

interface BadgesProps {
  maxInstallments: number;
  productionTime: string;
}

export function ProductTrustBadges({ maxInstallments, productionTime }: BadgesProps) {
  const items = [
    { icon: Shield, text: 'Compra Segura' },
    { icon: Clock, text: 'Entrega Rápida' },
    { icon: CreditCard, text: `Até ${maxInstallments}x s/ juros` },
    { icon: Package, text: productionTime },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="list" aria-label="Garantias">
      {items.map(({ icon: Icon, text }) => (
        <div key={text} role="listitem" className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/30 p-2.5 sm:p-3 text-xs sm:text-sm text-foreground">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <span className="leading-tight">{text}</span>
        </div>
      ))}
    </div>
  );
}
