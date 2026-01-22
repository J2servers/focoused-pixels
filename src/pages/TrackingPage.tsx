import { useState } from 'react';
import { DynamicTopBar } from '@/components/layout/DynamicTopBar';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Search, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const TrackingPage = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      setIsSearching(true);
      // Simulate search
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background ${isMobile ? 'pb-20' : ''}`}>
      {!isMobile && (
        <>
          <DynamicTopBar />
          <DynamicMainHeader />
          <NavigationBar />
        </>
      )}

      <main className={`flex-1 ${isMobile ? 'pt-16 px-4' : 'container mx-auto px-4 py-8'}`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Rastreie seu Pedido</h1>
            <p className="text-muted-foreground">
              Acompanhe o status da entrega do seu pedido
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Digite o código de rastreio ou número do pedido"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Placeholder for tracking results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Status do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Pedido confirmado</p>
                    <p className="text-sm text-muted-foreground">Seu pedido foi recebido</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Em produção</p>
                    <p className="text-sm text-muted-foreground">Aguardando início</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Enviado</p>
                    <p className="text-sm text-muted-foreground">Aguardando envio</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {!isMobile && <DynamicFooter />}
    </div>
  );
};

export default TrackingPage;
