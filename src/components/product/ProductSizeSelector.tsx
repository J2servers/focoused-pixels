import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductSizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
}

export const ProductSizeSelector = ({ 
  sizes, 
  selectedSize, 
  onSelectSize 
}: ProductSizeSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Tamanho
        </label>
        {selectedSize && (
          <span className="text-sm text-muted-foreground">
            Selecionado: {selectedSize}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <Button
            key={size}
            variant={selectedSize === size ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelectSize(size)}
            className={cn(
              "min-w-[4rem] transition-all",
              selectedSize === size && "ring-2 ring-primary/20"
            )}
          >
            {size}
          </Button>
        ))}
      </div>
    </div>
  );
};
