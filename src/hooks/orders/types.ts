import type { Json } from '@/integrations/supabase/types';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: Json;
  subtotal: number;
  shipping_cost: number | null;
  discount: number | null;
  total: number;
  order_status: string;
  payment_status: string;
  payment_method: string | null;
  tracking_code: string | null;
  shipping_company: string | null;
  notes: string | null;
  quote_id: string | null;
  production_status: string;
  production_notes: string | null;
  production_started_at: string | null;
  production_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductionStatus =
  | 'pending'
  | 'awaiting_material'
  | 'in_production'
  | 'quality_check'
  | 'ready'
  | 'shipped';

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  pending: 'Aguardando',
  awaiting_material: 'Aguardando Material',
  in_production: 'Em Produção',
  quality_check: 'Controle de Qualidade',
  ready: 'Pronto',
  shipped: 'Enviado',
};

export const PRODUCTION_STATUS_COLORS: Record<ProductionStatus, string> = {
  pending: 'bg-gray-500',
  awaiting_material: 'bg-yellow-500',
  in_production: 'bg-blue-500',
  quality_check: 'bg-purple-500',
  ready: 'bg-green-500',
  shipped: 'bg-teal-500',
};
