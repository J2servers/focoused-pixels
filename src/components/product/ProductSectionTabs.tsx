/**
 * ProductSectionTabs - Scroll-to-section navigation
 * Improvements: #16 Section tabs, #17 Smooth scroll nav, #18 Active section highlight
 */
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'product-details', label: 'Detalhes' },
  { id: 'product-reviews', label: 'Avaliações' },
  { id: 'product-faq', label: 'FAQ' },
  { id: 'product-related', label: 'Relacionados' },
];

export function ProductSectionTabs() {
  const [active, setActive] = useState('product-details');

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border -mx-4 px-4 mb-8">
      <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-colors',
              active === id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
