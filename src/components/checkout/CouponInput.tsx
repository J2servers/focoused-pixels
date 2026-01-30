import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tag, Loader2, CheckCircle, X } from 'lucide-react';
import { useValidateCoupon } from '@/hooks/useCoupons';
import { motion, AnimatePresence } from 'framer-motion';

interface CouponInputProps {
  orderValue: number;
  onApply: (discount: number, couponCode: string) => void;
  onRemove: () => void;
  appliedCoupon?: string | null;
}

export function CouponInput({ orderValue, onApply, onRemove, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const validateCoupon = useValidateCoupon();

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setError(null);
    try {
      const result = await validateCoupon.mutateAsync({ code, orderValue });
      setDiscount(result.discount);
      onApply(result.discount, result.coupon.code);
    } catch (err: any) {
      setError(err.message || 'Cupom inválido');
    }
  };

  const handleRemove = () => {
    setCode('');
    setDiscount(0);
    setError(null);
    onRemove();
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Cupom de Desconto
      </Label>
      
      {appliedCoupon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between bg-success/10 border border-success/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-semibold text-success">{appliedCoupon}</p>
              <p className="text-xs text-muted-foreground">
                Desconto de R$ {discount.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Digite o código"
            className="uppercase"
          />
          <Button 
            onClick={handleApply} 
            disabled={validateCoupon.isPending || !code.trim()}
            variant="secondary"
          >
            {validateCoupon.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Aplicar'
            )}
          </Button>
        </div>
      )}
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
