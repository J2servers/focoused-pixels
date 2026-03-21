import { motion } from 'framer-motion';
import { Sparkles, Shield, Truck, Clock, Award, Zap } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function DifferentialsSection() {
  const settings = useSiteSettings();
  const diffs = [
    { icon: <Sparkles className="h-6 w-6" />, title: 'Personalização Total', desc: 'Cada peça é única e feita sob medida para você.' },
    { icon: <Shield className="h-6 w-6" />, title: 'Compra 100% Segura', desc: 'Criptografia SSL e dados protegidos.' },
    { icon: <Truck className="h-6 w-6" />, title: `Frete Grátis +R$${settings.freeShippingMinimum}`, desc: 'Entrega rápida com rastreamento em tempo real.' },
    { icon: <Clock className="h-6 w-6" />, title: `Produção ${settings.productionTime}`, desc: 'Agilidade sem abrir mão da qualidade.' },
    { icon: <Award className="h-6 w-6" />, title: `Garantia ${settings.warranty}`, desc: 'Troca garantida sem complicação.' },
    { icon: <Zap className="h-6 w-6" />, title: `Até ${settings.installments}x s/ Juros`, desc: 'PIX, cartão, boleto. Você escolhe.' },
  ];

  return (
    <section className="relative py-24 border-y border-white/[0.05]"
      style={{ background: 'linear-gradient(180deg, rgba(10,22,40,0.78), rgba(10,22,40,0.28))' }}
    >
      <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-[hsl(var(--primary))/0.06] blur-[80px] pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-6 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3 justify-center">
            <span className="w-9 h-px bg-gradient-to-r from-transparent to-[hsl(var(--primary))]" />
            <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">Por que nos escolher</span>
            <span className="w-9 h-px bg-gradient-to-l from-transparent to-[hsl(var(--primary))]" />
          </div>
          <h2 className="font-bebas text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white">
            Diferenciais
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {diffs.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-3xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-xl shadow-[0_16px_32px_rgba(0,0,0,0.16)] hover:border-[hsl(var(--primary))/0.3] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--primary))/0.1] border border-[hsl(var(--primary))/0.12] flex items-center justify-center text-[hsl(var(--primary))] mb-5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]">
                {d.icon}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{d.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

