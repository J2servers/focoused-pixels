// Dados de produtos - Goat Comunicação Visual
// Importar imagens de produtos
import displayQrCode from '@/assets/products/display-qr-code.jpg';
import crachasAcrilico from '@/assets/products/crachas-acrilico.jpg';
import letreiroNeonLed from '@/assets/products/letreiro-neon-led.jpg';
import placaPortaEscritorio from '@/assets/products/placa-porta-escritorio.jpg';
import letreiroParedeAcrilico from '@/assets/products/letreiro-parede-acrilico.jpg';
import brochesEspelhados from '@/assets/products/broches-espelhados.jpg';
import chaveirosPersonalizados from '@/assets/products/chaveiros-personalizados.jpg';
import espelhoMaoPersonalizado from '@/assets/products/espelho-mao-personalizado.jpg';
import caixaPresenteMdf from '@/assets/products/caixa-presente-mdf.jpg';
import placaInfantil from '@/assets/products/placa-infantil.jpg';
import bandejaAcrilico from '@/assets/products/bandeja-acrilico.jpg';
import espelhoDecorativo from '@/assets/products/espelho-decorativo.jpg';
import mandalaDecorativa from '@/assets/products/mandala-decorativa.jpg';
import organizadorMesa from '@/assets/products/organizador-mesa.jpg';
import displayQrMultiplo from '@/assets/products/display-qr-multiplo.jpg';
import letreiro3dLed from '@/assets/products/letreiro-3d-led.jpg';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  fullDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviews: number;
  freeShipping: boolean;
  badge?: 'lancamento' | 'desconto' | 'brinde' | 'esgotado';
  sizes?: string[];
  colors?: string[];
  materials?: string[];
  customizable: boolean;
  minQuantity?: number;
  inStock: boolean;
  tags?: string[];
  specifications?: { label: string; value: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  subcategories?: { id: string; name: string; slug: string; description?: string }[];
}

