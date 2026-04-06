import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, Shield, ShieldAlert, AlertTriangle, Skull, ArrowRight } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { isAuthError } from '@/lib/auth-error';
import { supabase } from '@/integrations/supabase/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ─── Security constants ───
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000;
const PERMANENT_BAN_THRESHOLD = 15;

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type LoginFormData = z.infer<typeof loginSchema>;

interface LoginAttempt { timestamp: number; success: boolean; }
interface SecurityData { attempts: LoginAttempt[]; lockedUntil: number | null; totalFails: number; permanentBan: boolean; }

const getSecurityData = (): SecurityData => {
  try {
    const raw = sessionStorage.getItem('_sec_gate');
    if (!raw) return { attempts: [], lockedUntil: null, totalFails: 0, permanentBan: false };
    return JSON.parse(raw);
  } catch { return { attempts: [], lockedUntil: null, totalFails: 0, permanentBan: false }; }
};
const saveSecurityData = (data: SecurityData) => sessionStorage.setItem('_sec_gate', JSON.stringify(data));

// ─── 3D Scene Components ───

function LaserMachineBody() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    }
  });
  return (
    <group position={[0, -0.5, 0]}>
      {/* Main machine body */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 2, 2.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Machine arm */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[2.8, 0.3, 0.3]} />
        <meshStandardMaterial color="#16213e" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Laser head */}
      <mesh position={[0.8, 1.1, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.5, 16]} />
        <meshStandardMaterial color="#0f3460" metalness={0.85} roughness={0.1} />
      </mesh>
      {/* Laser beam glow */}
      <mesh position={[0.8, 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
        <meshBasicMaterial color="#e94560" transparent opacity={0.7} />
      </mesh>
      {/* Work bed */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[3.8, 0.15, 2.8]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Grid lines on bed */}
      <gridHelper args={[3.2, 12, '#e94560', '#1a1a3e']} position={[0, -1.1, 0]} />
    </group>
  );
}

function FloatingSphere({ position, scale, color, speed }: { position: [number, number, number]; scale: number; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.15;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.4}
          chromaticAberration={0.15}
          anisotropy={0.2}
          distortion={0.3}
          distortionScale={0.4}
          temporalDistortion={0.1}
          color={color}
          transmission={0.9}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

function SparkParticles() {
  const count = 60;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#e94560" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} color="#e94560" />
      <directionalLight position={[-5, 3, -3]} intensity={0.2} color="#533483" />
      <pointLight position={[0.8, 0.5, 1]} intensity={2} color="#e94560" distance={4} />
      <pointLight position={[-2, 2, -1]} intensity={0.8} color="#533483" distance={5} />

      <LaserMachineBody />
      <FloatingSphere position={[-3, 2, -1]} scale={0.8} color="#e94560" speed={1.2} />
      <FloatingSphere position={[3.5, -1, -2]} scale={0.5} color="#533483" speed={0.8} />
      <FloatingSphere position={[-1.5, -2, 1]} scale={0.35} color="#e94560" speed={1.5} />
      <FloatingSphere position={[2, 3, 0]} scale={1.2} color="#e9456088" speed={0.6} />
      <SparkParticles />

      <Environment preset="night" />
    </>
  );
}

