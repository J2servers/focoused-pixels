import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function CTASection() {
  const settings = useSiteSettings();

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))/0.08] via-transparent to-[hsl(var(--primary))/0.04]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--primary))/0.08] blur-[100px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 relative">
        <div className="p-10 md:p-16 rounded-[2rem] border border-[hsl(var(--primary))/0.2] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,8,18,0.5)] text-center">
          <h2 className="font-bebas text-[clamp(2.5rem,6vw,5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white mb-4">
            Pronto Para<br />
            <span className="text-[hsl(var(--primary))]">Personalizar?</span>
          </h2>
          <p className="max-w-lg mx-auto text-white/50 text-base leading-relaxed mb-8">
            Entre em contato e transforme suas ideias em peças únicas. Orçamento rápido e sem compromisso.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/checkout"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm
                bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]
                text-[#050d1a] shadow-[0_14px_30px_hsl(var(--primary)/0.3)]
                hover:shadow-[0_18px_40px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5 transition-all"
            >
              Solicitar Orçamento <ArrowRight className="h-4 w-4" />
            </Link>
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(settings.whatsappMessageTemplate)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm
                  border border-[hsl(var(--primary))/0.4] bg-[hsl(var(--primary))/0.05]
                  text-white hover:border-[hsl(var(--primary))/0.8] hover:bg-[hsl(var(--primary))/0.12]
                  hover:-translate-y-0.5 transition-all"
              >
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
