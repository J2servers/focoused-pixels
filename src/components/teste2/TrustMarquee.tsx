import { Shield, Truck, CreditCard, RefreshCw, Award, Lock } from 'lucide-react';

const trustItems = [
  { icon: <Shield className="h-4 w-4" />, text: 'Compra Segura' },
  { icon: <Truck className="h-4 w-4" />, text: 'Entrega Para Todo Brasil' },
  { icon: <CreditCard className="h-4 w-4" />, text: 'Até 12x Sem Juros' },
  { icon: <RefreshCw className="h-4 w-4" />, text: 'Troca Garantida' },
  { icon: <Award className="h-4 w-4" />, text: 'Qualidade Premium' },
  { icon: <Lock className="h-4 w-4" />, text: 'Dados Protegidos' },
];

export function TrustMarquee() {
  const items = [...trustItems, ...trustItems];

  return (
    <div className="relative py-5 border-y border-white/[0.06] overflow-hidden bg-white/[0.02]">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-white/50 shrink-0">
            <span className="text-[hsl(var(--primary))]">{item.icon}</span>
            <span className="font-mono text-[11px] tracking-[0.12em] uppercase">{item.text}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
