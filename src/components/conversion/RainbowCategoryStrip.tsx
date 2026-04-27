/**
 * RainbowCategoryStrip - Single elegant horizontal line of categories
 * Discreto, tipografia refinada, hover sutil com underline animado
 */
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

export function RainbowCategoryStrip({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="border-y border-border/40 bg-background/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <nav
          aria-label="Categorias"
          className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-none py-3 md:py-4"
        >
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center flex-shrink-0">
              {i > 0 && (
                <span aria-hidden className="text-border/60 select-none px-2 md:px-3">·</span>
              )}
              <Link
                to={`/categoria/${cat.slug}`}
                className="group relative inline-flex items-center px-2 md:px-3 py-1.5 text-[13px] md:text-sm font-medium tracking-wide text-foreground/75 hover:text-foreground transition-colors whitespace-nowrap"
                style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
              >
                <span className="relative">
                  {cat.name}
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-primary/0 via-primary to-primary/0 scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300"
                  />
                </span>
              </Link>
            </div>
          ))}
          <Link
            to="/categorias"
            className="ml-auto pl-3 text-[11px] md:text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
          >
            Ver todas
          </Link>
        </nav>
      </div>
    </section>
  );
}
