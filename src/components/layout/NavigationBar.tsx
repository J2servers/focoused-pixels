import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categories } from '@/data/products';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function NavigationBar() {
  return (
    <nav className="bg-background border-b border-border hidden lg:block">
      <div className="container mx-auto px-4">
        <NavigationMenu className="max-w-none justify-start">
          <NavigationMenuList className="gap-0">
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                {category.subcategories && category.subcategories.length > 0 ? (
                  <>
                    <NavigationMenuTrigger 
                      className="h-12 px-4 text-sm font-semibold uppercase tracking-wide text-primary hover:bg-secondary data-[state=open]:bg-secondary"
                    >
                      {category.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px] gap-1 p-4">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/categoria/${category.slug}`}
                              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-secondary hover:text-primary focus:bg-secondary"
                            >
                              <div className="text-sm font-semibold text-primary">
                                Ver todos
                              </div>
                              <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                                Todos os produtos de {category.name}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        {category.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={`/categoria/${category.slug}/${sub.slug}`}
                                className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-secondary hover:text-primary focus:bg-secondary"
                              >
                                <div className="text-sm font-medium">
                                  {sub.name}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link 
                    to={`/categoria/${category.slug}`}
                    className="flex h-12 items-center px-4 text-sm font-semibold uppercase tracking-wide text-primary hover:bg-secondary transition-colors"
                  >
                    {category.name}
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
            <NavigationMenuItem>
              <Link 
                to="/rastreio"
                className="flex h-12 items-center px-4 text-sm font-semibold uppercase tracking-wide text-primary hover:bg-secondary transition-colors"
              >
                Rastreio
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
