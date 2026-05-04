import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FloatingIconBtn } from './FloatingIconBtn';

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function HeaderSearchOverlay({ searchQuery, setSearchQuery, handleSearch, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-x-0 top-0 z-50 h-24 px-4 flex items-center"
      style={{
        background: 'hsl(var(--background))',
        borderBottom: '2px solid hsl(var(--neon-primary) / 0.4)',
      }}
    >
      <form onSubmit={handleSearch} className="flex items-center w-full gap-3">
        <FloatingIconBtn onClick={onClose}>
          <X className="h-4 w-4" />
        </FloatingIconBtn>
        <div className="flex-1 rounded-full overflow-hidden" style={{
          boxShadow: 'inset 4px 4px 10px hsl(var(--neu-dark) / 0.5), inset -4px -4px 10px hsl(var(--neu-light) / 0.7)',
          border: '1px solid hsl(var(--neon-primary) / 0.3)',
        }}>
          <Input
            type="search"
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 shadow-none bg-transparent h-11 rounded-full"
            autoFocus
          />
        </div>
        <Button type="submit" size="sm" disabled={!searchQuery.trim()} className="rounded-full px-4">
          Buscar
        </Button>
      </form>
    </motion.div>
  );
}
