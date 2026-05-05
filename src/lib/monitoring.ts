/**
 * Cliente de monitoramento — captura erros e métricas e envia para system_errors / system_metrics.
 * Buffer em batch com flush no beforeunload e a cada 10s.
 */
import { supabase } from '@/integrations/supabase/client';

interface ErrorReport {
  message: string;
  stack?: string;
  level?: 'fatal' | 'error' | 'warning' | 'info';
  source?: 'frontend' | 'edge_function' | 'database' | 'cron' | 'webhook' | 'payment';
  context?: Record<string, unknown>;
}

interface MetricReport {
  metric_name: string;
  metric_value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  context?: Record<string, unknown>;
}

const metricBuffer: MetricReport[] = [];
const recentFingerprints = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000;

function deviceType(): string {
  const w = window.innerWidth;
  return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

function fingerprint(msg: string, stack?: string): string {
  return `${msg}::${(stack ?? '').split('\n').slice(0, 2).join('|')}`.slice(0, 300);
}

export async function reportError(err: unknown, opts: Partial<ErrorReport> = {}): Promise<void> {
  const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
  const stack = err instanceof Error ? err.stack : undefined;
  const fp = fingerprint(message, stack);
  const now = Date.now();
  const last = recentFingerprints.get(fp);
  if (last && now - last < DEDUP_WINDOW_MS) return;
  recentFingerprints.set(fp, now);
  if (recentFingerprints.size > 100) {
    const cutoff = now - DEDUP_WINDOW_MS;
    for (const [k, v] of recentFingerprints) if (v < cutoff) recentFingerprints.delete(k);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.functions.invoke('report-error', {
      body: {
        message, stack,
        level: opts.level ?? 'error',
        source: opts.source ?? 'frontend',
        context: opts.context ?? {},
        url: window.location.href,
        user_agent: navigator.userAgent,
        user_id: user?.id ?? null,
      },
    });
  } catch {
    // silencioso — não fazer recursão de erro
  }
}

export function reportMetric(m: MetricReport): void {
  metricBuffer.push(m);
  if (metricBuffer.length >= 10) flushMetrics();
}

async function flushMetrics(): Promise<void> {
  if (metricBuffer.length === 0) return;
  const batch = metricBuffer.splice(0, metricBuffer.length);
  try {
    await supabase.from('system_metrics').insert(
      batch.map(m => ({
        metric_name: m.metric_name,
        metric_value: m.metric_value,
        rating: m.rating ?? null,
        url: window.location.pathname,
        user_agent: navigator.userAgent.slice(0, 500),
        device_type: deviceType(),
        context: m.context ?? {},
      })),
    );
  } catch {
    /* silencioso */
  }
}

export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Captura erros não tratados
  window.addEventListener('error', (e) => {
    reportError(e.error ?? e.message, { level: 'error', context: { type: 'window.onerror', filename: e.filename, lineno: e.lineno, colno: e.colno } });
  });

  // Captura promises rejeitadas
  window.addEventListener('unhandledrejection', (e) => {
    reportError(e.reason, { level: 'error', context: { type: 'unhandledrejection' } });
  });

  // Web Vitals via PerformanceObserver nativo (sem dependência extra)
  try {
    const rate = (name: string, v: number): MetricReport['rating'] => {
      const thresholds: Record<string, [number, number]> = {
        LCP: [2500, 4000], FID: [100, 300], CLS: [0.1, 0.25],
        INP: [200, 500], TTFB: [800, 1800], FCP: [1800, 3000],
      };
      const t = thresholds[name]; if (!t) return undefined;
      return v <= t[0] ? 'good' : v <= t[1] ? 'needs-improvement' : 'poor';
    };

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          reportMetric({ metric_name: 'LCP', metric_value: entry.startTime, rating: rate('LCP', entry.startTime) });
        }
        if (entry.entryType === 'first-input') {
          const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          reportMetric({ metric_name: 'FID', metric_value: fid, rating: rate('FID', fid) });
        }
        if (entry.entryType === 'layout-shift') {
          const ls = entry as PerformanceEntry & { value: number; hadRecentInput?: boolean };
          if (!ls.hadRecentInput) reportMetric({ metric_name: 'CLS', metric_value: ls.value, rating: rate('CLS', ls.value) });
        }
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          reportMetric({ metric_name: 'FCP', metric_value: entry.startTime, rating: rate('FCP', entry.startTime) });
        }
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        reportMetric({ metric_name: 'FID', metric_value: fid, rating: rate('FID', fid) });
      }
    }).observe({ type: 'first-input', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const ls = entry as PerformanceEntry & { value: number; hadRecentInput?: boolean };
        if (!ls.hadRecentInput) reportMetric({ metric_name: 'CLS', metric_value: ls.value, rating: rate('CLS', ls.value) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportMetric({ metric_name: 'FCP', metric_value: entry.startTime, rating: rate('FCP', entry.startTime) });
        }
      }
    }).observe({ type: 'paint', buffered: true });

    // TTFB
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav) {
      const ttfb = nav.responseStart;
      reportMetric({ metric_name: 'TTFB', metric_value: ttfb, rating: rate('TTFB', ttfb) });
    }
  } catch {
    /* PerformanceObserver não suportado */
  }

  // Flush periódico e no unload
  setInterval(flushMetrics, 10_000);
  window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushMetrics(); });
  window.addEventListener('beforeunload', flushMetrics);
}
