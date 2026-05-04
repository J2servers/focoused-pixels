import { logger } from '@/lib/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CashTransactionInput } from './types';

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: ['cash-transactions'] });

export function useCreateCashTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CashTransactionInput) => {
      const { data, error } = await supabase
        .from('cash_transactions')
        .insert({
          ...input,
          transaction_date: input.transaction_date || new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success('Transação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao registrar transação');
    },
  });
}

export function useUpdateCashTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CashTransactionInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('cash_transactions')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success('Transação atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
    },
  });
}

export function useDeleteCashTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cash_transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate(qc);
      toast.success('Transação excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação');
    },
  });
}
