// Dados de produtos baseados na Foco Laser
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
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
  inStock: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: { id: string; name: string; slug: string }[];
}

export const categories: Category[] = [
  {
    id: 'home-decor',
    name: 'Home Decor',
    slug: 'home-decor',
    subcategories: [
      { id: 'quadros', name: 'Quadros Decorativos', slug: 'quadros' },
      { id: 'vasos', name: 'Vasos', slug: 'vasos' },
      { id: 'organizadores', name: 'Organizadores', slug: 'organizadores' },
    ],
  },
  {
    id: 'broches',
    name: 'Broches',
    slug: 'broches',
    subcategories: [
      { id: 'crachas', name: 'Crachás de Identificação', slug: 'crachas' },
      { id: 'pins', name: 'Pins Decorativos', slug: 'pins' },
      { id: 'botons', name: 'Bottons', slug: 'botons' },
    ],
  },
  {
    id: 'qr-code',
    name: 'QR Code',
    slug: 'qr-code',
    subcategories: [
      { id: 'displays-qr', name: 'Displays com QR Code', slug: 'displays-qr' },
      { id: 'placas-qr', name: 'Placas QR Code', slug: 'placas-qr' },
    ],
  },
  {
    id: 'letreiros',
    name: 'Letreiros',
    slug: 'letreiros',
    subcategories: [
      { id: 'letreiros-acrilico', name: 'Letreiros em Acrílico', slug: 'letreiros-acrilico' },
      { id: 'letreiros-mdf', name: 'Letreiros em MDF', slug: 'letreiros-mdf' },
      { id: 'neon', name: 'Neon LED', slug: 'neon' },
    ],
  },
  {
    id: 'placas-porta',
    name: 'Placas de Porta',
    slug: 'placas-porta',
    subcategories: [
      { id: 'placas-escritorio', name: 'Escritório', slug: 'placas-escritorio' },
      { id: 'placas-residencial', name: 'Residencial', slug: 'placas-residencial' },
    ],
  },
  {
    id: 'espelhos',
    name: 'Espelhos',
    slug: 'espelhos',
    subcategories: [
      { id: 'espelhos-decorativos', name: 'Decorativos', slug: 'espelhos-decorativos' },
      { id: 'espelhos-personalizados', name: 'Personalizados', slug: 'espelhos-personalizados' },
    ],
  },
  {
    id: 'caixas',
    name: 'Caixas',
    slug: 'caixas',
    subcategories: [
      { id: 'caixas-presente', name: 'Caixas de Presente', slug: 'caixas-presente' },
      { id: 'caixas-organizadoras', name: 'Caixas Organizadoras', slug: 'caixas-organizadoras' },
    ],
  },
  {
    id: 'brindes',
    name: 'Brindes',
    slug: 'brindes',
    subcategories: [
      { id: 'brindes-corporativos', name: 'Corporativos', slug: 'brindes-corporativos' },
      { id: 'brindes-personalizados', name: 'Personalizados', slug: 'brindes-personalizados' },
    ],
  },
  {
    id: 'infantil',
    name: 'Infantil',
    slug: 'infantil',
    subcategories: [
      { id: 'decoracao-infantil', name: 'Decoração', slug: 'decoracao-infantil' },
      { id: 'brinquedos', name: 'Brinquedos', slug: 'brinquedos' },
    ],
  },
  {
    id: 'club-magnatas',
    name: 'Club dos Magnatas',
    slug: 'club-magnatas',
  },
];

