import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldAlert, AlertTriangle, Skull, ArrowRight } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { isAuthError } from '@/lib/auth-error';
import { supabase } from '@/integrations/supabase/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ─── Security ───
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 5 * 60 * 1000;
const BAN_THRESHOLD = 15;

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type LoginFormData = z.infer<typeof loginSchema>;

interface SecurityData {
  attempts: { timestamp: number; success: boolean }[];
  lockedUntil: number | null;
  totalFails: number;
  permanentBan: boolean;
}
const getSec = (): SecurityData => {
  try { const r = sessionStorage.getItem('_sg'); return r ? JSON.parse(r) : { attempts: [], lockedUntil: null, totalFails: 0, permanentBan: false }; }
  catch { return { attempts: [], lockedUntil: null, totalFails: 0, permanentBan: false }; }
};
const saveSec = (d: SecurityData) => sessionStorage.setItem('_sg', JSON.stringify(d));

// ─── 3D Components ───

function GoldenSphere({ pos, scale, speed }: { pos: [number, number, number]; scale: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(s.clock.elapsedTime * speed) * 0.4;
      ref.current.position.x = pos[0] + Math.cos(s.clock.elapsedTime * speed * 0.6) * 0.2;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={ref} position={pos} scale={scale}>
        <sphereGeometry args={[1, 48, 48]} />
        <MeshTransmissionMaterial
          backside samples={8} thickness={0.5}
          chromaticAberration={0.1} anisotropy={0.3}
          distortion={0.2} distortionScale={0.3}
          temporalDistortion={0.05}
          color="#e8a817" transmission={0.85}
          roughness={0.08} metalness={0.15}
        />
      </mesh>
    </Float>
  );
}

function LaserDevice() {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.12) * 0.06;
  });
  return (
    <group ref={ref} position={[0, -0.3, -1]}>
      {/* Screen frame */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[2.8, 2, 0.12]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Inner screen */}
      <mesh position={[0, 0.4, 0.07]}>
        <boxGeometry args={[2.4, 1.6, 0.01]} />
        <meshStandardMaterial color="#c8951a" metalness={0.4} roughness={0.6} emissive="#c8951a" emissiveIntensity={0.15} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, -0.8, 0.3]}>
        <boxGeometry args={[0.4, 0.5, 0.6]} />
        <meshStandardMaterial color="#111122" metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -1.1, 0.3]}>
        <boxGeometry args={[1.8, 0.1, 0.8]} />
        <meshStandardMaterial color="#0f0f1e" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Particles() {
  const count = 40;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 14;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return p;
  }, []);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.015; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.03} color="#e8a817" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} color="#e8a817" />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#e8a817" />
      <directionalLight position={[-4, 3, -3]} intensity={0.3} color="#c8951a" />
      <pointLight position={[0, 0, 3]} intensity={1.5} color="#e8a817" distance={8} />
      <LaserDevice />
      <GoldenSphere pos={[-3.5, 2.5, -1]} scale={1.2} speed={0.8} />
      <GoldenSphere pos={[4, -1.5, -2]} scale={0.6} speed={1.2} />
      <GoldenSphere pos={[-1, -2.5, 1]} scale={0.4} speed={1.6} />
      <GoldenSphere pos={[2.5, 3, 0.5]} scale={0.9} speed={0.6} />
      <GoldenSphere pos={[0, -3, -1.5]} scale={0.3} speed={2} />
      <Particles />
      <Environment preset="sunset" />
    </>
  );
}

