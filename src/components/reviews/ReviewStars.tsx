import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const ReviewStars = ({ 
  rating, 
  size = 'md', 
  interactive = false,
  onRatingChange 
}: ReviewStarsProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          onClick={() => handleClick(i)}
          className={cn(
            sizeClasses[size],
            i < Math.floor(rating) 
              ? 'fill-accent text-accent' 
              : 'fill-muted text-muted-foreground/30',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
        />
      ))}
    </div>
  );
};