export const products: Product[] = [
  // Broches e Crachás
  {
    id: 'cracha-identificacao-01',
    name: 'Crachá de Identificação Personalizado',
    slug: 'cracha-identificacao-personalizado',
    description: 'Crachá profissional em acrílico com gravação a laser. Ideal para empresas e eventos.',
    price: 19.90,
    originalPrice: 24.90,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop',
    category: 'broches',
    subcategory: 'crachas',
    rating: 4.8,
    reviews: 127,
    freeShipping: true,
    badge: 'desconto',
    inStock: true,
    tags: ['crachá', 'identificação', 'empresa'],
  },
  {
    id: 'pin-decorativo-01',
    name: 'Pin Decorativo Floral',
    slug: 'pin-decorativo-floral',
    description: 'Pin em acrílico colorido com design floral exclusivo.',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    category: 'broches',
    subcategory: 'pins',
    rating: 4.5,
    reviews: 89,
    freeShipping: false,
    badge: 'lancamento',
    inStock: true,
    tags: ['pin', 'decorativo', 'floral'],
  },
  {
    id: 'cracha-empresa-02',
    name: 'Kit 10 Crachás Empresariais',
    slug: 'kit-crachas-empresariais',
    description: 'Kit com 10 crachás em acrílico cristal com logo da empresa gravado a laser.',
    price: 149.90,
    originalPrice: 199.90,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    category: 'broches',
    subcategory: 'crachas',
    rating: 4.9,
    reviews: 203,
    freeShipping: true,
    badge: 'brinde',
    inStock: true,
    tags: ['kit', 'crachá', 'empresa'],
  },
  // QR Code
  {
    id: 'display-qr-01',
    name: 'Display QR Code para Mesa',
    slug: 'display-qr-code-mesa',
    description: 'Display em acrílico com QR Code personalizado. Perfeito para restaurantes e estabelecimentos.',
    price: 34.90,
    originalPrice: 44.90,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&h=400&fit=crop',
    category: 'qr-code',
    subcategory: 'displays-qr',
    rating: 4.7,
    reviews: 156,
    freeShipping: true,
    badge: 'desconto',
    inStock: true,
    tags: ['qr code', 'display', 'mesa'],
  },
  {
    id: 'placa-qr-pix-01',
    name: 'Placa QR Code PIX',
    slug: 'placa-qr-code-pix',
    description: 'Placa em acrílico com QR Code do PIX para pagamentos.',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
    category: 'qr-code',
    subcategory: 'placas-qr',
    rating: 4.6,
    reviews: 234,
    freeShipping: true,
    inStock: true,
    tags: ['qr code', 'pix', 'pagamento'],
  },
  // Letreiros
  {
    id: 'letreiro-acrilico-01',
    name: 'Letreiro Personalizado em Acrílico',
    slug: 'letreiro-personalizado-acrilico',
    description: 'Letreiro com nome personalizado em acrílico cristal. Ideal para decoração de ambientes.',
    price: 89.90,
    originalPrice: 119.90,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    category: 'letreiros',
    subcategory: 'letreiros-acrilico',
    rating: 4.9,
    reviews: 312,
    freeShipping: true,
    badge: 'desconto',
    sizes: ['P', 'M', 'G', 'GG'],
    inStock: true,
    tags: ['letreiro', 'acrílico', 'personalizado'],
  },
  {
    id: 'neon-led-01',
    name: 'Letreiro Neon LED Personalizado',
    slug: 'letreiro-neon-led-personalizado',
    description: 'Letreiro em LED neon flexível com sua frase ou nome. Vem com fonte e controle.',
    price: 199.90,
    originalPrice: 249.90,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=400&fit=crop',
    category: 'letreiros',
    subcategory: 'neon',
    rating: 4.8,
    reviews: 189,
    freeShipping: true,
    badge: 'lancamento',
    sizes: ['P', 'M', 'G'],
    inStock: true,
    tags: ['neon', 'led', 'personalizado'],
  },
  // Placas de Porta
  {
    id: 'placa-porta-01',
    name: 'Placa de Porta Escritório',
    slug: 'placa-porta-escritorio',
    description: 'Placa elegante para identificação de salas e escritórios.',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
    category: 'placas-porta',
    subcategory: 'placas-escritorio',
    rating: 4.7,
    reviews: 98,
    freeShipping: true,
    inStock: true,
    tags: ['placa', 'porta', 'escritório'],
  },
  // Espelhos
  {
    id: 'espelho-decorativo-01',
    name: 'Espelho Decorativo Geométrico',
    slug: 'espelho-decorativo-geometrico',
    description: 'Espelho com moldura em acrílico e design geométrico moderno.',
    price: 129.90,
    originalPrice: 159.90,
    discount: 19,
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop',
    category: 'espelhos',
    subcategory: 'espelhos-decorativos',
    rating: 4.6,
    reviews: 76,
    freeShipping: true,
    badge: 'desconto',
    inStock: true,
    tags: ['espelho', 'decorativo', 'geométrico'],
  },
  // Caixas
  {
    id: 'caixa-presente-01',
    name: 'Caixa de Presente Personalizada',
    slug: 'caixa-presente-personalizada',
    description: 'Caixa em MDF com tampa gravada a laser. Perfeita para presentes especiais.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop',
    category: 'caixas',
    subcategory: 'caixas-presente',
    rating: 4.8,
    reviews: 145,
    freeShipping: false,
    badge: 'brinde',
    inStock: true,
    tags: ['caixa', 'presente', 'personalizada'],
  },
  // Home Decor
  {
    id: 'quadro-decorativo-01',
    name: 'Quadro Decorativo Mandala',
    slug: 'quadro-decorativo-mandala',
    description: 'Quadro em MDF com mandala cortada a laser. Design exclusivo.',
    price: 79.90,
    originalPrice: 99.90,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop',
    category: 'home-decor',
    subcategory: 'quadros',
    rating: 4.9,
    reviews: 267,
    freeShipping: true,
    badge: 'desconto',
    inStock: true,
    tags: ['quadro', 'mandala', 'decoração'],
  },
  {
    id: 'organizador-01',
    name: 'Organizador de Mesa Escritório',
    slug: 'organizador-mesa-escritorio',
    description: 'Organizador compacto em acrílico para canetas, clips e materiais de escritório.',
    price: 59.90,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop',
    category: 'home-decor',
    subcategory: 'organizadores',
    rating: 4.5,
    reviews: 112,
    freeShipping: false,
    inStock: true,
    tags: ['organizador', 'mesa', 'escritório'],
  },
  // Brindes
  {
    id: 'chaveiro-personalizado-01',
    name: 'Chaveiro Personalizado Acrílico',
    slug: 'chaveiro-personalizado-acrilico',
    description: 'Chaveiro em acrílico cristal com gravação personalizada. Mínimo 10 unidades.',
    price: 8.90,
    image: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=400&h=400&fit=crop',
    category: 'brindes',
    subcategory: 'brindes-corporativos',
    rating: 4.7,
    reviews: 423,
    freeShipping: false,
    inStock: true,
    tags: ['chaveiro', 'brinde', 'corporativo'],
  },
  // Infantil
  {
    id: 'decoracao-infantil-01',
    name: 'Placa Decorativa Quarto Infantil',
    slug: 'placa-decorativa-quarto-infantil',
    description: 'Placa decorativa com nome da criança e desenhos personalizados.',
    price: 69.90,
    originalPrice: 89.90,
    discount: 22,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
    category: 'infantil',
    subcategory: 'decoracao-infantil',
    rating: 4.9,
    reviews: 178,
    freeShipping: true,
    badge: 'lancamento',
    inStock: true,
    tags: ['infantil', 'decoração', 'quarto'],
  },
  // Mais produtos para variedade
  {
    id: 'display-instagram-01',
    name: 'Display Instagram QR Code',
    slug: 'display-instagram-qr-code',
    description: 'Display com QR Code direcionando para seu perfil do Instagram.',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop',
    category: 'qr-code',
    subcategory: 'displays-qr',
    rating: 4.6,
    reviews: 89,
    freeShipping: true,
    badge: 'lancamento',
    inStock: true,
    tags: ['instagram', 'qr code', 'display'],
  },
  {
    id: 'letreiro-mdf-01',
    name: 'Letreiro MDF Love',
    slug: 'letreiro-mdf-love',
    description: 'Letreiro LOVE em MDF para decoração de ambientes.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop',
    category: 'letreiros',
    subcategory: 'letreiros-mdf',
    rating: 4.8,
    reviews: 156,
    freeShipping: false,
    inStock: true,
    tags: ['letreiro', 'mdf', 'love'],
  },
];

export const getProductsByCategory = (categorySlug: string): Product[] => {
  return products.filter((p) => p.category === categorySlug);
};

export const getProductsBySubcategory = (subcategorySlug: string): Product[] => {
  return products.filter((p) => p.subcategory === subcategorySlug);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((p) => p.badge === 'lancamento' || p.discount && p.discount >= 20);
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
