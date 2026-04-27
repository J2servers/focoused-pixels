/**
 * CookieBanner - Banner de consentimento de cookies
 * 
 * CONFIGURAÇÕES USADAS (Admin > Configurações > LGPD):
 * - cookie_consent_enabled: Exibir/ocultar o banner
 * - cookie_consent_message: Mensagem personalizada do banner
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { cookieConsentEnabled, cookieConsentMessage } = useSiteSettings();

  useEffect(() => {
    // Only show if enabled in settings and user hasn't consented yet
    if (!cookieConsentEnabled) {
      setIsVisible(false);
      return;
    }
    
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, [cookieConsentEnabled]);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-30 rounded-2xl border border-border bg-background/95 backdrop-blur-md shadow-[0_8px_30px_hsl(var(--foreground)/0.18)] p-3.5 animate-slide-in"
    >
      <p className="text-xs text-muted-foreground leading-snug">
        🍪 {cookieConsentMessage}{' '}
        <a href="/privacidade" className="text-primary font-medium hover:underline">
          Saiba mais
        </a>
      </p>
      <div className="flex gap-2 mt-2.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={declineCookies}
          className="flex-1 h-8 text-xs text-muted-foreground hover:text-foreground"
        >
          Recusar
        </Button>
        <Button
          size="sm"
          onClick={acceptCookies}
          className="flex-1 h-8 text-xs font-semibold"
        >
          Aceitar
        </Button>
      </div>
    </div>
  );
}

