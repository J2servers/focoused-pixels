import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { AIChatWidget } from '@/components/chat/AIChatWidget';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Truck, Shield, Clock, CreditCard, ShoppingBag, Zap } from 'lucide-react';
import { useProductBySlug, useCategoryBySlug } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { storeInfo, discountTiers } from '@/data/store';
import { toast } from 'sonner';
import {
  ProductImageGallery,
  ProductColorSelector,
  ProductSizeSelector,
  ProductQuantityCalculator,
  ProductWhatsAppQuote,
  ProductSpecifications,
  RelatedProducts,
} from '@/components/product';
import { ProductReviews } from '@/components/reviews';
import { TrustBar, ViewingNowBadge } from '@/components/conversion';
import { UrgencyBadge } from '@/components/conversion/UrgencyBadge';
import { DynamicSocialProof } from '@/components/conversion/DynamicSocialProof';
import { ProductShareButtons } from '@/components/product/ProductShareButtons';
import { ProductFAQ } from '@/components/product/ProductFAQ';
import { FreightCalculator } from '@/components/product/FreightCalculator';
import { WishlistButton } from '@/components/product/WishlistButton';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { RecentlyViewedBar } from '@/components/product/RecentlyViewedBar';


const ProductPage = () => {
  const { productSlug } = useParams();
  const { data: product, isLoading } = useProductBySlug(productSlug);
  const { data: category } = useCategoryBySlug(product?.category);
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedFreight, setSelectedFreight] = useState<{
    method: string; price: number; days: string; cep: string; city: string; state: string;
  } | null>(null);

  // Track recently viewed - must be before early returns
  useEffect(() => {
    if (product) {
      addRecentlyViewed({
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
      });
    }
  }, [product?.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TrustBar />
        <DynamicMainHeader />
        <NavigationBar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-6 w-64 mb-6 rounded-xl" />
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 rounded-xl" />
                <Skeleton className="h-6 w-1/2 rounded-xl" />
                <Skeleton className="h-10 w-1/3 rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <TrustBar />
        <DynamicMainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl neu-concave p-12 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <Link to="/">
              <Button>Voltar para a home</Button>
            </Link>
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];

  const getDiscountPercent = (qty: number): number => {
    let discount = 0;
    for (const tier of discountTiers) {
      if (qty >= tier.quantity) {
        discount = tier.discount;
      }
    }
    return discount;
  };

  const currentDiscount = getDiscountPercent(quantity);
  const discountedPrice = product.price * (1 - currentDiscount / 100);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Por favor, selecione um tamanho');
      return false;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Por favor, selecione uma cor');
      return false;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: discountedPrice,
      image: product.image,
      quantity,
      size: selectedSize || undefined,
    });
    toast.success('Produto adicionado ao carrinho!');
    return true;
  };

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (!added) return;

    // Save payment data to sessionStorage for PaymentPage
    const subtotal = discountedPrice * quantity;
    const shippingCost = selectedFreight?.price || 0;
    const totalAmount = subtotal + shippingCost;
    
    sessionStorage.setItem('pending_payment', JSON.stringify({
      orderId: `quick-${Date.now()}`,
      amount: totalAmount,
      customerName: '',
      customerEmail: '',
      customerCpf: '',
      customerPhone: '',
      description: `${product.name} x${quantity}`,
      cartItems: [{
        name: product.name,
        quantity,
        price: discountedPrice,
        size: selectedSize || undefined,
      }],
      shipping: selectedFreight ? {
        method: selectedFreight.method,
        cost: shippingCost,
        days: selectedFreight.days,
        cep: selectedFreight.cep,
        city: selectedFreight.city,
        state: selectedFreight.state,
      } : null,
    }));

    navigate('/pagamento');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background page-enter">
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-4 md:py-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
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
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Image Gallery */}
            <div className="rounded-2xl neu-pressed p-2 md:p-3">
              <ProductImageGallery 
                images={images}
                productName={product.name}
                badge={product.badge}
                discount={product.discount}
              />
            </div>

            {/* Product Info */}
            <div className="space-y-4 md:space-y-6">
              {/* Title & Rating */}
              <div className="rounded-2xl neu-flat p-4 md:p-6">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-foreground">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.floor(product.rating) 
                            ? 'fill-accent text-accent' 
                            : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.rating.toFixed(1)} ({product.reviews} avaliações)
                  </span>
                  <ViewingNowBadge productSlug={product.slug} variant="minimal" />
                  <WishlistButton product={{ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug }} size="sm" />
                </div>

                {/* Price */}
                <div className="space-y-0.5">
                  {product.originalPrice && (
                    <p className="text-base text-muted-foreground line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </p>
                  )}
                  <p className="text-2xl md:text-3xl font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ou em até {storeInfo.installments}x de R$ {(product.price / storeInfo.installments).toFixed(2)} sem juros
                  </p>
                </div>

                {/* Free Shipping Badge */}
                {product.freeShipping && (
                  <div className="flex items-center gap-2 text-success mt-3 neu-pressed px-3 py-2 rounded-xl w-fit">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm font-medium">Frete Grátis</span>
                  </div>
                )}

                <UrgencyBadge productId={product.id} />
              </div>

              {/* Share Buttons */}
              <ProductShareButtons productName={product.name} productSlug={product.slug} />

              {/* Short Description */}
              <p className="text-sm text-muted-foreground leading-relaxed px-1">
                {product.description}
              </p>

              {/* Buy Now & Add to Cart — Neumorphism Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full h-12 sm:h-14 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-lg font-bold transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    boxShadow: '6px 6px 12px hsl(var(--neu-dark) / var(--neu-intensity)), -6px -6px 12px hsl(var(--neu-light) / var(--neu-intensity)), inset 0 1px 0 hsl(0 0% 100% / 0.2), inset 0 -1px 0 hsl(var(--neu-dark) / 0.15)',
                    border: '1px solid hsl(var(--border) / 0.4)',
                  }}
                >
                  <Zap className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">COMPRAR AGORA</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full h-12 sm:h-14 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-lg font-bold transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '6px 6px 12px hsl(var(--neu-dark) / var(--neu-intensity)), -6px -6px 12px hsl(var(--neu-light) / var(--neu-intensity)), inset 0 1px 0 hsl(var(--neu-light) / 0.5), inset 0 -1px 0 hsl(var(--neu-dark) / 0.1)',
                    border: '1px solid hsl(var(--border) / 0.5)',
                  }}
                >
                  <ShoppingBag className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">ADICIONAR AO CARRINHO</span>
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 text-xs md:text-sm rounded-xl p-3 neu-concave">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span>Compra Segura</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm rounded-xl p-3 neu-concave">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>Entrega Rápida</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm rounded-xl p-3 neu-concave">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  <span>Até 12x s/ juros</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm rounded-xl p-3 neu-concave">
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  <span>Frete Calculado</span>
                </div>
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <ProductColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                />
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <ProductSizeSelector
                  sizes={product.sizes}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />
              )}

              {/* Quantity Calculator */}
              <ProductQuantityCalculator
                quantity={quantity}
                onQuantityChange={setQuantity}
                unitPrice={product.price}
                minQuantity={product.minQuantity}
              />

              {/* WhatsApp Quote & Cart */}
              <ProductWhatsAppQuote
                product={product}
                quantity={quantity}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onAddToCart={handleAddToCart}
              />
              {/* Freight Calculator */}
              <FreightCalculator productPrice={product.price * quantity} />
            </div>
          </div>

          {/* Specifications & Details */}
          <div className="mt-12 max-w-3xl">
            <div className="rounded-2xl neu-flat p-6">
              <ProductSpecifications product={product} />
            </div>
          </div>

          {/* Product Reviews */}
          <ProductReviews 
            productSlug={product.slug} 
            productName={product.name} 
          />

          {/* FAQ */}
          <ProductFAQ productName={product.name} />

          {/* Related Products */}
          <RelatedProducts product={product} limit={4} />

          {/* Recently Viewed */}
          <RecentlyViewedBar />
        </div>
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <AIChatWidget />
    </div>
  );
};

export default ProductPage;
