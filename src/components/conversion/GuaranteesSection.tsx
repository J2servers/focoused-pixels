/**
 * GuaranteesSection - Garantias com design neumorphism
 */

import { Shield, Truck, CreditCard, Clock, Award, RefreshCw } from 'lucide-react';

const guarantees = [
  { icon: <Shield className="h-5 w-5" />, title: 'Compra Segura', desc: 'Criptografia SSL' },
  { icon: <Truck className="h-5 w-5" />, title: 'Entrega Garantida', desc: 'Rastreamento em tempo real' },
  { icon: <RefreshCw className="h-5 w-5" />, title: '30 Dias Garantia', desc: 'Troca sem complicação' },
  { icon: <CreditCard className="h-5 w-5" />, title: 'Até 12x s/ Juros', desc: 'PIX, cartão ou boleto' },
  { icon: <Clock className="h-5 w-5" />, title: 'Produção Rápida', desc: 'Até 7 dias úteis' },
  { icon: <Award className="h-5 w-5" />, title: 'Qualidade Premium', desc: 'Materiais duráveis' },
];

export function GuaranteesSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {guarantees.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl neu-concave">
              <div className="w-12 h-12 rounded-xl neu-convex flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs font-semibold">{item.title}</h4>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
