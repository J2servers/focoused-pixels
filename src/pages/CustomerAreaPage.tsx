import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DynamicTopBar } from '@/components/layout/DynamicTopBar';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/hooks/useCustomerOrders';
import { useActivePromotions } from '@/hooks/usePromotions';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { Package, Search, ShoppingBag, Tag, Camera, ArrowRight } from 'lucide-react';
import { OrderStats } from './customer-area/OrderStats';
import { OrderCard, type OrderLike } from './customer-area/OrderCard';
import { PromotionsTab } from './customer-area/PromotionsTab';

const CustomerAreaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const siteSettings = useSiteSettings();
  const [searchOrder, setSearchOrder] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useCustomerOrders(user?.email);
  const { data: promotions = [], isLoading: promotionsLoading } = useActivePromotions();

  const filteredOrders = orders.filter(o =>
    o.order_number.toLowerCase().includes(searchOrder.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchOrder.toLowerCase())
  );
  const deliveredOrders = orders.filter(
    o => o.order_status === 'delivered' || o.production_status === 'shipped'
  );

  const handlePostPurchaseFollowUp = (order: OrderLike) => {
    const message = [
      `Olá! Recebi o pedido ${order.order_number} e quero participar da recompensa de cliente.`,
      'Quero enviar foto + avaliação para ganhar meu cupom especial.',
      `Nome: ${order.customer_name}`,
      `E-mail: ${order.customer_email}`,
    ].join('\n');
    const link = buildWhatsAppUrl(siteSettings.whatsapp, message);
    if (link) window.open(link, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <DynamicTopBar /><DynamicMainHeader />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-6">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Faça login para acessar</h2>
              <p className="text-muted-foreground mb-6">Entre na sua conta para ver seus pedidos e acompanhar a produção.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/login')}>Entrar</Button>
                <Button variant="outline" onClick={() => navigate('/cadastro')}>Criar conta</Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DynamicTopBar /><DynamicMainHeader />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minha Área</h1>
            <p className="text-muted-foreground">Olá, {user.email}! Acompanhe seus pedidos e aproveite nossas promoções.</p>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="orders" className="gap-2"><Package className="h-4 w-4" />Meus Pedidos</TabsTrigger>
              <TabsTrigger value="promotions" className="gap-2"><Tag className="h-4 w-4" />Promoções</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar pedido por número..." value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)} className="pl-10" />
              </div>

              <OrderStats orders={orders as Parameters<typeof OrderStats>[0]['orders']} />

              {deliveredOrders.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Seu pedido chegou? Ganhe recompensa</h3>
                        <p className="text-sm text-muted-foreground">Envie foto + avaliação do seu produto e receba cupom especial para a próxima compra.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handlePostPurchaseFollowUp(deliveredOrders[0] as OrderLike)} className="gap-2">
                          <Camera className="h-4 w-4" />Enviar foto e avaliar
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/por-que-escolher')} className="gap-2">
                          Ver experiência da marca <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando pedidos...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">{searchOrder ? 'Nenhum pedido encontrado' : 'Você ainda não tem pedidos'}</h3>
                    <p className="text-muted-foreground mb-4">{searchOrder ? 'Tente buscar com outro termo.' : 'Comece a comprar para ver seus pedidos aqui.'}</p>
                    <Button onClick={() => navigate('/categorias')}>Ver Produtos</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order as OrderLike}
                      isExpanded={expandedOrder === order.id}
                      onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      onPostPurchase={handlePostPurchaseFollowUp} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="promotions">
              <PromotionsTab promotions={promotions as Parameters<typeof PromotionsTab>[0]['promotions']} isLoading={promotionsLoading} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      <DynamicFooter />
    </div>
  );
};

export default CustomerAreaPage;
