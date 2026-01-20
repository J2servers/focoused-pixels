import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Truck, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { getProductBySlug, categories } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { storeInfo } from '@/data/store';
import { toast } from 'sonner';

const ProductPage = () => {
  const { productSlug } = useParams();
  const product = getProductBySlug(productSlug || '');
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <MainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link to="/">
            <Button>Voltar para a home</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const category = categories.find(c => c.slug === product.category);
  const subcategory = category?.subcategories?.find(s => s.slug === product.subcategory);

  const images = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      toast.error('Selecione um tamanho');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      size: selectedSize || undefined,
    });
    toast.success('Produto adicionado ao carrinho!');
  };

  const handleBuyNow = () => {
    const message = `Olá! Tenho interesse no produto:\n\n*${product.name}*\nPreço: R$ ${product.price.toFixed(2)}${selectedSize ? `\nTamanho: ${selectedSize}` : ''}\nQuantidade: ${quantity}\n\nPoderia me ajudar?`;
    window.open(`${storeInfo.whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const badgeLabels: Record<string, string> = {
    lancamento: 'LANÇAMENTO',
    desconto: `${product.discount}% OFF`,
    brinde: 'GANHE BRINDE',
    esgotado: 'ESGOTADO',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/categoria/${category.slug}`}>
                      {category.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              {subcategory && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/categoria/${category?.slug}/${subcategory.slug}`}>
                      {subcategory.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {product.badge && (
                  <Badge 
                    className={`absolute top-4 left-4 z-10 ${
                      product.badge === 'esgotado' ? 'bg-muted-foreground' : 'bg-primary'
                    }`}
                  >
                    {badgeLabels[product.badge]}
                  </Badge>
                )}
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) 
                            ? 'fill-accent text-accent' 
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating.toFixed(1)} ({product.reviews} avaliações)
                  </span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  {product.originalPrice && (
                    <p className="text-lg text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-3xl font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou em até {storeInfo.installments}x de R$ {(product.price / storeInfo.installments).toFixed(2)} sem juros
                  </p>
                </div>

                {/* Free Shipping Badge */}
                {product.freeShipping && (
                  <div className="flex items-center gap-2 text-success mt-3">
                    <Truck className="h-5 w-5" />
                    <span className="font-medium">Frete Grátis</span>
                  </div>
                )}
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tamanho
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[3rem]"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Quantidade
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={handleBuyNow}
                  size="lg" 
                  className="w-full text-lg font-bold"
                  disabled={!product.inStock}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {product.inStock ? 'Comprar via WhatsApp' : 'Produto Esgotado'}
                </Button>
                <Button 
                  onClick={handleAddToCart}
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProductPage;
