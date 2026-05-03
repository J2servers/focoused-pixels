import { type ElementType } from 'react';
import { Package, Truck, Clock, CheckCircle, AlertCircle, Wrench } from 'lucide-react';
import { type ProductionStatus } from '@/hooks/useOrders';

export const PRODUCTION_PROGRESS: Record<ProductionStatus, number> = {
  pending: 10, awaiting_material: 25, in_production: 50,
  quality_check: 75, ready: 90, shipped: 100,
};

export const PRODUCTION_STATUS_ICONS: Record<ProductionStatus, ElementType> = {
  pending: Clock, awaiting_material: AlertCircle, in_production: Wrench,
  quality_check: CheckCircle, ready: Package, shipped: Truck,
};

export const PRODUCTION_FLOW: ProductionStatus[] = [
  'pending', 'awaiting_material', 'in_production', 'quality_check', 'ready', 'shipped',
];

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente', confirmed: 'Confirmado', processing: 'Em Processamento',
  shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando Pagamento', paid: 'Pago', failed: 'Falhou', refunded: 'Reembolsado',
};

export const getStatusColor = (status: string): string => {
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

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return 'bg-green-500';
    case 'pending': return 'bg-yellow-500';
    case 'failed': return 'bg-red-500';
    case 'refunded': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

export interface OrderItemLike {
  name?: string; product_name?: string; quantity?: number;
  price?: number; unit_price?: number;
}
