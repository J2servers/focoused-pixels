// Shared lightweight types for dashboard metric computation.
// Kept loose on purpose — we only project the fields each module needs.

export interface OrderRecord {
  id: string;
  created_at: string;
  total: number;
  order_status: string;
  payment_status: string;
  payment_method?: string;
  production_status?: string;
  production_started_at?: string;
  production_completed_at?: string;
  customer_email?: string;
}

export interface OrderItemRecord {
  order_id: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  total_price?: number;
  cost_material?: number;
  cost_labor?: number;
  cost_shipping?: number;
}

export interface ProductRecord {
  status: string;
  stock?: number;
  min_stock?: number;
  price?: number;
  is_featured?: boolean;
}

export interface CategoryRecord { status: string }
export interface QuoteRecord { status: string; created_at: string }
export interface LeadRecord { is_subscribed: boolean; created_at: string }
export interface ReviewRecord { is_approved: boolean; rating: number }
export interface PromotionRecord { status: string }
export interface CouponRecord { is_active: boolean; usage_count?: number }
export interface PageViewRecord { created_at: string; page_path: string; session_id?: string }
export interface CashTxRecord { type: string; transaction_date: string; amount: number }
export interface RawMaterialRecord { quantity?: number; min_quantity?: number; cost_per_unit?: number }
export interface StockMovementRecord { created_at: string }
export interface WhatsappMsgRecord { status: string }
export interface WhatsappInstanceRecord { status: string }
export interface AuditLogRecord { created_at: string }
export interface WebhookLogRecord { error_message?: string }
export interface HeroSlideRecord { status: string }
export interface TaxSettings { simples_anexo?: 'II' | 'III' }

export interface DashboardSources {
  orders: OrderRecord[];
  products: ProductRecord[];
  categories: CategoryRecord[];
  quotes: QuoteRecord[];
  leads: LeadRecord[];
  reviews: ReviewRecord[];
  promotions: PromotionRecord[];
  coupons: CouponRecord[];
  pageViews: PageViewRecord[];
  cashTx: CashTxRecord[];
  rawMaterials: RawMaterialRecord[];
  stockMovements: StockMovementRecord[];
  whatsappMsgs: WhatsappMsgRecord[];
  whatsappInstances: WhatsappInstanceRecord[];
  auditLogs: AuditLogRecord[];
  webhookLogs: WebhookLogRecord[];
  orderItems: OrderItemRecord[];
  heroSlides: HeroSlideRecord[];
}

export interface DateBoundaries {
  now: Date;
  todayStart: Date;
  weekStart: Date;
  monthStart: Date;
  yearStart: Date;
  lastMonthStart: Date;
  lastMonthEnd: Date;
  twelveMonthsAgo: Date;
}

export const byDate = <T extends { created_at: string }>(arr: T[], start: Date) =>
  arr.filter(o => new Date(o.created_at) >= start);

export const byDateRange = <T extends { created_at: string }>(arr: T[], start: Date, end: Date) =>
  arr.filter(o => { const d = new Date(o.created_at); return d >= start && d <= end; });
