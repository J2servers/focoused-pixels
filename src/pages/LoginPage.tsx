import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence } from 'framer-motion';
import { Loader2, User, ShoppingBag, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscribeLead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import logoPincel from '@/assets/logo-pincel-de-luz.png';
import { isAuthError } from '@/lib/auth-error';
import { LoginHeroPanel } from '@/components/auth/LoginHeroPanel';
import { LoginFormPanel } from '@/components/auth/LoginFormPanel';

const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});
const signupSchema = z.object({
  fullName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Digite um email válido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').regex(/[A-Za-z]/, 'Deve conter letra').regex(/[0-9]/, 'Deve conter número'),
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
  acceptTerms: z.boolean().refine((v) => v, { message: 'Você deve aceitar os termos' }),
}).refine((d) => d.password === d.confirmPassword, { message: 'As senhas não coincidem', path: ['confirmPassword'] });
const resetSchema = z.object({ email: z.string().email('Digite um email válido') });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp, signInWithGoogle, resetPassword } = useAuthContext();
  const subscribeLead = useSubscribeLead();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formMode, setFormMode] = useState<'login' | 'signup' | 'reset'>('login');

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const signupForm = useForm<SignupFormData>({ resolver: zodResolver(signupSchema), defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', acceptTerms: false } });
  const resetForm = useForm<ResetFormData>({ resolver: zodResolver(resetSchema), defaultValues: { email: '' } });

  useEffect(() => { if (!isLoading && user) navigate('/'); }, [user, isLoading, navigate]);

  const onLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (isAuthError(error, 'Invalid login credentials')) toast.error('Email ou senha incorretos.');
        else if (isAuthError(error, 'Email not confirmed')) toast.error('Confirme seu email antes de fazer login.');
        else toast.error('Erro ao fazer login.');
      } else { toast.success('Bem-vindo de volta! 🎉'); navigate('/'); }
    } catch { toast.error('Erro inesperado.'); } finally { setIsSubmitting(false); }
  };

  const onSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        if (isAuthError(error, 'User already registered')) toast.error('Email já cadastrado.');
        else if (isAuthError(error, 'Password')) toast.error('Senha não atende requisitos.');
        else toast.error('Erro ao criar conta.');
      } else {
        try { await subscribeLead.mutateAsync({ name: data.fullName, email: data.email, source: 'signup', tags: ['cadastro'] }); } catch {}
        toast.success('Conta criada! Bem-vindo! ✨'); navigate('/');
      }
    } catch { toast.error('Erro inesperado.'); } finally { setIsSubmitting(false); }
  };

  const onReset = async (data: ResetFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(data.email);
      if (error) toast.error('Erro ao enviar email.');
      else { toast.success('Email enviado!'); setFormMode('login'); }
    } catch { toast.error('Erro inesperado.'); } finally { setIsSubmitting(false); }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try { const { error } = await signInWithGoogle(); if (error) toast.error('Erro com Google.'); }
    catch { toast.error('Erro inesperado.'); } finally { setIsGoogleLoading(false); }
  };

  const switchMode = (mode: 'login' | 'signup' | 'reset') => {
    setFormMode(mode); loginForm.reset(); signupForm.reset(); resetForm.reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <LoginHeroPanel logoSrc={logoPincel} />
      <div className="flex-1 flex flex-col bg-background">
        <div className="lg:hidden p-4 border-b border-border">
          <Link to="/"><img src={logoPincel} alt="Pincel de Luz" className="h-10 w-auto" /></Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <Card className="border-0 shadow-xl shadow-primary/5">
                <CardHeader className="text-center space-y-2 pb-4">
                  <div className="lg:hidden mx-auto mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                      {formMode === 'login' && <User className="h-7 w-7 text-primary-foreground" />}
                      {formMode === 'signup' && <ShoppingBag className="h-7 w-7 text-primary-foreground" />}
                      {formMode === 'reset' && <Mail className="h-7 w-7 text-primary-foreground" />}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {formMode === 'login' && 'Entrar na sua conta'}
                    {formMode === 'signup' && 'Criar sua conta'}
                    {formMode === 'reset' && 'Recuperar senha'}
                  </CardTitle>
                  <CardDescription>
                    {formMode === 'login' && 'Bem-vindo de volta!'}
                    {formMode === 'signup' && 'Preencha os dados para começar.'}
                    {formMode === 'reset' && 'Digite seu email para recuperar.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <LoginFormPanel
                    formMode={formMode} switchMode={switchMode}
                    loginForm={loginForm} signupForm={signupForm} resetForm={resetForm}
                    onLogin={onLogin} onSignup={onSignup} onReset={onReset}
                    onGoogleLogin={handleGoogleLogin}
                    isSubmitting={isSubmitting} isGoogleLoading={isGoogleLoading}
                    showPassword={showPassword} setShowPassword={setShowPassword}
                    showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword}
                  />
                </CardContent>
              </Card>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary transition-colors">← Voltar para a loja</Link>
              </div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
