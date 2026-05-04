import { ChevronRight } from 'lucide-react';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Props {
  productName: string;
  category?: { name: string; slug: string } | null;
}

export function ProductBreadcrumb({ productName, category }: Props) {
  return (
    <nav aria-label="Navegação" className="mb-4 md:mb-6">
      <Breadcrumb>
        <BreadcrumbList className="text-xs sm:text-sm">
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator>
          {category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categoria/${category.slug}`}>{category.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator>
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium truncate max-w-[200px]">{productName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
