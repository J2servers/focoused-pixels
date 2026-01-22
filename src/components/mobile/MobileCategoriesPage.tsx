import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { categories } from '@/data/products';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';

const categoryIcons: Record<string, string> = {
  'home-decor': '🏠',
  'broches': '✨',
  'qr-code': '📱',
  'letreiros': '💡',
  'placas-porta': '🚪',
  'espelhos': '🪞',
  'caixas': '📦',
  'brindes': '🎁',
  'infantil': '🧸',
};

export const MobileCategoriesPage = memo(() => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader />
      
      <main className="pt-16 px-4">
        <h1 className="text-xl font-bold mb-4">Categorias</h1>
        
        <div className="space-y-2">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/categoria/${category.slug}`}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {categoryIcons[category.slug] || '📦'}
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    {category.subcategories && category.subcategories.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {category.subcategories.length} subcategorias
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              
              {/* Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="ml-12 mt-1 space-y-1">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/categoria/${category.slug}/${sub.slug}`}
                      className="flex items-center justify-between py-2 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>{sub.name}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </main>
      
      <MobileBottomNav />
    </div>
  );
});

MobileCategoriesPage.displayName = 'MobileCategoriesPage';
