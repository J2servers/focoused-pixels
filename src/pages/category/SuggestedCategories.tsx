import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export interface SuggestedCat { id: string; slug: string; name: string; parent_id: string | null }

export function SuggestedCategories({ categories }: { categories: SuggestedCat[] }) {
  const parents = categories.filter(c => !c.parent_id).slice(0, 4);
  if (parents.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-2">Explore outras categorias:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {parents.map(c => (
          <Link key={c.id} to={`/categoria/${c.slug}`}>
            <Badge variant="outline" className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
