import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { PaymentState } from '@/hooks/payment/types';

interface PendingPaymentSession {
  orderId: string;
  amount?: number;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerCpf?: string;
  customerPhone?: string;
  shipping?: { cost?: number; method?: string };
  cartItems?: Array<{ id?: string; product_id?: string; quantity?: number }>;
}

const MIN_WEIGHT_KG = 0.3;
const DEFAULT_ITEM_WEIGHT_KG = 0.5;

async function calculateCartWeight(cartItems: PendingPaymentSession['cartItems']): Promise<number> {
  if (!cartItems?.length) return DEFAULT_ITEM_WEIGHT_KG;
  const productIds = cartItems
    .map((i) => i.id || i.product_id)
    .filter((v): v is string => Boolean(v));
  if (!productIds.length) return DEFAULT_ITEM_WEIGHT_KG;

  const { data: products } = await supabase
    .from('products')
    .select('id, weight_kg')
    .in('id', productIds);
  if (!products) return DEFAULT_ITEM_WEIGHT_KG;

  const weightMap = new Map(products.map((p) => [p.id, p.weight_kg ?? DEFAULT_ITEM_WEIGHT_KG]));
  const total = cartItems.reduce((sum, item) => {
    const id = item.id || item.product_id || '';
    return sum + (weightMap.get(id) ?? DEFAULT_ITEM_WEIGHT_KG) * (item.quantity ?? 1);
  }, 0);
  return Math.max(MIN_WEIGHT_KG, total);
}

function buildStateFromSession(data: PendingPaymentSession): PaymentState {
  const shippingCost = data.shipping?.cost ?? 0;
  return {
    orderId: data.orderId,
    amount: (data.amount ?? 0) + shippingCost,
    shippingCost,
    shippingMethod: data.shipping?.method ?? '',
    customerName: data.customerName ?? '',
    customerEmail: data.customerEmail ?? '',
    customerCpf: data.customerCpf ?? '',
    customerPhone: data.customerPhone ?? '',
    description: data.description ?? '',
  };
}

interface LoaderResult {
  paymentState: PaymentState | null;
  setPaymentState: React.Dispatch<React.SetStateAction<PaymentState | null>>;
  cartWeight: number;
  isLoading: boolean;
  fromExistingOrder: boolean;
}

export function usePaymentLoader(): LoaderResult {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);
  const [cartWeight, setCartWeight] = useState(DEFAULT_ITEM_WEIGHT_KG);
  const [isLoading, setIsLoading] = useState(true);
  const [fromExistingOrder, setFromExistingOrder] = useState(false);

  useEffect(() => {
    const load = async () => {
      const orderId = searchParams.get('order');

      if (orderId) {
        try {
          const { data: order, error } = await supabase
            .from('orders').select('*').eq('id', orderId).single();
          if (error || !order) throw new Error('Pedido não encontrado');
          setPaymentState({
            orderId: order.id,
            amount: order.total,
            shippingCost: order.shipping_cost ?? 0,
            shippingMethod: order.shipping_method ?? '',
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerCpf: '',
            customerPhone: order.customer_phone,
            description: `Pedido #${order.order_number}`,
          });
          setFromExistingOrder(true);
        } catch (err) {
          logger.error('paymentLoader', 'Error loading order:', err);
          toast.error('Erro ao carregar pedido');
          navigate('/');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      const stored = sessionStorage.getItem('pending_payment');
      if (!stored) {
        toast.error('Pedido não encontrado');
        navigate('/');
        return;
      }

      try {
        const data = JSON.parse(stored) as PendingPaymentSession;
        if (!data.amount || data.amount <= 0) {
          toast.error('Valor do pedido inválido');
          navigate('/');
          return;
        }
        setPaymentState(buildStateFromSession(data));
        setCartWeight(await calculateCartWeight(data.cartItems));
      } catch {
        toast.error('Dados do pedido corrompidos');
        sessionStorage.removeItem('pending_payment');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [searchParams, navigate]);

  return { paymentState, setPaymentState, cartWeight, isLoading, fromExistingOrder };
}
