import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Truck, Shield } from 'lucide-react';

const benefits = [
  { icon: ShoppingBag, title: 'Orçamentos salvos', description: 'Acompanhe todos os seus pedidos' },
  { icon: Heart, title: 'Lista de favoritos', description: 'Salve produtos para depois' },
  { icon: Star, title: 'Avaliações exclusivas', description: 'Compartilhe sua experiência' },
  { icon: Truck, title: 'Rastreamento', description: 'Acompanhe suas entregas' },
];

interface Props {
  logoSrc: string;
}

export function LoginHeroPanel({ logoSrc }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-purple"
    >
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12">
        <Link to="/" className="mb-12">
          <motion.img
            src={logoSrc}
            alt="Pincel de Luz Personalizados"
            className="h-16 w-auto brightness-0 invert"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
            Sua conta,<br /><span className="text-accent">suas vantagens.</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed mb-12">
            Crie sua conta gratuita e tenha acesso a benefícios exclusivos para acompanhar seus orçamentos e muito mais.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className="group">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-all duration-300">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <benefit.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground text-sm">{benefit.title}</h3>
                  <p className="text-xs text-primary-foreground/70 mt-0.5">{benefit.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 flex items-center gap-3 text-primary-foreground/60">
          <Shield className="h-5 w-5" />
          <span className="text-sm">Seus dados estão protegidos com criptografia de ponta</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
