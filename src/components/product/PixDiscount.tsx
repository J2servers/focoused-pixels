/**
 * PixDiscount - Shows PIX payment discount from company settings
 * Improvements: #7 PIX discount display, #8 Calculated PIX price, #9 Visual highlight
 */
import { QrCode } from 'lucide-react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

interface PixDiscountProps {
  price: number;
  quantity?: number;
}

export function PixDiscount({ price, quantity = 1 }: PixDiscountProps) {
  const { data: companyInfo } = useCompanyInfo();
  const pixPercent = companyInfo?.pix_discount_percent;

  if (!pixPercent || pixPercent <= 0) return null;

  const total = price * quantity;
  const pixPrice = total * (1 - pixPercent / 100);
  const savings = total - pixPrice;

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
      <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
        <QrCode className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
          R$ {pixPrice.toFixed(2).replace('.', ',')} no PIX
        </p>
        <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70">
          Economize R$ {savings.toFixed(2).replace('.', ',')} ({pixPercent}% de desconto)
        </p>
      </div>
    </div>
  );
}
