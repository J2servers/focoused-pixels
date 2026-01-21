import { Link } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { MainHeader } from '@/components/layout/MainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Trash2, Minus, Plus, MessageCircle, ShoppingBag, FileText } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { storeInfo } from '@/data/store';

const CartPage = () => {
  const { items, removeItem, updateQuantity, total, clearCart, itemCount } = useCart();

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;

    const itemsList = items
      .map(item => `• ${item.name}${item.size ? ` (${item.size})` : ''} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const message = `Olá! Gostaria de finalizar meu pedido:\n\n${itemsList}\n\n*Total: R$ ${total.toFixed(2)}*\n\nPoderia me ajudar?`;
    
    window.open(`${storeInfo.whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const freeShippingRemaining = storeInfo.freeShippingMinimum - total;
  const hasFreeShipping = total >= storeInfo.freeShippingMinimum;

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <MainHeader />
      <NavigationBar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">Meu Carrinho</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Seu carrinho está vazio</h2>
              <p className="text-muted-foreground mb-6">
                Adicione produtos ao carrinho para continuar comprando
              </p>
              <Link to="/">
                <Button size="lg">Continuar comprando</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Free Shipping Progress */}
                {!hasFreeShipping && (
                  <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                    <p className="text-sm">
                      Faltam <strong>R$ {freeShippingRemaining.toFixed(2)}</strong> para você ganhar{' '}
                      <span className="text-primary font-semibold">Frete Grátis!</span>
                    </p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min((total / storeInfo.freeShippingMinimum) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {hasFreeShipping && (
                  <div className="bg-success/10 text-success rounded-lg p-4 mb-6 flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <p className="font-medium">Parabéns! Você ganhou Frete Grátis!</p>
                  </div>
                )}

                {/* Items List */}
                {items.map((item) => (
                  <div 
                    key={`${item.id}-${item.size || ''}`}
                    className="flex gap-4 bg-card rounded-lg border border-border p-4"
                  >
                    <Link to={`/produto/${item.id}`} className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/produto/${item.id}`}
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
                        R$ {item.price.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
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

                {/* Clear Cart */}
                <Button 
                  variant="ghost" 
                  onClick={clearCart}
                  className="text-muted-foreground"
                >
                  Limpar carrinho
                </Button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-6 sticky top-32">
                  <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({itemCount} itens)</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete</span>
                      <span className={hasFreeShipping ? 'text-success font-medium' : ''}>
                        {hasFreeShipping ? 'Grátis' : 'A calcular'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border my-4" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl text-primary">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 text-center">
                    ou em até {storeInfo.installments}x de R$ {(total / storeInfo.installments).toFixed(2)} sem juros
                  </p>

                  <Link to="/checkout">
                    <Button 
                      size="lg" 
                      className="w-full font-bold"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Solicitar Orçamento
                    </Button>
                  </Link>

                  <Button 
                    onClick={handleCheckoutWhatsApp}
                    size="lg" 
                    variant="outline"
                    className="w-full font-bold border-success text-success hover:bg-success hover:text-success-foreground"
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
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default CartPage;
