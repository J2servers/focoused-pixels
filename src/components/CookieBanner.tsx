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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg animate-slide-in">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            {cookieConsentMessage}{' '}
            <a href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={declineCookies}>
              Recusar
            </Button>
            <Button size="sm" onClick={acceptCookies}>
              Aceitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
