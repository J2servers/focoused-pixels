import { useState, useEffect } from 'react';
import { MessageSquarePlus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { ReviewStars } from './ReviewStars';
import { supabase } from '@/integrations/supabase/client';
import { FadeInView } from '@/components/animations';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  is_verified_purchase: boolean;
  created_at: string;
}

interface ProductReviewsProps {
  productSlug: string;
  productName: string;
}

export const ProductReviews = ({ productSlug, productName }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_slug', productSlug)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }));

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchReviews();
  };

  return (
    <section className="mt-16 border-t border-border pt-12">
      <FadeInView>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Avaliações de Clientes
          </h2>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Escrever avaliação
            </Button>
          )}
        </div>
      </FadeInView>

      {/* Review Form */}
      {showForm && (
        <FadeInView>
          <div className="bg-muted/30 rounded-xl p-6 mb-8 border border-border">
            <h3 className="text-lg font-semibold mb-4">
              Avaliar: {productName}
            </h3>
            <ReviewForm
              productSlug={productSlug}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </FadeInView>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando avaliações...
        </div>
      ) : reviews.length === 0 ? (
        <FadeInView>
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
            <Star className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Sem avaliações ainda
            </h3>
            <p className="text-muted-foreground mb-4">
              Seja o primeiro a avaliar este produto!
            </p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} variant="outline">
                Escrever primeira avaliação
              </Button>
            )}
          </div>
        </FadeInView>
      ) : (
        <div className="grid lg:grid-cols-[300px_1fr] gap-8">
          {/* Summary */}
          <FadeInView>
            <div className="bg-muted/30 rounded-xl p-6 border border-border h-fit">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-foreground mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <ReviewStars rating={averageRating} size="md" />
                <p className="text-sm text-muted-foreground mt-2">
                  {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                </p>
              </div>

              {/* Distribution */}
              <div className="space-y-3">
                {ratingDistribution.map(({ star, count, percentage }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-12">
                      {star} {star === 1 ? 'estrela' : 'estrelas'}
                    </span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
