/** Centralized order status labels + semantic colors (HSL design tokens). */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'in_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

interface StatusMeta {
  label: string;
  /** Semantic Tailwind class — uses design tokens. */
  badgeClass: string;
}

const META: Record<OrderStatus, StatusMeta> = {
  pending:       { label: 'Aguardando pagamento', badgeClass: 'bg-muted text-muted-foreground' },
  paid:          { label: 'Pago',                 badgeClass: 'bg-primary/10 text-primary' },
  in_production: { label: 'Em produção',          badgeClass: 'bg-accent/20 text-accent-foreground' },
  shipped:       { label: 'Enviado',              badgeClass: 'bg-secondary/30 text-secondary-foreground' },
  delivered:     { label: 'Entregue',             badgeClass: 'bg-primary text-primary-foreground' },
  cancelled:     { label: 'Cancelado',            badgeClass: 'bg-destructive/10 text-destructive' },
  refunded:      { label: 'Reembolsado',          badgeClass: 'bg-muted text-muted-foreground' },
};

const FALLBACK: StatusMeta = { label: 'Desconhecido', badgeClass: 'bg-muted text-muted-foreground' };

export const isOrderStatus = (v: unknown): v is OrderStatus =>
  typeof v === 'string' && v in META;

export const orderStatusLabel = (status: string | null | undefined): string =>
  isOrderStatus(status) ? META[status].label : FALLBACK.label;

export const orderStatusBadgeClass = (status: string | null | undefined): string =>
  isOrderStatus(status) ? META[status].badgeClass : FALLBACK.badgeClass;

export const orderStatusMeta = (status: string | null | undefined): StatusMeta =>
  isOrderStatus(status) ? META[status] : FALLBACK;
