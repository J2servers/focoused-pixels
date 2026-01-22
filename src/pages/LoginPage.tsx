import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock, 
  ArrowLeft, 
  User, 
  ShoppingBag,
  Heart,
  Star,
  Truck,
  Shield,
  ArrowRight,
  CheckCircle2,
  Chrome
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSubscribeLead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import logoGoat from '@/assets/logo-goat.png';
import { getErrorMessage, isAuthError } from '@/lib/auth-error';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Digite um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Digite um email válido').max(255, 'Email muito longo'),
  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(6, 'Confirme sua senha'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const resetSchema = z.object({
  email: z.string().email('Digite um email válido'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const benefits = [
  { icon: ShoppingBag, title: 'Orçamentos salvos', description: 'Acompanhe todos os seus pedidos' },
  { icon: Heart, title: 'Lista de favoritos', description: 'Salve produtos para depois' },
  { icon: Star, title: 'Avaliações exclusivas', description: 'Compartilhe sua experiência' },
  { icon: Truck, title: 'Rastreamento', description: 'Acompanhe suas entregas' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp, signInWithGoogle, resetPassword } = useAuthContext();
  const subscribeLead = useSubscribeLead();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formMode, setFormMode] = useState<'login' | 'signup' | 'reset'>('login');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const onLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        if (isAuthError(error, 'Invalid login credentials')) {
          toast.error('Email ou senha incorretos. Verifique seus dados.');
        } else if (isAuthError(error, 'Email not confirmed')) {
          toast.error('Por favor, confirme seu email antes de fazer login.');
        } else {
          toast.error('Erro ao fazer login. Tente novamente.');
        }
      } else {
        toast.success('Bem-vindo de volta! 🎉');
        navigate('/');
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente mais tarde.');
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
          toast.error('Este email já está cadastrado. Tente fazer login.');
        } else if (isAuthError(error, 'Password')) {
          toast.error('A senha não atende aos requisitos de segurança.');
        } else {
        toast.error('Erro ao criar conta. Tente novamente.');
        }
      } else {
        // Save as lead for marketing
        try {
          await subscribeLead.mutateAsync({
            name: data.fullName,
            email: data.email,
            source: 'signup',
            tags: ['cadastro', 'cliente'],
          });
        } catch {
          // Lead save is not critical
          console.log('Lead already exists or failed to save');
        }
        
        toast.success('Conta criada com sucesso! Bem-vindo à Pincel de Luz! ✨');
        navigate('/');
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReset = async (data: ResetFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast.error('Erro ao enviar email de recuperação.');
      } else {
        toast.success('Email enviado! Verifique sua caixa de entrada.');
        setFormMode('login');
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Erro ao fazer login com Google. Tente novamente.');
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const switchMode = (mode: 'login' | 'signup' | 'reset') => {
    setFormMode(mode);
    loginForm.reset();
    signupForm.reset();
    resetForm.reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero/Benefits (Hidden on mobile) */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-purple"
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-12">
          {/* Logo */}
          <Link to="/" className="mb-12">
            <motion.img 
              src={logoGoat} 
              alt="GOAT Comunicação Visual" 
              className="h-16 w-auto brightness-0 invert"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          </Link>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              Sua conta,
              <br />
              <span className="text-accent">suas vantagens.</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed mb-12">
              Crie sua conta gratuita e tenha acesso a benefícios exclusivos para acompanhar seus orçamentos e muito mais.
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 hover:bg-primary-foreground/15 transition-all duration-300">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <benefit.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground text-sm">{benefit.title}</h3>
                    <p className="text-xs text-primary-foreground/70 mt-0.5">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex items-center gap-3 text-primary-foreground/60"
          >
            <Shield className="h-5 w-5" />
            <span className="text-sm">Seus dados estão protegidos com criptografia de ponta</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoGoat} alt="GOAT" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={formMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-0 shadow-xl shadow-primary/5">
                  <CardHeader className="text-center space-y-2 pb-4">
                    {/* Mobile Icon */}
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
                      {formMode === 'login' && 'Bem-vindo de volta! Entre com seus dados.'}
                      {formMode === 'signup' && 'Preencha os dados para começar a aproveitar.'}
                      {formMode === 'reset' && 'Digite seu email para receber o link de recuperação.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2">
                    {/* Login Form */}
                    {formMode === 'login' && (
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-email"
                              type="email"
                              autoComplete="email"
                              {...loginForm.register('email')}
                              placeholder="seu@email.com"
                              className="pl-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </div>
                          {loginForm.formState.errors.email && (
                            <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="login-password">Senha</Label>
                            <button
                              type="button"
                              onClick={() => switchMode('reset')}
                              className="text-xs text-primary hover:underline"
                            >
                              Esqueceu a senha?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="login-password"
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="current-password"
                              {...loginForm.register('password')}
                              placeholder="••••••••"
                              className="pl-10 pr-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {loginForm.formState.errors.password && (
                            <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity text-base font-semibold"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Entrando...
                            </>
                          ) : (
                            <>
                              Entrar
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>

                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">ou continue com</span>
                          </div>
                        </div>

                        {/* Google Login Button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 gap-3 border-border hover:bg-muted/50"
                          onClick={handleGoogleLogin}
                          disabled={isGoogleLoading}
                        >
                          {isGoogleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                          )}
                          Continuar com Google
                        </Button>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">ou</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12"
                          onClick={() => switchMode('signup')}
                        >
                          Criar uma conta gratuita
                        </Button>
                      </form>
                    )}

                    {/* Signup Form */}
                    {formMode === 'signup' && (
                      <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Nome completo</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-name"
                              type="text"
                              autoComplete="name"
                              {...signupForm.register('fullName')}
                              placeholder="Seu nome completo"
                              className="pl-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </div>
                          {signupForm.formState.errors.fullName && (
                            <p className="text-sm text-destructive">{signupForm.formState.errors.fullName.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              type="email"
                              autoComplete="email"
                              {...signupForm.register('email')}
                              placeholder="seu@email.com"
                              className="pl-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </div>
                          {signupForm.formState.errors.email && (
                            <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Senha</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="signup-password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                {...signupForm.register('password')}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {signupForm.formState.errors.password && (
                              <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="signup-confirm">Confirmar</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="signup-confirm"
                                type={showConfirmPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                {...signupForm.register('confirmPassword')}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {signupForm.formState.errors.confirmPassword && (
                              <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-medium">A senha deve conter:</p>
                          <ul className="grid grid-cols-2 gap-1">
                            <li className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                              Mínimo 6 caracteres
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                              Pelo menos uma letra
                            </li>
                            <li className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                              Pelo menos um número
                            </li>
                          </ul>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="terms"
                            checked={signupForm.watch('acceptTerms')}
                            onCheckedChange={(checked) => signupForm.setValue('acceptTerms', checked as boolean)}
                            className="mt-1"
                          />
                          <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                            Li e aceito os{' '}
                            <Link to="/termos" className="text-primary hover:underline">
                              termos de uso
                            </Link>{' '}
                            e a{' '}
                            <Link to="/privacidade" className="text-primary hover:underline">
                              política de privacidade
                            </Link>
                          </label>
                        </div>
                        {signupForm.formState.errors.acceptTerms && (
                          <p className="text-sm text-destructive">{signupForm.formState.errors.acceptTerms.message}</p>
                        )}

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity text-base font-semibold"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Criando conta...
                            </>
                          ) : (
                            <>
                              Criar minha conta
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground">ou cadastre-se com</span>
                          </div>
                        </div>

                        {/* Google Signup Button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-12 gap-3 border-border hover:bg-muted/50"
                          onClick={handleGoogleLogin}
                          disabled={isGoogleLoading}
                        >
                          {isGoogleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                          )}
                          Continuar com Google
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => switchMode('login')}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Já tenho uma conta
                        </Button>
                      </form>
                    )}

                    {/* Reset Password Form */}
                    {formMode === 'reset' && (
                      <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="reset-email"
                              type="email"
                              autoComplete="email"
                              {...resetForm.register('email')}
                              placeholder="seu@email.com"
                              className="pl-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary"
                            />
                          </div>
                          {resetForm.formState.errors.email && (
                            <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Enviar link de recuperação'
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => switchMode('login')}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar ao login
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <Link to="/" className="hover:text-primary transition-colors">
                    ← Voltar para a loja
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
