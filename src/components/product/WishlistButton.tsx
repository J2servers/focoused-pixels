/**
 * WishlistButton - Heart toggle for product wishlist
 */
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  className?: string;
  size?: 'sm' | 'md';
}

export function WishlistButton({ product, className, size = 'md' }: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const isWished = isInWishlist(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(isWished ? 'Removido dos favoritos' : 'Adicionado aos favoritos ❤️');
  };

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'rounded-full flex items-center justify-center transition-all duration-200 active:scale-95',
        isWished
          ? 'text-destructive'
          : 'text-muted-foreground hover:text-destructive',
        btnSize,
        className
      )}
      title={isWished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart
        className={cn(iconSize, isWished && 'fill-current')}
      />
    </button>
  );
}
