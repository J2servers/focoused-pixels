import { logger } from '@/lib/logger';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Generic gateway mutation factory.
 * Centralises invoke + error handling for every payment provider edge function.
 */
export function useGatewayMutation<TRequest>(
  functionName: string,
  errorLabel: string,
) {
  return useMutation({
    mutationFn: async (request: TRequest) => {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: request,
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Payment failed');
      return data;
    },
    onError: (error: Error) => {
      logger.error('gateway', `${errorLabel} error:`, error);
      toast.error(error.message || `Erro no ${errorLabel}`);
    },
  });
}

export function useTestConnection(functionName: string) {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { action: 'test_connection' },
      });
      if (error) throw new Error(error.message);
      return data;
    },
  });
}
