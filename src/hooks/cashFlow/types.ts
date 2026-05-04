export type CashTransactionType = 'entry' | 'exit';

export interface CashTransaction {
  id: string;
  type: CashTransactionType;
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
  type: CashTransactionType;
  category: string;
  description: string;
  amount: number;
  payment_method?: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  transaction_date?: string;
}
