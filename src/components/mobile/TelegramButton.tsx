import { memo } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

interface TelegramButtonProps {
  message?: string;
  className?: string;
}

export const TelegramButton = memo(({ message, className = '' }: TelegramButtonProps) => {
  const { data: company } = useCompanyInfo();
  
  // Use Telegram username from social links or fallback
  const telegramUsername = company?.social_tiktok?.includes('t.me') 
    ? company.social_tiktok.replace('https://t.me/', '')
    : 'pinceldeluz';

  const telegramUrl = message 
    ? `https://t.me/${telegramUsername}?text=${encodeURIComponent(message)}`
    : `https://t.me/${telegramUsername}`;

  return (
    <motion.a
      href={telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium rounded-full px-6 py-3 shadow-lg transition-colors ${className}`}
    >
      <Send className="h-5 w-5" />
      <span>Telegram</span>
    </motion.a>
  );
});

TelegramButton.displayName = 'TelegramButton';
