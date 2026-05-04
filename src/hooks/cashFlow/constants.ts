export const ENTRY_CATEGORIES = [
  { value: 'venda', label: 'Venda de Produto' },
  { value: 'servico', label: 'Prestação de Serviço' },
  { value: 'orcamento', label: 'Orçamento Aprovado' },
  { value: 'emprestimo', label: 'Empréstimo/Aporte' },
  { value: 'outros_entrada', label: 'Outros (Entrada)' },
] as const;

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
] as const;

export const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
] as const;
