import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2 } from 'lucide-react';
import { ReviewStars } from './ReviewStars';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { FadeInView } from '@/components/animations';

interface ReviewCardProps {
  review: {
    id: string;
    customer_name: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    is_verified_purchase: boolean;
    created_at: string;
  };
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const initials = review.customer_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <FadeInView>
      <div className="border border-border rounded-xl p-5 bg-card">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold text-foreground">
                {review.customer_name}
              </span>
              {review.is_verified_purchase && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Compra verificada
                </Badge>
              )}
            </div>

            {/* Rating & Date */}
            <div className="flex items-center gap-3 mb-3">
              <ReviewStars rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-medium text-foreground mb-2">{review.title}</h4>
            )}

            {/* Comment */}
            <p className="text-muted-foreground text-sm leading-relaxed">
              {review.comment}
            </p>

            {/* Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {review.images.map((image, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <button className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                        <img
                          src={image}
                          alt={`Foto ${index + 1} da avaliação`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-2">
                      <img
                        src={image}
                        alt={`Foto ${index + 1} da avaliação`}
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeInView>
  );
};
