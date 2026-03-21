import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const WeeklyUrgencySection = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysLeft = dayOfWeek <= 4 ? 4 - dayOfWeek : 7 - dayOfWeek + 4; // até sexta
  
  if (daysLeft <= 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Produção da Semana Quase Fechando
              </h3>
              <p className="text-muted-foreground text-sm">
                Faltam apenas <span className="font-bold text-foreground">{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</span> para fechar a leva de produção desta semana.
                Garanta seu pedido agora!
              </p>
            </div>
          </div>
          <Link to="/categorias">
            <Button className="whitespace-nowrap">
              Ver Produtos
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
