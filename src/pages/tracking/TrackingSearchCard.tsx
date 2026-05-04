import { Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  searchType: 'tracking' | 'order';
  setSearchType: (v: 'tracking' | 'order') => void;
  trackingCode: string;
  setTrackingCode: (v: string) => void;
  orderNumber: string;
  setOrderNumber: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function TrackingSearchCard(p: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-2xl mx-auto mb-8"
    >
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Consultar Rastreio
          </CardTitle>
          <CardDescription>
            Digite o código de rastreio (ex: SS123456789BR) ou o número do pedido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={p.searchType} onValueChange={(v) => p.setSearchType(v as 'tracking' | 'order')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="tracking">Código de Rastreio</TabsTrigger>
              <TabsTrigger value="order">Número do Pedido</TabsTrigger>
            </TabsList>
            <form onSubmit={p.onSubmit} className="space-y-4">
              <TabsContent value="tracking" className="m-0">
                <Input
                  type="text"
                  placeholder="Ex: SS123456789BR"
                  value={p.trackingCode}
                  onChange={(e) => p.setTrackingCode(e.target.value.toUpperCase())}
                  className="h-12 text-lg uppercase tracking-widest"
                  maxLength={13}
                />
              </TabsContent>
              <TabsContent value="order" className="m-0">
                <Input
                  type="text"
                  placeholder="Ex: PED-2024-001234"
                  value={p.orderNumber}
                  onChange={(e) => p.setOrderNumber(e.target.value)}
                  className="h-12 text-lg"
                />
              </TabsContent>
              <Button type="submit" className="w-full h-12 text-lg" disabled={p.loading}>
                {p.loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Consultando...</>
                ) : (
                  <><Search className="mr-2 h-5 w-5" />Rastrear</>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
