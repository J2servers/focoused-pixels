export interface WhyChooseUsConfig {
  hero: {
    headline: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
    enabled: boolean;
  };
  technologies: {
    enabled: boolean;
    items: Array<{
      title: string;
      description: string;
      image: string;
    }>;
  };
  metrics: {
    enabled: boolean;
    items: Array<{
      value: string;
      label: string;
    }>;
  };
  process: {
    enabled: boolean;
    title: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
  gallery: {
    enabled: boolean;
    title: string;
    images: string[];
  };
  font: string;
}

export const defaultWhyChooseUsConfig: WhyChooseUsConfig = {
  hero: {
    headline: 'Por que escolher a Pincel de Luz?',
    subtitle: 'Tecnologia de ponta, qualidade premium e atenção a cada detalhe fazem a diferença em nossos produtos personalizados.',
    ctaText: 'Solicitar Orçamento',
    ctaLink: '/checkout',
    backgroundImage: '',
    enabled: true,
  },
  technologies: {
    enabled: true,
    items: [
      {
        title: 'Laser CO2',
        description: 'Corte e gravação de alta precisão em acrílico, MDF, couro e outros materiais orgânicos. Acabamento impecável.',
        image: '',
      },
      {
        title: 'Fiber Laser',
        description: 'Gravação permanente em metais como aço inox, alumínio e latão. Ideal para placas industriais e peças de luxo.',
        image: '',
      },
      {
        title: 'CNC Router',
        description: 'Fresamento e corte 3D para peças com relevos, letras volumétricas e formas complexas em diversos materiais.',
        image: '',
      },
    ],
  },
  metrics: {
    enabled: true,
    items: [
      { value: '5+', label: 'Anos de Mercado' },
      { value: '2.000+', label: 'Projetos Entregues' },
      { value: '800+', label: 'Clientes Satisfeitos' },
      { value: '99%', label: 'Satisfação' },
    ],
  },
  process: {
    enabled: true,
    title: 'Nosso Processo',
    steps: [
      { title: 'Escolha seu Produto', description: 'Navegue pelo catálogo ou envie seu projeto personalizado.' },
      { title: 'Personalize', description: 'Envie seu logo, textos e escolha materiais e acabamentos.' },
      { title: 'Produção', description: 'Fabricamos com tecnologia de ponta e controle de qualidade rigoroso.' },
      { title: 'Receba em Casa', description: 'Embalagem segura e envio rastreado para todo o Brasil.' },
    ],
  },
  gallery: {
    enabled: true,
    title: 'Galeria de Projetos',
    images: [],
  },
  font: 'Inter',
};
