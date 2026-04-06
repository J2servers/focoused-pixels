import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Truck, Shield, Clock, CreditCard, ShoppingBag, Zap, Package, ChevronRight } from 'lucide-react';
import { useProductBySlug, useCategoryBySlug } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { storeInfo, discountTiers } from '@/data/store';
import { toast } from 'sonner';
import {
  ProductImageGallery,
  ProductColorSelector,
  ProductColorDropdown,
  ProductSizeSelector,
  ProductQuantityCalculator,
  ProductWhatsAppQuote,
  ProductSpecifications,
  RelatedProducts,
  VolumeDiscountTable,
  ProductCustomizationForm,
  HowItWorksSteps,
} from '@/components/product';
import type { CustomizationData } from '@/components/product/ProductCustomizationForm';
import { ProductReviews } from '@/components/reviews';
import { TrustBar, ViewingNowBadge } from '@/components/conversion';
import { UrgencyBadge } from '@/components/conversion/UrgencyBadge';
import { ProductShareButtons } from '@/components/product/ProductShareButtons';
import { ProductFAQ } from '@/components/product/ProductFAQ';
import { FreightCalculator } from '@/components/product/FreightCalculator';
import { WishlistButton } from '@/components/product/WishlistButton';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { RecentlyViewedBar } from '@/components/product/RecentlyViewedBar';
import { StickyBuyBar } from '@/components/product/StickyBuyBar';
import { ProductJsonLd } from '@/components/product/ProductJsonLd';
import { PixDiscount } from '@/components/product/PixDiscount';
import { StockIndicator } from '@/components/product/StockIndicator';
import { SizeGuideModal } from '@/components/product/SizeGuideModal';
import { ProductSectionTabs } from '@/components/product/ProductSectionTabs';
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate';
import { NotifyWhenAvailable } from '@/components/product/NotifyWhenAvailable';

const AIChatWidget = lazy(() => import('@/components/chat/AIChatWidget').then(m => ({ default: m.AIChatWidget })));

/* ─── Section wrapper for visual consistency ─── */
const Section = ({ children, className = '', label }: { children: React.ReactNode; className?: string; label?: string }) => (
  <section aria-label={label} className={`rounded-2xl border border-border/40 bg-card p-4 md:p-5 ${className}`}>
    {children}
  </section>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{children}</h2>
);

