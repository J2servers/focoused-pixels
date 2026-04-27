export interface WhyChooseUsTheme {
  pageBackground: string;
  sectionBackground: string;
  darkSectionBackground: string;
  cardBackground: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textOnDark: string;
  textMutedOnDark: string;
  accent: string;
  accentSoft: string;
  buttonPrimaryBackground: string;
  buttonPrimaryText: string;
  buttonSecondaryBackground: string;
  buttonSecondaryText: string;
  headingFont: string;
  bodyFont: string;
  heroTitleSize: string;
  sectionTitleSize: string;
}

export interface WhyChooseUsImageCard {
  image: string;
  title: string;
  description: string;
  tag?: string;
}

export interface WhyChooseUsStoryItem {
  title: string;
  description: string;
}

export interface WhyChooseUsTechItem {
  title: string;
  description: string;
  highlight: string;
}

export interface WhyChooseUsBullet {
  text: string;
}

export interface WhyChooseUsConfig {
  theme: WhyChooseUsTheme;
  hero: {
    badge: string;
    title: string;
    highlightedTitle: string;
    description: string;
    secondaryDescription: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    imageMain: string;
    imageSecondary: string;
    imageTertiary: string;
    imageMainTitle: string;
    imageSecondaryTitle: string;
    imageTertiaryTitle: string;
  };
  metrics: Array<{ value: string; label: string }>;
  story: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    items: WhyChooseUsStoryItem[];
  };
  technology: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: WhyChooseUsBullet[];
    items: WhyChooseUsTechItem[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    items: WhyChooseUsImageCard[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    showcaseImages: string[];
    items: Array<{
      image: string;
      quote: string;
      author: string;
      subtitle: string;
    }>;
  };
  finalCta: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    bullets: WhyChooseUsBullet[];
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
}

/**
 * Default config — cores alinhadas ao tema Neumorphism da loja
 * (roxo vibrante #7E23B6 / fundo cinza claro)
 */
