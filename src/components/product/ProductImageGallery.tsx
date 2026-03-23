import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Maximize2, X } from 'lucide-react';
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
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const imageRef = useRef<HTMLDivElement>(null);

  // #25 Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); nextImage(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevImage(); }
      if (e.key === 'Escape' && fullscreen) { setFullscreen(false); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreen, images.length]);

  const nextImage = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomLevel(1);
  }, [images.length]);
  
  const prevImage = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  // #26 Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    
    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      if (deltaX > 0) prevImage();
      else nextImage();
    }
  };

  // #27 Hover zoom on desktop
  const handleMouseMove = (e: React.MouseEvent) => {
    if (zoomLevel <= 1 || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleDoubleClick = () => {
    setZoomLevel(prev => prev === 1 ? 2 : 1);
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
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  // #28 Fullscreen gallery
  if (fullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
          <div className="flex items-center justify-between p-4">
            <span className="text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
            <button onClick={() => setFullscreen(false)} className="text-white/70 hover:text-white p-2">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div
            className="flex-1 flex items-center justify-center relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 p-3 rounded-full">
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button onClick={nextImage} className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 p-3 rounded-full">
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${productName} - Imagem ${currentIndex + 1}`}
                className="max-h-[80vh] max-w-[90vw] object-contain"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              />
            </AnimatePresence>
          </div>
          {/* Thumbnail strip */}
          <div className="flex gap-2 justify-center p-4 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setDirection(idx > currentIndex ? 1 : -1); setCurrentIndex(idx); }}
                className={cn(
                  'w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all',
                  idx === currentIndex ? 'border-white' : 'border-white/20 opacity-50'
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Image */}
      <Dialog>
        <div
          ref={imageRef}
          className="relative aspect-square bg-muted rounded-xl overflow-hidden group cursor-crosshair"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onDoubleClick={handleDoubleClick}
        >
          {badge && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Badge 
                className={cn(
                  "absolute top-4 left-4 z-10 text-xs font-bold px-3 py-1",
                  badge === 'esgotado' ? 'bg-muted-foreground' 
                    : badge === 'lancamento' ? 'bg-primary'
                    : badge === 'desconto' ? 'bg-destructive'
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
              style={zoomLevel > 1 ? {
                transform: `scale(${zoomLevel})`,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              } : undefined}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            />
          </AnimatePresence>

          {/* Fullscreen Button - #28 */}
          <motion.button
            onClick={() => setFullscreen(true)}
            className="absolute top-4 right-4 bg-background/90 hover:bg-background p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Tela cheia"
            whileHover={{ scale: 1.1 }}
          >
            <Maximize2 className="h-4 w-4 text-foreground" />
          </motion.button>

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

          {/* Image Counter + dot indicators */}
          {images.length > 1 && (
            <>
              <motion.div 
                className="absolute bottom-4 left-4 bg-background/90 px-3 py-1 rounded-full text-sm font-medium hidden sm:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {currentIndex + 1} / {images.length}
              </motion.div>
              {/* #29 Mobile dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setDirection(idx > currentIndex ? 1 : -1); setCurrentIndex(idx); }}
                    className={cn(
                      'rounded-full transition-all',
                      idx === currentIndex
                        ? 'w-6 h-2 bg-primary'
                        : 'w-2 h-2 bg-foreground/30'
                    )}
                  />
                ))}
              </div>
            </>
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

      {/* Thumbnails - #30 Improved active state */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
                setZoomLevel(1);
              }}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                idx === currentIndex 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
