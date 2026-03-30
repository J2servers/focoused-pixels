import { Tag } from 'lucide-react';

interface DiscountTier {
  quantity: number;
  discount: number;
}

interface VolumeDiscountTableProps {
  tiers: DiscountTier[];
  currentQuantity?: number;
}

export const VolumeDiscountTable = ({ tiers, currentQuantity = 1 }: VolumeDiscountTableProps) => {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-bold text-primary">Compre mais, pague menos!</h4>
      </div>

      <div className="space-y-1">
        {tiers.map((tier) => {
          const isActive = currentQuantity >= tier.quantity;
          return (
            <div
              key={tier.quantity}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/15 text-primary font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="font-bold">{tier.discount}% OFF</span>
              <span>Comprando {tier.quantity} unidades ou mais</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
