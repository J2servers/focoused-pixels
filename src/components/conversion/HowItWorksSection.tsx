import { motion } from 'framer-motion';
import { Search, Palette, Settings, Truck } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Escolha',
    description: 'Navegue pelo catálogo e selecione o produto ideal para seu projeto.',
  },
  {
    icon: Palette,
    title: 'Personalize',
    description: 'Envie seu logo, textos e especificações. Nós cuidamos do design.',
  },
  {
    icon: Settings,
    title: 'Produção',
    description: 'Fabricamos com laser de precisão e controle de qualidade rigoroso.',
  },
  {
    icon: Truck,
    title: 'Receba',
    description: 'Entrega segura com embalagem reforçada e rastreio em tempo real.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Como Funciona em 3 Passos
          </h2>
          <p className="text-muted-foreground mt-2">
            Do pedido à entrega, simples e transparente.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
