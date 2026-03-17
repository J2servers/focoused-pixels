/**
 * WhatsAppButton - Botão flutuante do WhatsApp
 * 
 * CONFIGURAÇÕES USADAS (Admin > Configurações > IA > WhatsApp):
 * - whatsapp_message_template: Mensagem pré-preenchida ao clicar
 * 
 * CONFIGURAÇÕES USADAS (Admin > Empresa > Contato):
 * - whatsapp: Número do WhatsApp para contato
 */

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function WhatsAppButton() {
  const { whatsapp, whatsappMessageTemplate } = useSiteSettings();

  // Build WhatsApp URL with custom message
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
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white px-4 py-3 rounded-full shadow-lg group"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <MessageCircle className="h-6 w-6 fill-current" />
      </motion.div>
      <span className="hidden sm:inline font-medium whitespace-nowrap">
        Fale conosco
      </span>
    </motion.a>
  );
}
