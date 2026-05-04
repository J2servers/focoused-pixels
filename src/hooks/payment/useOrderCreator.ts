import { logger } from '@/lib/logger';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import {
  generateIdempotencyKey,
  getIdempotencyEntry,
  setIdempotencyEntry,
  cleanupIdempotencyEntries,
} from '@/lib/idempotency';
import {
  generateOrderNumber,
  sanitizePhone,
  UUID_REGEX,
  type CustomerForm,
  type PaymentState,
  type UploadedFile,
} from './types';

interface UseOrderCreatorArgs {
  customerForm: CustomerForm;
  customText: string;
  uploadedFiles: UploadedFile[];
}

export function useOrderCreator({ customerForm, customText, uploadedFiles }: UseOrderCreatorArgs) {
  const saveCustomerAsLead = useCallback(async (name: string, email: string, phone: string) => {
    try {
      await supabase.from('leads').upsert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: sanitizePhone(phone),
        source: 'checkout',
        tags: ['cliente', 'pagamento'],
        is_subscribed: true,
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch (e) {
      console.error('Error saving lead:', e);
    }
  }, []);

  const createOrderInDB = useCallback(async (state: PaymentState): Promise<string | null> => {
    if (UUID_REGEX.test(state.orderId)) return state.orderId;

    let cartItemsForKey: Array<{ id: string; quantity: number }> = [];
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) {
        const parsed = JSON.parse(storedPayment) as { cartItems?: Array<{ id?: string; quantity?: number }> };
        cartItemsForKey = (parsed.cartItems || []).map((i) => ({
          id: i.id || '',
          quantity: i.quantity || 1,
        }));
      }
    } catch { /* empty */ }

    const idemKey = generateIdempotencyKey(state.customerEmail, cartItemsForKey, state.amount);
    const existingEntry = getIdempotencyEntry(idemKey);
    if (existingEntry && (existingEntry.status === 'processing' || existingEntry.status === 'completed')) {
      if (existingEntry.orderId) return existingEntry.orderId;
      toast.info('Pedido já está sendo processado...');
      return null;
    }
    setIdempotencyEntry(idemKey, 'processing');

    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();
    let cartItems: unknown[] = [];
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) {
        const parsed = JSON.parse(storedPayment) as { cartItems?: unknown[] };
        cartItems = parsed.cartItems || [{ description: state.description, amount: state.amount }];
      }
    } catch {
      cartItems = [{ description: state.description, amount: state.amount }];
    }

    const prodNotes: string[] = [];
    if (customText.trim()) prodNotes.push(`📝 Texto: ${customText.trim()}`);
    if (uploadedFiles.length > 0) prodNotes.push(`📎 Arquivos: ${uploadedFiles.map(f => f.name).join(', ')}`);

    let shippingInfo: { method?: string; cost?: number; cep?: string; city?: string; state?: string } = {};
    try {
      const storedPayment = sessionStorage.getItem('pending_payment');
      if (storedPayment) {
        const parsed = JSON.parse(storedPayment) as { shipping?: typeof shippingInfo };
        shippingInfo = parsed.shipping || {};
      }
    } catch { /* empty */ }

    const { error } = await supabase.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      customer_name: state.customerName.trim(),
      customer_email: state.customerEmail.trim().toLowerCase(),
      customer_phone: sanitizePhone(state.customerPhone) || state.customerPhone || '',
      items: cartItems as unknown as Json,
      subtotal: state.amount - state.shippingCost,
      total: state.amount,
      shipping_cost: state.shippingCost,
      shipping_method: state.shippingMethod || shippingInfo.method || null,
      shipping_cep: shippingInfo.cep || customerForm.cep?.trim() || null,
      shipping_city: shippingInfo.city || customerForm.city?.trim() || null,
      shipping_state: shippingInfo.state || customerForm.state?.trim() || null,
      shipping_address: [customerForm.street, customerForm.number, customerForm.complement, customerForm.neighborhood]
        .filter(Boolean).join(', ') || null,
      order_status: 'pending',
      payment_status: 'pending',
      production_status: 'pending',
      custom_text: customText.trim() || null,
      customer_files: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.url) : [],
      production_notes: prodNotes.length > 0 ? prodNotes.join('\n') : null,
    });

    if (error) {
      console.error('Error creating order:', error);
      setIdempotencyEntry(idemKey, 'failed');
      toast.error('Erro ao criar pedido. Tente novamente.');
      return null;
    }
    setIdempotencyEntry(idemKey, 'completed', orderId);
    cleanupIdempotencyEntries();
    sessionStorage.removeItem('pending_payment');
    await saveCustomerAsLead(state.customerName, state.customerEmail, state.customerPhone);
    return orderId;
  }, [customText, uploadedFiles, customerForm, saveCustomerAsLead]);

  return { createOrderInDB, saveCustomerAsLead };
}