// ─── Login Page ───

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  // Login page settings from company_info
  const [loginSettings, setLoginSettings] = useState<{
    login_logo?: string | null;
    login_title?: string | null;
    login_subtitle?: string | null;
    company_name?: string | null;
  }>({});

  useEffect(() => {
    supabase.from('company_info').select('login_logo, login_title, login_subtitle, company_name, header_logo').limit(1).single()
      .then(({ data }) => {
        if (data) setLoginSettings(data as typeof loginSettings);
      });
  }, []);

  useEffect(() => {
    const d = getSec();
    if (d.permanentBan) { setBanned(true); return; }
    if (d.lockedUntil && Date.now() < d.lockedUntil) {
      setLocked(true); setRemaining(Math.ceil((d.lockedUntil - Date.now()) / 1000));
    }
    setFails(d.attempts.filter(a => !a.success && Date.now() - a.timestamp < WINDOW_MS).length);
  }, []);

  useEffect(() => {
    if (locked && !banned) {
      timerRef.current = setInterval(() => {
        const d = getSec();
        if (!d.lockedUntil || Date.now() >= d.lockedUntil) {
          setLocked(false); setRemaining(0); setFails(0);
          saveSec({ ...d, attempts: [], lockedUntil: null });
          if (timerRef.current) clearInterval(timerRef.current);
        } else setRemaining(Math.ceil((d.lockedUntil - Date.now()) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [locked, banned]);

  useEffect(() => {
    if (!isLoading && user && role) navigate('/admin');
  }, [user, role, isLoading, navigate]);

  const record = (ok: boolean) => {
    const d = getSec(); const now = Date.now();
    const recent = d.attempts.filter(a => now - a.timestamp < WINDOW_MS);
    recent.push({ timestamp: now, success: ok });
    const tf = ok ? 0 : d.totalFails + 1;
    if (tf >= BAN_THRESHOLD) { saveSec({ attempts: recent, lockedUntil: null, totalFails: tf, permanentBan: true }); setBanned(true); return; }
    const rf = recent.filter(a => !a.success); setFails(rf.length);
    if (rf.length >= MAX_ATTEMPTS) {
      const lu = now + LOCKOUT_MS;
      saveSec({ attempts: recent, lockedUntil: lu, totalFails: tf, permanentBan: false });
      setLocked(true); setRemaining(Math.ceil(LOCKOUT_MS / 1000)); return;
    }
    saveSec({ attempts: recent, lockedUntil: d.lockedUntil, totalFails: tf, permanentBan: false });
  };

  const gate = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-gate-check', { body: { email } });
      if (error) return false;
      if (data?.reason === 'blocked' || data?.reason === 'rate_limited') { setServerBlocked(true); return false; }
      return data?.allowed === true;
    } catch { return false; }
  };

  const onSubmit = async (data: LoginFormData) => {
    if (locked || banned || serverBlocked) { toast.error('Acesso bloqueado.'); return; }
    setSubmitting(true);
    try {
      const ok = await gate(data.email);
      if (!ok) {
        record(false);
        const r = MAX_ATTEMPTS - (fails + 1);
        toast.error(r <= 0 ? '🔒 Bloqueado por tentativas excessivas.' : 'Acesso negado.');
        return;
      }
      const { error } = await signIn(data.email, data.password);
      if (error) {
        record(false);
        const r = MAX_ATTEMPTS - (fails + 1);
        if (isAuthError(error, 'Invalid login credentials'))
          toast.error(r <= 0 ? '🔒 Bloqueado por 15 minutos.' : `Senha incorreta. ${r} tentativa${r !== 1 ? 's' : ''}.`);
        else if (isAuthError(error, 'Email not confirmed')) toast.error('Email não confirmado.');
        else toast.error('Erro de autenticação.');
      } else {
        record(true);
        saveSec({ attempts: [], lockedUntil: null, totalFails: 0, permanentBan: false });
        toast.success('✅ Acesso autorizado.');
      }
    } catch { record(false); toast.error('Erro interno.'); }
    finally { setSubmitting(false); }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const brandName = loginSettings.company_name || 'Pincel de Luz';
  const title = loginSettings.login_title || 'Painel de Controle';
  const subtitle = loginSettings.login_subtitle || 'Acesse o centro de comando do seu negócio com segurança máxima.';
  const logoUrl = loginSettings.login_logo || (loginSettings as Record<string, unknown>).header_logo as string | undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1408]">
        <Loader2 className="h-10 w-10 animate-spin text-[#e8a817]" />
      </div>
    );
  }

  if (banned || serverBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1408]">
        <div className="max-w-md p-8 rounded-3xl border border-red-500/20 bg-red-950/10 backdrop-blur-2xl text-center">
          <Skull className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Acesso Bloqueado</h2>
          <p className="text-red-400/60 text-sm">Tentativas não autorizadas detectadas. Incidente registrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#1a1408] via-[#2d1f0a] to-[#1a1408]">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}><Scene /></Suspense>
        </Canvas>
      </div>

      {/* Golden gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#c8951a]/20 via-transparent to-[#c8951a]/10" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#1a1408]/40 via-transparent to-[#1a1408]/60" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 gap-8 lg:gap-20">

        {/* Left - Branding */}
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
            <span className="text-white">
              {title.split(' ').slice(0, 2).join(' ')}<br />
              {title.split(' ').slice(2).join(' ')}
            </span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Right - Glass Login Card */}
        <div className="w-full max-w-[440px]">
          <div className="relative rounded-3xl border border-[#e8a817]/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-[#e8a817]/10 overflow-hidden">
            {/* Glass shine */}
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
                {locked ? '🔒 ACESSO BLOQUEADO' : 'WELCOME BACK'}
              </h2>
              <p className="text-xs text-white/30 tracking-wider uppercase text-center mb-8">
                {locked ? `Tente em ${fmt(remaining)}` : 'LOG IN TO CONTINUE'}
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="email" {...form.register('email')}
                      placeholder="seu@email.com" autoComplete="off"
                      className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-white text-[#1a1408] placeholder:text-[#1a1408]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e8a817]/50 transition-all border-0"
                    />
                  </div>
                  {form.formState.errors.email && <p className="text-xs text-red-400 pl-1">{form.formState.errors.email.message}</p>}

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type={showPw ? 'text' : 'password'} {...form.register('password')}
                      placeholder="••••••••" autoComplete="off"
                      className="w-full h-[52px] pl-12 pr-16 rounded-xl bg-white text-[#1a1408] placeholder:text-[#1a1408]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e8a817]/50 transition-all border-0"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1408]/30 hover:text-[#1a1408]/60 text-[10px] uppercase tracking-widest font-bold transition-colors">
                      {showPw ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                  {form.formState.errors.password && <p className="text-xs text-red-400 pl-1">{form.formState.errors.password.message}</p>}

                  {/* Submit */}
                  <button type="submit" disabled={submitting}
                    className="w-full h-[52px] rounded-xl bg-[#0f0f1a] hover:bg-[#1a1a2e] text-white font-semibold text-sm tracking-wide flex items-center justify-between px-6 transition-all duration-300 group disabled:opacity-50 mt-2">
                    {submitting ? (
                      <span className="flex items-center gap-2 mx-auto"><Loader2 className="h-4 w-4 animate-spin" />Verificando...</span>
                    ) : (
                      <><span>Acessar Painel</span><ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
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
