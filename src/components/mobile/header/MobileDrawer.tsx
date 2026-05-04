import { Link } from 'react-router-dom';
import { ChevronRight, HelpCircle, Info, Package, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetClose } from '@/components/ui/sheet';

interface Category { id: string; name: string; slug: string; }

interface Props {
  company?: { company_name?: string | null } | null;
  categories: Category[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleCategorySelect: (slug: string, closeSearch?: boolean) => void;
}

export function MobileDrawer({
  company, categories, loading, searchQuery, setSearchQuery, handleSearch, handleCategorySelect,
}: Props) {
  return (
    <div className="flex flex-col p-5 pt-8 gap-5">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.12)' }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
            boxShadow: '3px 3px 8px hsl(var(--neu-dark) / 0.3), -2px -2px 6px hsl(var(--neu-light) / 0.2)',
          }}
        >
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">{company?.company_name || 'Loja'}</p>
          <p className="text-[11px] text-muted-foreground">Explore nosso catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        <div className="rounded-xl overflow-hidden" style={{
          boxShadow: 'inset 3px 3px 6px hsl(var(--neu-dark) / 0.3), inset -3px -3px 6px hsl(var(--neu-light) / 0.5)',
          border: '1px solid hsl(var(--neon-primary) / 0.1)',
        }}>
          <Input
            type="search"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none bg-transparent h-10 text-sm"
          />
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 6).map((cat) => (
          <SheetClose key={cat.id} asChild>
            <button
              type="button"
              onClick={() => handleCategorySelect(cat.slug, false)}
              className="px-2.5 py-1.5 rounded-lg text-xs border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              {cat.name}
            </button>
          </SheetClose>
        ))}
      </div>

      <nav className="flex flex-col gap-1.5">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 mb-1">Categorias</p>
        {loading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)
        ) : (
          categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <SheetClose asChild>
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
                  style={{
                    background: 'hsl(var(--background))',
                    boxShadow: '3px 3px 8px hsl(var(--neu-dark) / 0.2), -3px -3px 8px hsl(var(--neu-light) / 0.4)',
                    border: '1px solid hsl(var(--neon-primary) / 0.08)',
                  }}
                >
                  <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </SheetClose>
            </motion.div>
          ))
        )}
      </nav>

      <div className="pt-3" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.08)' }}>
        {[
          { to: '/pagamento', icon: Sparkles, label: 'Solicitar Orçamento' },
          { to: '/rastreio', icon: Package, label: 'Rastrear Pedido' },
          { to: '/sobre', icon: Info, label: 'Sobre Nós' },
          { to: '/faq', icon: HelpCircle, label: 'FAQ' },
        ].map((link) => (
          <SheetClose key={link.to} asChild>
            <Link
              to={link.to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          </SheetClose>
        ))}
      </div>
    </div>
  );
}
