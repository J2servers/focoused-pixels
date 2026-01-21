import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Star, Truck } from 'lucide-react';
import { getProductBySlug, categories } from '@/data/products';
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

const ProductPage = () => {
  const { productSlug } = useParams();
  const product = getProductBySlug(productSlug || '');
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

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

  // Calcular desconto por quantidade
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
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Por favor, selecione uma cor');
      return;
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            <ProductImageGallery 
              images={images}
              productName={product.name}
              badge={product.badge}
              discount={product.discount}
            />

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-3 text-foreground">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-3 mb-4">
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
                  <div className="flex items-center gap-2 text-success mt-3 bg-success/10 px-3 py-2 rounded-lg w-fit">
                    <Truck className="h-5 w-5" />
                    <span className="font-medium">Frete Grátis</span>
                  </div>
                )}
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

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
            </div>
          </div>

          {/* Specifications & Details */}
          <div className="mt-12 max-w-3xl">
            <ProductSpecifications product={product} />
          </div>

          {/* Related Products */}
          <RelatedProducts product={product} limit={4} />
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProductPage;
