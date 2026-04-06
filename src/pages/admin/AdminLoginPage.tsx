import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Lock, ShieldAlert, AlertTriangle, Skull, ArrowRight, X } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { isAuthError } from '@/lib/auth-error';
import { supabase } from '@/integrations/supabase/client';

// ─── Matrix Rain Canvas ───
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const cols = Math.floor(canvas.width / 14);
    const drops: number[] = Array(cols).fill(1);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF!@#$%^&*';

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = '12px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : `rgba(0, 255, 65, ${0.3 + Math.random() * 0.7})`;
        ctx.fillText(char, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 40);
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { clearInterval(interval); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// ─── Intruder Info Modal ───
interface IntruderInfo {
  ip: string;
  userAgent: string;
  platform: string;
  language: string;
  screenRes: string;
  timezone: string;
  cores: number;
  memory: string;
  gpu: string;
  connectionType: string;
  timestamp: string;
  fingerprint: string;
  attemptCount: number;
  referrer: string;
  cookiesEnabled: boolean;
  doNotTrack: string;
  online: boolean;
  plugins: string[];
  touchSupport: boolean;
}

const IntruderModal = ({ info, onClose }: { info: IntruderInfo; onClose: () => void }) => {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [showData, setShowData] = useState(false);
  const [glitch, setGlitch] = useState(false);

  const terminalLines = useMemo(() => [
    '> INICIANDO VARREDURA DE SEGURANÇA...',
    '> SISTEMA DE DEFESA ATIVADO',
    '> RASTREANDO CONEXÃO...',
    `> IP DETECTADO: ${info.ip}`,
    '> COLETANDO DADOS DO DISPOSITIVO...',
    '> FINGERPRINT GERADO COM SUCESSO',
    '> ⚠️ TENTATIVA DE INVASÃO REGISTRADA',
    '> DADOS DO INVASOR CAPTURADOS:',
  ], [info.ip]);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < terminalLines.length) {
        setTypedLines(prev => [...prev, terminalLines[i]]);
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setGlitch(true);
          setTimeout(() => { setGlitch(false); setShowData(true); }, 300);
        }, 500);
      }
    }, 350);
    return () => clearInterval(timer);
  }, [terminalLines]);

  const dataRows: [string, string][] = [
    ['ENDEREÇO IP', info.ip],
    ['NAVEGADOR', info.userAgent.slice(0, 80)],
    ['PLATAFORMA', info.platform],
    ['IDIOMA', info.language],
    ['RESOLUÇÃO', info.screenRes],
    ['FUSO HORÁRIO', info.timezone],
    ['NÚCLEOS CPU', String(info.cores)],
    ['MEMÓRIA', info.memory],
    ['GPU', info.gpu],
    ['CONEXÃO', info.connectionType],
    ['FINGERPRINT', info.fingerprint],
    ['TENTATIVAS', String(info.attemptCount)],
    ['COOKIES', info.cookiesEnabled ? 'ATIVO' : 'INATIVO'],
    ['DO NOT TRACK', info.doNotTrack],
    ['ONLINE', info.online ? 'SIM' : 'NÃO'],
    ['TOUCH', info.touchSupport ? 'SIM' : 'NÃO'],
    ['REFERRER', info.referrer || 'DIRETO'],
    ['PLUGINS', info.plugins.length > 0 ? info.plugins.join(', ') : 'NENHUM'],
    ['TIMESTAMP', info.timestamp],
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Matrix background */}
      <div className="absolute inset-0">
        <MatrixRain />
      </div>
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div
        className={`relative z-10 w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#00ff41]/30 bg-black/95 shadow-[0_0_80px_rgba(0,255,65,0.15)] ${glitch ? 'animate-pulse' : ''}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[#00ff41]/20 bg-black/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[#00ff41] text-sm font-bold tracking-widest">
              ⚠ INTRUSION DETECTION SYSTEM
            </span>
          </div>
          <button onClick={onClose} className="text-[#00ff41]/50 hover:text-[#00ff41] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Terminal output */}
          <div className="font-mono text-xs space-y-1">
            {typedLines.map((line, i) => (
              <div key={i} className={`${line.includes('⚠') ? 'text-red-400' : line.includes('IP DETECTADO') ? 'text-yellow-400' : 'text-[#00ff41]'} ${i === typedLines.length - 1 ? 'animate-pulse' : ''}`}>
                {line}
                {i === typedLines.length - 1 && !showData && <span className="animate-pulse">█</span>}
              </div>
            ))}
          </div>

          {/* Data table */}
          {showData && (
            <div className="animate-fade-in space-y-4">
              <div className="border border-[#00ff41]/20 rounded-lg overflow-hidden">
                {dataRows.map(([label, value], i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'bg-[#00ff41]/[0.03]' : 'bg-transparent'} border-b border-[#00ff41]/10 last:border-b-0`}>
                    <div className="w-[140px] shrink-0 px-4 py-2 font-mono text-[10px] text-[#00ff41]/60 font-bold tracking-wider">
                      {label}
                    </div>
                    <div className="px-4 py-2 font-mono text-[11px] text-[#00ff41] break-all">
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="border border-red-500/30 rounded-xl bg-red-500/5 p-4 text-center space-y-2">
                <Skull className="w-8 h-8 text-red-500 mx-auto" />
                <p className="font-mono text-red-400 text-xs font-bold tracking-wide">
                  TODOS OS DADOS ACIMA FORAM REGISTRADOS PERMANENTEMENTE
                </p>
                <p className="font-mono text-red-400/60 text-[10px]">
                  TENTATIVAS ADICIONAIS RESULTARÃO EM BLOQUEIO PERMANENTE E NOTIFICAÇÃO ÀS AUTORIDADES
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-[#00ff41]/30 bg-[#00ff41]/5 text-[#00ff41] font-mono text-xs font-bold tracking-widest hover:bg-[#00ff41]/10 transition-all"
              >
                ENTENDIDO — ENCERRAR SESSÃO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Security Constants ───
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 5 * 60 * 1000;
const BAN_THRESHOLD = 15;

// ─── Input Validation (strict, anti-injection) ───
const SAFE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const DANGEROUS_PATTERNS = /[<>"'`;(){}[\]\\|&$!#]/;

const sanitize = (v: string): string =>
  v.replace(/[<>"'`;(){}[\]\\|&$!#]/g, '').trim().slice(0, 255);

const loginSchema = z.object({
  email: z
    .string()
    .max(255, 'Email muito longo')
    .refine((v) => SAFE_EMAIL.test(v), 'Email inválido')
    .refine((v) => !DANGEROUS_PATTERNS.test(v), 'Caracteres não permitidos'),
  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .max(128, 'Senha muito longa')
    .refine((v) => !DANGEROUS_PATTERNS.test(v), 'Caracteres não permitidos'),
});
type LoginFormData = z.infer<typeof loginSchema>;

// ─── Session Security Store (obfuscated key, tamper-resistant) ───
const SEC_KEY = '__x9f2';
interface SecurityData {
  a: { t: number; s: boolean }[]; // attempts
  l: number | null;               // lockedUntil
  f: number;                       // totalFails
  b: boolean;                      // permanentBan
  h: string;                       // hash for tamper detection
}

const computeHash = (a: number, f: number, b: boolean): string => {
  const raw = `${a}-${f}-${b ? '1' : '0'}-x9f2`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
};

const getSecData = (): SecurityData => {
  try {
    const r = sessionStorage.getItem(SEC_KEY);
    if (!r) return { a: [], l: null, f: 0, b: false, h: computeHash(0, 0, false) };
    const d: SecurityData = JSON.parse(r);
    // Tamper check
    if (d.h !== computeHash(d.a.length, d.f, d.b)) {
      // Tampered — permanent ban
      const banned: SecurityData = { a: [], l: null, f: BAN_THRESHOLD, b: true, h: computeHash(0, BAN_THRESHOLD, true) };
      sessionStorage.setItem(SEC_KEY, JSON.stringify(banned));
      return banned;
    }
    return d;
  } catch {
    return { a: [], l: null, f: 0, b: false, h: computeHash(0, 0, false) };
  }
};

const saveSecData = (a: SecurityData['a'], l: number | null, f: number, b: boolean) => {
  const d: SecurityData = { a, l, f, b, h: computeHash(a.length, f, b) };
  sessionStorage.setItem(SEC_KEY, JSON.stringify(d));
};

// ─── Fingerprint (basic browser fingerprint for extra layer) ───
const getFingerprint = (): string => {
  const nav = navigator;
  const raw = [
    nav.userAgent, nav.language, nav.hardwareConcurrency,
    screen.width, screen.height, screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
};

// ─── Component ───
const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, role, isLoading, signIn } = useAuthContext();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [banned, setBanned] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [fails, setFails] = useState(0);
  const [serverBlocked, setServerBlocked] = useState(false);
  const [intruderInfo, setIntruderInfo] = useState<IntruderInfo | null>(null);
  const [showIntruderModal, setShowIntruderModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountTime = useRef(Date.now());
  const fpRef = useRef(getFingerprint());

  const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  // Background image & branding from company_info
  const [loginSettings, setLoginSettings] = useState<{
    login_logo?: string | null;
    login_bg_image?: string | null;
    login_title?: string | null;
    login_subtitle?: string | null;
    company_name?: string | null;
    header_logo?: string | null;
  }>({});

  useEffect(() => {
    supabase
      .from('company_info')
      .select('login_logo, login_bg_image, login_title, login_subtitle, company_name, header_logo')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setLoginSettings(data as typeof loginSettings);
      });
  }, []);

  // Initialize security state
  useEffect(() => {
    const d = getSecData();
    if (d.b) { setBanned(true); return; }
    if (d.l && Date.now() < d.l) {
      setLocked(true);
      setRemaining(Math.ceil((d.l - Date.now()) / 1000));
    }
    setFails(d.a.filter((x) => !x.s && Date.now() - x.t < WINDOW_MS).length);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (locked && !banned) {
      timerRef.current = setInterval(() => {
        const d = getSecData();
        if (!d.l || Date.now() >= d.l) {
          setLocked(false);
          setRemaining(0);
          setFails(0);
          saveSecData([], null, d.f, false);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setRemaining(Math.ceil((d.l - Date.now()) / 1000));
        }
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [locked, banned]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user && role) navigate('/admin');
  }, [user, role, isLoading, navigate]);

  const record = useCallback((ok: boolean) => {
    const d = getSecData();
    const now = Date.now();
    const recent = d.a.filter((x) => now - x.t < WINDOW_MS);
    recent.push({ t: now, s: ok });
    const tf = ok ? 0 : d.f + 1;

    if (tf >= BAN_THRESHOLD) {
      saveSecData(recent, null, tf, true);
      setBanned(true);
      return;
    }

    const rf = recent.filter((x) => !x.s);
    setFails(rf.length);

    if (rf.length >= MAX_ATTEMPTS) {
      const lu = now + LOCKOUT_MS;
      saveSecData(recent, lu, tf, false);
      setLocked(true);
      setRemaining(Math.ceil(LOCKOUT_MS / 1000));
      return;
    }

    saveSecData(recent, d.l, tf, false);
  }, []);

  const collectIntruderInfo = useCallback((): IntruderInfo => {
    const nav = navigator as any;
    let gpu = 'Desconhecido';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const dbg = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (dbg) gpu = (gl as any).getParameter(dbg.UNMASKED_RENDERER_WEBGL) || 'Desconhecido';
      }
    } catch { /* silent */ }

    return {
      ip: 'Rastreando...',
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'Desconhecido',
      language: navigator.language,
      screenRes: `${screen.width}x${screen.height} @${window.devicePixelRatio}x`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cores: navigator.hardwareConcurrency || 0,
      memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'N/A',
      gpu,
      connectionType: nav.connection?.effectiveType || 'Desconhecido',
      timestamp: new Date().toISOString(),
      fingerprint: fpRef.current,
      attemptCount: fails + 1,
      referrer: document.referrer,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'Não definido',
      online: navigator.onLine,
      plugins: Array.from(navigator.plugins || []).map(p => p.name).slice(0, 5),
      touchSupport: 'ontouchstart' in window,
    };
  }, [fails]);

  const showIntruderWarning = useCallback(() => {
    const info = collectIntruderInfo();
    // Try to get real IP
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => { info.ip = d.ip || 'Oculto por VPN'; setIntruderInfo({ ...info }); })
      .catch(() => { info.ip = 'Protegido / VPN detectada'; setIntruderInfo({ ...info }); });
    setIntruderInfo(info);
    setShowIntruderModal(true);
  }, [collectIntruderInfo]);

  const gate = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-gate-check', {
        body: { email: sanitize(email) },
      });
      if (error) return false;
      if (data?.reason === 'blocked' || data?.reason === 'rate_limited') {
        setServerBlocked(true);
        return false;
      }
      return data?.allowed === true;
    } catch {
      return false;
    }
  };

  const onSubmit = async (raw: LoginFormData) => {
    if (locked || banned || serverBlocked) {
      toast.error('Acesso bloqueado.');
      return;
    }

    // Honeypot check — bots fill hidden fields
    if (honeypotRef.current?.value) {
      // Silently reject
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
      toast.error('Acesso negado.');
      return;
    }

    // Timing check — form submitted too fast = bot
    if (Date.now() - mountTime.current < 2000) {
      await new Promise((r) => setTimeout(r, 2000));
      toast.error('Acesso negado.');
      return;
    }

    const email = sanitize(raw.email);
    const password = raw.password.slice(0, 128);

    // Final regex validation (defense in depth)
    if (!SAFE_EMAIL.test(email) || DANGEROUS_PATTERNS.test(password)) {
      toast.error('Entrada inválida.');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await gate(email);
      if (!ok) {
        record(false);
        showIntruderWarning();
        return;
      }

      const { error } = await signIn(email, password);
      if (error) {
        record(false);
        showIntruderWarning();
      } else {
        record(true);
        saveSecData([], null, 0, false);
        toast.success('✅ Acesso autorizado.');
      }
    } catch {
      record(false);
      toast.error('Erro interno.');
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const brandName = loginSettings.company_name || 'Pincel de Luz';
  const title = loginSettings.login_title || 'Painel de Controle';
  const subtitle = loginSettings.login_subtitle || 'Acesse o centro de comando do seu negócio com segurança máxima.';
  const logoUrl = loginSettings.login_logo || loginSettings.header_logo;
  const bgImage = loginSettings.login_bg_image;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <Loader2 className="h-10 w-10 animate-spin text-[#e8a817]" />
      </div>
    );
  }

  if (banned || serverBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <div className="max-w-md p-8 rounded-3xl border border-red-500/20 bg-red-950/10 backdrop-blur-2xl text-center">
          <Skull className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Acesso Permanentemente Bloqueado</h2>
          <p className="text-red-400/60 text-sm">Atividade suspeita detectada e registrada. Incidente reportado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0a0a12]">
      {/* Layer 1: Background Image */}
      {bgImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      {/* Layer 2: Dark overlay for contrast */}
      <div className="absolute inset-0 z-[1] bg-black/60" />

      {/* Layer 3: Gradient overlay */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-br from-[#0a0a12]/80 via-[#1a1408]/40 to-[#0a0a12]/80" />

      {/* Layer 4: Radial glow */}
      <div className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,_rgba(232,168,23,0.08)_0%,_transparent_60%)]" />

      {/* Layer 5: Subtle noise texture via CSS */}
      <div className="absolute inset-0 z-[4] opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 gap-8 lg:gap-20">
        {/* Left — Branding */}
        <div className="hidden lg:flex flex-col max-w-md">
          <div className="flex items-center gap-3 mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-12 w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e8a817] to-[#c8951a] flex items-center justify-center shadow-xl shadow-[#e8a817]/30">
                <div className="w-4 h-6 bg-white rounded-full" />
              </div>
            )}
            <span className="text-2xl font-bold text-white tracking-tight">{brandName}</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-5">
            <span className="text-white">{title}</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">{subtitle}</p>
        </div>

        {/* Right — Glass Login Card */}
        <div className="w-full max-w-[440px]">
          <div className="relative rounded-3xl border border-[#e8a817]/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-[#e8a817]/10 overflow-hidden">
            {/* Glass reflections */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#e8a817]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#e8a817]/8 blur-2xl pointer-events-none" />

            <div className="relative p-8 sm:p-10">
              {/* Mobile branding */}
              <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} className="h-10 w-auto" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8a817] to-[#c8951a] flex items-center justify-center">
                    <div className="w-3 h-5 bg-white rounded-full" />
                  </div>
                )}
                <span className="text-lg font-bold text-white">{brandName}</span>
              </div>

              <h2 className="text-sm font-semibold tracking-[0.2em] text-[#e8a817] uppercase text-center mb-1">
                {locked ? '🔒 ACESSO BLOQUEADO' : 'ACESSO RESTRITO'}
              </h2>
              <p className="text-xs text-white/30 tracking-wider uppercase text-center mb-8">
                {locked ? `Tente em ${fmt(remaining)}` : 'IDENTIFICAÇÃO OBRIGATÓRIA'}
              </p>

              {fails > 0 && fails < MAX_ATTEMPTS && !locked && (
                <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/12 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-amber-300/80">
                    {MAX_ATTEMPTS - fails} tentativa{MAX_ATTEMPTS - fails !== 1 ? 's' : ''} restante{MAX_ATTEMPTS - fails !== 1 ? 's' : ''}.
                  </p>
                </div>
              )}

              {locked ? (
                <div className="py-12 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-red-400" />
                  </div>
                  <div className="font-mono text-4xl font-bold text-red-400 tabular-nums">{fmt(remaining)}</div>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off" noValidate>
                  {/* Honeypot — invisible to humans, bots fill it */}
                  <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
                    <input
                      ref={honeypotRef}
                      type="text"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="email"
                      {...form.register('email')}
                      placeholder="seu@email.com"
                      autoComplete="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-white text-[#1a1408] placeholder:text-[#1a1408]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e8a817]/50 transition-all border-0"
                      onPaste={(e) => {
                        // Block pasting scripts
                        const text = e.clipboardData.getData('text');
                        if (DANGEROUS_PATTERNS.test(text)) {
                          e.preventDefault();
                          toast.error('Conteúdo bloqueado.');
                        }
                      }}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-400 pl-1">{form.formState.errors.email.message}</p>
                  )}

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      {...form.register('password')}
                      placeholder="••••••••"
                      autoComplete="off"
                      spellCheck={false}
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full h-[52px] pl-12 pr-16 rounded-xl bg-white text-[#1a1408] placeholder:text-[#1a1408]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e8a817]/50 transition-all border-0"
                      onPaste={(e) => {
                        const text = e.clipboardData.getData('text');
                        if (DANGEROUS_PATTERNS.test(text)) {
                          e.preventDefault();
                          toast.error('Conteúdo bloqueado.');
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1408]/30 hover:text-[#1a1408]/60 text-[10px] uppercase tracking-widest font-bold transition-colors"
                    >
                      {showPw ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-400 pl-1">{form.formState.errors.password.message}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-[52px] rounded-xl bg-[#0f0f1a] hover:bg-[#1a1a2e] text-white font-semibold text-sm tracking-wide flex items-center justify-between px-6 transition-all duration-300 group disabled:opacity-50 mt-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2 mx-auto">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando...
                      </span>
                    ) : (
                      <>
                        <span>Acessar Painel</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="text-[9px] text-white/12 text-center mt-8 tracking-wide">
                PORTAL MONITORADO • SEM RECUPERAÇÃO DE SENHA • CONTATE O ADMINISTRADOR
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
