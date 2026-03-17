/**
 * WhatsAppButton - Botão flutuante do WhatsApp (Desktop)
 */

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function WhatsAppButton() {
  const { whatsapp, whatsappMessageTemplate } = useSiteSettings();

  const whatsappLink = whatsapp 
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessageTemplate)}`
    : '#';

  if (!whatsapp) return null;

  return (
    <motion.a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 hidden sm:flex items-center gap-2 px-4 py-3 rounded-2xl group"
      style={{
        background: 'hsl(var(--surface-elevated))',
        color: 'hsl(var(--whatsapp))',
        boxShadow: '-6px -6px 12px hsl(var(--neu-light) / 0.92), 8px 8px 16px hsl(var(--neu-dark) / 0.42), 0 0 0 1px hsl(142 70% 45% / 0.22)',
      }}
      aria-label="Fale conosco pelo WhatsApp"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <MessageCircle className="h-5 w-5" />
      </motion.div>
      <span className="font-semibold text-sm whitespace-nowrap">
        Fale conosco
      </span>
    </motion.a>
  );
}
