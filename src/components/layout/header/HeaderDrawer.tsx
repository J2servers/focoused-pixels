import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SheetClose } from '@/components/ui/sheet';

interface CategoryNode { id: string; name: string; slug: string; }

interface Props {
  company?: { company_name?: string | null } | null;
  categoryTree: CategoryNode[];
  categoriesLoading: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export function HeaderDrawer({
  company, categoryTree, categoriesLoading, searchQuery, setSearchQuery, handleSearch,
}: Props) {
  return (
    <div className="flex flex-col gap-5 mt-6 p-5">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid hsl(var(--neon-primary) / 0.15)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--purple-dark)))',
          boxShadow: '0 4px 14px hsl(var(--primary) / 0.4)',
        }}>
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">{company?.company_name || 'Loja'}</p>
          <p className="text-[10px] text-muted-foreground">Navegue pelo catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSearch}>
        <div className="rounded-full overflow-hidden" style={{
          boxShadow: 'inset 3px 3px 8px hsl(var(--neu-dark) / 0.5), inset -3px -3px 8px hsl(var(--neu-light) / 0.7)',
          border: '1px solid hsl(var(--neon-primary) / 0.2)',
        }}>
          <Input
            type="search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none bg-transparent rounded-full pr-10"
          />
        </div>
      </form>

      <nav className="flex flex-col gap-1.5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold px-2 mb-1">Categorias</p>
        {categoriesLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-full" />)
        ) : (
          categoryTree.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <SheetClose asChild>
                <Link
                  to={`/categoria/${cat.slug}`}
                  className="flex items-center justify-between px-4 py-3 rounded-full text-sm font-medium transition-all group hover:text-primary"
                  style={{
                    background: 'hsl(var(--background))',
                    boxShadow: `4px 4px 10px hsl(var(--neu-dark) / 0.35), -4px -4px 10px hsl(var(--neu-light) / 0.6)`,
                    border: '1px solid hsl(var(--neon-primary) / 0.1)',
                  }}
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </SheetClose>
            </motion.div>
          ))
        )}
      </nav>

      <div className="pt-3 flex flex-col gap-1" style={{ borderTop: '1px solid hsl(var(--neon-primary) / 0.1)' }}>
        <SheetClose asChild>
          <Link to="/pagamento" className="py-2.5 px-4 rounded-full text-sm font-medium hover:text-primary transition-colors">
            Solicitar Orçamento
          </Link>
        </SheetClose>
        <SheetClose asChild>
          <Link to="/login" className="py-2.5 px-4 rounded-full text-sm font-medium hover:text-primary transition-colors">
            Minha Conta
          </Link>
        </SheetClose>
      </div>
    </div>
  );
}
