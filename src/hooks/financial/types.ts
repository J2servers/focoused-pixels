export interface ProductWithCosts {
  id: string;
  name: string;
  price: number;
  promotional_price: number | null;
  stock: number;
  min_stock: number;
  cost_material: number;
  cost_labor: number;
  cost_shipping: number;
  cover_image: string | null;
  status: string;
}

export interface ProductWithMargin extends ProductWithCosts {
  sellPrice: number;
  totalCost: number;
  margin: number;
  marginPercent: number;
}

export interface FinancialOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_material: number;
  cost_labor: number;
  cost_shipping: number;
}

export interface FinancialOrder {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  created_at: string;
}

export interface TaxSettings {
  id: string;
  cnpj: string | null;
  cnae_primary: string | null;
  tax_regime: string;
  simples_anexo: string;
  simples_faixa: number;
}

export type SimplesAnexo = 'II' | 'III';

export interface SimplesTaxResult {
  aliquotaEfetiva: number;
  valorImposto: number;
  faixa: number;
}

export interface ProductRankingEntry {
  product_id: string;
  product_name: string;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}
