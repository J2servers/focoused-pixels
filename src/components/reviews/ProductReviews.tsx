import { useState, useEffect, useMemo } from 'react';
import { MessageSquarePlus, Star, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'with_images';

export const ProductReviews = ({ productSlug, productName }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // #35 Sort reviews
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  // #36 Filter by rating
  const [filterRating, setFilterRating] = useState<number | null>(null);
  // #37 Pagination
  const [visibleCount, setVisibleCount] = useState(5);

  const fetchReviews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('reviews_public')
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

  // #38 Review with images count
  const reviewsWithImages = reviews.filter(r => r.images && r.images.length > 0).length;

  // Apply sort and filter
  const processedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(r => r.rating === filterRating);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'with_images':
        filtered.sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [reviews, sortBy, filterRating]);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchReviews();
  };

  return (
    <section id="product-reviews" className="mt-16 border-t border-border pt-12">
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

              {/* Distribution - #39 Clickable filter */}
              <div className="space-y-3">
                {ratingDistribution.map(({ star, count, percentage }) => (
                  <button
                    key={star}
                    onClick={() => setFilterRating(filterRating === star ? null : star)}
                    className={`w-full flex items-center gap-3 rounded-lg px-1 py-0.5 transition-colors ${
                      filterRating === star ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-sm text-muted-foreground w-12">
                      {star} {star === 1 ? 'estrela' : 'estrelas'}
                    </span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </button>
                ))}
              </div>

              {/* #40 Quick stats */}
              {reviewsWithImages > 0 && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  📸 {reviewsWithImages} avaliação(ões) com fotos
                </p>
              )}

              {filterRating !== null && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterRating(null)}
                  className="w-full mt-3 text-xs"
                >
                  Limpar filtro
                </Button>
              )}
            </div>
          </FadeInView>

          {/* Reviews List */}
          <div className="space-y-4">
            {/* #41 Sort and filter controls */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {processedReviews.length} {processedReviews.length === 1 ? 'avaliação' : 'avaliações'}
                {filterRating !== null && ` com ${filterRating} estrela${filterRating > 1 ? 's' : ''}`}
              </p>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <ArrowUpDown className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigas</SelectItem>
                  <SelectItem value="highest">Melhor avaliadas</SelectItem>
                  <SelectItem value="lowest">Pior avaliadas</SelectItem>
                  <SelectItem value="with_images">Com fotos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {processedReviews.slice(0, visibleCount).map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {/* #42 Load more */}
            {visibleCount < processedReviews.length && (
              <Button
                variant="outline"
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="w-full"
              >
                Ver mais avaliações ({processedReviews.length - visibleCount} restantes)
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
