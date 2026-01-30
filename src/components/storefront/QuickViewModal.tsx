import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, MessageCircle, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  description?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  freeShipping?: boolean;
  badge?: string;
  discount?: number;
}

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewModal({ product, open, onOpenChange }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { whatsapp, whatsappMessageTemplate } = useSiteSettings();

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    onOpenChange(false);
  };

  const handleWhatsApp = () => {
    const message = `Olá! Tenho interesse no produto: ${product.name} - R$ ${product.price.toFixed(2).replace('.', ',')}`;
    const phone = whatsapp?.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative bg-muted aspect-square">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={allImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-primary w-6' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {product.badge && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                {product.badge === 'desconto' ? `${product.discount}% OFF` : product.badge.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-bold pr-8">{product.name}</DialogTitle>
            </DialogHeader>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating!) ? 'fill-amber-400 text-amber-400' : 'text-muted'
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">({product.reviews})</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-4">
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through block">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
              <span className="text-3xl font-bold text-primary">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-sm text-muted-foreground block mt-1">
                ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
              </span>
            </div>

            {product.freeShipping && (
              <div className="flex items-center gap-2 mt-3 text-success text-sm">
                <Truck className="h-4 w-4" />
                <span>Frete grátis</span>
              </div>
            )}

            <Separator className="my-4" />

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm font-medium">Quantidade:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto pt-6">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.inStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Link to={`/produto/${product.slug}`}>
                  <Button variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
