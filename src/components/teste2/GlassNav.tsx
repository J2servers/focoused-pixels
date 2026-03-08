import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, ChevronRight, Sparkles, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function GlassNav({ companyName, logo }: { companyName: string; logo: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-[1240px] mx-auto px-6">
          <div className={`flex items-center justify-between px-6 py-3 rounded-full border transition-all duration-500
            ${scrolled
              ? 'bg-[#050d1a]/80 border-[hsl(var(--primary))/0.2] shadow-[0_22px_54px_rgba(0,0,0,0.4)]'
              : 'bg-[#050d1a]/40 border-white/[0.08] shadow-[0_18px_36px_rgba(0,0,0,0.18)]'
            } backdrop-blur-xl`}
          >
            <Link to="/teste2" className="flex items-center gap-3 shrink-0">
              {logo ? (
                <img src={logo} alt={companyName} className="h-8 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <span className="font-bebas text-xl tracking-[0.18em] uppercase text-white">{companyName}</span>
                </div>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Produtos', 'Categorias', 'Sobre', 'Contato'].map(item => (
                <Link
                  key={item}
                  to={item === 'Produtos' ? '/busca' : item === 'Categorias' ? '/categorias' : item === 'Sobre' ? '/sobre' : '/faq'}
                  className="relative text-white/80 text-sm tracking-wide hover:text-white transition-colors group"
                >
                  {item}
                  <span className="absolute left-0 -bottom-1 w-full h-px bg-[hsl(var(--primary))] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/busca" className="hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
                <Search className="h-4 w-4 text-white/70" />
              </Link>
              <Link to="/login" className="hidden md:flex w-10 h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
                <User className="h-4 w-4 text-white/70" />
              </Link>
              <Link to="/carrinho" className="relative w-10 h-10 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
                <ShoppingBag className="h-4 w-4 text-white/70" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(var(--primary))] text-[#050d1a] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]"
              >
                {mobileOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#050d1a]/96 backdrop-blur-2xl flex items-center justify-center p-6 md:hidden"
          >
            <div className="w-full max-w-sm p-6 rounded-3xl border border-[hsl(var(--primary))/0.15] bg-white/[0.05] backdrop-blur-2xl shadow-2xl">
              <div className="grid gap-3">
                {[
                  { label: 'Produtos', to: '/busca' },
                  { label: 'Categorias', to: '/categorias' },
                  { label: 'Sobre', to: '/sobre' },
                  { label: 'FAQ', to: '/faq' },
                  { label: 'Minha Conta', to: '/login' },
                  { label: 'Carrinho', to: '/carrinho' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white hover:border-[hsl(var(--primary))/0.3] transition-all"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
