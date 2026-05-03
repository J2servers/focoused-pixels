import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  loginSchema,
  type LoginFormData,
  DANGEROUS_PATTERNS,
  MAX_ATTEMPTS,
  formatTime,
} from './security';

interface Props {
  locked: boolean;
  remaining: number;
  fails: number;
  submitting: boolean;
  mountTime: number;
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const AdminLoginForm = ({
  locked,
  remaining,
  fails,
  submitting,
  mountTime,
  onSubmit,
}: Props) => {
  const form = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const honeypotRef = useRef<HTMLInputElement>(null);
  const showPwState = useRef<boolean>(false);
  // Use simple toggling via DOM attribute for show/hide
  const togglePw = (btn: HTMLButtonElement) => {
    showPwState.current = !showPwState.current;
    const input = btn.parentElement?.querySelector('input');
    if (input) input.type = showPwState.current ? 'text' : 'password';
    btn.textContent = showPwState.current ? 'HIDE' : 'SHOW';
  };

  const handle = async (raw: LoginFormData) => {
    if (honeypotRef.current?.value) {
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
      toast.error('Acesso negado.');
      return;
    }
    if (Date.now() - mountTime < 2000) {
      await new Promise((r) => setTimeout(r, 2000));
      toast.error('Acesso negado.');
      return;
    }
    await onSubmit(raw);
  };

  return (
    <>
      <h2 className="text-sm font-semibold tracking-[0.2em] text-[#e8a817] uppercase text-center mb-1">
        {locked ? '🔒 ACESSO BLOQUEADO' : 'ACESSO RESTRITO'}
      </h2>
      <p className="text-xs text-white/30 tracking-wider uppercase text-center mb-8">
        {locked ? `Tente em ${formatTime(remaining)}` : 'IDENTIFICAÇÃO OBRIGATÓRIA'}
      </p>

      {fails > 0 && fails < MAX_ATTEMPTS && !locked && (
        <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/12 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-300/80">
            {MAX_ATTEMPTS - fails} tentativa{MAX_ATTEMPTS - fails !== 1 ? 's' : ''} restante
            {MAX_ATTEMPTS - fails !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {locked ? (
        <div className="py-12 flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-400" />
          </div>
          <div className="font-mono text-4xl font-bold text-red-400 tabular-nums">
            {formatTime(remaining)}
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(handle)} className="space-y-4" autoComplete="off" noValidate>
          <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true">
            <input ref={honeypotRef} type="text" name="website_url" tabIndex={-1} autoComplete="off" />
          </div>

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

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <input
              type="password"
              {...form.register('password')}
              placeholder="••••••••"
              autoComplete="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              className="w-full h-[52px] pl-12 pr-16 rounded-xl bg-white text-[#1a1408] placeholder:text-[#1a1408]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#e8a817]/50 transition-all border-0"
            />
            <button
              type="button"
              onClick={(e) => togglePw(e.currentTarget)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1408]/30 hover:text-[#1a1408]/60 text-[10px] uppercase tracking-widest font-bold transition-colors"
            >
              SHOW
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-red-400 pl-1">{form.formState.errors.password.message}</p>
          )}

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
    </>
  );
};
