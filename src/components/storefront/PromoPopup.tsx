import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface PromoPopup {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  trigger_type: 'time' | 'scroll' | 'exit';
  trigger_value: number;
  show_once: boolean;
}

export function PromoPopupManager() {
  const [activePopup, setActivePopup] = useState<PromoPopup | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const { data: popups } = useQuery({
    queryKey: ['promo-popups'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promo_popups')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data as PromoPopup[];
    },
  });

  useEffect(() => {
    if (!popups || popups.length === 0) return;

    const popup = popups[0];
    
    // Check if already dismissed in this session
    const dismissedKey = `popup_dismissed_${popup.id}`;
    if (popup.show_once && sessionStorage.getItem(dismissedKey)) {
      return;
    }

    // Check if already shown
    if (dismissed.has(popup.id)) return;

    const showPopup = () => {
      setActivePopup(popup);
    };

    if (popup.trigger_type === 'time') {
      const timer = setTimeout(showPopup, (popup.trigger_value || 5) * 1000);
      return () => clearTimeout(timer);
    }

    if (popup.trigger_type === 'scroll') {
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= (popup.trigger_value || 50)) {
          showPopup();
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    if (popup.trigger_type === 'exit') {
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          showPopup();
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [popups, dismissed]);

  const handleDismiss = () => {
    if (activePopup) {
      setDismissed((prev) => new Set(prev).add(activePopup.id));
      if (activePopup.show_once) {
        sessionStorage.setItem(`popup_dismissed_${activePopup.id}`, 'true');
      }
    }
    setActivePopup(null);
  };

  if (!activePopup) return null;

  return (
    <Dialog open={!!activePopup} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 bg-background/80 p-1"
        >
          <X className="h-4 w-4" />
        </button>

        {activePopup.image_url && (
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="aspect-video overflow-hidden"
          >
            <img
              src={activePopup.image_url}
              alt={activePopup.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">{activePopup.title}</DialogTitle>
          </DialogHeader>

          {activePopup.content && (
            <p className="mt-2 text-muted-foreground">{activePopup.content}</p>
          )}

          {activePopup.cta_text && activePopup.cta_link && (
            <Link to={activePopup.cta_link} onClick={handleDismiss}>
              <Button className="w-full mt-4" size="lg">
                {activePopup.cta_text}
              </Button>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
