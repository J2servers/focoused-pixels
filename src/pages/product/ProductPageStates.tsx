import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { TrustBar } from '@/components/conversion';

export function ProductPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Skeleton className="h-5 w-48 mb-6" />
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </main>
      <DynamicFooter />
    </div>
  );
}

export function ProductNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />
      <main className="flex-1 container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <p className="text-muted-foreground">O produto que você procura não está disponível.</p>
          <Link to="/"><Button size="lg">Voltar para a Home</Button></Link>
        </div>
      </main>
      <DynamicFooter />
    </div>
  );
}
