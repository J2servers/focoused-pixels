import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Truck, ShoppingBag, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  freeShipping: boolean;
  badge?: 'lancamento' | 'desconto' | 'brinde' | 'esgotado';
  discount?: number;
}

interface MobileVerticalCarouselProps {
  products: Product[];
  categoryName: string;
  categorySlug: string;
}

export function MobileVerticalCarousel({ 
  products, 
  categoryName, 
  categorySlug 
}: MobileVerticalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  const y = useMotionValue(0);
  const scale = useTransform(y, [-200, 0, 200], [0.8, 1, 0.8]);
  const opacity = useTransform(y, [-200, 0, 200], [0.3, 1, 0.3]);

  const goToSlide = useCallback((index: number) => {
    if (index < 0) {
      setCurrentIndex(products.length - 1);
    } else if (index >= products.length) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(index);
    }
  }, [products.length]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    
    if (info.offset.y < -threshold) {
      goToSlide(currentIndex + 1);
    } else if (info.offset.y > threshold) {
      goToSlide(currentIndex - 1);
    }
    
    y.set(0);
  };

  // Auto-play with pause on interaction
  useEffect(() => {
    if (!isDragging && products.length > 1) {
      autoPlayRef.current = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 4000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, isDragging, products.length, goToSlide]);

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];
  
  const badgeVariants: Record<string, { label: string; className: string }> = {
    lancamento: { label: 'NOVO', className: 'bg-accent text-accent-foreground' },
    desconto: { label: `${currentProduct.discount}% OFF`, className: 'bg-destructive text-destructive-foreground' },
    brinde: { label: 'BRINDE', className: 'bg-success text-success-foreground' },
    esgotado: { label: 'ESGOTADO', className: 'bg-muted text-muted-foreground' },
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[480px] md:hidden overflow-hidden rounded-2xl bg-gradient-to-b from-card to-background shadow-xl"
    >
      {/* Category Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-background/90 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground truncate flex-1">{categoryName}</h3>
          <Link to={`/categoria/${categorySlug}`}>
            <Button variant="ghost" size="sm" className="text-primary text-xs gap-1">
              <ShoppingBag className="h-3 w-3" />
              Ver todos
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <motion.button
          onClick={() => goToSlide(currentIndex - 1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg"
        >
          <ChevronUp className="h-4 w-4 text-foreground" />
        </motion.button>
        <motion.button
          onClick={() => goToSlide(currentIndex + 1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg"
        >
          <ChevronDown className="h-4 w-4 text-foreground" />
        </motion.button>
      </div>

      {/* Vertical Progress Indicators */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
        {products.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex 
                ? 'w-2 h-8 bg-primary shadow-glow' 
                : 'w-2 h-2 bg-muted-foreground/40 hover:bg-muted-foreground/60'
            }`}
            whileTap={{ scale: 0.9 }}
            layout
          />
        ))}
      </div>

      {/* Product Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProduct.id}
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.3}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ scale, opacity }}
          className="absolute inset-0 pt-16 pb-4 px-4 cursor-grab active:cursor-grabbing"
        >
          <Link to={`/produto/${currentProduct.slug}`} className="block h-full">
            <div className="relative h-full rounded-2xl overflow-hidden bg-card shadow-2xl border border-border/50">
              {/* Product Image */}
              <div className="relative h-[55%] overflow-hidden">
                <motion.img
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                
                {/* Badge */}
                {currentProduct.badge && badgeVariants[currentProduct.badge] && (
                  <Badge className={`absolute top-4 left-4 ${badgeVariants[currentProduct.badge].className} shadow-lg`}>
                    {badgeVariants[currentProduct.badge].label}
                  </Badge>
                )}

                {/* Free Shipping */}
                {currentProduct.freeShipping && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="bg-success/90 text-success-foreground gap-1.5 shadow-lg">
                      <Truck className="h-3 w-3" />
                      Frete Grátis
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-3 h-[45%] flex flex-col justify-between">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(currentProduct.rating)
                            ? 'fill-accent text-accent'
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({currentProduct.reviews} avaliações)
                  </span>
                </div>

                {/* Name */}
                <h4 className="text-lg font-bold text-foreground line-clamp-2 leading-tight">
                  {currentProduct.name}
                </h4>

                {/* Price */}
                <div className="space-y-1">
                  {currentProduct.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      R$ {currentProduct.originalPrice.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">
                      R$ {currentProduct.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button className="w-full font-bold text-base py-6 shadow-lg">
                  Ver Produto
                </Button>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Swipe Hint */}
      <motion.div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronUp className="h-3 w-3" />
        </motion.div>
        <span>Deslize para explorar</span>
        <motion.div
          animate={{ y: [2, -2, 2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
      </motion.div>
    </div>
  );
}
