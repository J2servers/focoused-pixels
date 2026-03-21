

# Fix: Boleto Generation - Missing Address Fields

## Problem
Mercado Pago API requires payer address fields (`zip_code`, `street_name`, `street_number`, `neighborhood`, `city`, `federal_unit`) to generate a registered boleto. The current code doesn't send any address data to the edge function.

The customer already fills in address and CEP in Step 2, but this data is never forwarded to the boleto creation request.

## Root Cause
- `PaymentPage.tsx` calls `create_boleto` without address fields
- `usePaymentGateway.ts` interface doesn't include address fields
- Edge function `payment-mercadopago/index.ts` doesn't accept or send `payer.address` to Mercado Pago API

## Plan

### 1. Update Edge Function (`payment-mercadopago/index.ts`)
- Add address fields to `PaymentRequest` interface: `payerZipCode`, `payerStreetName`, `payerStreetNumber`, `payerNeighborhood`, `payerCity`, `payerState`
- Add `payer.address` object to the boleto payload sent to Mercado Pago API

### 2. Update Payment Gateway Hook (`usePaymentGateway.ts`)
- Add address fields to `MercadoPagoPaymentRequest` interface

### 3. Update Payment Page (`PaymentPage.tsx`)
- Pass `customerForm.address` and `customerForm.cep` to the `create_boleto` call
- Parse the address string to extract street, number, neighborhood, city, state (best-effort)

### 4. Improve Address Collection (`PaymentStepDetails.tsx`)
- Split the single "Endereço Completo" textarea into structured fields: Street, Number, Neighborhood, City, State
- This ensures clean data for Mercado Pago instead of guessing from free text

## Technical Details

**Edge function boleto payload change:**
```typescript
payer: {
  // ...existing fields
  address: {
    zip_code: payerZipCode?.replace(/\D/g, ""),
    street_name: payerStreetName,
    street_number: payerStreetNumber,
    neighborhood: payerNeighborhood,
    city: payerCity,
    federal_unit: payerState,
  }
}
```

**Customer form expansion** (structured fields instead of free text):
```
address → street (rua)
number → number (número)  
complement → complement (complemento)
neighborhood → neighborhood (bairro)
city → city (cidade)
state → state (UF)
cep → cep (already exists)
```

