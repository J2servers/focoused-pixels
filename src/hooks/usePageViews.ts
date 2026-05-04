/**
 * Hook para rastrear visualizações de página e consultar analytics
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function getSessionId() {
  let sessionId = sessionStorage.getItem('pv_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('pv_session', sessionId);
  }
  return sessionId;
}

export function useTrackPageView() {
  const location = useLocation();

  useEffect(() => {
    const trackView = async () => {
      try {
        const sessionId = getSessionId();
        const cacheKey = `pv_${sessionId}_${location.pathname}`;
        const lastTracked = sessionStorage.getItem(cacheKey);
        const now = Date.now();

        if (lastTracked && now - parseInt(lastTracked) < 30000) return;
        sessionStorage.setItem(cacheKey, now.toString());

        await supabase.from('page_views').insert({
          page_path: location.pathname,
          referrer: document.referrer || null,
          session_id: sessionId,
        });
      } catch {
        // Silent fail
      }
    };
    trackView();
  }, [location.pathname]);
}

interface PageViewStats {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  uniqueSessions: number;
  topPages: { page_path: string; views: number }[];
}

export function usePageViewStats() {
  return useQuery({
    queryKey: ['page-view-stats'],
    queryFn: async (): Promise<PageViewStats> => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [totalRes, todayRes, weekRes, monthRes] = await Promise.all([
        supabase.from('page_views').select('id', { count: 'exact', head: true }),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
      ]);

      const { data: sessionsData } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', monthStart);

      const uniqueSessions = new Set((sessionsData || []).map((r) => r.session_id)).size;

      const { data: allViews } = await supabase
        .from('page_views')
        .select('page_path')
        .gte('created_at', monthStart);

      const pageCounts: Record<string, number> = {};
      (allViews || []).forEach((v) => {
        pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
      });

      const topPages = Object.entries(pageCounts)
        .map(([page_path, views]) => ({ page_path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      return {
        totalViews: totalRes.count || 0,
        todayViews: todayRes.count || 0,
        weekViews: weekRes.count || 0,
        monthViews: monthRes.count || 0,
        uniqueSessions,
        topPages,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}
