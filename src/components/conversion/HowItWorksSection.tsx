import { Palette, CheckCircle2, Truck } from 'lucide-react';

const STEPS = [
  {
    icon: Palette,
    title: '1. Você personaliza',
    description: 'Escolha o produto, envie sua ideia e ajuste do jeito que deseja.',
  },
  {
    icon: CheckCircle2,
    title: '2. A gente produz',
    description: 'Nossa equipe valida os detalhes e inicia a produção com controle de qualidade.',
  },
  {
    icon: Truck,
    title: '3. Você recebe e aprova',
    description: 'Enviamos com rastreio e suporte até a entrega final do seu pedido.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Como funciona em 3 passos</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Processo simples para você sair da ideia e chegar no produto pronto, sem dor de cabeça.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {STEPS.map((step) => (
            <article key={step.title} className="rounded-2xl neu-flat p-5 md:p-6 group">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 guarantee-icon-hover">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


