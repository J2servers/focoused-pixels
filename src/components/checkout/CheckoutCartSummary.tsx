import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Truck, Shield, Clock } from 'lucide-react';
import { storeInfo } from '@/data/store';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface CheckoutCartSummaryProps {
  items: CartItem[];
  total: number;
}

export function CheckoutCartSummary({ items, total }: CheckoutCartSummaryProps) {
  return (
    <div className="space-y-4 sticky top-4">
      {/* Cart Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="h-5 w-5" />
            Resumo do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length > 0 ? (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                    {item.size && (
                      <p className="text-xs text-muted-foreground">Tamanho: {item.size}</p>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        Qtd: {item.quantity}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-success">A calcular</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-3">
                Nenhum produto no carrinho
              </p>
              <Link to="/">
                <Button variant="outline" size="sm">
                  Explorar Produtos
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Truck className="h-4 w-4 text-success" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Frete Grátis</h4>
                <p className="text-xs text-muted-foreground">
                  Acima de R$ {storeInfo.freeShippingMinimum}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Garantia de 30 dias</h4>
                <p className="text-xs text-muted-foreground">
                  Defeitos de fabricação
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Clock className="h-4 w-4 text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Produção Rápida</h4>
                <p className="text-xs text-muted-foreground">
                  {storeInfo.productionTime}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            Dúvidas? Fale conosco pelo{' '}
            <a
              href={`https://wa.me/${storeInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-success font-medium hover:underline"
            >
              WhatsApp
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
