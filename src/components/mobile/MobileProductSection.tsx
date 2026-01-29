import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileProductCard } from './MobileProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  description?: string;
  badge?: string;
  freeShipping?: boolean;
  inStock?: boolean;
}

interface MobileProductSectionProps {
  title: string;
  products: Product[];
  categorySlug?: string;
  showAll?: boolean;
}

export function MobileProductSection({ 
  title, 
  products, 
  categorySlug,
  showAll = true 
}: MobileProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold">{title}</h2>
        {showAll && categorySlug && (
          <Link 
            to={`/categoria/${categorySlug}`} 
            className="text-sm text-primary font-medium flex items-center"
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      
      {/* Horizontal Scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2">
          {products.slice(0, 6).map((product, index) => (
            <motion.div
              key={product.id}
              className="w-[160px] flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MobileProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MobileProductGrid({ 
  products,
  title
}: { 
  products: Product[];
  title?: string;
}) {
  return (
    <section className="py-4 px-4">
      {title && (
        <h2 className="text-base font-bold mb-3">{title}</h2>
      )}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <MobileProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
