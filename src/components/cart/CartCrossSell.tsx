/**
 * CartCrossSell - Cross-sell recommendations in cart
 */
import { useProducts } from '@/hooks/useProducts';
import { useCart, CartItem } from '@/hooks/useCart';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CartCrossSellProps {
  cartItems: CartItem[];
}

export function CartCrossSell({ cartItems }: CartCrossSellProps) {
  const { data: allProducts = [] } = useProducts();
  const { addItem } = useCart();

  const recommendations = useMemo(() => {
    const cartIds = new Set(cartItems.map(i => i.id));
    // Pick products not in cart, prioritize featured
    return allProducts
      .filter(p => !cartIds.has(p.id) && p.inStock)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [allProducts, cartItems]);

  if (recommendations.length === 0) return null;

  const handleAdd = (product: typeof recommendations[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.name} adicionado!`);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h3 className="font-bold text-base">Clientes também compraram</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {recommendations.map((product) => (
          <div key={product.id} className="rounded-xl neu-flat p-3 flex flex-col">
            <Link to={`/produto/${product.slug}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg mb-2"
                loading="lazy"
              />
            </Link>
            <Link
              to={`/produto/${product.slug}`}
              className="text-xs font-medium line-clamp-2 hover:text-primary transition-colors mb-1"
            >
              {product.name}
            </Link>
            <span className="text-sm font-bold text-primary mt-auto">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 text-xs rounded-lg w-full"
              onClick={() => handleAdd(product)}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Adicionar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
