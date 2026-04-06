/**
 * EventTracker - Centralized analytics event tracking
 * Implements: cart events, search, scroll depth, product views, etc.
 */
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Capture UTM params on first visit
function captureUTMParams() {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const utmData: Record<string, string> = {};
  let hasUtm = false;
  
  utmKeys.forEach(key => {
    const val = params.get(key);
    if (val) {
      utmData[key] = val;
      hasUtm = true;
    }
  });
  
  if (hasUtm) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmData));
  }
  
  const ref = document.referrer;
  if (ref && !ref.includes(window.location.hostname)) {
    sessionStorage.setItem('referrer', ref);
  }
}

// Get or create session ID
function getSessionId(): string {
  let sid = sessionStorage.getItem('analytics_session_id');
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('analytics_session_id', sid);
    sessionStorage.setItem('session_start', Date.now().toString());
  }
  return sid;
}

// Track an event (fire-and-forget, no blocking)
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  try {
    const sessionId = getSessionId();
    const utmRaw = sessionStorage.getItem('utm_params');
    const utm = utmRaw ? JSON.parse(utmRaw) : {};
    
    // Store events locally for analytics dashboard
    const events = JSON.parse(sessionStorage.getItem('analytics_events') || '[]');
    events.push({
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      utm,
      referrer: sessionStorage.getItem('referrer') || '',
      path: window.location.pathname,
    });
    // Keep last 100 events per session
    if (events.length > 100) events.shift();
    sessionStorage.setItem('analytics_events', JSON.stringify(events));
    
    // Push to dataLayer for GA4 if available
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: eventName,
        ...properties,
        session_id: sessionId,
      });
    }
  } catch {
    // Silent fail - analytics should never break the app
  }
}

// Pre-built event helpers
export const analytics = {
  addToCart: (product: { id: string; name: string; price: number }) =>
    trackEvent('add_to_cart', { product_id: product.id, product_name: product.name, price: product.price }),
  
  buyNow: (product: { id: string; name: string; price: number }) =>
    trackEvent('buy_now', { product_id: product.id, product_name: product.name, price: product.price }),
  
  search: (query: string, resultsCount?: number) =>
    trackEvent('search', { query, results_count: resultsCount }),
  
  categoryView: (category: string) =>
    trackEvent('category_view', { category }),
  
  productView: (product: { id: string; name: string; price: number }) =>
    trackEvent('product_view', { product_id: product.id, product_name: product.name, price: product.price }),
  
  quickView: (productId: string) =>
    trackEvent('quick_view', { product_id: productId }),
  
  whatsappClick: (context?: string) =>
    trackEvent('whatsapp_click', { context }),
  
  newsletterSignup: (source: string) =>
    trackEvent('newsletter_signup', { source }),
  
  checkoutStarted: (total: number, itemCount: number) =>
    trackEvent('checkout_started', { total, item_count: itemCount }),
  
  checkoutCompleted: (orderId: string, total: number) =>
    trackEvent('checkout_completed', { order_id: orderId, total }),
  
  couponUsed: (code: string, discount: number) =>
    trackEvent('coupon_used', { code, discount }),
  
  wishlistAdd: (productId: string) =>
    trackEvent('wishlist_add', { product_id: productId }),
  
  heroClick: (slideIndex: number, ctaLink?: string) =>
    trackEvent('hero_click', { slide_index: slideIndex, cta_link: ctaLink }),
  
  viewAll: (category: string) =>
    trackEvent('view_all_click', { category }),
};

/** Hook: scroll depth tracking */
export function useScrollDepthTracker() {
  const milestones = useRef(new Set<number>());
  const location = useLocation();
  
  useEffect(() => {
    milestones.current.clear();
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      
      const percent = Math.round((scrollTop / docHeight) * 100);
      
      [25, 50, 75, 100].forEach(milestone => {
        if (percent >= milestone && !milestones.current.has(milestone)) {
          milestones.current.add(milestone);
          trackEvent('scroll_depth', { depth: milestone, page: location.pathname });
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);
}

/** Hook: session time tracking */
export function useSessionTimeTracker() {
  useEffect(() => {
    const startStr = sessionStorage.getItem('session_start');
    if (!startStr) return;
    
    const handleUnload = () => {
      const duration = Math.round((Date.now() - parseInt(startStr)) / 1000);
      trackEvent('session_end', { duration_seconds: duration });
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
}

/** Component: initializes analytics on mount */
export function AnalyticsInit() {
  useEffect(() => {
    captureUTMParams();
    getSessionId();
  }, []);
  
  useScrollDepthTracker();
  useSessionTimeTracker();
  
  return null;
}