const ProductPage = () => {
  const { productSlug } = useParams();
  const { data: product, isLoading } = useProductBySlug(productSlug);
  const { data: category } = useCategoryBySlug(product?.category);
  const { data: companyInfo } = useCompanyInfo();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBgColor, setSelectedBgColor] = useState<string | null>(null);
  const [selectedLogoColor, setSelectedLogoColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customizationData, setCustomizationData] = useState<CustomizationData>({
    customText: '',
    logoFiles: [],
    whatsappNumber: '',
  });
  const [selectedFreight, setSelectedFreight] = useState<{
    method: string; price: number; days: string; cep: string; city: string; state: string;
  } | null>(null);

  useEffect(() => {
    if (product) {
      addRecentlyViewed({ slug: product.slug, name: product.name, image: product.image, price: product.price });
    }
  }, [product?.slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedBgColor(null);
    setSelectedLogoColor(null);
    setQuantity(1);
    setSelectedFreight(null);
    setCustomizationData({ customText: '', logoFiles: [], whatsappNumber: '' });
  }, [productSlug]);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TrustBar />
        <DynamicMainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Skeleton className="h-5 w-48 mb-6" />
          <div className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  /* ─── Not Found ─── */
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TrustBar />
        <DynamicMainHeader />
        <NavigationBar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Produto não encontrado</h1>
            <p className="text-muted-foreground">O produto que você procura não está disponível.</p>
            <Link to="/"><Button size="lg">Voltar para a Home</Button></Link>
          </div>
        </main>
        <DynamicFooter />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image];
  const productUrl = `${window.location.origin}/produto/${product.slug}`;

  const getDiscountPercent = (qty: number): number => {
    let discount = 0;
    for (const tier of discountTiers) {
      if (qty >= tier.quantity) discount = tier.discount;
    }
    return discount;
  };

  const currentDiscount = getDiscountPercent(quantity);
  const discountedPrice = product.price * (1 - currentDiscount / 100);
  const installments = companyInfo?.max_installments || storeInfo.installments;
  const minInstallmentValue = companyInfo?.min_installment_value || 50;
  const maxInstallments = Math.min(installments, Math.floor(product.price / minInstallmentValue) || 1);

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
      id: product.id, name: product.name, price: discountedPrice, image: product.image,
      quantity, size: selectedSize || undefined, color: selectedColor || selectedBgColor || undefined,
      customization: {
        customText: customizationData.customText || undefined,
        whatsappNumber: customizationData.whatsappNumber || undefined,
        logoFileNames: customizationData.logoFiles.length > 0 ? customizationData.logoFiles.map(f => f.name) : undefined,
        backgroundColorChoice: selectedBgColor || undefined,
        logoColorChoice: selectedLogoColor || undefined,
      },
    });
    toast.success('Produto adicionado ao carrinho!', {
      action: { label: 'Ver carrinho', onClick: () => navigate('/carrinho') },
    });
    return true;
  };

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (!added) return;
    const subtotal = discountedPrice * quantity;
    const shippingCost = selectedFreight?.price || 0;
    sessionStorage.setItem('pending_payment', JSON.stringify({
      orderId: `quick-${Date.now()}`, amount: subtotal + shippingCost,
      customerName: '', customerEmail: '', customerCpf: '', customerPhone: '',
      description: `${product.name} x${quantity}`,
      cartItems: [{ name: product.name, quantity, price: discountedPrice, size: selectedSize || undefined, color: selectedColor || undefined }],
      shipping: selectedFreight ? { method: selectedFreight.method, cost: shippingCost, days: selectedFreight.days, cep: selectedFreight.cep, city: selectedFreight.city, state: selectedFreight.state } : null,
    }));
    navigate('/pagamento');
  };

  const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

  return (
    <>
      <div className="min-h-screen flex flex-col bg-background">
        <ProductJsonLd product={product} category={category ? { name: category.name, slug: category.slug } : null} url={productUrl} />
        <TrustBar />
        <DynamicMainHeader />
        <NavigationBar />

        <main className="flex-1" id="main-content">
          <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-7xl">

            {/* ─── Breadcrumb ─── */}
            <nav aria-label="Navegação" className="mb-4 md:mb-6">
              <Breadcrumb>
                <BreadcrumbList className="text-xs sm:text-sm">
                  <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator>
                  {category && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={`/categoria/${category.slug}`}>{category.name}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator>
                    </>
                  )}
                  <BreadcrumbItem><BreadcrumbPage className="font-medium truncate max-w-[200px]">{product.name}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </nav>

            {/* ═══════════════════════════════════════════════════
                HERO: Image + Core Info (2-col desktop, stacked mobile)
                ═══════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">

              {/* ─── LEFT: Image Gallery ─── */}
              <div className="lg:sticky lg:top-4 lg:self-start">
                <div className="rounded-2xl overflow-hidden border border-border/30 bg-card">
                  <ProductImageGallery images={images} productName={product.name} badge={product.badge} discount={product.discount} />
                </div>
                {/* Share — desktop only */}
                <div className="hidden lg:block mt-4">
                  <ProductShareButtons productName={product.name} productSlug={product.slug} productImage={product.image} productPrice={product.price} />
                </div>
              </div>

              {/* ─── RIGHT: Product Info ─── */}
              <div className="space-y-4">

                {/* ── 1. Title + Rating + Wishlist ── */}
                <Section label="Informações do produto">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                        {product.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <div className="flex items-center gap-0.5" aria-label={`Avaliação: ${product.rating} de 5 estrelas`}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {product.rating.toFixed(1)} · {product.reviews} avaliações
                        </span>
                        <ViewingNowBadge productSlug={product.slug} variant="minimal" />
                      </div>
                    </div>
                    <WishlistButton product={{ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug }} size="sm" />
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3">{product.description}</p>
                  )}
                </Section>

                {/* ── 2. Pricing Block ── */}
                <Section label="Preço" className="space-y-3">
                  <div className="flex items-end gap-3 flex-wrap">
                    {product.originalPrice && (
                      <span className="text-base text-muted-foreground line-through" aria-label="Preço original">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    <span className="text-3xl sm:text-4xl font-extrabold text-primary tabular-nums" aria-label="Preço atual">
                      {formatPrice(product.price)}
                    </span>
                    {product.discount && product.discount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive text-xs font-bold px-2.5 py-1">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {maxInstallments > 1 && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 shrink-0" />
                      ou em até <strong className="text-foreground">{maxInstallments}x</strong> de{' '}
                      <strong className="text-foreground">{formatPrice(product.price / maxInstallments)}</strong> sem juros
                    </p>
                  )}

                  <PixDiscount price={discountedPrice} quantity={quantity} />

                  <div className="flex items-center gap-3 flex-wrap">
                    <StockIndicator stock={product.inStock ? undefined : 0} />
                    {product.freeShipping && (
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5">
                        <Truck className="h-3.5 w-3.5" />
                        Frete Grátis
                      </div>
                    )}
                  </div>

                  <UrgencyBadge productId={product.id} />
                </Section>

                {/* ── 3. Actions (Buy / Cart) ── */}
                {product.inStock ? (
                  <Section label="Ações de compra" className="space-y-3">
                    <Button onClick={handleBuyNow} size="lg" className="w-full h-13 sm:h-14 text-base sm:text-lg font-bold gap-2 rounded-xl">
                      <Zap className="h-5 w-5" />
                      COMPRAR AGORA
                    </Button>
                    <Button onClick={handleAddToCart} size="lg" variant="outline" className="w-full h-12 sm:h-13 text-base font-semibold gap-2 rounded-xl">
                      <ShoppingBag className="h-5 w-5" />
                      ADICIONAR AO CARRINHO
                    </Button>
                  </Section>
                ) : (
                  <NotifyWhenAvailable productName={product.name} productId={product.id} inStock={product.inStock} />
                )}

                {/* ── 4. Trust Badges ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="list" aria-label="Garantias">
                  {[
                    { icon: Shield, text: 'Compra Segura' },
                    { icon: Clock, text: 'Entrega Rápida' },
                    { icon: CreditCard, text: `Até ${maxInstallments}x s/ juros` },
                    { icon: Package, text: companyInfo?.production_time || storeInfo.productionTime },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} role="listitem" className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/30 p-2.5 sm:p-3 text-xs sm:text-sm text-foreground">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="leading-tight">{text}</span>
                    </div>
                  ))}
                </div>

                {/* ── 5. Customization Options ── */}
                <Section label="Opções de personalização" className="space-y-4">
                  <SectionTitle>Personalização</SectionTitle>

                  <ProductColorDropdown
                    label="Cor de fundo da Placa:"
                    colors={storeInfo.customizationOptions.backgroundColors}
                    selectedColor={selectedBgColor}
                    onSelectColor={setSelectedBgColor}
                    required
                  />
                  <ProductColorDropdown
                    label="Cor da placa onde vai a Logo:"
                    colors={storeInfo.customizationOptions.mirrorColors}
                    selectedColor={selectedLogoColor}
                    onSelectColor={setSelectedLogoColor}
                    required
                  />

                  {product.colors && product.colors.length > 0 && (
                    <ProductColorSelector colors={product.colors} selectedColor={selectedColor} onSelectColor={setSelectedColor} />
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-2">
                      <ProductSizeSelector sizes={product.sizes} selectedSize={selectedSize} onSelectSize={setSelectedSize} />
                      <SizeGuideModal sizes={product.sizes} productName={product.name} />
                    </div>
                  )}

                  <ProductCustomizationForm data={customizationData} onDataChange={setCustomizationData} />
                </Section>

                {/* ── 6. Quantity & Volume ── */}
                <Section label="Quantidade" className="space-y-4">
                  <SectionTitle>Quantidade</SectionTitle>
                  <ProductQuantityCalculator quantity={quantity} onQuantityChange={setQuantity} unitPrice={product.price} minQuantity={product.minQuantity} />
                  <VolumeDiscountTable tiers={discountTiers} currentQuantity={quantity} />
                </Section>

                {/* ── 7. Shipping ── */}
                <Section label="Entrega" className="space-y-4">
                  <SectionTitle>Entrega</SectionTitle>
                  <FreightCalculator productPrice={product.price * quantity} onFreightSelect={setSelectedFreight} />
                  {selectedFreight && (
                    <DeliveryEstimate freightDays={selectedFreight.days} productionDays={companyInfo?.production_time || storeInfo.productionTime} />
                  )}
                </Section>

                {/* ── 8. WhatsApp Quote ── */}
                <ProductWhatsAppQuote product={product} quantity={quantity} selectedSize={selectedSize} selectedColor={selectedColor || selectedBgColor} onAddToCart={handleAddToCart} />

                {/* ── 9. How It Works ── */}
                <HowItWorksSteps />

                {/* Share — mobile only */}
                <div className="lg:hidden">
                  <ProductShareButtons productName={product.name} productSlug={product.slug} productImage={product.image} productPrice={product.price} />
                </div>
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                BELOW THE FOLD: Details, Reviews, FAQ, Related
                ═══════════════════════════════════════════════════ */}
            <div className="mt-10 md:mt-16 space-y-8 md:space-y-12">
              <ProductSectionTabs />

              <section id="product-details" aria-label="Detalhes do produto" className="max-w-4xl">
                <Section label="Especificações">
                  <ProductSpecifications product={product} />
                </Section>
              </section>

              <ProductReviews productSlug={product.slug} productName={product.name} />

              <section id="product-faq" aria-label="Perguntas frequentes">
                <ProductFAQ productName={product.name} />
              </section>

              <RelatedProducts product={product} limit={4} />
              <RecentlyViewedBar />
            </div>
          </div>
        </main>

        <DynamicFooter />
        <WhatsAppButton />
        <Suspense fallback={null}>
          <AIChatWidget />
        </Suspense>

        <StickyBuyBar
          productName={product.name}
          productImage={product.image}
          price={discountedPrice}
          originalPrice={product.originalPrice}
          inStock={product.inStock}
          onBuyNow={handleBuyNow}
          onAddToCart={handleAddToCart}
        />
      </div>
    </>
  );
};

export default ProductPage;
