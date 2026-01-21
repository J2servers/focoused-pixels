import { Minus, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { discountTiers } from '@/data/store';

interface ProductQuantityCalculatorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  unitPrice: number;
  minQuantity?: number;
}

export const ProductQuantityCalculator = ({ 
  quantity, 
  onQuantityChange, 
  unitPrice,
  minQuantity = 1
}: ProductQuantityCalculatorProps) => {
  // Calcular desconto baseado na quantidade
  const getDiscountPercent = (qty: number): number => {
    let discount = 0;
    for (const tier of discountTiers) {
      if (qty >= tier.quantity) {
        discount = tier.discount;
      }
    }
    return discount;
  };

  const currentDiscount = getDiscountPercent(quantity);
  const discountedPrice = unitPrice * (1 - currentDiscount / 100);
  const totalPrice = discountedPrice * quantity;
  const savings = (unitPrice * quantity) - totalPrice;

  // Próximo tier de desconto
  const nextTier = discountTiers.find(t => t.quantity > quantity);

  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minQuantity;
    onQuantityChange(Math.max(minQuantity, value));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Quantidade
        </label>
        {minQuantity > 1 && (
          <span className="text-xs text-muted-foreground">
            Mínimo: {minQuantity} unidades
          </span>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= minQuantity}
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          min={minQuantity}
          className="w-20 h-10 text-center border border-input rounded-md font-medium text-lg bg-background"
        />
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Quick quantity buttons */}
        <div className="hidden sm:flex gap-1 ml-2">
          {[10, 20, 50, 100].map((qty) => (
            <Button
              key={qty}
              variant={quantity === qty ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onQuantityChange(qty)}
              className="text-xs px-2"
            >
              {qty}
            </Button>
          ))}
        </div>
      </div>

      {/* Discount Tiers Info */}
      <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Tag className="h-4 w-4 text-primary" />
          <span>Descontos por quantidade</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {discountTiers.map((tier) => (
            <div 
              key={tier.quantity}
              className={`text-center p-2 rounded-md transition-all ${
                quantity >= tier.quantity 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background border border-border'
              }`}
            >
              <div className="text-xs font-medium">+{tier.quantity}</div>
              <div className="text-sm font-bold">{tier.discount}%</div>
            </div>
          ))}
        </div>

        {nextTier && (
          <p className="text-xs text-muted-foreground">
            Adicione mais {nextTier.quantity - quantity} unidades para ganhar {nextTier.discount}% de desconto!
          </p>
        )}
      </div>

      {/* Price Summary */}
      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Preço unitário:</span>
          <span>R$ {unitPrice.toFixed(2)}</span>
        </div>
        
        {currentDiscount > 0 && (
          <>
            <div className="flex justify-between text-sm text-success">
              <span className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                  -{currentDiscount}%
                </Badge>
                Desconto aplicado:
              </span>
              <span>- R$ {savings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Preço com desconto:</span>
              <span>R$ {discountedPrice.toFixed(2)} /un</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
          <span>Total ({quantity}x):</span>
          <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
