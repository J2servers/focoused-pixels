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
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Feito com Tecnologia Laser
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Cada produto é criado com equipamentos de corte e gravação a laser de última geração
        </p>
      </div>

      <div className="space-y-16 lg:space-y-20 container mx-auto px-4">
        {steps.map((step, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={index}
              className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
            >
              <div className="w-full lg:w-1/2">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full aspect-[4/3] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase mb-3 bg-primary/10 px-3 py-1 rounded-full">
                  Etapa {index + 1}
                </span>
                <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base lg:text-lg">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
