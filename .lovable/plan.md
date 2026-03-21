

# Plan: Send WhatsApp notification after boleto generation

## What will be done
After a boleto is successfully generated, the system will automatically send a WhatsApp message to the customer with the boleto barcode and payment link, using the existing WhatsApp Evolution API integration with failover logic.

## Changes

### 1. Update Edge Function `payment-mercadopago/index.ts`
After successfully creating the boleto (line ~394), add a call to the `whatsapp-evolution` function to send the boleto details to the customer. This keeps the notification server-side and reliable.

- After `console.log("[MercadoPago] Boleto created:", data.id)`, invoke the WhatsApp function with:
  - Customer phone (new parameter `payerPhone`)
  - Customer name
  - Barcode content
  - Boleto URL
  - Expiration date
  - Amount
- The WhatsApp send is fire-and-forget (non-blocking) so it doesn't delay the boleto response
- If WhatsApp fails, it logs the error but doesn't fail the payment

### 2. Update `PaymentPage.tsx`
Pass `payerPhone` to the `create_boleto` call (line ~460). The phone is already available in `paymentState.customerPhone`.

Add `payerPhone: paymentState.customerPhone` to the `mutateAsync` call.

### 3. Update Edge Function interface
Add `payerPhone` to the `PaymentRequest` interface (already exists but need to ensure it's destructured and used in the boleto handler).

## Message template
```
🧾 *Boleto Gerado - Pincel de Luz*

Olá, {nome}! Seu boleto foi gerado com sucesso.

💰 *Valor:* R$ {valor}
📅 *Vencimento:* {data}

📋 *Código de barras:*
{barcode}

🔗 *Link do boleto:*
{url}

Qualquer dúvida, estamos à disposição! ✨
```

## Technical flow
```text
PaymentPage (frontend)
  └─ create_boleto (edge fn)
       ├─ Mercado Pago API → boleto created
       ├─ WhatsApp Evolution API → message sent (async, non-blocking)
       └─ Response to frontend (barcode, url, etc.)
```

## Files to modify
| File | Change |
|------|--------|
| `supabase/functions/payment-mercadopago/index.ts` | Add WhatsApp notification after boleto creation |
| `src/pages/PaymentPage.tsx` | Pass `payerPhone` to boleto request |