export const categories: Category[] = [
  {
    id: 'qr-code',
    name: 'Displays QR Code',
    slug: 'qr-code',
    description: 'Displays profissionais para QR Code',
    subcategories: [
      { id: 'belleforme', name: 'Linha Belleforme', slug: 'belleforme', description: 'Design elegante e sofisticado' },
      { id: 'classic', name: 'Linha Classic', slug: 'classic', description: 'Modelo tradicional e versátil' },
      { id: 'aurea', name: 'Linha Aurea', slug: 'aurea', description: 'Acabamento dourado premium' },
      { id: 'royale', name: 'Linha Royale', slug: 'royale', description: 'Para estabelecimentos de luxo' },
      { id: 'lux', name: 'Linha Lux', slug: 'lux', description: 'Minimalismo com sofisticação' },
    ],
  },
  {
    id: 'letreiros',
    name: 'Letreiros',
    slug: 'letreiros',
    description: 'Letreiros personalizados para sua marca',
    subcategories: [
      { id: 'so-letras', name: 'Só Letras', slug: 'so-letras', description: 'Letras soltas para composição' },
      { id: 'com-placa', name: 'Com Placa de Fundo', slug: 'com-placa', description: 'Letreiros com base' },
      { id: 'com-led', name: 'Com LED', slug: 'com-led', description: 'Iluminação inclusa' },
      { id: 'neon-led', name: 'Neon LED', slug: 'neon-led', description: 'Efeito neon flexível' },
      { id: 'letras-3d', name: 'Letras 3D', slug: 'letras-3d', description: 'Relevo tridimensional' },
    ],
  },
  {
    id: 'placas-porta',
    name: 'Placas de Porta',
    slug: 'placas-porta',
    description: 'Sinalização elegante para ambientes',
    subcategories: [
      { id: 'opus-nobre', name: 'Linha Opus Nobre', slug: 'opus-nobre' },
      { id: 'elegance', name: 'Linha Elegance', slug: 'elegance' },
      { id: 'prestige', name: 'Linha Prestige', slug: 'prestige' },
      { id: 'dor-ambience', name: "Linha D'Or Ambience", slug: 'dor-ambience' },
      { id: 'aurea-design', name: 'Linha Aurea Design', slug: 'aurea-design' },
    ],
  },
  {
    id: 'broches',
    name: 'Broches e Pins',
    slug: 'broches',
    description: 'Identificação e decoração pessoal',
    subcategories: [
      { id: 'espelhados', name: 'Linha Espelhados', slug: 'espelhados', description: 'Acabamento espelhado premium' },
      { id: 'escovados', name: 'Linha Escovados', slug: 'escovados', description: 'Textura escovada elegante' },
      { id: 'coloridos', name: 'Linha Coloridos', slug: 'coloridos', description: 'Cores vibrantes' },
      { id: 'crachas', name: 'Crachás Empresariais', slug: 'crachas', description: 'Identificação profissional' },
    ],
  },
  {
    id: 'home-decor',
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Decoração para sua casa',
    subcategories: [
      { id: 'bandejas', name: 'Bandejas', slug: 'bandejas' },
      { id: 'quadros', name: 'Quadros Decorativos', slug: 'quadros' },
      { id: 'organizadores', name: 'Organizadores', slug: 'organizadores' },
      { id: 'mandalas', name: 'Mandalas', slug: 'mandalas' },
    ],
  },
  {
    id: 'espelhos',
    name: 'Espelhos',
    slug: 'espelhos',
    description: 'Espelhos decorativos e personalizados',
    subcategories: [
      { id: 'reflexo', name: 'Linha Reflexo', slug: 'reflexo', description: 'Espelhos de mão' },
      { id: 'decorativos', name: 'Decorativos', slug: 'decorativos', description: 'Para ambientes' },
      { id: 'personalizados', name: 'Personalizados', slug: 'personalizados', description: 'Com sua marca' },
    ],
  },
  {
    id: 'caixas',
    name: 'Caixas',
    slug: 'caixas',
    description: 'Caixas personalizadas para presentes',
    subcategories: [
      { id: 'presente', name: 'Caixas de Presente', slug: 'presente' },
      { id: 'organizadoras', name: 'Caixas Organizadoras', slug: 'organizadoras' },
      { id: 'kit', name: 'Kits Especiais', slug: 'kit' },
    ],
  },
  {
    id: 'brindes',
    name: 'Brindes',
    slug: 'brindes',
    description: 'Brindes corporativos personalizados',
    subcategories: [
      { id: 'chaveiros', name: 'Chaveiros Premium', slug: 'chaveiros' },
      { id: 'corporativos', name: 'Corporativos', slug: 'corporativos' },
      { id: 'eventos', name: 'Para Eventos', slug: 'eventos' },
    ],
  },
  {
    id: 'infantil',
    name: 'Infantil',
    slug: 'infantil',
    description: 'Decoração para quartos infantis',
    subcategories: [
      { id: 'placas-nome', name: 'Placas com Nome', slug: 'placas-nome' },
      { id: 'decoracao', name: 'Decoração', slug: 'decoracao' },
      { id: 'porta-maternidade', name: 'Porta Maternidade', slug: 'porta-maternidade' },
    ],
  },
];

