import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, Shield, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { isAuthError } from '@/lib/auth-error';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000; // 5 minute window

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginAttempt {
  timestamp: number;
  success: boolean;
}

const getAttemptData = (): { attempts: LoginAttempt[]; lockedUntil: number | null } => {
  try {
    const raw = sessionStorage.getItem('_sec_gate');
    if (!raw) return { attempts: [], lockedUntil: null };
    return JSON.parse(raw);
  } catch {
    return { attempts: [], lockedUntil: null };
  }
};

const saveAttemptData = (data: { attempts: LoginAttempt[]; lockedUntil: number | null }) => {
  sessionStorage.setItem('_sec_gate', JSON.stringify(data));
};

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, role, isLoading, signIn } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const lockTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check lockout on mount
  useEffect(() => {
    const data = getAttemptData();
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      setIsLocked(true);
      setLockRemaining(Math.ceil((data.lockedUntil - Date.now()) / 1000));
    }
    const recentFails = data.attempts.filter(
      a => !a.success && Date.now() - a.timestamp < ATTEMPT_WINDOW_MS
    );
    setFailedCount(recentFails.length);
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (isLocked) {
      lockTimerRef.current = setInterval(() => {
        const data = getAttemptData();
        if (!data.lockedUntil || Date.now() >= data.lockedUntil) {
          setIsLocked(false);
          setLockRemaining(0);
          setFailedCount(0);
          saveAttemptData({ attempts: [], lockedUntil: null });
          if (lockTimerRef.current) clearInterval(lockTimerRef.current);
        } else {
          setLockRemaining(Math.ceil((data.lockedUntil - Date.now()) / 1000));
        }
      }, 1000);
    }
    return () => {
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [isLocked]);

  useEffect(() => {
    if (!isLoading && user && role) {
      navigate('/admin');
    }
  }, [user, role, isLoading, navigate]);

  const recordAttempt = (success: boolean) => {
    const data = getAttemptData();
    const now = Date.now();

    // Clean old attempts outside window
    const recentAttempts = data.attempts.filter(
      a => now - a.timestamp < ATTEMPT_WINDOW_MS
    );
    recentAttempts.push({ timestamp: now, success });

    const recentFails = recentAttempts.filter(a => !a.success);
    setFailedCount(recentFails.length);

    if (recentFails.length >= MAX_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_DURATION_MS;
      saveAttemptData({ attempts: recentAttempts, lockedUntil });
      setIsLocked(true);
      setLockRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
      return;
    }

    saveAttemptData({ attempts: recentAttempts, lockedUntil: data.lockedUntil });
  };

  const onLogin = async (data: LoginFormData) => {
    if (isLocked) {
      toast.error('Conta bloqueada temporariamente. Aguarde o desbloqueio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        recordAttempt(false);

        const remaining = MAX_ATTEMPTS - (failedCount + 1);

        if (isAuthError(error, 'Invalid login credentials')) {
          if (remaining <= 0) {
            toast.error('🔒 Conta bloqueada por 15 minutos devido a tentativas excessivas.');
          } else {
            toast.error(`Credenciais inválidas. ${remaining} tentativa${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`);
          }
        } else if (isAuthError(error, 'Email not confirmed')) {
          toast.error('Email não confirmado.');
        } else {
          toast.error('Erro de autenticação.');
        }
      } else {
        recordAttempt(true);
        // Clear attempts on success
        saveAttemptData({ attempts: [], lockedUntil: null });
        toast.success('✅ Acesso autorizado.');
      }
    } catch {
      recordAttempt(false);
      toast.error('Erro interno de segurança.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left Side - Security Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0d0d15] via-[#111128] to-[#0d0d15]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.06),transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Acesso Restrito
          </h1>
          <p className="text-lg text-white/40 max-w-md leading-relaxed">
            Portal protegido com segurança avançada. Acesso exclusivo para pessoal autorizado.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Bloqueio automático após tentativas falhas',
              'Sessões monitoradas e rastreáveis',
              'Sem recuperação de senha por email',
              'Controle de acesso baseado em roles (RBAC)',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/40">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/5 to-blue-500/5 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500/5 to-transparent blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-white/[0.06] bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="lg:hidden mx-auto">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg mx-auto">
                <Shield className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                {isLocked ? '🔒 Acesso Bloqueado' : 'Acesso Seguro'}
              </CardTitle>
              <CardDescription className="mt-2 text-white/40">
                {isLocked
                  ? `Tente novamente em ${formatTime(lockRemaining)}`
                  : 'Identifique-se para continuar'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Security warning banner */}
            {failedCount > 0 && failedCount < MAX_ATTEMPTS && !isLocked && (
              <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300">
                  {MAX_ATTEMPTS - failedCount} tentativa{MAX_ATTEMPTS - failedCount !== 1 ? 's' : ''} restante{MAX_ATTEMPTS - failedCount !== 1 ? 's' : ''} antes do bloqueio de 15 minutos.
                </p>
              </div>
            )}

            {isLocked ? (
              <div className="space-y-6 py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="h-10 w-10 text-red-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm">
                      Múltiplas tentativas de login falhas detectadas.
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                      O acesso será restaurado automaticamente.
                    </p>
                  </div>
                  <div className="font-mono text-3xl font-bold text-red-400 tabular-nums">
                    {formatTime(lockRemaining)}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-white/50">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input
                      id="email"
                      type="email"
                      {...loginForm.register('email')}
                      placeholder="seu@email.com"
                      autoComplete="off"
                      className="pl-10 h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/40"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-white/50">Senha</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      placeholder="••••••••"
                      autoComplete="off"
                      className="pl-10 pr-10 h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all duration-300 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Autenticar
                    </>
                  )}
                </Button>

                {/* Security notice */}
                <div className="pt-4 border-t border-white/[0.06]">
                  <p className="text-[11px] text-white/20 text-center leading-relaxed">
                    Este portal é monitorado. Tentativas não autorizadas serão registradas e reportadas. Recuperação de senha disponível apenas via administrador do sistema.
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
