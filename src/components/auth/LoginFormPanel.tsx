import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FirstPurchaseBanner } from '@/components/conversion/FirstPurchaseBanner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoginFormData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SignupFormData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResetFormData = any;

interface Props {
  formMode: 'login' | 'signup' | 'reset';
  switchMode: (mode: 'login' | 'signup' | 'reset') => void;
  loginForm: UseFormReturn<LoginFormData>;
  signupForm: UseFormReturn<SignupFormData>;
  resetForm: UseFormReturn<ResetFormData>;
  onLogin: (data: LoginFormData) => void;
  onSignup: (data: SignupFormData) => void;
  onReset: (data: ResetFormData) => void;
  onGoogleLogin: () => void;
  isSubmitting: boolean;
  isGoogleLoading: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (v: boolean) => void;
}

export function LoginFormPanel({
  formMode, switchMode, loginForm, signupForm, resetForm,
  onLogin, onSignup, onReset, onGoogleLogin,
  isSubmitting, isGoogleLoading,
  showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
}: Props) {
  return (
    <motion.div key={formMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
      {/* Login */}
      {formMode === 'login' && (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="login-email" type="email" autoComplete="email" {...loginForm.register('email')} placeholder="seu@email.com" className="pl-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary" />
            </div>
            {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Senha</Label>
              <button type="button" onClick={() => switchMode('reset')} className="text-xs text-primary hover:underline">Esqueceu a senha?</button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...loginForm.register('password')} placeholder="••••••••" className="pl-10 pr-10 h-12 bg-muted/50 border-border focus-visible:ring-2 focus-visible:ring-primary" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Entrando...</> : <>Entrar<ArrowRight className="h-5 w-5 ml-2" /></>}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">ou continue com</span></div>
          </div>

          <GoogleButton onClick={onGoogleLogin} isLoading={isGoogleLoading} />

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">ou</span></div>
          </div>

          <FirstPurchaseBanner />
          <Button type="button" variant="outline" className="w-full h-12" onClick={() => switchMode('signup')}>Criar uma conta gratuita</Button>
        </form>
      )}

      {/* Signup */}
      {formMode === 'signup' && (
        <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="signup-name" type="text" autoComplete="name" {...signupForm.register('fullName')} placeholder="Seu nome completo" className="pl-10 h-12 bg-muted/50" />
            </div>
            {signupForm.formState.errors.fullName && <p className="text-sm text-destructive">{signupForm.formState.errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="signup-email" type="email" autoComplete="email" {...signupForm.register('email')} placeholder="seu@email.com" className="pl-10 h-12 bg-muted/50" />
            </div>
            {signupForm.formState.errors.email && <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...signupForm.register('password')} placeholder="Mínimo 6 caracteres" className="pl-10 pr-10 h-12 bg-muted/50" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {signupForm.formState.errors.password && <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-confirm">Confirmar senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="signup-confirm" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" {...signupForm.register('confirmPassword')} placeholder="Repita a senha" className="pl-10 pr-10 h-12 bg-muted/50" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {signupForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>}
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="terms" checked={signupForm.watch('acceptTerms')} onCheckedChange={(v) => signupForm.setValue('acceptTerms', v === true)} />
            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              Aceito os <a href="/termos" className="text-primary hover:underline">Termos de Uso</a> e <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>
            </label>
          </div>
          {signupForm.formState.errors.acceptTerms && <p className="text-sm text-destructive">{signupForm.formState.errors.acceptTerms.message}</p>}

          <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Criando...</> : <>Criar conta<ArrowRight className="h-5 w-5 ml-2" /></>}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">ou</span></div>
          </div>
          <GoogleButton onClick={onGoogleLogin} isLoading={isGoogleLoading} />
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}<button type="button" onClick={() => switchMode('login')} className="text-primary font-medium hover:underline">Entrar</button>
          </p>
        </form>
      )}

      {/* Reset */}
      {formMode === 'reset' && (
        <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="reset-email" type="email" autoComplete="email" {...resetForm.register('email')} placeholder="seu@email.com" className="pl-10 h-12 bg-muted/50" />
            </div>
            {resetForm.formState.errors.email && <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}Enviar link de recuperação
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Lembrou?{' '}<button type="button" onClick={() => switchMode('login')} className="text-primary font-medium hover:underline">Voltar ao login</button>
          </p>
        </form>
      )}
    </motion.div>
  );
}

function GoogleButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <Button type="button" variant="outline" className="w-full h-12 gap-3 border-border hover:bg-muted/50" onClick={onClick} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      Continuar com Google
    </Button>
  );
}
