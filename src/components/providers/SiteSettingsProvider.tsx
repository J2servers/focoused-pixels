/**
 * SiteSettingsProvider
 * 
 * Provedor global que aplica configurações dinâmicas do admin ao site:
 * - Injeta CSS customizado
 * - Atualiza cores do tema via CSS variables
 * - Aplica tema claro/escuro baseado na configuração do admin
 * - Carrega scripts de analytics (GA, GTM, Facebook Pixel)
 * - Atualiza meta tags SEO dinamicamente
 * - Renderiza página de manutenção quando ativo
 */

import { useEffect, ReactNode } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { useLocation } from 'react-router-dom';

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const settings = useSiteSettings();
  const location = useLocation();

  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Apply dark mode based on admin settings
  useEffect(() => {
    if (settings.isLoading) return;
    
    // Don't apply storefront theme to admin routes (admin has its own theme)
    if (isAdminRoute) return;

    const root = document.documentElement;
    
    if (settings.darkModeEnabled) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    return () => {
      // Don't cleanup if navigating to admin
      if (!isAdminRoute) {
        root.classList.remove('dark');
      }
    };
  }, [settings.darkModeEnabled, settings.isLoading, isAdminRoute]);

  // Apply dynamic CSS variables for theme colors
  useEffect(() => {
    if (settings.isLoading) return;

    const root = document.documentElement;

    // Convert hex to HSL for Tailwind compatibility
    const hexToHSL = (hex: string): string => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
      if (!result) return '0 0% 0%';

      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply theme colors
    if (settings.primaryColor) {
      root.style.setProperty('--primary', hexToHSL(settings.primaryColor));
    }
    if (settings.secondaryColor) {
      root.style.setProperty('--secondary', hexToHSL(settings.secondaryColor));
    }
    if (settings.accentColor) {
      root.style.setProperty('--accent', hexToHSL(settings.accentColor));
    }

    return () => {
      // Cleanup: remove inline styles
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
    };
  }, [settings.primaryColor, settings.secondaryColor, settings.accentColor, settings.isLoading]);

  // Inject custom CSS
  useEffect(() => {
    if (!settings.customCss) return;

    const styleId = 'custom-admin-css';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = settings.customCss;

    return () => {
      styleElement?.remove();
    };
  }, [settings.customCss]);

  // Update SEO meta tags
  useEffect(() => {
    if (settings.isLoading) return;

    // Update title
    if (settings.seoTitle) {
      document.title = settings.seoTitle;
    }

    // Update meta description
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', settings.seoDescription);

    // Update meta keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', settings.seoKeywords);

    // Update OG Image
    if (settings.ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.setAttribute('content', settings.ogImage);
    }

    // Update favicon
    if (settings.faviconUrl) {
      let faviconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.faviconUrl;
    }
  }, [settings.seoTitle, settings.seoDescription, settings.seoKeywords, settings.ogImage, settings.faviconUrl, settings.isLoading]);

  // Load Google Analytics
  useEffect(() => {
    if (!settings.googleAnalyticsId || settings.isLoading) return;

    const gaId = settings.googleAnalyticsId;

    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

    // Load gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    const initScript = document.createElement('script');
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(initScript);

    console.log('[Analytics] Google Analytics loaded:', gaId);
  }, [settings.googleAnalyticsId, settings.isLoading]);

  // Load Google Tag Manager
  useEffect(() => {
    if (!settings.googleTagManagerId || settings.isLoading) return;

    const gtmId = settings.googleTagManagerId;

    // Check if already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtm"]`)) return;

    // Load GTM
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);

    console.log('[Analytics] Google Tag Manager loaded:', gtmId);
  }, [settings.googleTagManagerId, settings.isLoading]);

  // Load Facebook Pixel
  useEffect(() => {
    if (!settings.facebookPixelId || settings.isLoading) return;

    const pixelId = settings.facebookPixelId;

    // Check if already loaded
    if (window.fbq) return;

    // Load FB Pixel
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    console.log('[Analytics] Facebook Pixel loaded:', pixelId);
  }, [settings.facebookPixelId, settings.isLoading]);

  // Show maintenance page for non-admin routes when maintenance mode is active
  if (settings.maintenanceMode && !isAdminRoute && !settings.isLoading) {
    return <MaintenancePage message={settings.maintenanceMessage} />;
  }

  return <>{children}</>;
}

// Add fbq to window type
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
