// Informações da loja Goat Comunicação Visual
export const storeInfo = {
  name: 'GOAT',
  tagline: 'Comunicação Visual',
  fullName: 'GOAT Comunicação Visual',
  email: 'contato@goatcomunicacaovisual.com.br',
  phone: '(11) 99999-9999',
  whatsapp: '5511999999999',
  whatsappLink: 'https://wa.me/5511999999999',
  freeShippingMinimum: 159,
  installments: 12,
  productionTime: '4 a 10 dias úteis',
  warranty: '3 meses',
  social: {
    instagram: 'https://instagram.com/goatcomunicacaovisual',
    facebook: 'https://facebook.com/goatcomunicacaovisual',
    youtube: 'https://youtube.com/@goatcomunicacaovisual',
    pinterest: 'https://pinterest.com/goatcomunicacaovisual',
    tiktok: 'https://tiktok.com/@goatcomunicacaovisual',
  },
  address: {
    street: 'Av. Paulista, 1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zip: '01310-100',
    country: 'Brasil',
  },
  cnpj: '00.000.000/0001-00',
  footerLinks: {
    institutional: [
      { name: 'Sobre Nós', href: '/sobre' },
      { name: 'Política de Privacidade', href: '/privacidade' },
      { name: 'Termos de Uso', href: '/termos' },
      { name: 'Garantia', href: '/garantia' },
    ],
    help: [
      { name: 'Trocas e Devoluções', href: '/trocas' },
      { name: 'Perguntas Frequentes', href: '/faq' },
      { name: 'Contato', href: '/contato' },
      { name: 'Rastreio', href: '/rastreio' },
      { name: 'Como Personalizar', href: '/como-personalizar' },
    ],
    payment: ['PIX', 'Boleto', 'Cartão de Crédito em até 12x', 'Cartão de Débito'],
  },
  customizationOptions: {
    backgroundColors: ['Branco', 'Preto', 'Transparente', 'Azul Royal', 'Rosa', 'Lilás', 'Verde', 'Vermelho'],
    mirrorColors: ['Dourado', 'Prata', 'Rose Gold', 'Azul', 'Bronze', 'Vermelho', 'Verde', 'Lilás', 'Laranja', 'Preto'],
    materials: ['Acrílico Cristal', 'Acrílico Espelhado', 'MDF', 'Acrílico com LED'],
    finishes: ['Polido', 'Fosco', 'Brilhante'],
    fixation: ['Fita Dupla Face (inclusa)', 'Prolongadores de Inox', 'Suporte de Mesa'],
  },
};

// Importar imagens dos heróis
import heroQrcode from '@/assets/hero/hero-qrcode.jpg';
import heroNeon from '@/assets/hero/hero-neon.jpg';
import heroCrachas from '@/assets/hero/hero-crachas.jpg';

export const heroSlides = [
  {
    id: 1,
    title: 'Displays QR Code',
    subtitle: 'Modernize seu estabelecimento com displays profissionais',
    discount: 'ATÉ 25% OFF',
    cta: 'Ver Produtos',
    href: '/categoria/qr-code',
    image: heroQrcode,
    badge: 'FRETE GRÁTIS',
  },
  {
    id: 2,
    title: 'Letreiros Neon LED',
    subtitle: 'Ilumine sua decoração com estilo único',
    discount: 'NOVIDADE',
    cta: 'Conhecer',
    href: '/categoria/letreiros',
    image: heroNeon,
    badge: 'EXCLUSIVO',
  },
  {
    id: 3,
    title: 'Crachás Empresariais',
    subtitle: 'Identificação profissional para sua equipe',
    discount: '20% OFF',
    cta: 'Aproveite',
    href: '/categoria/broches',
    image: heroCrachas,
    badge: 'COMPRE E GANHE',
  },
];

export const benefits = [
  {
    icon: 'truck',
    title: 'Frete Grátis',
    description: 'Acima de R$ 159',
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
    title: 'Garantia',
    description: '3 meses de garantia',
  },
];

export const discountTiers = [
  { quantity: 10, discount: 5 },
  { quantity: 20, discount: 10 },
  { quantity: 50, discount: 15 },
  { quantity: 100, discount: 20 },
];
