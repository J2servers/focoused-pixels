import { logger } from '@/lib/logger';
import { sanitizeEmail } from '@/lib/sanitize';
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
  UUID_REGEX,
  type CustomerForm,
  type PaymentState,
  type UploadedFile,
} from './types';
import {
  buildShippingAddressLine,
  buildProductionNotes,
  generateOrderNumber,
  sanitizeCustomerSnapshot,
} from '@/lib/order';
import { sanitizePhone } from '@/lib/sanitize';

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
        email: sanitizeEmail(email),
        phone: sanitizePhone(phone),
        source: 'checkout',
        tags: ['cliente', 'pagamento'],
        is_subscribed: true,
        subscribed_at: new Date().toISOString(),
      }, { onConflict: 'email' });
    } catch (e) {
      logger.error('orderCreator', 'Error saving lead:', e);
    }
  }, []);

  const createOrderInDB = useCallback(async (state: PaymentState): Promise<string | null> => {
    if (UUID_REGEX.test(state.orderId)) return state.orderId;

    const pending = readPendingPayment();
    const cartItemsForKey = pendingCartItemKeys(pending?.cartItems ?? []);

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
    const cartItems: unknown[] = pending?.cartItems?.length
      ? pending.cartItems
      : [{ description: state.description, amount: state.amount }];

    const prodNotes = buildProductionNotes(customText, uploadedFiles);
    const shippingInfo = pending?.shipping ?? {};

    const snap = sanitizeCustomerSnapshot({
      customerName: state.customerName,
      customerEmail: state.customerEmail,
      customerPhone: state.customerPhone,
    });

    const { error } = await supabase.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      customer_name: snap.customerName,
      customer_email: snap.customerEmail,
      customer_phone: snap.customerPhone,
      items: cartItems as unknown as Json,
      subtotal: state.amount - state.shippingCost,
      total: state.amount,
      shipping_cost: state.shippingCost,
      shipping_method: state.shippingMethod || shippingInfo.method || null,
      shipping_cep: shippingInfo.cep || customerForm.cep?.trim() || null,
      shipping_city: shippingInfo.city || customerForm.city?.trim() || null,
      shipping_state: shippingInfo.state || customerForm.state?.trim() || null,
      shipping_address: buildShippingAddressLine(customerForm),
      order_status: 'pending',
      payment_status: 'pending',
      production_status: 'pending',
      custom_text: customText.trim() || null,
      customer_files: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.url) : [],
      production_notes: prodNotes,
    });

    if (error) {
      logger.error('orderCreator', 'Error creating order:', error);
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
