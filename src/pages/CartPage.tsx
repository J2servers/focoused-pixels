import { Link, useNavigate } from 'react-router-dom';
import { DynamicMainHeader, DynamicFooter, NavigationBar } from '@/components/layout';
import { TrustBar } from '@/components/conversion';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { lazy, Suspense } from 'react';

const AIChatWidget = lazy(() => import('@/components/chat/AIChatWidget').then(m => ({ default: m.AIChatWidget })));
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, MessageCircle, ShoppingBag, FileText, CreditCard } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCartTotals } from '@/hooks/useCartTotals';

import { CartCrossSell } from '@/components/cart/CartCrossSell';
import { CartStickyCheckoutBar } from '@/components/cart/CartStickyCheckoutBar';
import { FreeShippingBar } from '@/components/cart/FreeShippingBar';
import { PageSEO } from '@/components/seo/PageSEO';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { renderCartCheckoutMessage } from '@/lib/whatsapp-templates';
import { writePendingPayment } from '@/lib/pendingPayment';
import { formatCurrency } from '@/lib/format';

const CartPage = () => {
  const { items, removeItem, updateQuantity, total, clearCart, itemCount } = useCart();
  const siteSettings = useSiteSettings();
  const totals = useCartTotals();
  const navigate = useNavigate();

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;
    const message = renderCartCheckoutMessage({
      items: items.map(i => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price })),
      total,
      itemCount,
    });
    const whatsappLink = buildWhatsAppUrl(siteSettings.whatsapp, message);
    if (!whatsappLink) return;
    window.open(whatsappLink, '_blank');
  };

  const handlePayNow = () => {
    writePendingPayment({
      orderId: `cart-${Date.now()}`,
      amount: total,
      customerName: '',
      customerEmail: '',
      customerCpf: '',
      customerPhone: '',
      description: `Carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`,
      cartItems: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      })),
    });
    navigate('/pagamento');
  };

  const hasFreeShipping = totals.freeShippingApplied || totals.freeShippingRemaining === 0 && totals.freeShippingMinimum > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageSEO title="Meu Carrinho" description="Revise os itens do seu carrinho de compras Pincel de Luz." path="/carrinho" noindex />
      <TrustBar />
      <DynamicMainHeader />
      <NavigationBar />

      <main id="main-content" className="flex-1" role="main">
        <div className="container mx-auto px-4 py-8 pb-28 lg:pb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Meu Carrinho</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="rounded-2xl neu-concave p-12 max-w-md mx-auto">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
                <p className="text-muted-foreground mb-6">
                  Adicione produtos ao carrinho para continuar comprando
                </p>
                <Link to="/">
                  <Button size="lg">Continuar comprando</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Free Shipping Progress (centralized) */}
                <FreeShippingBar className="mb-6" />

                {/* Items List */}
                {items.map((item) => (
                  <div 
                    key={`${item.id}-${item.size || ''}`}
                    className="flex gap-4 rounded-2xl neu-flat p-5"
                  >
                    <Link to={`/produto/${item.slug || item.id}`} className="flex-shrink-0">
                      <div className="rounded-xl neu-pressed p-1">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/produto/${item.slug || item.id}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      {item.size && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Tamanho: {item.size}
                        </p>
                      )}
                      <p className="text-lg font-bold text-primary mt-2">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-xl"
                            onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-xl"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id, item.size)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <Button 
                  variant="ghost" 
                  onClick={clearCart}
                  className="text-muted-foreground"
                >
                  Limpar carrinho
                </Button>

                {/* Cross-sell Recommendations */}
                <CartCrossSell cartItems={items} />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl neu-raised p-6 sticky top-32">
                  <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({itemCount} itens)</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    {totals.progressiveDiscount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Desconto progressivo</span>
                        <span>- {formatCurrency(totals.progressiveDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span className={hasFreeShipping ? 'text-success font-medium' : ''}>
                        {hasFreeShipping ? 'Grátis' : 'A calcular'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border/30 my-4" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl text-primary">
                      {formatCurrency(totals.total)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 text-center">
                    ou em até {siteSettings.installments}x de {formatCurrency(totals.total / siteSettings.installments)} sem juros
                  </p>

                  <div className="space-y-3">
                    <Button 
                      onClick={handlePayNow}
                      size="lg" 
                      className="w-full font-bold rounded-xl"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pagar Agora
                    </Button>

                    <Link to="/pagamento">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full font-bold rounded-xl"
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Solicitar Orçamento
                      </Button>
                    </Link>

                    <Button 
                      onClick={handleCheckoutWhatsApp}
                      size="lg" 
                      variant="ghost"
                      className="w-full font-bold text-success hover:text-success"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Comprar via WhatsApp
                    </Button>

                    <Link to="/" className="block">
                      <Button variant="ghost" className="w-full text-muted-foreground">
                        Continuar comprando
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <DynamicFooter />
      <WhatsAppButton />
      <Suspense fallback={null}>
        <AIChatWidget />
      </Suspense>

      {/* Mobile sticky checkout — keeps "Finalizar compra" reachable */}
      {items.length > 0 && (
        <CartStickyCheckoutBar
          total={total}
          itemCount={itemCount}
          onCheckout={handlePayNow}
        />
      )}
    </div>
  );
};

export default CartPage;




