import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CashTransaction {
  id: string;
  type: 'entry' | 'exit';
  category: string;
  description: string;
  amount: number;
  payment_method: string | null;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  transaction_date: string;
  created_at: string;
  created_by: string | null;
}

export interface CashTransactionInput {
  type: 'entry' | 'exit';
  category: string;
  description: string;
  amount: number;
  payment_method?: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  transaction_date?: string;
}

// Categorias padrão para entradas e saídas
export const ENTRY_CATEGORIES = [
  { value: 'venda', label: 'Venda de Produto' },
  { value: 'servico', label: 'Prestação de Serviço' },
  { value: 'orcamento', label: 'Orçamento Aprovado' },
  { value: 'emprestimo', label: 'Empréstimo/Aporte' },
  { value: 'outros_entrada', label: 'Outros (Entrada)' },
];

export const EXIT_CATEGORIES = [
  { value: 'material', label: 'Compra de Material' },
  { value: 'fornecedor', label: 'Pagamento Fornecedor' },
  { value: 'salario', label: 'Salário/Pró-labore' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'energia', label: 'Energia/Água/Gás' },
  { value: 'internet', label: 'Internet/Telefone' },
  { value: 'imposto', label: 'Impostos e Taxas' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'marketing', label: 'Marketing/Publicidade' },
  { value: 'frete', label: 'Frete/Transporte' },
  { value: 'outros_saida', label: 'Outros (Saída)' },
];

export const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
];

export function useCashTransactions(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['cash-transactions', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('cash_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CashTransaction[];
    },
  });
}

export function useCashSummary(startDate?: string, endDate?: string) {
  const { data: transactions } = useCashTransactions(startDate, endDate);

  const totalEntries = transactions
    ?.filter(t => t.type === 'entry')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const totalExits = transactions
    ?.filter(t => t.type === 'exit')
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const balance = totalEntries - totalExits;

  // Agrupar por categoria
  const entriesByCategory = transactions
    ?.filter(t => t.type === 'entry')
    .reduce((acc, t) => {
      const cat = t.category;
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>) || {};

  const exitsByCategory = transactions
    ?.filter(t => t.type === 'exit')
    .reduce((acc, t) => {
      const cat = t.category;
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>) || {};

  return {
    totalEntries,
    totalExits,
    balance,
    entriesByCategory,
    exitsByCategory,
    transactionCount: transactions?.length || 0,
  };
}

export function useCreateCashTransaction() {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['cash-transactions'] });
      toast.success('Transação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao registrar transação');
    },
  });
}

export function useUpdateCashTransaction() {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['cash-transactions'] });
      toast.success('Transação atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
    },
  });
}

export function useDeleteCashTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cash_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-transactions'] });
      toast.success('Transação excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação');
    },
  });
}
