import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { Clock } from 'lucide-react';

export function RecentlyViewedBar() {
  const { items } = useRecentlyViewed();

  if (items.length < 2) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h3 className="flex items-center gap-2 text-lg font-bold mb-4">
          <Clock className="h-5 w-5 text-primary" />
          Vistos Recentemente
        </h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
          {items.slice(0, 8).map((item) => (
            <Link
              key={item.slug}
              to={`/produto/${item.slug}`}
              className="flex-shrink-0 w-28 group"
            >
              <div className="aspect-square rounded-xl overflow-hidden neu-raised card-lift mb-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <p className="text-xs font-medium line-clamp-2 text-foreground/80 group-hover:text-primary transition-colors">
                {item.name}
              </p>
              <p className="text-xs font-bold text-primary mt-0.5">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
