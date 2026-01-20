// Informações da loja Pincel de Luz
export const storeInfo = {
  name: 'Pincel de Luz',
  tagline: 'Personalizados',
  fullName: 'Pincel de Luz Personalizados',
  email: 'contato@pinceldeluz.com.br',
  phone: '(75) 99173-1938',
  whatsapp: '5575991731938',
  whatsappLink: 'https://wa.me/5575991731938',
  freeShippingMinimum: 199,
  installments: 12,
  social: {
    instagram: 'https://instagram.com/pinceldeluz',
    facebook: 'https://facebook.com/pinceldeluz',
    youtube: 'https://youtube.com/@pinceldeluz',
    pinterest: 'https://pinterest.com/pinceldeluz',
  },
  address: {
    street: 'Feira de Santana',
    city: 'Feira de Santana',
    state: 'BA',
    country: 'Brasil',
  },
  cnpj: '00.000.000/0001-00',
  footerLinks: {
    institutional: [
      { name: 'Sobre Nós', href: '/sobre' },
      { name: 'Política de Privacidade', href: '/privacidade' },
      { name: 'Termos de Uso', href: '/termos' },
    ],
    help: [
      { name: 'Trocas e Devoluções', href: '/trocas' },
      { name: 'Perguntas Frequentes', href: '/faq' },
      { name: 'Contato', href: '/contato' },
      { name: 'Rastreio', href: '/rastreio' },
    ],
    payment: ['PIX', 'Boleto', 'Cartão de Crédito', 'Cartão de Débito'],
  },
};

export const heroSlides = [
  {
    id: 1,
    title: 'Crachás de Identificação',
    subtitle: 'Personalize com sua marca',
    discount: '20% OFF',
    cta: 'Aproveite agora',
    href: '/categoria/broches',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&h=500&fit=crop',
    badge: 'FRETE GRÁTIS',
  },
  {
    id: 2,
    title: 'Displays QR Code',
    subtitle: 'Modernize seu estabelecimento',
    discount: 'ATÉ 25% OFF',
    cta: 'Ver produtos',
    href: '/categoria/qr-code',
    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=1200&h=500&fit=crop',
    badge: 'LANÇAMENTO',
  },
  {
    id: 3,
    title: 'Letreiros em Neon LED',
    subtitle: 'Ilumine sua decoração',
    discount: 'NOVIDADE',
    cta: 'Conhecer',
    href: '/categoria/letreiros',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&h=500&fit=crop',
    badge: 'EXCLUSIVO',
  },
];

export const benefits = [
  {
    icon: 'truck',
    title: 'Frete Grátis',
    description: 'Acima de R$ 199',
  },
  {
    icon: 'credit-card',
    title: 'Parcelamento',
    description: 'Em até 12x sem juros',
  },
  {
    icon: 'message-circle',
    title: 'Atendimento',
    description: 'Via WhatsApp',
  },
  {
    icon: 'shield-check',
    title: 'Site Seguro',
    description: 'Compra protegida',
  },
];
