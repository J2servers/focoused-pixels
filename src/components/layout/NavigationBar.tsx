import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categories } from '@/data/products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function NavigationBar() {
  return (
    <nav className="bg-background border-b border-border hidden lg:block">
      <div className="container mx-auto px-4">
        <div className="flex items-center flex-wrap">
          {categories.map((category) => (
            <div key={category.id} className="relative">
              {category.subcategories && category.subcategories.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost"
                      className="h-12 px-4 text-sm font-semibold uppercase tracking-wide text-primary hover:bg-secondary rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      {category.name}
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    sideOffset={4}
                    alignOffset={0}
                    className="w-[280px] bg-popover border shadow-lg z-[100] p-2"
                    style={{ minWidth: '280px' }}
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/categoria/${category.slug}`}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-primary">
                          Ver todos
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Todos os produtos de {category.name}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    {category.subcategories.map((sub) => (
                      <DropdownMenuItem key={sub.id} asChild>
                        <Link
                          to={`/categoria/${category.slug}/${sub.slug}`}
                          className="p-3 cursor-pointer"
                        >
                          <span className="text-sm font-medium">
                            {sub.name}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link 
                  to={`/categoria/${category.slug}`}
                  className="flex h-12 items-center px-4 text-sm font-semibold uppercase tracking-wide text-primary hover:bg-secondary transition-colors"
                >
                  {category.name}
                </Link>
              )}
            </div>
          ))}
          <Link 
            to="/rastreio"
            className="flex h-12 items-center px-4 text-sm font-semibold uppercase tracking-wide text-primary hover:bg-secondary transition-colors"
          >
            Rastreio
          </Link>
        </div>
      </div>
    </nav>
  );
}
