import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, UserPlus, Loader2, Eye, EyeOff, ShieldCheck, Package, History } from 'lucide-react';

interface PaymentStepAuthProps {
  onAuthenticated: () => void;
  isAuthenticated: boolean;
  userEmail?: string;
}

export function PaymentStepAuth({ onAuthenticated, isAuthenticated, userEmail }: PaymentStepAuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-7 w-7 text-emerald-500" />
            </div>
            <p className="font-semibold text-lg">Conta verificada</p>
            <p className="text-sm text-muted-foreground">
              Logado como <span className="font-medium text-foreground">{userEmail}</span>
            </p>
            <Button onClick={onAuthenticated} size="lg" className="mt-4">
              Continuar para dados de entrega
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      toast.error('Preencha e-mail e senha');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          toast.error('Informe seu nome completo');
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/pagamento`,
            data: { full_name: fullName.trim() },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('E-mail já cadastrado. Faça login.');
            setMode('login');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Conta criada! Verifique seu e-mail para confirmar.');
        // Note: user may need to confirm email depending on config
        // Try to auto-login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (!loginError) {
          onAuthenticated();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('E-mail ou senha incorretos');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Confirme seu e-mail antes de fazer login');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success('Login realizado!');
        onAuthenticated();
      }
    } catch {
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/pagamento`,
      },
    });
    if (error) toast.error('Erro ao conectar com Google');
  };

  return (
    <div className="space-y-4">
      {/* Benefits banner */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Package, label: 'Acompanhe pedidos' },
          { icon: History, label: 'Histórico de compras' },
          { icon: ShieldCheck, label: 'Compra segura' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted/50 text-center">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium leading-tight">{label}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            {mode === 'register' ? (
              <><UserPlus className="h-5 w-5" /> Crie sua conta</>
            ) : (
              <><LogIn className="h-5 w-5" /> Acesse sua conta</>
            )}
          </CardTitle>
          <CardDescription>
            {mode === 'register'
              ? 'Cadastre-se para acompanhar seus pedidos e gerenciar suas compras'
              : 'Entre com suas credenciais para continuar'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="auth-name">Nome Completo *</Label>
                <Input
                  id="auth-name"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={120}
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email">E-mail *</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">Senha *</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={128}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === 'register' ? 'Criar Conta e Continuar' : 'Entrar e Continuar'}
            </Button>
          </form>

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              ou
            </span>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </Button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className="text-sm text-primary hover:underline"
            >
              {mode === 'register' ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
