import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function DarkFooter() {
  const settings = useSiteSettings();

  return (
    <footer className="relative pt-16 pb-8 border-t border-white/[0.08]"
      style={{ background: 'linear-gradient(180deg, rgba(10,22,40,0.94), rgba(5,13,26,0.98))' }}
    >
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h4 className="font-bebas text-2xl tracking-[0.12em] uppercase text-white mb-4">{settings.companyName}</h4>
            <p className="text-white/40 text-sm leading-relaxed">{settings.seoDescription}</p>
          </div>
          <div>
            <h4 className="font-bebas text-lg tracking-[0.12em] uppercase text-white mb-4">Navegação</h4>
            <ul className="space-y-3">
              {[
                { label: 'Produtos', to: '/busca' },
                { label: 'Categorias', to: '/categorias' },
                { label: 'Sobre Nós', to: '/sobre' },
                { label: 'FAQ', to: '/faq' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-white/50 text-sm hover:text-[hsl(var(--primary))] transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bebas text-lg tracking-[0.12em] uppercase text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: 'Política de Privacidade', to: '/privacidade' },
                { label: 'Termos de Uso', to: '/termos' },
                { label: 'Rastreamento', to: '/rastreio' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-white/50 text-sm hover:text-[hsl(var(--primary))] transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bebas text-lg tracking-[0.12em] uppercase text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              {settings.email && (
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <Mail className="h-4 w-4 text-[hsl(var(--primary))]" /> {settings.email}
                </li>
              )}
              {settings.whatsapp && (
                <li className="flex items-center gap-2 text-white/50 text-sm">
                  <Phone className="h-4 w-4 text-[hsl(var(--primary))]" /> WhatsApp
                </li>
              )}
            </ul>
            <div className="flex gap-3 mt-4">
              {settings.raw?.social_instagram && (
                <a href={settings.raw.social_instagram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))/0.3] transition-all">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {settings.raw?.social_facebook && (
                <a href={settings.raw.social_facebook} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))/0.3] transition-all">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] text-center">
          <p className="text-white/30 text-xs">{settings.raw?.copyright_text || `© ${new Date().getFullYear()} ${settings.companyName}. Todos os direitos reservados.`}</p>
        </div>
      </div>
    </footer>
  );
}
