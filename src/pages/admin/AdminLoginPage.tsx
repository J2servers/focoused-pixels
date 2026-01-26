import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowLeft, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getErrorMessage, isAuthError } from '@/lib/auth-error';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

const resetSchema = z.object({
  email: z.string().email('Email inválido'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, role, isLoading, signIn, signUp, resetPassword } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!isLoading && user && role) {
      navigate('/admin');
    }
  }, [user, role, isLoading, navigate]);

  const onLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        if (isAuthError(error, 'Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(getErrorMessage(error));
        }
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      
      if (error) {
        if (isAuthError(error, 'User already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(getErrorMessage(error));
        }
      } else {
        toast.success('Cadastro realizado com sucesso! Aguarde a aprovação de um administrador para acessar o painel.');
        setShowSignupForm(false);
      }
    } catch {
      toast.error('Erro ao fazer cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReset = async (data: ResetFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast.error(getErrorMessage(error));
      } else {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setShowResetForm(false);
      }
    } catch {
      toast.error('Erro ao enviar email. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))]">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[hsl(var(--admin-accent-purple)/0.3)] animate-ping" />
          <div className="absolute inset-0 rounded-full bg-[hsl(var(--admin-accent-pink)/0.2)] animate-pulse delay-75" />
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-blue))] flex items-center justify-center shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.4)]">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[hsl(var(--admin-sidebar))]">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--admin-accent-purple)/0.15)] via-transparent to-[hsl(var(--admin-accent-pink)/0.1)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--admin-accent-blue)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--admin-accent-pink)/0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-blue))] flex items-center justify-center shadow-2xl shadow-[hsl(var(--admin-accent-purple)/0.4)] mb-8 animate-pulse">
            <Sparkles className="h-8 w-8 text-white drop-shadow-[0_0_8px_white]" />
          </div>
          <h1 className="text-4xl font-bold admin-gradient-text mb-4">
            Pincel de Luz Admin
          </h1>
          <p className="text-lg text-[hsl(var(--admin-text-muted))] max-w-md leading-relaxed">
            Gerencie seu catálogo de produtos, promoções e muito mais em um só lugar.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'Gestão completa de produtos e categorias',
              'Controle de promoções e descontos',
              'Moderação de avaliações de clientes',
              'Relatórios e métricas em tempo real',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-[hsl(var(--admin-text-muted))]">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))]" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[hsl(var(--admin-accent-purple)/0.1)] to-[hsl(var(--admin-accent-pink)/0.1)] blur-3xl" />
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[hsl(var(--admin-accent-blue)/0.1)] to-transparent blur-3xl" />
        <div className="absolute top-1/2 right-20 w-32 h-32 rounded-full bg-[hsl(var(--admin-accent-cyan)/0.1)] blur-2xl animate-pulse" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))] p-6">
        <Card className="w-full max-w-md border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-2xl shadow-black/20">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="lg:hidden mx-auto">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-blue))] flex items-center justify-center shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.3)] mx-auto">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">
                {showResetForm 
                  ? 'Recuperar Senha' 
                  : showSignupForm 
                    ? 'Criar Conta'
                    : 'Bem-vindo de volta'}
              </CardTitle>
              <CardDescription className="mt-2 text-[hsl(var(--admin-text-muted))]">
                {showResetForm 
                  ? 'Digite seu email para recuperar a senha' 
                  : showSignupForm 
                    ? 'Crie sua conta para solicitar acesso'
                    : 'Faça login para acessar o painel'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {showResetForm ? (
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email" className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                      id="reset-email"
                      type="email"
                      {...resetForm.register('email')}
                      placeholder="seu@email.com"
                      className="pl-10 h-11 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-purple))] focus-visible:border-[hsl(var(--admin-accent-purple))]"
                    />
                  </div>
                  {resetForm.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {resetForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-purple))] hover:opacity-90 text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.3)] transition-all duration-300" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar email de recuperação'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))]"
                  onClick={() => setShowResetForm(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao login
                </Button>
              </form>
            ) : showSignupForm ? (
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name" className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Nome completo</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                      id="signup-name"
                      type="text"
                      {...signupForm.register('fullName')}
                      placeholder="Seu nome"
                      className="pl-10 h-11 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-purple))] focus-visible:border-[hsl(var(--admin-accent-purple))]"
                    />
                  </div>
                  {signupForm.formState.errors.fullName && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {signupForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-email" className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                      id="signup-email"
                      type="email"
                      {...signupForm.register('email')}
                      placeholder="seu@email.com"
                      className="pl-10 h-11 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-purple))] focus-visible:border-[hsl(var(--admin-accent-purple))]"
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Senha</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      {...signupForm.register('password')}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-purple))] focus-visible:border-[hsl(var(--admin-accent-purple))]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-confirm" className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Confirmar senha</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                      id="signup-confirm"
                      type={showPassword ? 'text' : 'password'}
                      {...signupForm.register('confirmPassword')}
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-purple))] focus-visible:border-[hsl(var(--admin-accent-purple))]"
                    />
                  </div>
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-purple))] hover:opacity-90 text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.3)] transition-all duration-300" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-[hsl(var(--admin-sidebar-hover))]"
                  onClick={() => setShowSignupForm(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao login
                </Button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                      id="email"
                      type="email"
                      {...loginForm.register('email')}
                      placeholder="seu@email.com"
                      className="pl-10 h-11 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-purple))] focus-visible:border-[hsl(var(--admin-accent-purple))]"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-400 mt-1.5">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Senha</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password')}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent-purple))] focus-visible:border-[hsl(var(--admin-accent-purple))]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--admin-text-muted))] hover:text-white transition-colors"
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

                <Button type="submit" className="w-full h-11 bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-purple))] hover:opacity-90 text-white shadow-lg shadow-[hsl(var(--admin-accent-purple)/0.3)] transition-all duration-300" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-sidebar-hover))] hover:text-white hover:border-[hsl(var(--admin-accent-purple)/0.5)]"
                    onClick={() => setShowSignupForm(true)}
                  >
                    Criar nova conta
                  </Button>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-[hsl(var(--admin-accent-purple))] hover:text-[hsl(var(--admin-accent-pink))]"
                    onClick={() => setShowResetForm(true)}
                  >
                    Esqueceu sua senha?
                  </Button>
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
