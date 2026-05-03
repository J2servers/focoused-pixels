import { Card, CardContent } from '@/components/ui/card';
import { Package, Wrench, CheckCircle, Truck } from 'lucide-react';

interface OrderLike { production_status: string }

export function OrderStats({ orders }: { orders: OrderLike[] }) {
  const inProduction = orders.filter(o => ['in_production', 'quality_check'].includes(o.production_status)).length;
  const ready = orders.filter(o => o.production_status === 'ready').length;
  const shipped = orders.filter(o => o.production_status === 'shipped').length;

  const cards = [
    { icon: Package, color: 'primary', bg: 'bg-primary/10', text: 'text-primary', value: orders.length, label: 'Total de Pedidos' },
    { icon: Wrench, color: 'blue', bg: 'bg-blue-500/10', text: 'text-blue-500', value: inProduction, label: 'Em Produção' },
    { icon: CheckCircle, color: 'green', bg: 'bg-green-500/10', text: 'text-green-500', value: ready, label: 'Prontos' },
    { icon: Truck, color: 'teal', bg: 'bg-teal-500/10', text: 'text-teal-500', value: shipped, label: 'Enviados' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${c.bg}`}>
                  <Icon className={`h-5 w-5 ${c.text}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{c.value}</p>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
