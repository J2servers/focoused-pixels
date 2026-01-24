/**
 * MaintenancePage
 * 
 * Exibida quando o modo manutenção está ativo no admin.
 * Configuração: Configurações > Manutenção > Ativar Modo Manutenção
 */

import { Construction, Wrench, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface MaintenancePageProps {
  message?: string;
}

export function MaintenancePage({ message = 'Estamos em manutenção. Voltamos em breve!' }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative inline-flex">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Construction className="h-12 w-12 text-primary" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center"
            >
              <Wrench className="h-5 w-5 text-accent" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-foreground mb-4"
        >
          Site em Manutenção
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-muted-foreground mb-8"
        >
          {message}
        </motion.p>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Clock className="h-4 w-4" />
          </motion.div>
          <span>Trabalhando para voltar o mais rápido possível</span>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                opacity: [0, 0.3, 0],
                y: [0, -100],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
