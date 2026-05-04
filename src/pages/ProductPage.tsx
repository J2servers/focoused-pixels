import { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { TrustBar } from '@/components/conversion';
import { useProductBySlug, useCategoryBySlug } from '@/hooks/useProducts';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { usePaymentCredentials } from '@/hooks/usePaymentCredentials';
import { useSiteSettings } from '@/hooks/useSiteSettings';

import {
  ProductImageGallery, ProductWhatsAppQuote, ProductSpecifications,
  RelatedProducts, HowItWorksSteps,
} from '@/components/product';
import { ProductReviews } from '@/components/reviews';
import { ProductShareButtons } from '@/components/product/ProductShareButtons';
import { ProductFAQ } from '@/components/product/ProductFAQ';
import { FreightCalculator } from '@/components/product/FreightCalculator';
import { RecentlyViewedBar } from '@/components/product/RecentlyViewedBar';
import { StickyBuyBar } from '@/components/product/StickyBuyBar';
import { ProductJsonLd } from '@/components/product/ProductJsonLd';
import { ProductSectionTabs } from '@/components/product/ProductSectionTabs';
import { DeliveryEstimate } from '@/components/product/DeliveryEstimate';
import { FreeShippingBar } from '@/components/cart/FreeShippingBar';

import { ProductPageSkeleton, ProductNotFound } from './product/ProductPageStates';
import { ProductBreadcrumb } from './product/ProductBreadcrumb';
import { Section } from './product/sectionPrimitives';
import {
  ProductTitleBlock, ProductPricingBlock, ProductExtrasBlock,
  ProductCustomizationBlock, ProductQuantityBlock,
} from './product/ProductInfoSections';
import { ProductCtaBlock, ProductTrustBadges } from './product/ProductCtaBlock';
import { useProductPageState } from './product/useProductPageState';

const AIChatWidget = lazy(() => import('@/components/chat/AIChatWidget').then(m => ({ default: m.AIChatWidget })));

const ProductPage = () => {
  const { productSlug } = useParams();
  const { data: product, isLoading } = useProductBySlug(productSlug);
  const { data: category } = useCategoryBySlug(product?.category);
  const { data: companyInfo } = useCompanyInfo();
  const { data: paymentCreds } = usePaymentCredentials();
  const settings = useSiteSettings();
  const state = useProductPageState(product, productSlug);

  if (isLoading) return <ProductPageSkeleton />;
  if (!product) return <ProductNotFound />;

  const images = product.images?.length ? product.images : [product.image];
  const productUrl = `${window.location.origin}/produto/${product.slug}`;
  const installments = paymentCreds?.max_installments || settings.installments;
  const minInstallmentValue = paymentCreds?.min_installment_value || 50;
  const maxInstallments = Math.min(installments, Math.floor(product.price / minInstallmentValue) || 1);
  const productionTime = companyInfo?.production_time || settings.productionTime;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ProductJsonLd product={product} category={category ? { name: category.name, slug: category.slug } : null} url={productUrl} />
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1" id="main-content">
        <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6 max-w-7xl">
          <ProductBreadcrumb productName={product.name} category={category} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">
            <div className="lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-card">
                <ProductImageGallery images={images} productName={product.name} badge={product.badge} discount={product.discount} />
              </div>
              <div className="hidden lg:block mt-4">
                <ProductShareButtons productName={product.name} productSlug={product.slug} productImage={product.image} productPrice={product.price} />
              </div>
            </div>

            <div className="space-y-4">
              <ProductTitleBlock product={product} />
              <ProductPricingBlock product={product} maxInstallments={maxInstallments} />
              <ProductCtaBlock
                inStock={product.inStock} productId={product.id} productName={product.name}
                onBuyNow={state.handleBuyNow} onAddToCart={state.handleAddToCart}
              />
              <ProductExtrasBlock
                product={product} discountedPrice={state.discountedPrice} quantity={state.quantity}
              />
              <ProductTrustBadges maxInstallments={maxInstallments} productionTime={productionTime} />
              <ProductCustomizationBlock
                product={product}
                selectedBgColor={state.selectedBgColor} setSelectedBgColor={state.setSelectedBgColor}
                selectedLogoColor={state.selectedLogoColor} setSelectedLogoColor={state.setSelectedLogoColor}
                selectedColor={state.selectedColor} setSelectedColor={state.setSelectedColor}
                selectedSize={state.selectedSize} setSelectedSize={state.setSelectedSize}
                customizationData={state.customizationData} setCustomizationData={state.setCustomizationData}
              />
              <ProductQuantityBlock
                quantity={state.quantity} setQuantity={state.setQuantity}
                unitPrice={product.price} minQuantity={product.minQuantity}
              />
              <Section label="Entrega" className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Entrega</h2>
                <FreeShippingBar />
                <FreightCalculator productPrice={product.price * state.quantity} onFreightSelect={state.setSelectedFreight} />
                {state.selectedFreight && (
                  <DeliveryEstimate freightDays={state.selectedFreight.days} productionDays={productionTime} />
                )}
              </Section>
              <ProductWhatsAppQuote
                product={product} quantity={state.quantity} selectedSize={state.selectedSize}
                selectedColor={state.selectedColor || state.selectedBgColor} onAddToCart={state.handleAddToCart}
              />
              <HowItWorksSteps />
              <div className="lg:hidden">
                <ProductShareButtons productName={product.name} productSlug={product.slug} productImage={product.image} productPrice={product.price} />
              </div>
            </div>
          </div>

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
        productName={product.name} productImage={product.image}
        price={state.discountedPrice} originalPrice={product.originalPrice}
        inStock={product.inStock}
        onBuyNow={state.handleBuyNow} onAddToCart={state.handleAddToCart}
      />
    </div>
  );
};

export default ProductPage;
