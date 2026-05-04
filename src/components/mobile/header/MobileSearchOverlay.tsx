import { Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Category { id: string; name: string; slug: string; }

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  onClose: () => void;
  onCategorySelect: (slug: string) => void;
  suggestions: Category[];
}

export function MobileSearchOverlay({
  searchQuery, setSearchQuery, handleSearch, onClose, onCategorySelect, suggestions,
}: Props) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: 'hsl(var(--foreground) / 0.08)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="fixed inset-x-3 top-3 z-50 rounded-2xl p-3"
        style={{
          background: 'hsl(var(--background))',
          boxShadow: `8px 8px 20px hsl(var(--neu-dark) / 0.35), -8px -8px 20px hsl(var(--neu-light) / 0.5), inset 0 1px 0 hsl(var(--neu-light) / 0.4)`,
          border: '1px solid hsl(var(--neon-primary) / 0.2)',
        }}
      >
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={onClose} className="neu-icon-btn-sm shrink-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </motion.button>
          <div className="flex-1 rounded-xl overflow-hidden" style={{
            boxShadow: 'inset 3px 3px 6px hsl(var(--neu-dark) / 0.3), inset -3px -3px 6px hsl(var(--neu-light) / 0.5)',
            border: '1px solid hsl(var(--neon-primary) / 0.15)',
          }}>
            <Input
              type="search"
              placeholder="O que você procura?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 shadow-none bg-transparent h-10 text-sm"
              autoFocus
            />
          </div>
          <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="rounded-xl shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2 px-1">
            {searchQuery.trim() ? 'Categorias sugeridas' : 'Categorias populares'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategorySelect(cat.slug)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border border-primary/20 hover:bg-primary/10"
              >
                {cat.name}
              </button>
            ))}
            {suggestions.length === 0 && (
              <span className="text-xs text-muted-foreground px-1">Nenhuma categoria encontrada.</span>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
