import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Skull } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { IntruderModal, type IntruderInfo } from './login/IntruderModal';
import {
  BAN_THRESHOLD,
  LOCKOUT_MS,
  MAX_ATTEMPTS,
  SAFE_EMAIL,
  WINDOW_MS,
  type LoginFormData,
  getFingerprint,
  getSecData,
  resetSecKeyOnce,
  sanitize,
  saveSecData,
} from './login/security';
import { useCollectIntruderInfo, enrichWithBatteryAndIp } from './login/useIntruderInfo';
import { AdminLoginForm } from './login/AdminLoginForm';

interface LoginSettings {
  login_logo?: string | null;
  login_bg_image?: string | null;
  login_title?: string | null;
  login_subtitle?: string | null;
  login_logo_height?: number | null;
  login_title_size?: number | null;
  login_subtitle_size?: number | null;
  login_brand_text?: string | null;
  company_name?: string | null;
  header_logo?: string | null;
}

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, role, isLoading, signIn, canEdit } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [banned, setBanned] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [fails, setFails] = useState(0);
  const [serverBlocked, setServerBlocked] = useState(false);
  const [intruderInfo, setIntruderInfo] = useState<IntruderInfo | null>(null);
  const [showIntruderModal, setShowIntruderModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountTime = useRef(Date.now());
  const fpRef = useRef(getFingerprint());
  const [loginSettings, setLoginSettings] = useState<LoginSettings>({});

  const collectIntruderInfo = useCollectIntruderInfo(fpRef.current, fails);

  useEffect(() => {
    supabase
      .from('login_page_settings' as never)
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setLoginSettings(data as LoginSettings);
      });
  }, []);

  useEffect(() => {
    resetSecKeyOnce();
    const d = getSecData();
    if (d.b) {
      setBanned(true);
      return;
    }
    if (d.l && Date.now() < d.l) {
      setLocked(true);
      setRemaining(Math.ceil((d.l - Date.now()) / 1000));
    }
    setFails(d.a.filter((x) => !x.s && Date.now() - x.t < WINDOW_MS).length);
  }, []);

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [locked, banned]);

  useEffect(() => {
    if (!isLoading && user && role && canEdit()) navigate('/admin');
  }, [user, role, isLoading, navigate, canEdit]);

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

  const showIntruderWarning = useCallback(() => {
    const info = collectIntruderInfo();
    enrichWithBatteryAndIp(info, setIntruderInfo);
    setIntruderInfo(info);
    setShowIntruderModal(true);
  }, [collectIntruderInfo]);

  const gate = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-gate-check', {
        body: { email: sanitize(email) },
      });
      if (error) return false;
      const reply = data as { reason?: string; allowed?: boolean } | null;
      if (reply?.reason === 'blocked' || reply?.reason === 'rate_limited') {
        setServerBlocked(true);
        return false;
      }
      return reply?.allowed === true;
    } catch {
      return false;
    }
  };

  const onSubmit = async (raw: LoginFormData) => {
    if (locked || banned || serverBlocked) {
      toast.error('Acesso bloqueado.');
      return;
    }
    const email = sanitize(raw.email);
    const password = raw.password.slice(0, 128);
    if (!SAFE_EMAIL.test(email)) {
      toast.error('Email inválido.');
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

  const brandName = loginSettings.login_brand_text || loginSettings.company_name || 'Pincel de Luz';
  const title = loginSettings.login_title || 'Painel de Controle';
  const subtitle =
    loginSettings.login_subtitle || 'Acesse o centro de comando do seu negócio com segurança máxima.';
  const logoUrl = loginSettings.login_logo || loginSettings.header_logo;
  const bgImage = loginSettings.login_bg_image;
  const logoHeight = loginSettings.login_logo_height || 48;
  const titleSize = loginSettings.login_title_size || 48;
  const subtitleSize = loginSettings.login_subtitle_size || 14;

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
          <p className="text-red-400/60 text-sm">
            Atividade suspeita detectada e registrada. Incidente reportado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0a0a12]">
      {bgImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="absolute inset-0 z-[1] bg-black/60" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-br from-[#0a0a12]/80 via-[#1a1408]/40 to-[#0a0a12]/80" />
      <div className="absolute inset-0 z-[3] bg-[radial-gradient(ellipse_at_center,_rgba(232,168,23,0.08)_0%,_transparent_60%)]" />
      <div
        className="absolute inset-0 z-[4] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 gap-8 lg:gap-20">
        <div className="hidden lg:flex flex-col max-w-md">
          <div className="flex items-center gap-3 mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} style={{ height: `${logoHeight}px` }} className="w-auto object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e8a817] to-[#c8951a] flex items-center justify-center shadow-xl shadow-[#e8a817]/30">
                <div className="w-4 h-6 bg-white rounded-full" />
              </div>
            )}
            <span className="text-2xl font-bold text-white tracking-tight">{brandName}</span>
          </div>
          <h1 className="font-extrabold leading-tight mb-5" style={{ fontSize: `${titleSize}px` }}>
            <span className="text-white">{title}</span>
          </h1>
          <p className="text-white/50 leading-relaxed max-w-sm" style={{ fontSize: `${subtitleSize}px` }}>
            {subtitle}
          </p>
        </div>

        <div className="w-full max-w-[440px]">
          <div className="relative rounded-3xl border border-[#e8a817]/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-[#e8a817]/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#e8a817]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#e8a817]/8 blur-2xl pointer-events-none" />

            <div className="relative p-8 sm:p-10">
              <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} style={{ height: `${Math.min(logoHeight, 40)}px` }} className="w-auto object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8a817] to-[#c8951a] flex items-center justify-center">
                    <div className="w-3 h-5 bg-white rounded-full" />
                  </div>
                )}
                <span className="text-lg font-bold text-white">{brandName}</span>
              </div>

              <AdminLoginForm
                locked={locked}
                remaining={remaining}
                fails={fails}
                submitting={submitting}
                mountTime={mountTime.current}
                onSubmit={onSubmit}
              />

              <p className="text-[9px] text-white/12 text-center mt-8 tracking-wide">
                PORTAL MONITORADO • SEM RECUPERAÇÃO DE SENHA • CONTATE O ADMINISTRADOR
              </p>
            </div>
          </div>
        </div>
      </div>

      {showIntruderModal && intruderInfo && (
        <IntruderModal info={intruderInfo} onClose={() => setShowIntruderModal(false)} />
      )}
    </div>
  );
};

export default AdminLoginPage;