// ─── Main Component ───

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, role, isLoading, signIn } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPermanentBan, setIsPermanentBan] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    const data = getSecurityData();
    if (data.permanentBan) { setIsPermanentBan(true); return; }
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      setIsLocked(true);
      setLockRemaining(Math.ceil((data.lockedUntil - Date.now()) / 1000));
    }
    setFailedCount(data.attempts.filter(a => !a.success && Date.now() - a.timestamp < ATTEMPT_WINDOW_MS).length);
  }, []);

  useEffect(() => {
    if (isLocked && !isPermanentBan) {
      lockTimerRef.current = setInterval(() => {
        const data = getSecurityData();
        if (!data.lockedUntil || Date.now() >= data.lockedUntil) {
          setIsLocked(false); setLockRemaining(0); setFailedCount(0);
          saveSecurityData({ ...data, attempts: [], lockedUntil: null });
          if (lockTimerRef.current) clearInterval(lockTimerRef.current);
        } else { setLockRemaining(Math.ceil((data.lockedUntil - Date.now()) / 1000)); }
      }, 1000);
    }
    return () => { if (lockTimerRef.current) clearInterval(lockTimerRef.current); };
  }, [isLocked, isPermanentBan]);

  useEffect(() => {
    if (!isLoading && user && role) navigate('/admin');
  }, [user, role, isLoading, navigate]);

  const recordAttempt = (success: boolean) => {
    const data = getSecurityData();
    const now = Date.now();
    const recentAttempts = data.attempts.filter(a => now - a.timestamp < ATTEMPT_WINDOW_MS);
    recentAttempts.push({ timestamp: now, success });
    const newTotalFails = success ? 0 : data.totalFails + 1;
    if (newTotalFails >= PERMANENT_BAN_THRESHOLD) {
      saveSecurityData({ attempts: recentAttempts, lockedUntil: null, totalFails: newTotalFails, permanentBan: true });
      setIsPermanentBan(true); return;
    }
    const recentFails = recentAttempts.filter(a => !a.success);
    setFailedCount(recentFails.length);
    if (recentFails.length >= MAX_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_DURATION_MS;
      saveSecurityData({ attempts: recentAttempts, lockedUntil, totalFails: newTotalFails, permanentBan: false });
      setIsLocked(true); setLockRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000)); return;
    }
    saveSecurityData({ attempts: recentAttempts, lockedUntil: data.lockedUntil, totalFails: newTotalFails, permanentBan: false });
  };

  const verifyEmailHasAdminRole = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-gate-check', { body: { email } });
      if (error) return false;
      return data?.allowed === true;
    } catch { return false; }
  };

  const onLogin = async (data: LoginFormData) => {
    if (isLocked || isPermanentBan) { toast.error('Acesso bloqueado.'); return; }
    setIsSubmitting(true);
    try {
      const hasAccess = await verifyEmailHasAdminRole(data.email);
      if (!hasAccess) {
        recordAttempt(false);
        const remaining = MAX_ATTEMPTS - (failedCount + 1);
        toast.error(remaining <= 0 ? '🔒 Acesso bloqueado por excesso de tentativas.' : 'Acesso negado. Portal exclusivo para pessoal autorizado.');
        setIsSubmitting(false); return;
      }
      const { error } = await signIn(data.email, data.password);
      if (error) {
        recordAttempt(false);
        const remaining = MAX_ATTEMPTS - (failedCount + 1);
        if (isAuthError(error, 'Invalid login credentials')) {
          toast.error(remaining <= 0 ? '🔒 Conta bloqueada por 15 minutos.' : `Senha incorreta. ${remaining} tentativa${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`);
        } else if (isAuthError(error, 'Email not confirmed')) {
          toast.error('Email não confirmado.');
        } else { toast.error('Erro de autenticação.'); }
      } else {
        recordAttempt(true);
        saveSecurityData({ attempts: [], lockedUntil: null, totalFails: 0, permanentBan: false });
        toast.success('✅ Acesso autorizado.');
      }
    } catch { recordAttempt(false); toast.error('Erro interno.'); }
    finally { setIsSubmitting(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <Loader2 className="h-10 w-10 animate-spin text-[#e94560]" />
      </div>
    );
  }

  if (isPermanentBan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a12]">
        <div className="w-full max-w-md p-8 rounded-3xl border border-red-500/20 bg-red-950/10 backdrop-blur-2xl text-center">
          <Skull className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Acesso Permanentemente Bloqueado</h2>
          <p className="text-red-400/60 text-sm">Múltiplas tentativas não autorizadas foram detectadas e registradas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#0a0a12] via-[#1a0a2e] to-[#0a0a12]">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0a0a12]/80 via-transparent to-[#0a0a12]/40" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0a0a12]/60 via-transparent to-[#0a0a12]/30" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 sm:px-8 gap-8 lg:gap-16">
        
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e94560] to-[#533483] flex items-center justify-center shadow-xl shadow-[#e94560]/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Pincel de Luz</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            <span className="bg-gradient-to-r from-white via-[#e94560] to-[#533483] bg-clip-text text-transparent">
              Painel de{'\n'}Controle
            </span>
          </h1>
          <p className="text-white/40 text-base leading-relaxed max-w-sm">
            Acesse o centro de comando do seu negócio. Gerencie produtos, pedidos e toda sua operação com segurança máxima.
          </p>
        </div>

        {/* Right side - Glass Login Card */}
        <div className="w-full max-w-[420px]">
          {/* Glass Card */}
          <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#e94560]/10 blur-3xl pointer-events-none" />

            <div className="relative p-8 sm:p-10">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e94560] to-[#533483] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Pincel de Luz</span>
              </div>

              <h2 className="text-lg font-semibold tracking-wide text-white/90 uppercase text-center mb-1">
                {isLocked ? '🔒 Acesso Bloqueado' : 'Acesso Restrito'}
              </h2>
              <p className="text-sm text-white/30 text-center mb-8">
                {isLocked ? `Tente novamente em ${formatTime(lockRemaining)}` : 'Identifique-se para continuar'}
              </p>

              {/* Warning banner */}
              {failedCount > 0 && failedCount < MAX_ATTEMPTS && !isLocked && (
                <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300/80">
                    {MAX_ATTEMPTS - failedCount} tentativa{MAX_ATTEMPTS - failedCount !== 1 ? 's' : ''} restante{MAX_ATTEMPTS - failedCount !== 1 ? 's' : ''} antes do bloqueio.
                  </p>
                </div>
              )}

              {isLocked ? (
                <div className="py-10 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-red-400" />
                  </div>
                  <p className="text-white/40 text-sm text-center">Múltiplas tentativas falhas detectadas.</p>
                  <div className="font-mono text-4xl font-bold text-red-400 tabular-nums">
                    {formatTime(lockRemaining)}
                  </div>
                </div>
              ) : (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                  {/* Email */}
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                      <input
                        type="email"
                        {...loginForm.register('email')}
                        placeholder="seu@email.com"
                        autoComplete="off"
                        className="w-full h-13 pl-12 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]/40 focus:border-[#e94560]/30 transition-all"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-red-400 mt-1.5 pl-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...loginForm.register('password')}
                        placeholder="••••••••"
                        autoComplete="off"
                        className="w-full h-13 pl-12 pr-12 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]/40 focus:border-[#e94560]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors text-xs uppercase tracking-wider font-medium"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-red-400 mt-1.5 pl-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-13 rounded-xl bg-[#0f0f1a] hover:bg-[#1a1a2e] border border-white/[0.06] text-white font-semibold text-sm tracking-wide flex items-center justify-between px-6 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
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

              {/* Footer notice */}
              <p className="text-[10px] text-white/15 text-center mt-8 leading-relaxed">
                Portal monitorado. Não existe recuperação de senha. Contate o administrador do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
