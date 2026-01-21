import { Link } from 'react-router-dom';
import { Product, getRelatedProducts } from '@/data/products';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeInView } from '@/components/animations';

interface RelatedProductsProps {
  product: Product;
  limit?: number;
}

export function RelatedProducts({ product, limit = 4 }: RelatedProductsProps) {
  const relatedProducts = getRelatedProducts(product, limit);

  if (relatedProducts.length === 0) return null;

  return (
    <FadeInView>
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Produtos Relacionados
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link 
                to={`/produto/${item.slug}`}
                className="group block"
              >
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
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {item.badge === 'lancamento' && (
                          <Badge className="bg-accent text-accent-foreground text-xs">
                            NOVO
                          </Badge>
                        )}
                        {item.discount && item.discount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{item.discount}%
                          </Badge>
                        )}
                      </div>

                      {/* Free Shipping Badge */}
                      {item.freeShipping && (
                        <div className="absolute bottom-2 left-2">
                          <Badge variant="secondary" className="bg-success/90 text-success-foreground text-xs gap-1">
                            <Truck className="h-3 w-3" />
                            Frete Grátis
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3 md:p-4">
                      {/* Rating */}
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
                        <span className="text-xs text-muted-foreground">
                          ({item.reviews})
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-medium text-sm md:text-base text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div className="space-y-0.5">
                        {item.originalPrice && (
                          <p className="text-xs text-muted-foreground line-through">
                            R$ {item.originalPrice.toFixed(2)}
                          </p>
                        )}
                        <p className="text-lg font-bold text-primary">
                          R$ {item.price.toFixed(2)}
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
