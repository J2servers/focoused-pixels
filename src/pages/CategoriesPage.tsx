import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { MobileHeader, MobileBottomNav } from '@/components/mobile';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const isMobile = useIsMobile();
  
  // Get parent categories
  const parentCategories = categories.filter(c => !c.parent_id);
  
  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return categories.filter(c => c.parent_id === parentId);
  };

  const content = (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Todas as Categorias</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : parentCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma categoria disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {parentCategories.map((category, index) => {
            const subcategories = getSubcategories(category.id);
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/categoria/${category.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">📦</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-bold text-white text-sm md:text-base">
                        {category.name}
                      </h3>
                      {subcategories.length > 0 && (
                        <p className="text-white/80 text-xs mt-0.5">
                          {subcategories.length} subcategoria{subcategories.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
                
                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {subcategories.slice(0, 3).map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/categoria/${category.slug}/${sub.slug}`}
                        className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors px-1"
                      >
                        <span className="truncate">{sub.name}</span>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      </Link>
                    ))}
                    {subcategories.length > 3 && (
                      <Link
                        to={`/categoria/${category.slug}`}
                        className="text-xs text-primary font-medium px-1"
                      >
                        +{subcategories.length - 3} mais
                      </Link>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-20">
        <MobileHeader />
        <main className="flex-1">
          {content}
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />
      <main className="flex-1">
        {content}
      </main>
      <DynamicFooter />
    </div>
  );
}
