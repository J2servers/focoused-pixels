import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Sparkles, Gift } from 'lucide-react';
import type { Coupon } from '@/hooks/useCoupons';
import { QUICK_TEMPLATES, QuickTemplate } from './types';

interface Props {
  topCoupons: Coupon[];
  onQuickCreate: (tpl: QuickTemplate) => void;
}

export function CouponsTopAndTemplates({ topCoupons, onQuickCreate }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="liquid-glass">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Cupons Mais Utilizados</h3>
          </div>
          {topCoupons.length === 0 ? (
            <p className="text-sm text-white/50 text-center py-4">Nenhum dado de uso ainda</p>
          ) : (
            <div className="space-y-3">
              {topCoupons.map((coupon, i) => (
                <div key={coupon.id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-500/20 text-amber-300' : i === 1 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-700/20 text-orange-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-white">{coupon.code}</span>
                      <span className="text-xs font-medium text-purple-400">{coupon.usage_count} usos</span>
                    </div>
                    {coupon.usage_limit && (
                      <Progress value={(coupon.usage_count / coupon.usage_limit) * 100} className="h-1 mt-1.5 bg-white/[0.03]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="liquid-glass">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <h3 className="text-sm font-semibold text-white">Criação Rápida</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_TEMPLATES.map((tpl) => (
              <button key={tpl.code} onClick={() => onQuickCreate(tpl)}
                className="group p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-purple-500/40 transition-all text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="h-3.5 w-3.5 text-purple-400 group-hover:text-pink-400 transition-colors" />
                  <span className="text-xs font-semibold text-white">{tpl.name}</span>
                </div>
                <p className="text-[10px] text-white/50">{tpl.desc}</p>
                <div className="mt-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                    {tpl.code}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
