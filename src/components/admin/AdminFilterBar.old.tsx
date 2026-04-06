import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AdminFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}

export const AdminFilterBar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  children,
}: AdminFilterBarProps) => (
  <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
    <CardContent className="p-4">
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))]"
          />
        </div>
        {children}
      </div>
    </CardContent>
  </Card>
);
