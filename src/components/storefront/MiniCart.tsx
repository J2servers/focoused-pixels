import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface MiniCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MiniCart({ open, onOpenChange }: MiniCartProps) {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart();
  const { freeShippingMinimum } = useSiteSettings();

  const freeShippingProgress = Math.min((total / (freeShippingMinimum || 159)) * 100, 100);
  const remainingForFreeShipping = Math.max((freeShippingMinimum || 159) - total, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </SheetTitle>
        </SheetHeader>

        {/* Free Shipping Progress */}
        {total > 0 && (
          <div className="py-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-success"
                initial={{ width: 0 }}
                animate={{ width: `${freeShippingProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              {remainingForFreeShipping > 0 ? (
                <>
                  Faltam <span className="font-semibold text-foreground">R$ {remainingForFreeShipping.toFixed(2).replace('.', ',')}</span> para frete grátis!
                </>
              ) : (
                <span className="text-success font-semibold">🎉 Você ganhou frete grátis!</span>
              )}
            </p>
          </div>
        )}

        <Separator />

        {/* Cart Items */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-2">Seu carrinho está vazio</p>
                <Link to="/categorias" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" size="sm">
                    Explorar produtos
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <ul className="space-y-4 py-4">
                {items.map((item) => (
                  <motion.li
                    key={`${item.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4"
                  >
                    <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
                      {item.size && (
                        <p className="text-xs text-muted-foreground">Tamanho: {item.size}</p>
                      )}
                      <p className="text-sm font-semibold text-primary mt-1">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            className="p-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id, item.size)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        {items.length > 0 && (
          <SheetFooter className="flex-col gap-4 mt-auto">
            <Separator />
            <div className="flex items-center justify-between w-full">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="text-xl font-bold">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Link to="/checkout" onClick={() => onOpenChange(false)}>
                <Button size="lg" className="w-full">
                  Finalizar Pedido
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/carrinho" onClick={() => onOpenChange(false)}>
                <Button variant="outline" size="lg" className="w-full">
                  Ver Carrinho Completo
                </Button>
              </Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
