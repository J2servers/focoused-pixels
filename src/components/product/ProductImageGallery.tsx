import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  badge?: 'lancamento' | 'desconto' | 'brinde' | 'esgotado';
  discount?: number;
}

const badgeLabels: Record<string, string> = {
  lancamento: 'LANÇAMENTO',
  desconto: 'DESCONTO',
  brinde: 'GANHE BRINDE',
  esgotado: 'ESGOTADO',
};

export const ProductImageGallery = ({ 
  images, 
  productName, 
  badge, 
  discount 
}: ProductImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextImage = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getBadgeLabel = () => {
    if (badge === 'desconto' && discount) return `${discount}% OFF`;
    return badge ? badgeLabels[badge] : null;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Image */}
      <Dialog>
        <div className="relative aspect-square bg-muted rounded-xl overflow-hidden group">
          {badge && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Badge 
                className={cn(
                  "absolute top-4 left-4 z-10 text-xs font-bold px-3 py-1",
                  badge === 'esgotado' 
                    ? 'bg-muted-foreground' 
                    : badge === 'lancamento'
                    ? 'bg-primary'
                    : badge === 'desconto'
                    ? 'bg-destructive'
                    : 'bg-whatsapp'
                )}
              >
                {getBadgeLabel()}
              </Badge>
            </motion.div>
          )}
          
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`${productName} - Imagem ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            />
          </AnimatePresence>

          {/* Zoom Button */}
          <DialogTrigger asChild>
            <motion.button 
              className="absolute bottom-4 right-4 bg-background/90 hover:bg-background p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Ampliar imagem"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ZoomIn className="h-5 w-5 text-foreground" />
            </motion.button>
          </DialogTrigger>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <motion.button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Imagem anterior"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>
              <motion.button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Próxima imagem"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <motion.div 
              className="absolute bottom-4 left-4 bg-background/90 px-3 py-1 rounded-full text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentIndex + 1} / {images.length}
            </motion.div>
          )}
        </div>

        {/* Zoom Dialog */}
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          <motion.img
            src={images[currentIndex]}
            alt={`${productName} - Ampliado`}
            className="w-full h-auto rounded-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </DialogContent>
      </Dialog>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                idx === currentIndex 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <img 
                src={img} 
                alt={`Miniatura ${idx + 1}`} 
                className="w-full h-full object-cover" 
              />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
