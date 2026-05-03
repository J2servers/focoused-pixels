import { useCallback } from 'react';
import type { IntruderInfo } from './IntruderModal';

interface NavigatorWithExtras extends Navigator {
  deviceMemory?: number;
  connection?: { effectiveType?: string; downlink?: number };
  userAgentData?: { platform?: string };
  webdriver?: boolean;
  pdfViewerEnabled?: boolean;
  getBattery?: () => Promise<{ level: number; charging: boolean }>;
}

export const useCollectIntruderInfo = (fingerprint: string, attempts: number) => {
  return useCallback((): IntruderInfo => {
    const nav = navigator as NavigatorWithExtras;
    let gpu = 'Desconhecido';
    let gpuVendor = 'Desconhecido';
    let canvasFp = 'N/A';
    let webglVendor = 'N/A';

    try {
      const canvas = document.createElement('canvas');
      const gl =
        (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          gpu = (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string) || 'Desconhecido';
          gpuVendor = (gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) as string) || 'Desconhecido';
        }
        webglVendor = (gl.getParameter(gl.VENDOR) as string) || 'N/A';
      }
      const c2 = document.createElement('canvas');
      c2.width = 200;
      c2.height = 50;
      const ctx = c2.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('IntruderFP_2026', 2, 2);
        canvasFp = c2.toDataURL().slice(-32);
      }
    } catch {
      /* silent */
    }

    let audioFp = 'N/A';
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const actx = new Ctor();
      audioFp = `sr:${actx.sampleRate}_ch:${actx.destination.maxChannelCount}`;
      actx.close();
    } catch {
      /* silent */
    }

    const tzOffset = new Date().getTimezoneOffset();

    return {
      ip: 'Rastreando...',
      city: '...',
      region: '...',
      country: '...',
      isp: '...',
      org: '...',
      lat: '...',
      lon: '...',
      userAgent: navigator.userAgent,
      platform: navigator.platform || nav.userAgentData?.platform || 'Desconhecido',
      language: navigator.language,
      languages: (navigator.languages || []).join(', '),
      screenRes: `${screen.width}x${screen.height} @${window.devicePixelRatio}x`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: `${screen.colorDepth}bit`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: `UTC${tzOffset > 0 ? '-' : '+'}${Math.abs(tzOffset / 60)}`,
      cores: navigator.hardwareConcurrency || 0,
      memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'N/A',
      gpu,
      gpuVendor,
      connectionType: nav.connection?.effectiveType || 'Desconhecido',
      downlink: nav.connection?.downlink ? `${nav.connection.downlink} Mbps` : 'N/A',
      timestamp: new Date().toISOString(),
      fingerprint,
      attemptCount: attempts + 1,
      referrer: document.referrer || 'Acesso Direto',
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'Não definido',
      online: navigator.onLine,
      plugins: Array.from(navigator.plugins || []).map((p) => p.name).slice(0, 5),
      touchSupport: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      webdriver: !!nav.webdriver,
      pdfViewerEnabled: !!nav.pdfViewerEnabled,
      canvasFingerprint: canvasFp,
      audioFingerprint: audioFp,
      webglVendor,
      batteryLevel: '...',
      charging: '...',
      localTime: new Date().toLocaleString('pt-BR'),
    };
  }, [fingerprint, attempts]);
};

export const enrichWithBatteryAndIp = (
  info: IntruderInfo,
  setInfo: (i: IntruderInfo) => void,
) => {
  const nav = navigator as NavigatorWithExtras;
  if (nav.getBattery) {
    nav
      .getBattery()
      .then((b) => {
        info.batteryLevel = `${Math.round(b.level * 100)}%`;
        info.charging = b.charging ? 'Carregando' : 'Bateria';
        setInfo({ ...info });
      })
      .catch(() => {});
  }

  fetch('https://ipapi.co/json/')
    .then((r) => r.json())
    .then((d: Record<string, unknown>) => {
      info.ip = (d.ip as string) || 'Oculto';
      info.city = (d.city as string) || 'Desconhecido';
      info.region = (d.region as string) || 'Desconhecido';
      info.country = `${(d.country_name as string) || '??'} (${(d.country_code as string) || '??'})`;
      info.isp = (d.org as string) || 'Desconhecido';
      info.org = (d.asn as string) || 'N/A';
      info.lat = String(d.latitude ?? '??');
      info.lon = String(d.longitude ?? '??');
      setInfo({ ...info });
    })
    .catch(() => {
      info.ip = 'Protegido / VPN';
      setInfo({ ...info });
    });
};
