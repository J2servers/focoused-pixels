import { useCallback, useEffect, useState } from 'react';
import { sanitizeCEP } from '@/lib/sanitize';
import { logger } from '@/lib/logger';
import { fetchViaCep } from '@/lib/freight';
import { supabase } from '@/integrations/supabase/client';
import { FALLBACK_FREIGHT_OPTIONS, FreightOption, CustomerFormData } from './types';

interface UseFreightCalculatorParams {
  customerForm: CustomerFormData;
  setCustomerForm: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  amount: number;
  shippingCost: number;
  cartWeight: number;
}

export function useFreightCalculator({
  customerForm,
  setCustomerForm,
  amount,
  shippingCost,
  cartWeight,
}: UseFreightCalculatorParams) {
  const [freightOptions, setFreightOptions] = useState<FreightOption[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState(false);
  const [destinationInfo, setDestinationInfo] = useState<{ city: string; state: string } | null>(null);
  const [lastFetchedCep, setLastFetchedCep] = useState('');

  const fetchFreight = useCallback(async (cep: string) => {
    const cleanCep = sanitizeCEP(cep);
    if (cleanCep.length !== 8 || cleanCep === lastFetchedCep) return;

    setFreightLoading(true);
    setFreightError(false);
    setFreightOptions([]);
    setSelectedMethod(null);
    setLastFetchedCep(cleanCep);

    try {
      const [viaCep, freightRes] = await Promise.all([
        fetchViaCep(cleanCep),
        supabase.functions.invoke('calculate-freight', {
          body: {
            destinationCep: cleanCep,
            productPrice: amount - shippingCost,
            weight: cartWeight,
            freeShippingMinimum: 0,
          },
        }),
      ]);

      if (viaCep) {
        setCustomerForm(prev => ({
          ...prev,
          street: prev.street?.trim() ? prev.street : (viaCep.street || prev.street),
          neighborhood: prev.neighborhood?.trim() ? prev.neighborhood : (viaCep.neighborhood || prev.neighborhood),
          city: viaCep.city || prev.city,
          state: viaCep.state || prev.state,
        }));
      }

      const { data, error } = freightRes;
      if (error || data?.error) throw new Error(data?.error || 'API error');

      if (data.results?.length > 0) {
        setFreightOptions(data.results);
        setDestinationInfo({ city: data.destination.city, state: data.destination.state });
        setCustomerForm(prev => ({
          ...prev,
          city: data.destination.city || prev.city,
          state: data.destination.state || prev.state,
        }));
      } else {
        throw new Error('No results');
      }
    } catch (err) {
      logger.error('freight', 'Freight fetch error:', err);
      setFreightError(true);
      setFreightOptions(FALLBACK_FREIGHT_OPTIONS);
      setDestinationInfo(null);
    } finally {
      setFreightLoading(false);
    }
  }, [amount, shippingCost, lastFetchedCep, setCustomerForm, cartWeight]);

  useEffect(() => {
    const cleanCep = sanitizeCEP(customerForm.cep);
    if (cleanCep.length === 8 && cleanCep !== lastFetchedCep) {
      const timer = setTimeout(() => fetchFreight(customerForm.cep), 500);
      return () => clearTimeout(timer);
    }
  }, [customerForm.cep, fetchFreight, lastFetchedCep]);

  return {
    freightOptions,
    selectedMethod,
    setSelectedMethod,
    freightLoading,
    freightError,
    destinationInfo,
  };
}
