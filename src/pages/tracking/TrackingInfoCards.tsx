import { CheckCircle2, Package, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export function TrackingInfoCards() {
  const items = [
    { Icon: Package, title: 'Onde encontro o código?', desc: 'O código de rastreio é enviado por e-mail e WhatsApp quando seu pedido é despachado' },
    { Icon: Truck, title: 'Prazo de entrega', desc: 'O prazo varia de acordo com a região. Geralmente de 3 a 15 dias úteis' },
    { Icon: CheckCircle2, title: 'Atualizações automáticas', desc: 'Você receberá atualizações por e-mail a cada movimentação do seu pedido' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 mt-8"
    >
      {items.map(({ Icon, title, desc }) => (
        <Card key={title} className="text-center p-6">
          <Icon className="h-10 w-10 mx-auto mb-3 text-primary" />
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </Card>
      ))}
    </motion.div>
  );
}
