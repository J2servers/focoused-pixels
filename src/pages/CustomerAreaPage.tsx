import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicTopBar } from '@/components/layout/DynamicTopBar';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/hooks/useCustomerOrders';
import { useActivePromotions } from '@/hooks/usePromotions';
import { PRODUCTION_STATUS_LABELS, type ProductionStatus } from '@/hooks/useOrders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  Search, 
  ShoppingBag,
  Tag,
  ChevronDown,
  MapPin,
  AlertCircle,
  Percent,
  Gift,
  Wrench,
  Eye
} from 'lucide-react';

// Production status progress mapping
const PRODUCTION_PROGRESS: Record<ProductionStatus, number> = {
  pending: 10,
  awaiting_material: 25,
  in_production: 50,
  quality_check: 75,
  ready: 90,
  shipped: 100,
};

const PRODUCTION_STATUS_ICONS: Record<ProductionStatus, React.ElementType> = {
  pending: Clock,
  awaiting_material: AlertCircle,
  in_production: Wrench,
  quality_check: CheckCircle,
  ready: Package,
  shipped: Truck,
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Em Processamento',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando Pagamento',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Reembolsado',
};

const CustomerAreaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [searchOrder, setSearchOrder] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders = [], isLoading: ordersLoading } = useCustomerOrders(user?.email);
  const { data: promotions = [], isLoading: promotionsLoading } = useActivePromotions();

  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchOrder.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchOrder.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'processing': return 'bg-purple-500';
      case 'shipped': return 'bg-teal-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <DynamicTopBar />
        <DynamicMainHeader />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-6">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Faça login para acessar</h2>
              <p className="text-muted-foreground mb-6">
                Entre na sua conta para ver seus pedidos e acompanhar a produção.
              </p>
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
      <DynamicTopBar />
      <DynamicMainHeader />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minha Área</h1>
            <p className="text-muted-foreground">
              Olá, {user.email}! Acompanhe seus pedidos e aproveite nossas promoções.
            </p>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                Meus Pedidos
              </TabsTrigger>
              <TabsTrigger value="promotions" className="gap-2">
                <Tag className="h-4 w-4" />
                Promoções
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pedido por número..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{orders.length}</p>
                        <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Wrench className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {orders.filter(o => ['in_production', 'quality_check'].includes(o.production_status)).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Em Produção</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {orders.filter(o => o.production_status === 'ready').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Prontos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/10">
                        <Truck className="h-5 w-5 text-teal-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {orders.filter(o => o.production_status === 'shipped').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Enviados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Orders List */}
              {ordersLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando pedidos...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {searchOrder ? 'Nenhum pedido encontrado' : 'Você ainda não tem pedidos'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchOrder ? 'Tente buscar com outro termo.' : 'Comece a comprar para ver seus pedidos aqui.'}
                    </p>
                    <Button onClick={() => navigate('/categorias')}>
                      Ver Produtos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const StatusIcon = PRODUCTION_STATUS_ICONS[order.production_status as ProductionStatus] || Clock;
                    const progress = PRODUCTION_PROGRESS[order.production_status as ProductionStatus] || 0;
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                      >
                        <Card className="overflow-hidden">
                          <Collapsible open={isExpanded} onOpenChange={() => setExpandedOrder(isExpanded ? null : order.id)}>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <CardTitle className="text-lg font-mono">
                                        {order.order_number}
                                      </CardTitle>
                                      <Badge className={getStatusColor(order.order_status)}>
                                        {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
                                      </Badge>
                                      <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                                        {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                                      </Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-4 flex-wrap">
                                      <span>
                                        {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                      </span>
                                      <span className="font-medium text-foreground">
                                        R$ {order.total.toFixed(2).replace('.', ',')}
                                      </span>
                                    </CardDescription>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </div>
                                </div>

                                {/* Production Progress */}
                                <div className="mt-4 space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <StatusIcon className="h-4 w-4 text-primary" />
                                      <span className="font-medium">
                                        {PRODUCTION_STATUS_LABELS[order.production_status as ProductionStatus] || 'Aguardando'}
                                      </span>
                                    </div>
                                    <span className="text-muted-foreground">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="border-t pt-6 space-y-6">
                                {/* Order Items */}
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    Itens do Pedido
                                  </h4>
                                  <div className="space-y-2">
                                    {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                          <p className="font-medium">{item.name || item.product_name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Qtd: {item.quantity} × R$ {(item.price || item.unit_price || 0).toFixed(2).replace('.', ',')}
                                          </p>
                                        </div>
                                        <p className="font-medium">
                                          R$ {((item.quantity || 1) * (item.price || item.unit_price || 0)).toFixed(2).replace('.', ',')}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Summary */}
                                <div className="grid md:grid-cols-2 gap-6">
                                  {/* Pricing */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Resumo</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                                      </div>
                                      {order.shipping_cost && order.shipping_cost > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Frete</span>
                                          <span>R$ {order.shipping_cost.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                      )}
                                      {order.discount && order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                          <span>Desconto</span>
                                          <span>-R$ {order.discount.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-semibold pt-2 border-t">
                                        <span>Total</span>
                                        <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Shipping Info */}
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <Truck className="h-4 w-4" />
                                      Entrega
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      {order.shipping_company && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground">Transportadora:</span>
                                          <span className="capitalize">{order.shipping_company}</span>
                                        </div>
                                      )}
                                      {order.tracking_code ? (
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground">Rastreio:</span>
                                          <Button
                                            variant="link"
                                            className="h-auto p-0 text-primary"
                                            onClick={() => navigate(`/rastreio?codigo=${order.tracking_code}`)}
                                          >
                                            {order.tracking_code}
                                          </Button>
                                        </div>
                                      ) : (
                                        <p className="text-muted-foreground flex items-center gap-2">
                                          <MapPin className="h-4 w-4" />
                                          Código de rastreio será disponibilizado após envio
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Production Info */}
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Wrench className="h-4 w-4" />
                                    Status da Produção
                                  </h4>
                                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                    {(['pending', 'awaiting_material', 'in_production', 'quality_check', 'ready', 'shipped'] as ProductionStatus[]).map((status) => {
                                      const Icon = PRODUCTION_STATUS_ICONS[status];
                                      const isActive = status === order.production_status;
                                      const isPast = PRODUCTION_PROGRESS[status] < PRODUCTION_PROGRESS[order.production_status as ProductionStatus];
                                      
                                      return (
                                        <div
                                          key={status}
                                          className={`flex flex-col items-center p-2 rounded-lg text-center ${
                                            isActive
                                              ? 'bg-primary text-primary-foreground'
                                              : isPast
                                              ? 'bg-primary/20 text-primary'
                                              : 'bg-muted text-muted-foreground'
                                          }`}
                                        >
                                          <Icon className="h-5 w-5 mb-1" />
                                          <span className="text-[10px] leading-tight">
                                            {PRODUCTION_STATUS_LABELS[status]}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  {order.production_notes && (
                                    <div className="mt-4 p-3 bg-muted rounded-lg">
                                      <p className="text-sm font-medium mb-1">Notas de Produção:</p>
                                      <p className="text-sm text-muted-foreground">{order.production_notes}</p>
                                    </div>
                                  )}

                                  {order.production_started_at && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Produção iniciada em: {format(new Date(order.production_started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                  )}
                                  {order.production_completed_at && (
                                    <p className="text-sm text-muted-foreground">
                                      Produção concluída em: {format(new Date(order.production_completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                  )}
                                </div>

                                {/* Order Notes */}
                                {order.notes && (
                                  <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm font-medium mb-1">Observações:</p>
                                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Promotions Tab */}
            <TabsContent value="promotions" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Promoções Ativas</h2>
                  <p className="text-muted-foreground">Aproveite nossos descontos especiais!</p>
                </div>
              </div>

              {promotionsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Carregando promoções...</p>
                </div>
              ) : promotions.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma promoção ativa no momento</h3>
                    <p className="text-muted-foreground mb-4">
                      Fique de olho! Em breve teremos novos descontos.
                    </p>
                    <Button onClick={() => navigate('/categorias')}>
                      Ver Produtos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promotions.map((promo) => (
                    <motion.div
                      key={promo.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden h-full flex flex-col">
                        {promo.banner_url && (
                          <div className="aspect-video bg-muted overflow-hidden">
                            <img
                              src={promo.banner_url}
                              alt={promo.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{promo.name}</CardTitle>
                            <Badge className="shrink-0 bg-primary">
                              <Percent className="h-3 w-3 mr-1" />
                              {promo.type === 'percentage' 
                                ? `${promo.value}% OFF`
                                : `R$ ${promo.value.toFixed(2)} OFF`
                              }
                            </Badge>
                          </div>
                          <CardDescription>
                            {promo.rule === 'general' && 'Válido para todos os produtos'}
                            {promo.rule === 'category' && 'Válido para categorias selecionadas'}
                            {promo.rule === 'product' && 'Válido para produtos selecionados'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-end">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                            <span>Válido até:</span>
                            <span className="font-medium">
                              {format(new Date(promo.end_date), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <Button className="w-full" onClick={() => navigate('/categorias')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Produtos
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <DynamicFooter />
    </div>
  );
};

export default CustomerAreaPage;
