import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('leads').insert({
        name,
        email,
        source: 'newsletter',
        tags: ['newsletter', 'storefront'],
      });

      if (error) {
        if (error.code === '23505') {
          toast.info('Este e-mail já está cadastrado!');
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        toast.success('Inscrito com sucesso!');
      }
    } catch {
      toast.error('Erro ao se inscrever. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--primary))/0.03] to-transparent" />
      <div className="max-w-[1240px] mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 md:p-14 rounded-[2rem] border border-[hsl(var(--primary))/0.15] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,8,18,0.4)]"
        >
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
                <span className="font-mono text-xs tracking-[0.18em] uppercase text-[hsl(var(--primary))]">
                  Exclusivo
                </span>
              </div>
              <h2 className="font-bebas text-[clamp(2rem,4vw,3.5rem)] leading-[0.92] tracking-[0.09em] uppercase text-white mb-4">
                Receba Ofertas<br />
                <span className="text-[hsl(var(--primary))]">Em Primeira Mão</span>
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Cadastre-se e receba promoções exclusivas, lançamentos e descontos especiais diretamente no seu e-mail.
              </p>
            </div>

            <div>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-[hsl(var(--primary))] mx-auto mb-4" />
                  <h3 className="font-bebas text-2xl text-white tracking-wider uppercase mb-2">Inscrito!</h3>
                  <p className="text-white/50 text-sm">Você receberá nossas novidades em breve.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[hsl(var(--primary))/0.5] focus:ring-1 focus:ring-[hsl(var(--primary))/0.2] transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[hsl(var(--primary))/0.5] focus:ring-1 focus:ring-[hsl(var(--primary))/0.2] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-sm
                      bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.7)]
                      text-[#050d1a] shadow-[0_14px_30px_hsl(var(--primary)/0.3)]
                      hover:shadow-[0_18px_40px_hsl(var(--primary)/0.4)] transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Cadastrando...' : (
                      <>Quero Receber <Send className="h-4 w-4" /></>
                    )}
                  </button>
                  <p className="text-white/30 text-[10px] font-mono tracking-wider text-center">
                    Sem spam. Cancele quando quiser.
                  </p>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

