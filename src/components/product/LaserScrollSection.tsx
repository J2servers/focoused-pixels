import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import laserImg1 from '@/assets/laser/laser-engraving-1.jpg';
import laserImg2 from '@/assets/laser/laser-engraving-2.jpg';
import laserImg3 from '@/assets/laser/laser-engraving-3.jpg';

const steps = [
  {
    image: laserImg1,
    title: 'Precisão Absoluta',
    description: 'Corte e gravação a laser com precisão de 0.1mm em acrílico, garantindo detalhes perfeitos.',
  },
  {
    image: laserImg2,
    title: 'Personalização em MDF',
    description: 'Textos, logos e designs únicos gravados com tecnologia de ponta em MDF de alta qualidade.',
  },
  {
    image: laserImg3,
    title: 'Arte em Cada Detalhe',
    description: 'Mandalas, padrões decorativos e cortes complexos que transformam madeira em obra de arte.',
  },
];

export function LaserScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section ref={containerRef} className="py-16 overflow-hidden">
      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [0, 1]) }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Feito com Tecnologia Laser
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Cada produto é criado com equipamentos de corte e gravação a laser de última geração
        </p>
      </motion.div>

      <div className="space-y-24 lg:space-y-32">
        {steps.map((step, index) => (
          <LaserStep key={index} step={step} index={index} />
        ))}
      </div>
    </section>
  );
}

function LaserStep({ step, index }: { step: typeof steps[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.85]);
  const imageY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16 px-4`}
    >
      {/* Image with parallax */}
      <motion.div
        style={{ y: imageY, scale }}
        className="w-full lg:w-1/2 relative"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
          <motion.img
            src={step.image}
            alt={step.title}
            className="w-full aspect-[4/3] object-cover"
            loading="lazy"
          />
          {/* Laser glow overlay */}
          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.2, 0.5], [0, 0.6]) }}
            className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent pointer-events-none"
          />
          {/* Animated scan line */}
          <motion.div
            style={{
              top: useTransform(scrollYProgress, [0.15, 0.85], ['0%', '100%']),
            }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 pointer-events-none"
          />
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        style={{ y, opacity }}
        className="w-full lg:w-1/2 text-center lg:text-left"
      >
        <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase mb-3 bg-primary/10 px-3 py-1 rounded-full">
          Etapa {index + 1}
        </span>
        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
          {step.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed text-base lg:text-lg">
          {step.description}
        </p>
      </motion.div>
    </div>
  );
}
