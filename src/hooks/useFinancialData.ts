import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductWithCosts {
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

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_material: number;
  cost_labor: number;
  cost_shipping: number;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  created_at: string;
}

interface TaxSettings {
  id: string;
  cnpj: string | null;
  cnae_primary: string | null;
  tax_regime: string;
  simples_anexo: string;
  simples_faixa: number;
}

// Alíquotas do Simples Nacional - Anexo III (Serviços)
// Baseado na LC 123/2006 atualizada
const SIMPLES_NACIONAL_ANEXO_III = [
  { faixa: 1, receitaBruta: 180000, aliquota: 6.0, deducao: 0 },
  { faixa: 2, receitaBruta: 360000, aliquota: 11.2, deducao: 9360 },
  { faixa: 3, receitaBruta: 720000, aliquota: 13.5, deducao: 17640 },
  { faixa: 4, receitaBruta: 1800000, aliquota: 16.0, deducao: 35640 },
  { faixa: 5, receitaBruta: 3600000, aliquota: 21.0, deducao: 125640 },
  { faixa: 6, receitaBruta: 4800000, aliquota: 33.0, deducao: 648000 },
];

// Anexo II (Indústria) - mais comum para fabricação de letreiros
const SIMPLES_NACIONAL_ANEXO_II = [
  { faixa: 1, receitaBruta: 180000, aliquota: 4.5, deducao: 0 },
  { faixa: 2, receitaBruta: 360000, aliquota: 7.8, deducao: 5940 },
  { faixa: 3, receitaBruta: 720000, aliquota: 10.0, deducao: 13860 },
  { faixa: 4, receitaBruta: 1800000, aliquota: 11.2, deducao: 22500 },
  { faixa: 5, receitaBruta: 3600000, aliquota: 14.7, deducao: 85500 },
  { faixa: 6, receitaBruta: 4800000, aliquota: 30.0, deducao: 720000 },
];

export function calculateSimplesTax(
  receitaBruta12Meses: number,
  anexo: 'II' | 'III' = 'III'
): { aliquotaEfetiva: number; valorImposto: number; faixa: number } {
  const tabela = anexo === 'II' ? SIMPLES_NACIONAL_ANEXO_II : SIMPLES_NACIONAL_ANEXO_III;
  
  // Encontra a faixa correta
  const faixa = tabela.find(f => receitaBruta12Meses <= f.receitaBruta) || tabela[tabela.length - 1];
  
  // Cálculo da alíquota efetiva: (RBT12 x Aliq - Deducao) / RBT12
  const aliquotaEfetiva = receitaBruta12Meses > 0 
    ? ((receitaBruta12Meses * (faixa.aliquota / 100)) - faixa.deducao) / receitaBruta12Meses * 100
    : faixa.aliquota;
  
  const valorImposto = (receitaBruta12Meses * Math.max(aliquotaEfetiva, 0)) / 100;
  
  return {
    aliquotaEfetiva: Math.max(aliquotaEfetiva, 0),
    valorImposto,
    faixa: faixa.faixa,
  };
}

export function useLowStockProducts(limit = 10) {
  return useQuery({
    queryKey: ['low-stock-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, min_stock, cover_image, status')
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('stock', { ascending: true })
        .limit(limit);

      if (error) throw error;
      
      // Filtra produtos com estoque abaixo do mínimo
      return (data || []).filter(p => (p.stock || 0) <= (p.min_stock || 5)) as ProductWithCosts[];
    },
  });
}

export function useProductsWithMargins() {
  return useQuery({
    queryKey: ['products-with-margins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, promotional_price, stock, min_stock, cost_material, cost_labor, cost_shipping, cover_image, status')
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      
      return (data || []).map(p => {
        const sellPrice = p.promotional_price || p.price;
        const totalCost = (p.cost_material || 0) + (p.cost_labor || 0) + (p.cost_shipping || 0);
        const margin = sellPrice - totalCost;
        const marginPercent = sellPrice > 0 ? (margin / sellPrice) * 100 : 0;
        
        return {
          ...p,
          sellPrice,
          totalCost,
          margin,
          marginPercent,
        };
      }) as (ProductWithCosts & { sellPrice: number; totalCost: number; margin: number; marginPercent: number })[];
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useOrderItems() {
  return useQuery({
    queryKey: ['order-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*');

      if (error) throw error;
      return data as OrderItem[];
    },
  });
}

export function useTaxSettings() {
  return useQuery({
    queryKey: ['tax-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_tax_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TaxSettings | null;
    },
  });
}

export function useQuotesApproved() {
  return useQuery({
    queryKey: ['quotes-approved'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .in('status', ['approved', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useFinancialSummary() {
  const { data: orders } = useOrders();
  const { data: orderItems } = useOrderItems();
  const { data: quotesApproved } = useQuotesApproved();
  const { data: taxSettings } = useTaxSettings();
  
  // Calcular receita dos últimos 12 meses
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);
  
  const ordersLast12Months = orders?.filter(o => 
    new Date(o.created_at) >= twelveMonthsAgo && 
    ['completed', 'delivered'].includes(o.order_status)
  ) || [];
  
  const receitaBruta = ordersLast12Months.reduce((sum, o) => sum + (o.total || 0), 0);
  
  // Calcular custos totais
  const custoTotal = orderItems?.reduce((sum, item) => {
    return sum + (item.cost_material || 0) + (item.cost_labor || 0) + (item.cost_shipping || 0);
  }, 0) || 0;
  
  // Calcular impostos (Simples Nacional)
  const anexo = (taxSettings?.simples_anexo || 'III') as 'II' | 'III';
  const taxCalc = calculateSimplesTax(receitaBruta, anexo);
  
  // Receita líquida = Receita Bruta - Custos - Impostos
  const receitaLiquida = receitaBruta - custoTotal - taxCalc.valorImposto;
  
  return {
    receitaBruta,
    custoTotal,
    impostos: taxCalc.valorImposto,
    aliquotaEfetiva: taxCalc.aliquotaEfetiva,
    faixaSimples: taxCalc.faixa,
    receitaLiquida,
    margemLiquida: receitaBruta > 0 ? (receitaLiquida / receitaBruta) * 100 : 0,
    totalPedidos: orders?.length || 0,
    totalOrcamentosAprovados: quotesApproved?.length || 0,
    taxSettings,
  };
}

export function useProductRanking(limit = 10) {
  return useQuery({
    queryKey: ['product-ranking', limit],
    queryFn: async () => {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('product_id, product_name, quantity, total_price, cost_material, cost_labor, cost_shipping');

      if (error) throw error;
      
      // Agrupa por produto
      const productMap = new Map<string, {
        product_id: string;
        product_name: string;
        totalQuantity: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
      }>();
      
      (orderItems || []).forEach(item => {
        const key = item.product_id || item.product_name;
        const existing = productMap.get(key);
        const itemCost = (item.cost_material || 0) + (item.cost_labor || 0) + (item.cost_shipping || 0);
        const itemProfit = (item.total_price || 0) - itemCost;
        
        if (existing) {
          existing.totalQuantity += item.quantity || 0;
          existing.totalRevenue += item.total_price || 0;
          existing.totalCost += itemCost;
          existing.totalProfit += itemProfit;
        } else {
          productMap.set(key, {
            product_id: item.product_id || '',
            product_name: item.product_name,
            totalQuantity: item.quantity || 0,
            totalRevenue: item.total_price || 0,
            totalCost: itemCost,
            totalProfit: itemProfit,
          });
        }
      });
      
      // Ordena por quantidade vendida
      return Array.from(productMap.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);
    },
  });
}
