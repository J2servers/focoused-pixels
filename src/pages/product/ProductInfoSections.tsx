import { Star, Truck, CreditCard } from 'lucide-react';
import { Section, SectionTitle, formatPrice } from './sectionPrimitives';
import { ViewingNowBadge } from '@/components/conversion';
import { UrgencyBadge } from '@/components/conversion/UrgencyBadge';
import { WishlistButton } from '@/components/product/WishlistButton';
import { PixDiscount } from '@/components/product/PixDiscount';
import { StockIndicator } from '@/components/product/StockIndicator';
import {
  ProductColorSelector, ProductColorDropdown, ProductSizeSelector,
  ProductCustomizationForm, ProductQuantityCalculator, VolumeDiscountTable,
} from '@/components/product';
import type { CustomizationData } from '@/components/product/ProductCustomizationForm';
import { SizeGuideModal } from '@/components/product/SizeGuideModal';
import { discountTiers } from '@/data/store';

interface ProductForInfo {
  id: string;
  name: string;
  slug: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  description?: string;
  inStock: boolean;
  freeShipping?: boolean;
  sizes?: string[] | null;
  colors?: string[] | null;
  minQuantity?: number;
}

export function ProductTitleBlock({ product }: { product: ProductForInfo }) {
  return (
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
      {product.description && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">{product.description}</p>
      )}
    </Section>
  );
}

export function ProductPricingBlock({ product, maxInstallments }: { product: ProductForInfo; maxInstallments: number }) {
  return (
    <Section label="Preço" className="space-y-3">
      <div className="flex items-end gap-3 flex-wrap">
        {product.originalPrice && (
          <span className="text-base text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
        )}
        <span className="text-3xl sm:text-4xl font-extrabold text-primary tabular-nums">
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
    </Section>
  );
}

export function ProductExtrasBlock({
  product, discountedPrice, quantity,
}: { product: ProductForInfo; discountedPrice: number; quantity: number }) {
  return (
    <Section label="Vantagens e disponibilidade" className="space-y-3">
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
  );
}

interface CustomizationProps {
  product: ProductForInfo;
  selectedBgColor: string | null; setSelectedBgColor: (v: string | null) => void;
  selectedLogoColor: string | null; setSelectedLogoColor: (v: string | null) => void;
  selectedColor: string | null; setSelectedColor: (v: string | null) => void;
  selectedSize: string | null; setSelectedSize: (v: string | null) => void;
  customizationData: CustomizationData; setCustomizationData: (v: CustomizationData) => void;
}

export function ProductCustomizationBlock({
  product, selectedBgColor, setSelectedBgColor, selectedLogoColor, setSelectedLogoColor,
  selectedColor, setSelectedColor, selectedSize, setSelectedSize,
  customizationData, setCustomizationData,
}: CustomizationProps) {
  return (
    <Section label="Opções de personalização" className="space-y-4">
      <SectionTitle>Personalização</SectionTitle>
      <ProductColorDropdown
        label="Cor de fundo da Placa:"
        colors={["Branco","Preto","Transparente","Azul Royal","Rosa","Lilás","Verde","Vermelho","Dourado","Prata"]}
        selectedColor={selectedBgColor} onSelectColor={setSelectedBgColor} required
      />
      <ProductColorDropdown
        label="Cor da placa onde vai a Logo:"
        colors={["Dourado","Prata","Rose Gold","Bronze","Azul","Vermelho","Verde","Lilás","Preto","Branco"]}
        selectedColor={selectedLogoColor} onSelectColor={setSelectedLogoColor} required
      />
      {product.colors?.length ? (
        <ProductColorSelector colors={product.colors} selectedColor={selectedColor} onSelectColor={setSelectedColor} />
      ) : null}
      {product.sizes?.length ? (
        <div className="space-y-2">
          <ProductSizeSelector sizes={product.sizes} selectedSize={selectedSize} onSelectSize={setSelectedSize} />
          <SizeGuideModal sizes={product.sizes} productName={product.name} />
        </div>
      ) : null}
      <ProductCustomizationForm data={customizationData} onDataChange={setCustomizationData} />
    </Section>
  );
}

export function ProductQuantityBlock({
  quantity, setQuantity, unitPrice, minQuantity,
}: { quantity: number; setQuantity: (v: number) => void; unitPrice: number; minQuantity?: number }) {
  return (
    <Section label="Quantidade" className="space-y-4">
      <SectionTitle>Quantidade</SectionTitle>
      <ProductQuantityCalculator quantity={quantity} onQuantityChange={setQuantity} unitPrice={unitPrice} minQuantity={minQuantity} />
      <VolumeDiscountTable tiers={discountTiers} currentQuantity={quantity} />
    </Section>
  );
}
