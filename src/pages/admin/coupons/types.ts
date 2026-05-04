export interface CouponFormData {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export const initialCouponForm: CouponFormData = {
  code: '', description: '', type: 'percentage', value: 0,
  min_order_value: null, max_discount: null, usage_limit: null,
  is_active: true, start_date: '', end_date: '',
};

export interface QuickTemplate {
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  desc: string;
}

export const QUICK_TEMPLATES: QuickTemplate[] = [
  { name: 'Primeira Compra', code: 'BEMVINDO10', type: 'percentage', value: 10, desc: '10% para novos clientes' },
  { name: 'Frete Grátis', code: 'FRETEGRATIS', type: 'fixed', value: 25, desc: 'R$25 para cobrir frete' },
  { name: 'Black Friday', code: 'BLACK30', type: 'percentage', value: 30, desc: '30% promoção especial' },
  { name: 'Fidelidade', code: 'FIEL15', type: 'percentage', value: 15, desc: '15% para clientes recorrentes' },
];
