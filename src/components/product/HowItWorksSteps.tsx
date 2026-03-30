import { ShoppingCart, MessageCircle, Palette, Package } from 'lucide-react';

export const HowItWorksSteps = () => {
  const steps = [
    {
      icon: ShoppingCart,
      number: 1,
      title: 'Efetue a compra',
      description: 'Escolha as opções e finalize o pedido no site.',
    },
    {
      icon: MessageCircle,
      number: 2,
      title: 'Personalização via WhatsApp',
      description: 'Nossa equipe entra em contato para definir os detalhes.',
    },
    {
      icon: Palette,
      number: 3,
      title: 'Aprovação da arte',
      description: 'Você recebe a prévia do layout para aprovação.',
    },
    {
      icon: Package,
      number: 4,
      title: 'Fabricação e envio',
      description: 'Fabricamos e enviamos com rastreio completo.',
    },
  ];

  return (
    <div className="rounded-xl border border-border/30 p-4 md:p-5 space-y-3 bg-card/50">
      <h4 className="text-sm font-bold text-foreground">Como funciona:</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-muted/30">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {step.number}
            </div>
            <p className="text-xs font-semibold">{step.title}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
