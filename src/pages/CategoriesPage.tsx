import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useProducts';
import { useIsMobile } from '@/hooks/use-mobile';
import { DynamicTopBar, DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { MobileHeader, MobileBottomNav } from '@/components/mobile';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const isMobile = useIsMobile();
  
  const parentCategories = categories.filter(c => !c.parent_id);

  const content = (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold mb-5">Categorias</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
          ))}
        </div>
      ) : parentCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="rounded-2xl neu-concave p-8 max-w-sm mx-auto">
            <p className="text-muted-foreground">Nenhuma categoria disponível.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {parentCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                to={`/categoria/${category.slug}`}
                className="group block"
              >
                <div
                  className="relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.97]"
                  style={{
                    background: 'hsl(var(--background))',
                    boxShadow: '6px 6px 14px hsl(var(--neu-dark) / var(--neu-intensity)), -6px -6px 14px hsl(var(--neu-light) / var(--neu-intensity)), inset 0 1px 0 hsl(var(--neu-light) / 0.4)',
                    border: '1px solid hsl(var(--neon-primary) / 0.15)',
                  }}
                >
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center neu-concave">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  
                  {/* Category name */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-bold text-white text-sm leading-tight drop-shadow-lg">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background pb-20">
        <MobileHeader />
        <main className="flex-1">{content}</main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DynamicTopBar />
      <DynamicMainHeader />
      <NavigationBar />
      <main className="flex-1">
        <div className="container mx-auto">{content}</div>
      </main>
      <DynamicFooter />
    </div>
  );
}
