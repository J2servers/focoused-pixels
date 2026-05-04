import { CheckCircle2, MapPin, Package, Truck } from 'lucide-react';

export interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  date: string;
  time: string;
}

export interface TrackingResult {
  code: string;
  events: TrackingEvent[];
  isDelivered: boolean;
  lastStatus: string;
  error?: string;
}

export function getStatusIcon(status: string, isFirst: boolean) {
  const s = status.toLowerCase();
  if (s.includes('entregue') || s.includes('delivered'))
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (s.includes('trânsito') || s.includes('encaminhado'))
    return <Truck className="h-5 w-5 text-blue-500" />;
  if (s.includes('postado')) return <Package className="h-5 w-5 text-primary" />;
  if (isFirst) return <MapPin className="h-5 w-5 text-orange-500" />;
  return <Package className="h-5 w-5 text-muted-foreground" />;
}

export function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s.includes('entregue') || s.includes('delivered'))
    return 'bg-green-500/10 text-green-700 border-green-500/30';
  if (s.includes('trânsito') || s.includes('encaminhado'))
    return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
  if (s.includes('postado')) return 'bg-primary/10 text-primary border-primary/30';
  return 'bg-muted text-muted-foreground';
}
