import { MessageCircle } from 'lucide-react';
import { storeInfo } from '@/data/store';

export function WhatsAppButton() {
  return (
    <a
      href={storeInfo.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-whatsapp hover:bg-whatsapp/90 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 group"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-6 w-6 fill-current" />
      <span className="hidden sm:inline font-medium whitespace-nowrap">
        Fale conosco
      </span>
    </a>
  );
}
