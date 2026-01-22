import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '@/hooks/useProducts';

export function MobileCategoryGrid() {
  const { data: categories = [] } = useCategories();
  
  // Filter only parent categories
  const parentCategories = categories.filter(c => !c.parent_id).slice(0, 8);

  if (parentCategories.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-base font-bold">Categorias</h2>
        <Link to="/categorias" className="text-sm text-primary font-medium flex items-center">
          Ver todas
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2">
          {parentCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/categoria/${category.slug}`}
                className="flex flex-col items-center w-20 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-1.5 transition-transform group-active:scale-95 overflow-hidden border border-primary/10">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <span className="text-xs text-center font-medium text-foreground line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
