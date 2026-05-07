import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/lib/monitoring';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const msg = error?.message || '';
    if (/Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|error loading dynamically imported module/i.test(msg)) {
      try {
        const KEY = '__pdl_chunk_reloaded_at';
        const last = Number(sessionStorage.getItem(KEY) || 0);
        if (Date.now() - last > 30_000) {
          sessionStorage.setItem(KEY, String(Date.now()));
          const url = new URL(window.location.href);
          url.searchParams.set('_r', Date.now().toString(36));
          window.location.replace(url.toString());
          return;
        }
      } catch { /* ignore */ }
    }
    reportError(error, {
      level: 'fatal',
      source: 'frontend',
      context: { componentStack: info.componentStack?.slice(0, 2000), boundary: 'react' },
    });
  }

  reset = (): void => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Algo deu errado</h1>
          <p className="text-muted-foreground text-sm">
            Já fomos avisados e estamos trabalhando para resolver. Tente recarregar a página.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>Recarregar</Button>
            <Button variant="outline" onClick={this.reset}>Tentar novamente</Button>
          </div>
        </div>
      </div>
    );
  }
}
