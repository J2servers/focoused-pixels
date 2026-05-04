import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { discountTiers } from '@/data/store';
import type { CustomizationData } from '@/components/product/ProductCustomizationForm';

interface ProductLike {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  sizes?: string[] | null;
  colors?: string[] | null;
  minQuantity?: number;
}

interface SelectedFreight {
  method: string; price: number; days: string; cep: string; city: string; state: string;
}

export function getDiscountPercent(qty: number): number {
  let discount = 0;
  for (const tier of discountTiers) {
    if (qty >= tier.quantity) discount = tier.discount;
  }
  return discount;
}

export function useProductPageState(product: ProductLike | undefined, productSlug: string | undefined) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBgColor, setSelectedBgColor] = useState<string | null>(null);
  const [selectedLogoColor, setSelectedLogoColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customizationData, setCustomizationData] = useState<CustomizationData>({
    customText: '', logoFiles: [], whatsappNumber: '',
  });
  const [selectedFreight, setSelectedFreight] = useState<SelectedFreight | null>(null);

  useEffect(() => {
    if (product) addRecentlyViewed({
      slug: product.slug, name: product.name, image: product.image, price: product.price,
    });
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

  const currentDiscount = getDiscountPercent(quantity);
  const discountedPrice = product ? product.price * (1 - currentDiscount / 100) : 0;

  const handleAddToCart = () => {
    if (!product) return false;
    if (product.sizes?.length && !selectedSize) {
      toast.error('Por favor, selecione um tamanho');
      return false;
    }
    if (product.colors?.length && !selectedColor) {
      toast.error('Por favor, selecione uma cor');
      return false;
    }
    addItem({
      id: product.id, name: product.name, price: discountedPrice, image: product.image,
      quantity, size: selectedSize || undefined, color: selectedColor || selectedBgColor || undefined,
      customization: {
        customText: customizationData.customText || undefined,
        whatsappNumber: customizationData.whatsappNumber || undefined,
        logoFileNames: customizationData.logoFiles.length > 0
          ? customizationData.logoFiles.map(f => f.name) : undefined,
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
    if (!product) return;
    const added = handleAddToCart();
    if (!added) return;
    const subtotal = discountedPrice * quantity;
    const shippingCost = selectedFreight?.price || 0;
    sessionStorage.setItem('pending_payment', JSON.stringify({
      orderId: `quick-${Date.now()}`, amount: subtotal + shippingCost,
      customerName: '', customerEmail: '', customerCpf: '', customerPhone: '',
      description: `${product.name} x${quantity}`,
      cartItems: [{
        name: product.name, quantity, price: discountedPrice,
        size: selectedSize || undefined, color: selectedColor || undefined,
      }],
      shipping: selectedFreight ? {
        method: selectedFreight.method, cost: shippingCost, days: selectedFreight.days,
        cep: selectedFreight.cep, city: selectedFreight.city, state: selectedFreight.state,
      } : null,
    }));
    navigate('/pagamento');
  };

  return {
    selectedSize, setSelectedSize,
    selectedColor, setSelectedColor,
    selectedBgColor, setSelectedBgColor,
    selectedLogoColor, setSelectedLogoColor,
    quantity, setQuantity,
    customizationData, setCustomizationData,
    selectedFreight, setSelectedFreight,
    currentDiscount, discountedPrice,
    handleAddToCart, handleBuyNow,
  };
}
