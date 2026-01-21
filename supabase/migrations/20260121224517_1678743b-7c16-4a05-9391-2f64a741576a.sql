-- Tabela de movimentações de caixa (entradas e saídas)
CREATE TABLE public.cash_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('entry', 'exit')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  reference_id TEXT,
  reference_type TEXT,
  notes TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso apenas para admins
CREATE POLICY "Admins podem visualizar transações" 
ON public.cash_transactions 
FOR SELECT 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins podem criar transações" 
ON public.cash_transactions 
FOR INSERT 
WITH CHECK (has_admin_access(auth.uid()));

CREATE POLICY "Admins podem atualizar transações" 
ON public.cash_transactions 
FOR UPDATE 
USING (has_admin_access(auth.uid()));

CREATE POLICY "Admins podem deletar transações" 
ON public.cash_transactions 
FOR DELETE 
USING (has_admin_access(auth.uid()));

-- Índices para performance
CREATE INDEX idx_cash_transactions_date ON public.cash_transactions(transaction_date);
CREATE INDEX idx_cash_transactions_type ON public.cash_transactions(type);
CREATE INDEX idx_cash_transactions_category ON public.cash_transactions(category);