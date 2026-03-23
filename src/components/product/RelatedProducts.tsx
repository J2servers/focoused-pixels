/**
 * RelatedProducts - Now fetches from DB by category
 * Improvements: #46 DB-based related products, #47 Same category logic, #48 Fallback to featured
 */
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeInView } from '@/components/animations';
import { useProductsByCategory, useFeaturedProducts } from '@/hooks/useProducts';

interface RelatedProductsProps {
  product: {
    id: string;
    category?: string;
    slug: string;
    name: string;
  };
  limit?: number;
}

export function RelatedProducts({ product, limit = 4 }: RelatedProductsProps) {
  // #46 Fetch from DB by same category
  const { data: categoryProducts = [] } = useProductsByCategory(product.category || undefined);
  // #48 Fallback to featured
  const { data: featuredProducts = [] } = useFeaturedProducts(limit + 1);

  // Filter out current product and limit
  const sameCategory = categoryProducts.filter(p => p.id !== product.id).slice(0, limit);
  const featured = featuredProducts.filter(p => p.id !== product.id).slice(0, limit);
  
  const relatedProducts = sameCategory.length >= 2 ? sameCategory : featured;

  if (relatedProducts.length === 0) return null;

  return (
    <FadeInView>
      <section id="product-related" className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          {sameCategory.length >= 2 ? 'Produtos Relacionados' : 'Você também pode gostar'}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={`/produto/${item.slug}`} className="group block">
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Card className="h-full overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <motion.img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                        loading="lazy"
                      />
                      
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {item.badge === 'lancamento' && (
                          <Badge className="bg-accent text-accent-foreground text-xs">NOVO</Badge>
                        )}
                        {item.discount && item.discount > 0 && (
                          <Badge variant="destructive" className="text-xs">-{item.discount}%</Badge>
                        )}
                      </div>

                      {item.freeShipping && (
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="bg-emerald-500/90 text-white text-xs gap-1">
                            <Truck className="h-3 w-3" />
                            Frete Grátis
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(item.rating)
                                  ? 'fill-accent text-accent'
                                  : 'fill-muted text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({item.reviews})</span>
                      </div>

                      <h3 className="font-medium text-sm md:text-base text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>

                      <div className="space-y-0.5">
                        {item.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            R$ {item.originalPrice.toFixed(2).replace('.', ',')}
                          </p>
                        )}
                        <p className="text-lg font-bold text-primary">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </FadeInView>
  );
}
