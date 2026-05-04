export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500' },
  processing: { label: 'Em processamento', color: 'bg-purple-500' },
  shipped: { label: 'Enviado', color: 'bg-teal-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' },
};

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando', color: 'bg-yellow-500' },
  paid: { label: 'Pago', color: 'bg-green-500' },
  failed: { label: 'Falhou', color: 'bg-red-500' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-500' },
};

export const EXPORT_COLUMNS = [
  { key: 'order_number', header: 'Numero Pedido' },
  { key: 'customer_name', header: 'Cliente' },
  { key: 'customer_email', header: 'Email' },
  { key: 'total_fmt', header: 'Total' },
  { key: 'order_status_label', header: 'Status' },
  { key: 'payment_status_label', header: 'Pagamento' },
  { key: 'created_at_fmt', header: 'Data' },
];

export const fmtCurrency = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
