import { useState } from 'react';
import { ShoppingBag, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface BuyTogetherProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
}

interface BuyTogetherSectionProps {
  mainProduct: BuyTogetherProduct;
  relatedProducts: BuyTogetherProduct[];
  bundleDiscount?: number; // percentage
}

export const BuyTogetherSection = ({
  mainProduct,
  relatedProducts,
  bundleDiscount = 10,
}: BuyTogetherSectionProps) => {
  const { addItem } = useCart();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(relatedProducts.slice(0, 2).map((p) => p.id))
  );

  if (relatedProducts.length === 0) return null;

  const toggleProduct = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedProducts = relatedProducts.filter((p) => selectedIds.has(p.id));
  const allProducts = [mainProduct, ...selectedProducts];
  const originalTotal = allProducts.reduce((sum, p) => sum + p.price, 0);
  const discountedTotal = originalTotal * (1 - bundleDiscount / 100);

  const handleAddBundle = () => {
    allProducts.forEach((p) => {
      addItem({ id: p.id, name: p.name, price: p.price * (1 - bundleDiscount / 100), image: p.image, quantity: 1 });
    });
    toast.success(`${allProducts.length} produtos adicionados com ${bundleDiscount}% de desconto!`);
  };

  return (
    <div className="rounded-xl border border-border/50 p-4 md:p-6 space-y-4 bg-card/50">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-primary" />
        Compre Junto
      </h3>

      <div className="flex flex-wrap items-center gap-3">
        {/* Main product */}
        <div className="flex flex-col items-center w-24">
          <img
            src={mainProduct.image}
            alt={mainProduct.name}
            className="w-20 h-20 object-cover rounded-lg border border-border/30"
          />
          <p className="text-xs text-center mt-1 line-clamp-2">{mainProduct.name}</p>
        </div>

        {relatedProducts.slice(0, 3).map((product) => (
          <div key={product.id} className="flex items-center gap-3">
            <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              onClick={() => toggleProduct(product.id)}
              className={`flex flex-col items-center w-24 p-2 rounded-lg border-2 transition-all ${
                selectedIds.has(product.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                {selectedIds.has(product.id) && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-1 line-clamp-2">{product.name}</p>
            </button>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div>
          <p className="text-sm text-muted-foreground line-through">
            R$ {originalTotal.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-lg font-bold text-primary">
            R$ {discountedTotal.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-xs font-medium text-green-600 dark:text-green-400">
            {bundleDiscount}% de desconto
          </p>
        </div>

        <Button onClick={handleAddBundle} className="rounded-xl gap-2">
          <ShoppingBag className="h-4 w-4" />
          Adicionar ao carrinho
        </Button>
      </div>
    </div>
  );
};
