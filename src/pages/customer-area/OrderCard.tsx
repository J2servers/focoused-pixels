import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Truck, Wrench, ShoppingBag, MapPin, Camera, ArrowRight, Clock } from 'lucide-react';
import { type ProductionStatus } from '@/hooks/useOrders';
import { PRODUCTION_STATUS_LABELS } from '@/hooks/useOrders';
import {
  PRODUCTION_PROGRESS, PRODUCTION_STATUS_ICONS, PRODUCTION_FLOW,
  ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS,
  getStatusColor, getPaymentStatusColor, OrderItemLike,
} from './constants';

interface OrderLike {
  id: string; order_number: string; customer_name: string; customer_email: string;
  created_at: string; updated_at: string; total: number; subtotal: number;
  shipping_cost?: number; discount?: number;
  order_status: string; payment_status: string; production_status: string;
  production_started_at?: string | null; production_completed_at?: string | null;
  production_notes?: string | null; notes?: string | null;
  shipping_company?: string | null; tracking_code?: string | null;
  items?: OrderItemLike[] | unknown;
}

export function OrderCard({
  order, isExpanded, onToggle, onPostPurchase,
}: {
  order: OrderLike;
  isExpanded: boolean;
  onToggle: () => void;
  onPostPurchase: (o: OrderLike) => void;
}) {
  const navigate = useNavigate();
  const StatusIcon = PRODUCTION_STATUS_ICONS[order.production_status as ProductionStatus] || Clock;
  const progress = PRODUCTION_PROGRESS[order.production_status as ProductionStatus] || 0;

  const getStatusIndex = (status: string) => {
    const idx = PRODUCTION_FLOW.indexOf(status as ProductionStatus);
    return idx === -1 ? 0 : idx;
  };

  const getStepDate = (status: ProductionStatus) => {
    if (status === 'pending') return order.created_at;
    if (status === 'in_production') return order.production_started_at;
    if (status === 'ready') return order.production_completed_at;
    if (status === 'shipped' && getStatusIndex(order.production_status) >= getStatusIndex('shipped')) return order.updated_at;
    if ((status === 'awaiting_material' || status === 'quality_check') && getStatusIndex(order.production_status) >= getStatusIndex(status)) return order.updated_at;
    return null;
  };

  const items: OrderItemLike[] = Array.isArray(order.items) ? (order.items as OrderItemLike[]) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout>
      <Card className="overflow-hidden">
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <CardTitle className="text-lg font-mono">{order.order_number}</CardTitle>
                    <Badge className={getStatusColor(order.order_status)}>
                      {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
                    </Badge>
                    <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                      {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4 flex-wrap">
                    <span>{format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    <span className="font-medium text-foreground">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                  </CardDescription>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
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
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Itens do Pedido
                </h4>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Resumo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span></div>
                    {order.shipping_cost && order.shipping_cost > 0 && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>R$ {order.shipping_cost.toFixed(2).replace('.', ',')}</span></div>
                    )}
                    {order.discount && order.discount > 0 && (
                      <div className="flex justify-between text-green-600"><span>Desconto</span><span>-R$ {order.discount.toFixed(2).replace('.', ',')}</span></div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t"><span>Total</span><span>R$ {order.total.toFixed(2).replace('.', ',')}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2"><Truck className="h-4 w-4" /> Entrega</h4>
                  <div className="space-y-2 text-sm">
                    {order.shipping_company && (
                      <div className="flex items-center gap-2"><span className="text-muted-foreground">Transportadora:</span><span className="capitalize">{order.shipping_company}</span></div>
                    )}
                    {order.tracking_code ? (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Rastreio:</span>
                        <Button variant="link" className="h-auto p-0 text-primary"
                          onClick={() => navigate(`/rastreio?codigo=${order.tracking_code}`)}>
                          {order.tracking_code}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Código de rastreio será disponibilizado após envio
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2"><Wrench className="h-4 w-4" /> Status da Produção</h4>
                <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm font-medium mb-3">Timeline do pedido</p>
                  <div className="grid md:grid-cols-6 gap-2">
                    {PRODUCTION_FLOW.map((status) => {
                      const Icon = PRODUCTION_STATUS_ICONS[status];
                      const isReached = getStatusIndex(order.production_status) >= getStatusIndex(status);
                      const isCurrent = order.production_status === status;
                      const stepDate = getStepDate(status);
                      return (
                        <div key={`timeline-${status}`} className={`rounded-lg p-2 text-center border ${
                          isCurrent ? 'bg-primary text-primary-foreground border-primary'
                          : isReached ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-background border-border text-muted-foreground'
                        }`}>
                          <Icon className="h-4 w-4 mx-auto mb-1" />
                          <p className="text-[10px] leading-tight font-medium">{PRODUCTION_STATUS_LABELS[status]}</p>
                          <p className="text-[10px] mt-1 opacity-80">{stepDate ? format(new Date(stepDate), 'dd/MM', { locale: ptBR }) : '--'}</p>
                        </div>
                      );
                    })}
                  </div>
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

              {order.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Observações:</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}

              {(order.order_status === 'delivered' || order.production_status === 'shipped') && (
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="text-sm font-medium mb-2">Pedido entregue: envie foto + avaliação e ganhe cupom.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onPostPurchase(order)} className="gap-2">
                      <Camera className="h-4 w-4" /> Quero meu cupom
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/por-que-escolher')} className="gap-2">
                      Ver programa de benefícios <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}

export type { OrderLike };
