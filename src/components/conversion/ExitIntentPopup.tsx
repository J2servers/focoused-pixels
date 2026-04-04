/**
 * ExitIntentPopup - Detects mouse leaving viewport and shows coupon popup
 * Pure visual, minimal text — icon-driven design
 */
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Copy, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const couponCode = 'FICAMAIS10';
  const discountPercent = 10;

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 5 && !sessionStorage.getItem('exit_intent_shown')) {
      sessionStorage.setItem('exit_intent_shown', '1');
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('exit_intent_shown')) return;
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // Wait 5s before activating
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success('Cupom copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-none bg-transparent shadow-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Animated gradient border wrapper */}
          <div className="rounded-3xl p-[2px] neu-raised">
            <div className="rounded-[calc(1.5rem-2px)] bg-background p-8 text-center relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg"
              >
                <Gift className="h-8 w-8 text-white" />
              </motion.div>

              {/* Discount - BIG visual number, no lengthy text */}
              <div className="relative mb-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                >
                  {discountPercent}%
                </motion.div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">OFF</span>
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
              </div>

              {/* Coupon code */}
              <button
                onClick={handleCopy}
                className="group w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 transition-all mb-4"
              >
                <span className="font-mono font-bold text-lg tracking-wider text-primary">
                  {couponCode}
                </span>
                <Copy className={`h-4 w-4 transition-colors ${copied ? 'text-green-500' : 'text-muted-foreground group-hover:text-primary'}`} />
              </button>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full rounded-xl font-bold text-base h-12"
                onClick={() => setOpen(false)}
              >
                🛍️ Aproveitar
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
