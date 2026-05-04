import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertTriangle } from 'lucide-react';
import type { Coupon } from '@/hooks/useCoupons';

interface Props {
  expiringCoupons: Coupon[];
  expiredCoupons: Coupon[];
}

export function CouponsAlerts({ expiringCoupons, expiredCoupons }: Props) {
  if (!expiringCoupons.length && !expiredCoupons.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {expiringCoupons.length > 0 && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-300">Expirando em breve</h3>
              <p className="text-xs text-amber-400/70 mt-0.5">
                {expiringCoupons.map(c => c.code).join(', ')} — expiram nos próximos 7 dias
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {expiredCoupons.length > 0 && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-300">Cupons expirados ativos</h3>
              <p className="text-xs text-red-400/70 mt-0.5">
                {expiredCoupons.map(c => c.code).join(', ')} — ainda marcados como ativos
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
