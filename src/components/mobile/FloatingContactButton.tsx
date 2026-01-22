import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useIsMobile } from '@/hooks/use-mobile';

export const FloatingContactButton = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: company } = useCompanyInfo();
  const isMobile = useIsMobile();

  const whatsappNumber = company?.whatsapp?.replace(/\D/g, '') || '5511999999999';
  const telegramUsername = 'pinceldeluz';

  const contacts = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Olá! Vi seu site e gostaria de mais informações.')}`,
      color: 'bg-[#25D366] hover:bg-[#20BD5A]',
    },
    {
      name: 'Telegram',
      icon: <Send className="h-5 w-5" />,
      url: `https://t.me/${telegramUsername}`,
      color: 'bg-[#0088cc] hover:bg-[#0077b5]',
    },
  ];

  // Different positioning for mobile (above bottom nav)
  const bottomPosition = isMobile ? 'bottom-20' : 'bottom-6';

  return (
    <div className={`fixed ${bottomPosition} right-4 z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3"
          >
            {contacts.map((contact) => (
              <motion.a
                key={contact.name}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 ${contact.color} text-white px-4 py-3 rounded-full shadow-lg whitespace-nowrap`}
              >
                {contact.icon}
                <span className="font-medium">{contact.name}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
});

FloatingContactButton.displayName = 'FloatingContactButton';
