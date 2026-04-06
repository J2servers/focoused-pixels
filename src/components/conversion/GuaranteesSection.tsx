/**
 * GuaranteesSection - Garantias com design neumorphism
 * #36 micro-interactions on icons, #39 tooltips
 */

import { Shield, Truck, CreditCard, Clock, Award, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const guarantees = [
  { icon: <Shield className="h-5 w-5" />, title: 'Compra Segura', desc: 'Criptografia SSL', tip: 'Seus dados protegidos com criptografia de ponta a ponta' },
  { icon: <Truck className="h-5 w-5" />, title: 'Entrega Garantida', desc: 'Rastreamento em tempo real', tip: 'Acompanhe seu pedido do início ao fim' },
  { icon: <RefreshCw className="h-5 w-5" />, title: '30 Dias Garantia', desc: 'Troca sem complicação', tip: 'Se não gostar, devolvemos seu dinheiro' },
  { icon: <CreditCard className="h-5 w-5" />, title: 'Até 12x s/ Juros', desc: 'PIX, cartão ou boleto', tip: 'Pague como preferir, sem taxas extras' },
  { icon: <Clock className="h-5 w-5" />, title: 'Produção Rápida', desc: 'Até 7 dias úteis', tip: 'Produção ágil com controle de qualidade' },
  { icon: <Award className="h-5 w-5" />, title: 'Qualidade Premium', desc: 'Materiais duráveis', tip: 'Acrílico, MDF e LED de alta qualidade' },
];

export function GuaranteesSection() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <TooltipProvider delayDuration={300}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {guarantees.map((item) => (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center text-center gap-3 p-4 rounded-2xl neu-concave group cursor-default">
                    <div className="w-12 h-12 rounded-xl neu-convex flex items-center justify-center text-primary guarantee-icon-hover">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold">{item.title}</h4>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px] text-center">
                  <p className="text-xs">{item.tip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