export const defaultWhyChooseUsConfig: WhyChooseUsConfig = {
  theme: {
    /* Backgrounds — neumorphism light gray */
    pageBackground: '#e6e6f0',
    sectionBackground: '#dddde8',
    darkSectionBackground: '#22222a',
    cardBackground: '#ebebf2',
    cardBorder: '#d3d3e1',

    /* Texts */
    textPrimary: '#22222a',
    textSecondary: '#67677e',
    textOnDark: '#f0f0f8',
    textMutedOnDark: '#a0a0b8',

    /* Accent — roxo vibrante Pincel de Luz */
    accent: '#7E23B6',
    accentSoft: '#ede0f5',

    /* Buttons */
    buttonPrimaryBackground: '#7E23B6',
    buttonPrimaryText: '#ffffff',
    buttonSecondaryBackground: '#ebebf2',
    buttonSecondaryText: '#7E23B6',

    /* Typography */
    headingFont: 'Montserrat, "Segoe UI", sans-serif',
    bodyFont: 'Inter, "Segoe UI", sans-serif',
    heroTitleSize: 'clamp(2.2rem, 4.5vw, 4.5rem)',
    sectionTitleSize: 'clamp(1.8rem, 3.5vw, 3.5rem)',
  },
  hero: {
    badge: 'Produção personalizada com efeito de marca e memória',
    title: 'Não vendemos só um produto.',
    highlightedTitle: 'Criamos a sensação de acerto quando ele chega nas mãos do cliente.',
    description:
      'A Pincel de Luz transforma ideia em peça memorável. Cada corte, gravação e acabamento é pensado para fazer o cliente olhar e sentir que recebeu algo realmente especial.',
    secondaryDescription:
      'Trabalhamos com corte CNC a laser CO2 e gravações em Fiber Laser, tecnologias entre as mais avançadas do mercado para quem quer precisão, acabamento premium e mais valor percebido no resultado final.',
    primaryCtaLabel: 'Quero criar meu produto',
    primaryCtaHref: '/pagamento',
    secondaryCtaLabel: 'Ver catálogo completo',
    secondaryCtaHref: '/categorias',
    imageMain: '',
    imageSecondary: '',
    imageTertiary: '',
    imageMainTitle: 'Produtos que viram vitrine da marca',
    imageSecondaryTitle: 'Personalização que também ajuda a vender',
    imageTertiaryTitle: 'Acabamento que sustenta uma percepção premium',
  },
  metrics: [
    { value: '4.9/5', label: 'avaliação média percebida pelos clientes' },
    { value: '2.8k+', label: 'interações e avaliações que reforçam confiança' },
    { value: '7 dias', label: 'prazo ágil para boa parte das entregas' },
    { value: '1 pedido', label: 'para sentir que seu presente ou marca ficaram certos' },
  ],
  story: {
    eyebrow: 'Storytelling de produção',
    title: 'O cliente não compra acrílico, MDF ou gravação.',
    highlightedTitle: 'Ele compra presença, lembrança e uma sensação boa quando mostra o resultado.',
    items: [
      {
        title: 'Tudo começa com a sua intenção',
        description:
          'Antes de falar em máquina, a gente escuta a ocasião, o objetivo da peça e o que ela precisa comunicar para o cliente final.',
      },
      {
        title: 'Depois, traduzimos ideia em material e acabamento',
        description:
          'Escolhemos espessura, contraste, gravação, brilho e proporção para transformar referência em algo bonito também fora da tela.',
      },
      {
        title: 'O resultado chega com cara de acerto',
        description:
          'Quando a caixa é aberta, a sensação é de cuidado, acabamento e valor percebido. É isso que faz o produto ser lembrado.',
      },
    ],
  },
  technology: {
    eyebrow: 'Tecnologia que sustenta o resultado',
    title: 'Quando a máquina é certa, a peça transmite valor antes mesmo de alguém tocar nela.',
    description:
      'O corte CNC a laser CO2 e a gravação Fiber Laser permitem linhas limpas, repetibilidade, detalhe fino e acabamento sofisticado em materiais personalizados.',
    bullets: [
      { text: 'Mais controle de corte, encaixe e leitura visual em materiais personalizados.' },
      { text: 'Marcação precisa para nomes, logos, textos finos e detalhes com aparência premium.' },
      { text: 'Acabamento que ajuda o cliente a perceber mais valor no que comprou.' },
    ],
    items: [
      {
        title: 'Corte a laser CNC CO2',
        description:
          'Ideal para cortes limpos, curvas bem resolvidas e acabamento preciso em acrílico, MDF e outros materiais personalizados.',
        highlight: 'Precisão visual, repetibilidade e acabamento elegante.',
      },
      {
        title: 'Gravação em Fiber Laser',
        description:
          'Perfeita para marcações finas, detalhamento técnico e personalização premium com leitura forte e aspecto profissional.',
        highlight: 'Detalhes mais finos, marcação forte e presença premium.',
      },
      {
        title: 'Controle de proporção e encaixe',
        description:
          'A peça precisa ter leitura boa, sustentação, proporção correta e presença estética. Processo e regulagem fazem diferença real.',
        highlight: 'Visual bonito na tela e ainda melhor na vida real.',
      },
    ],
  },
  gallery: {
    eyebrow: 'Galeria de resultados',
    title: 'O que convence não é só o discurso.',
    highlightedTitle: 'É ver o resultado com cara de peça bem feita.',
    description:
      'Cada imagem representa o tipo de percepção que buscamos construir: acabamento limpo, materiais bem explorados e personalização com aparência profissional.',
    items: Array.from({ length: 6 }, () => ({
      image: '',
      title: '',
      description: '',
      tag: '',
    })),
  },
  testimonials: {
    eyebrow: 'Clientes felizes com o resultado',
    title: 'Quando a peça chega certa, ela vira elogio, foto, indicação e recompra.',
    description:
      'A intenção é fazer cada cliente mostrar o produto com orgulho, seja em um presente, no ambiente ou na comunicação da marca.',
    showcaseImages: ['', '', ''],
    items: Array.from({ length: 3 }, () => ({
      image: '',
      quote: '',
      author: '',
      subtitle: '',
    })),
  },
  finalCta: {
    eyebrow: 'Por que comprar com a gente',
    title: 'Porque você quer mais do que receber um produto.',
    highlightedTitle: 'Você quer receber algo que pareça especial assim que for visto.',
    description:
      'Se a intenção é presentear, impressionar, valorizar uma marca ou criar uma peça com memória, a escolha do processo importa. É nisso que a Pincel de Luz se diferencia.',
    bullets: [
      { text: 'Atendimento consultivo em vez de resposta genérica.' },
      { text: 'Personalização pensada para impacto visual e valor percebido.' },
      { text: 'Processo claro, com sensação de segurança do início ao fim.' },
      { text: 'Experiência feita para gerar encantamento e recompra.' },
      { text: 'Acabamentos com aparência premium para presente ou marca.' },
      { text: 'Entrega com a expectativa certa e suporte depois da compra.' },
    ],
    primaryCtaLabel: 'Começar meu pedido',
    primaryCtaHref: '/pagamento',
    secondaryCtaLabel: 'Acompanhar meus pedidos',
    secondaryCtaHref: '/minha-area',
  },
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const mergeWhyChooseUsConfig = (
  base: WhyChooseUsConfig,
  partial?: unknown,
): WhyChooseUsConfig => {
  if (!isObject(partial)) return base;

  const mergeValue = (baseValue: unknown, partialValue: unknown): unknown => {
    if (Array.isArray(baseValue)) {
      return Array.isArray(partialValue) ? partialValue : baseValue;
    }

    if (isObject(baseValue)) {
      const next = { ...baseValue } as Record<string, unknown>;
      if (!isObject(partialValue)) return next;

      Object.keys(baseValue).forEach((key) => {
        next[key] = mergeValue((baseValue as Record<string, unknown>)[key], partialValue[key]);
      });

      return next;
    }

    return partialValue ?? baseValue;
  };

  return mergeValue(base, partial) as WhyChooseUsConfig;
};
