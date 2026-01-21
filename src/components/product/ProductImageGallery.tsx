import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const getBadgeLabel = () => {
    if (badge === 'desconto' && discount) return `${discount}% OFF`;
    return badge ? badgeLabels[badge] : null;
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Dialog>
        <div className="relative aspect-square bg-muted rounded-xl overflow-hidden group">
          {badge && (
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
          )}
          
          <img
            src={images[currentIndex]}
            alt={`${productName} - Imagem ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Zoom Button */}
          <DialogTrigger asChild>
            <button 
              className="absolute bottom-4 right-4 bg-background/90 hover:bg-background p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
              aria-label="Ampliar imagem"
            >
              <ZoomIn className="h-5 w-5 text-foreground" />
            </button>
          </DialogTrigger>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 bg-background/90 px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Zoom Dialog */}
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          <img
            src={images[currentIndex]}
            alt={`${productName} - Ampliado`}
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                idx === currentIndex 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <img 
                src={img} 
                alt={`Miniatura ${idx + 1}`} 
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
