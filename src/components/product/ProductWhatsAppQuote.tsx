import { MessageCircle, ShoppingCart, Truck, Shield, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { discountTiers } from '@/data/store';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Product } from '@/data/products';

interface ProductWhatsAppQuoteProps {
  product: Product;
  quantity: number;
  selectedSize: string | null;
  selectedColor: string | null;
  onAddToCart: () => void;
}

export const ProductWhatsAppQuote = ({ 
  product, 
  quantity, 
  selectedSize, 
  selectedColor,
  onAddToCart
}: ProductWhatsAppQuoteProps) => {
  const settings = useSiteSettings();
  // Calcular desconto
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
  const totalPrice = discountedPrice * quantity;

  const handleWhatsAppQuote = () => {
    const specifications = [];
    
    if (selectedSize) specifications.push(`📏 Tamanho: ${selectedSize}`);
    if (selectedColor) specifications.push(`🎨 Cor: ${selectedColor}`);
    specifications.push(`📦 Quantidade: ${quantity} unidades`);
    
    if (currentDiscount > 0) {
      specifications.push(`💰 Desconto: ${currentDiscount}%`);
    }

    const message = `Olá! Gostaria de solicitar um orçamento:\n\n` +
      `*${product.name}*\n` +
      `${product.description}\n\n` +
      `${specifications.join('\n')}\n\n` +
      `💵 Valor estimado: R$ ${totalPrice.toFixed(2)}\n` +
      (product.customizable ? `\n✨ Este produto é personalizável!\n` : '') +
      `\nPoderia me enviar mais detalhes sobre prazo e personalização?`;
    
    const whatsappNum = settings.whatsapp?.replace(/\D/g, '') || '';
    window.open(`https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const isDisabled = !product.inStock || 
    (product.sizes && product.sizes.length > 0 && !selectedSize) ||
    (product.colors && product.colors.length > 0 && !selectedColor);

  const getButtonText = () => {
    if (!product.inStock) return 'Produto Esgotado';
    if (product.sizes && product.sizes.length > 0 && !selectedSize) return 'Selecione o Tamanho';
    if (product.colors && product.colors.length > 0 && !selectedColor) return 'Selecione a Cor';
    return 'Solicitar Orçamento via WhatsApp';
  };

  return (
    <div className="space-y-4">
      {/* Main CTA Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleWhatsAppQuote}
          size="lg" 
          className="w-full text-sm sm:text-lg font-bold bg-whatsapp hover:bg-whatsapp/90 h-12 sm:h-14 px-3"
          disabled={isDisabled}
        >
          <MessageCircle className="h-5 w-5 flex-shrink-0" />
          <span className="ml-2 truncate">{getButtonText()}</span>
        </Button>
        
        <Button 
          onClick={onAddToCart}
          variant="outline" 
          size="lg" 
          className="w-full h-12 text-sm sm:text-base"
          disabled={isDisabled}
        >
          <ShoppingCart className="h-5 w-5 flex-shrink-0" />
          <span className="ml-2">Adicionar ao Carrinho</span>
        </Button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="p-1.5 rounded-full bg-secondary">
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <span>Frete Grátis +R${settings.freeShippingMinimum}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="p-1.5 rounded-full bg-secondary">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span>{settings.warranty} garantia</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="p-1.5 rounded-full bg-secondary">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <span>{settings.productionTime}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="p-1.5 rounded-full bg-secondary">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <span>Parcelamos em {settings.installments}x</span>
        </div>
      </div>
    </div>
  );
};

