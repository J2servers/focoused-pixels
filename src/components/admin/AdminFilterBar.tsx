import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export const AdminFilterBar = ({
  search, onSearchChange, searchPlaceholder = 'Buscar...', children,
}: AdminFilterBarProps) => (
  <div className="liquid-glass rounded-xl p-4">
    <div className="flex flex-col md:flex-row gap-3 items-end">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <Input placeholder={searchPlaceholder} value={search} onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 liquid-input" />
      </div>
      {children}
    </div>
  </div>
);