export const products: Product[] = [
  // ===== DISPLAYS QR CODE =====
  {
    id: 'display-qr-belleforme-1',
    name: 'Display QR Code Belleforme 1 QR',
    slug: 'display-qr-belleforme-1-qr',
    description: 'Display em acrílico cristal com design elegante para 1 QR Code. Perfeito para PIX, cardápio digital ou redes sociais.',
    fullDescription: 'O Display Belleforme é a escolha perfeita para estabelecimentos que buscam elegância e praticidade. Fabricado em acrílico cristal de alta qualidade com corte a laser de precisão, este display comporta 1 QR Code personalizado. Ideal para pagamentos via PIX, cardápios digitais, links de redes sociais ou avaliações do Google. Acompanha base estável e apliques em acrílico espelhado dourado.',
    price: 129.90,
    originalPrice: 159.90,
    discount: 19,
    image: displayQrCode,
    images: [displayQrCode, displayQrMultiplo],
    category: 'qr-code',
    subcategory: 'belleforme',
    rating: 4.9,
    reviews: 234,
    freeShipping: true,
    badge: 'desconto',
    colors: ['Dourado', 'Prata', 'Rose Gold', 'Preto'],
    materials: ['Acrílico Cristal', 'Acrílico Preto'],
    customizable: true,
    inStock: true,
    tags: ['qr code', 'display', 'pix', 'cardápio', 'instagram'],
    specifications: [
      { label: 'Material', value: 'Acrílico Cristal 3mm' },
      { label: 'Dimensões', value: '15x20cm' },
      { label: 'Acabamento', value: 'Polido' },
      { label: 'Fixação', value: 'Base de mesa inclusa' },
    ],
  },
  {
    id: 'display-qr-belleforme-3',
    name: 'Display QR Code Belleforme 3 QRs',
    slug: 'display-qr-belleforme-3-qrs',
    description: 'Display premium para 3 QR Codes. Ideal para PIX, cardápio e Instagram em um único display.',
    fullDescription: 'Display Belleforme versão expandida para 3 QR Codes. Organize PIX, cardápio digital e redes sociais em um único display elegante.',
    price: 179.90,
    originalPrice: 219.90,
    discount: 18,
    image: displayQrMultiplo,
    category: 'qr-code',
    subcategory: 'belleforme',
    rating: 4.8,
    reviews: 156,
    freeShipping: true,
    badge: 'desconto',
    colors: ['Dourado', 'Prata', 'Rose Gold'],
    customizable: true,
    inStock: true,
    tags: ['qr code', 'display', 'múltiplo', 'restaurante'],
    specifications: [
      { label: 'Material', value: 'Acrílico Cristal 3mm' },
      { label: 'Dimensões', value: '20x30cm' },
      { label: 'QR Codes', value: 'Até 3 códigos' },
    ],
  },
  {
    id: 'display-qr-classic-1',
    name: 'Display QR Code Classic',
    slug: 'display-qr-classic-1-qr',
    description: 'Modelo clássico e versátil para 1 QR Code. Design clean e profissional.',
    price: 89.90,
    image: displayQrCode,
    category: 'qr-code',
    subcategory: 'classic',
    rating: 4.7,
    reviews: 312,
    freeShipping: true,
    customizable: true,
    inStock: true,
    tags: ['qr code', 'display', 'classic'],
  },

  // ===== LETREIROS =====
  {
    id: 'letreiro-neon-personalizado',
    name: 'Letreiro Neon LED Personalizado',
    slug: 'letreiro-neon-led-personalizado',
    description: 'Letreiro em LED neon flexível com sua frase ou nome. Inclui fonte de alimentação e controle remoto com dimmer.',
    fullDescription: 'Crie uma atmosfera única com nosso Letreiro Neon LED personalizado. Fabricado com tecnologia de LED flexível que simula o efeito neon tradicional, porém com baixo consumo de energia e maior durabilidade. Perfeito para decoração de ambientes, fachadas, estúdios, quartos e eventos.',
    price: 289.90,
    originalPrice: 349.90,
    discount: 17,
    image: letreiroNeonLed,
    category: 'letreiros',
    subcategory: 'neon-led',
    rating: 4.9,
    reviews: 445,
    freeShipping: true,
    badge: 'lancamento',
    sizes: ['P (até 50cm)', 'M (até 80cm)', 'G (até 120cm)', 'GG (até 150cm)'],
    colors: ['Rosa', 'Azul', 'Verde', 'Amarelo', 'Vermelho', 'Branco Quente', 'Branco Frio', 'RGB'],
    customizable: true,
    inStock: true,
    tags: ['neon', 'led', 'letreiro', 'decoração', 'personalizado'],
    specifications: [
      { label: 'Tecnologia', value: 'LED Neon Flexível' },
      { label: 'Voltagem', value: '110V/220V (bivolt)' },
      { label: 'Vida útil', value: '50.000 horas' },
      { label: 'Controle', value: 'Remoto com dimmer' },
    ],
  },
  {
    id: 'letreiro-acrilico-parede',
    name: 'Letreiro Acrílico para Parede',
    slug: 'letreiro-acrilico-parede',
    description: 'Letreiro em acrílico espelhado para fixação em parede. Design moderno e sofisticado.',
    price: 149.90,
    originalPrice: 189.90,
    discount: 21,
    image: letreiroParedeAcrilico,
    category: 'letreiros',
    subcategory: 'so-letras',
    rating: 4.8,
    reviews: 267,
    freeShipping: true,
    badge: 'desconto',
    sizes: ['P (15cm altura)', 'M (20cm altura)', 'G (30cm altura)', 'GG (40cm altura)'],
    colors: ['Dourado', 'Prata', 'Rose Gold', 'Preto', 'Branco'],
    customizable: true,
    inStock: true,
    tags: ['letreiro', 'acrílico', 'parede', 'decoração'],
  },
  {
    id: 'letreiro-3d-led-empresa',
    name: 'Letreiro 3D com LED Backlight',
    slug: 'letreiro-3d-led-empresa',
    description: 'Letreiro corporativo 3D com iluminação LED traseira. Impacto visual garantido para sua empresa.',
    price: 549.90,
    originalPrice: 699.90,
    discount: 21,
    image: letreiro3dLed,
    category: 'letreiros',
    subcategory: 'com-led',
    rating: 5.0,
    reviews: 89,
    freeShipping: true,
    badge: 'brinde',
    sizes: ['Até 1 metro', 'Até 2 metros', 'Até 3 metros'],
    customizable: true,
    inStock: true,
    tags: ['letreiro', '3d', 'led', 'empresa', 'fachada'],
  },

  // ===== PLACAS DE PORTA =====
  {
    id: 'placa-porta-opus-nobre',
    name: 'Placa de Porta Opus Nobre',
    slug: 'placa-porta-opus-nobre',
    description: 'Placa elegante em acrílico preto com letras douradas. Perfeita para escritórios e consultórios.',
    fullDescription: 'A Linha Opus Nobre representa o que há de mais sofisticado em sinalização corporativa. Fabricada em acrílico preto de alta qualidade com apliques em acrílico espelhado dourado, esta placa transmite profissionalismo e elegância.',
    price: 89.90,
    originalPrice: 109.90,
    discount: 18,
    image: placaPortaEscritorio,
    category: 'placas-porta',
    subcategory: 'opus-nobre',
    rating: 4.9,
    reviews: 178,
    freeShipping: true,
    badge: 'desconto',
    sizes: ['25x9cm', '30x10cm', '35x12cm'],
    colors: ['Dourado', 'Prata', 'Rose Gold'],
    customizable: true,
    inStock: true,
    tags: ['placa', 'porta', 'escritório', 'consultório', 'sinalização'],
    specifications: [
      { label: 'Material Base', value: 'Acrílico Preto 3mm' },
      { label: 'Apliques', value: 'Acrílico Espelhado' },
      { label: 'Fixação', value: 'Fita dupla face inclusa' },
    ],
  },
  {
    id: 'placa-porta-elegance',
    name: 'Placa de Porta Elegance',
    slug: 'placa-porta-elegance',
    description: 'Design clean e minimalista em acrílico cristal com letras espelhadas.',
    price: 79.90,
    image: placaPortaEscritorio,
    category: 'placas-porta',
    subcategory: 'elegance',
    rating: 4.7,
    reviews: 134,
    freeShipping: true,
    customizable: true,
    inStock: true,
    tags: ['placa', 'porta', 'elegance', 'minimalista'],
  },

  // ===== BROCHES E PINS =====
  {
    id: 'broche-espelhado-personalizado',
    name: 'Broche Espelhado Personalizado',
    slug: 'broche-espelhado-personalizado',
    description: 'Broche em acrílico espelhado com corte a laser. Ideal para identificação com estilo.',
    price: 24.90,
    originalPrice: 34.90,
    discount: 29,
    image: brochesEspelhados,
    category: 'broches',
    subcategory: 'espelhados',
    rating: 4.8,
    reviews: 456,
    freeShipping: false,
    badge: 'desconto',
    colors: ['Dourado', 'Prata', 'Rose Gold', 'Azul', 'Verde', 'Vermelho'],
    customizable: true,
    minQuantity: 5,
    inStock: true,
    tags: ['broche', 'pin', 'espelhado', 'identificação'],
  },
  {
    id: 'kit-crachas-empresariais-10',
    name: 'Kit 10 Crachás Empresariais',
    slug: 'kit-crachas-empresariais-10',
    description: 'Kit com 10 crachás em acrílico cristal com logo gravado a laser. Cordão incluso.',
    price: 189.90,
    originalPrice: 249.90,
    discount: 24,
    image: crachasAcrilico,
    category: 'broches',
    subcategory: 'crachas',
    rating: 4.9,
    reviews: 312,
    freeShipping: true,
    badge: 'brinde',
    customizable: true,
    inStock: true,
    tags: ['crachá', 'empresa', 'identificação', 'kit'],
  },
  {
    id: 'cracha-identificacao-unitario',
    name: 'Crachá de Identificação Premium',
    slug: 'cracha-identificacao-premium',
    description: 'Crachá individual em acrílico com gravação personalizada e presilha.',
    price: 29.90,
    image: crachasAcrilico,
    category: 'broches',
    subcategory: 'crachas',
    rating: 4.6,
    reviews: 567,
    freeShipping: false,
    customizable: true,
    inStock: true,
    tags: ['crachá', 'identificação', 'premium'],
  },

  // ===== HOME DECOR =====
  {
    id: 'bandeja-acrilico-decorativa',
    name: 'Bandeja Decorativa em Acrílico',
    slug: 'bandeja-acrilico-decorativa',
    description: 'Bandeja em acrílico cristal com alças douradas e gravação decorativa.',
    price: 149.90,
    originalPrice: 189.90,
    discount: 21,
    image: bandejaAcrilico,
    category: 'home-decor',
    subcategory: 'bandejas',
    rating: 4.8,
    reviews: 89,
    freeShipping: true,
    badge: 'desconto',
    sizes: ['P (25x35cm)', 'M (30x40cm)', 'G (35x50cm)'],
    customizable: true,
    inStock: true,
    tags: ['bandeja', 'decoração', 'acrílico', 'home'],
  },
  {
    id: 'mandala-mdf-decorativa',
    name: 'Mandala Decorativa MDF',
    slug: 'mandala-decorativa-mdf',
    description: 'Mandala em MDF cortada a laser com design intrincado. Pintura branca ou natural.',
    price: 89.90,
    originalPrice: 119.90,
    discount: 25,
    image: mandalaDecorativa,
    category: 'home-decor',
    subcategory: 'mandalas',
    rating: 4.9,
    reviews: 234,
    freeShipping: true,
    badge: 'desconto',
    sizes: ['30cm', '50cm', '70cm', '90cm'],
    colors: ['Branco', 'Natural', 'Dourado', 'Preto'],
    customizable: false,
    inStock: true,
    tags: ['mandala', 'decoração', 'mdf', 'parede'],
  },
  {
    id: 'organizador-mesa-escritorio',
    name: 'Organizador de Mesa Premium',
    slug: 'organizador-mesa-premium',
    description: 'Organizador em acrílico cristal com múltiplos compartimentos para escritório.',
    price: 79.90,
    image: organizadorMesa,
    category: 'home-decor',
    subcategory: 'organizadores',
    rating: 4.7,
    reviews: 156,
    freeShipping: true,
    customizable: true,
    inStock: true,
    tags: ['organizador', 'escritório', 'mesa', 'acrílico'],
  },

  // ===== ESPELHOS =====
  {
    id: 'espelho-mao-reflexo',
    name: 'Espelho de Mão Linha Reflexo',
    slug: 'espelho-mao-linha-reflexo',
    description: 'Espelho de mão em acrílico com design floral. Perfeito para maquiagem e presente.',
    price: 59.90,
    originalPrice: 79.90,
    discount: 25,
    image: espelhoMaoPersonalizado,
    category: 'espelhos',
    subcategory: 'reflexo',
    rating: 4.8,
    reviews: 178,
    freeShipping: false,
    badge: 'desconto',
    colors: ['Rosa', 'Lilás', 'Azul', 'Verde', 'Transparente'],
    customizable: true,
    inStock: true,
    tags: ['espelho', 'mão', 'maquiagem', 'presente'],
  },
  {
    id: 'espelho-decorativo-geometrico',
    name: 'Espelho Decorativo Geométrico',
    slug: 'espelho-decorativo-geometrico',
    description: 'Espelho com moldura em acrílico dourado e formato octogonal moderno.',
    price: 179.90,
    originalPrice: 229.90,
    discount: 22,
    image: espelhoDecorativo,
    category: 'espelhos',
    subcategory: 'decorativos',
    rating: 4.9,
    reviews: 67,
    freeShipping: true,
    badge: 'lancamento',
    sizes: ['40cm', '50cm', '60cm'],
    customizable: false,
    inStock: true,
    tags: ['espelho', 'decorativo', 'geométrico', 'parede'],
  },

  // ===== CAIXAS =====
  {
    id: 'caixa-presente-mdf-coracao',
    name: 'Caixa de Presente MDF Coração',
    slug: 'caixa-presente-mdf-coracao',
    description: 'Caixa em MDF com tampa gravada a laser. Perfeita para presentes especiais.',
    price: 69.90,
    originalPrice: 89.90,
    discount: 22,
    image: caixaPresenteMdf,
    category: 'caixas',
    subcategory: 'presente',
    rating: 4.8,
    reviews: 234,
    freeShipping: false,
    badge: 'desconto',
    sizes: ['P (15x15x8cm)', 'M (20x20x10cm)', 'G (25x25x12cm)'],
    customizable: true,
    inStock: true,
    tags: ['caixa', 'presente', 'mdf', 'casamento'],
  },

  // ===== BRINDES =====
  {
    id: 'chaveiro-acrilico-cristal',
    name: 'Chaveiro Acrílico Premium',
    slug: 'chaveiro-acrilico-premium',
    description: 'Chaveiro em acrílico cristal com gravação a laser. Mínimo 10 unidades.',
    price: 9.90,
    image: chaveirosPersonalizados,
    category: 'brindes',
    subcategory: 'chaveiros',
    rating: 4.7,
    reviews: 678,
    freeShipping: false,
    customizable: true,
    minQuantity: 10,
    inStock: true,
    tags: ['chaveiro', 'brinde', 'corporativo', 'evento'],
  },
  {
    id: 'kit-chaveiros-50',
    name: 'Kit 50 Chaveiros Personalizados',
    slug: 'kit-chaveiros-personalizados-50',
    description: 'Kit econômico com 50 chaveiros em acrílico cristal. Ideal para eventos e brindes.',
    price: 349.90,
    originalPrice: 495.00,
    discount: 29,
    image: chaveirosPersonalizados,
    category: 'brindes',
    subcategory: 'chaveiros',
    rating: 4.9,
    reviews: 123,
    freeShipping: true,
    badge: 'brinde',
    customizable: true,
    inStock: true,
    tags: ['chaveiro', 'kit', 'brinde', 'atacado'],
  },

  // ===== INFANTIL =====
  {
    id: 'placa-nome-infantil',
    name: 'Placa Nome Infantil Colorida',
    slug: 'placa-nome-infantil-colorida',
    description: 'Placa decorativa com nome da criança em acrílico colorido. Design exclusivo com unicórnio e arco-íris.',
    price: 89.90,
    originalPrice: 119.90,
    discount: 25,
    image: placaInfantil,
    category: 'infantil',
    subcategory: 'placas-nome',
    rating: 5.0,
    reviews: 189,
    freeShipping: true,
    badge: 'lancamento',
    colors: ['Rosa', 'Azul', 'Verde', 'Lilás', 'Multicolorido'],
    customizable: true,
    inStock: true,
    tags: ['infantil', 'placa', 'nome', 'decoração', 'quarto'],
  },
  {
    id: 'porta-maternidade-personalizado',
    name: 'Porta Maternidade Personalizado',
    slug: 'porta-maternidade-personalizado',
    description: 'Porta maternidade em MDF com apliques em acrílico. Personalizado com nome e data.',
    price: 149.90,
    originalPrice: 189.90,
    discount: 21,
    image: placaInfantil,
    category: 'infantil',
    subcategory: 'porta-maternidade',
    rating: 4.9,
    reviews: 156,
    freeShipping: true,
    badge: 'desconto',
    customizable: true,
    inStock: true,
    tags: ['maternidade', 'porta', 'bebê', 'nascimento'],
  },
];

// Funções utilitárias
export const getProductsByCategory = (categorySlug: string): Product[] => {
  return products.filter((p) => p.category === categorySlug);
};

export const getProductsBySubcategory = (subcategorySlug: string): Product[] => {
  return products.filter((p) => p.subcategory === subcategorySlug);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((p) => p.badge === 'lancamento' || (p.discount && p.discount >= 20));
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((p) => p.slug === slug);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getRelatedProducts = (product: Product, limit: number = 4): Product[] => {
  return products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.subcategory === product.subcategory))
    .slice(0, limit);
};

export const getBestSellers = (): Product[] => {
  return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 8);
};

export const getNewArrivals = (): Product[] => {
  return products.filter((p) => p.badge === 'lancamento');
};
