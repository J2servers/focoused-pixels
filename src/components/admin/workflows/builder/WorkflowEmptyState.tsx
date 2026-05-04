import { Button } from '@/components/ui/button';
import { Plus, Upload, Workflow, Sparkles, Zap, TestTube2 } from 'lucide-react';

export function WorkflowEmptyState({ onNew, onImport }: { onNew: () => void; onImport: () => void }) {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[hsl(var(--admin-bg))] via-[hsl(var(--admin-bg))] to-violet-950/10">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="relative text-center max-w-lg px-8">
        <div className="relative mx-auto w-28 h-28 mb-10">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20" />
          <div className="absolute inset-4 rounded-2xl bg-[hsl(var(--admin-card))] flex items-center justify-center border border-white/[0.06]">
            <Workflow className="h-12 w-12 text-violet-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Centro de Automação</h2>
        <p className="text-sm text-white/40 mb-10 leading-relaxed max-w-sm mx-auto">
          Automatize comunicações com seus clientes usando fluxos visuais inteligentes. Selecione um modelo pronto ou crie do zero.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button onClick={onNew} className="admin-btn admin-btn-create gap-2.5 h-12 px-8">
            <Plus className="h-4 w-4" />Novo Workflow
          </Button>
          <Button onClick={onImport} className="admin-btn admin-btn-view gap-2.5 h-12 px-8">
            <Upload className="h-4 w-4" />Importar JSON
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { icon: Sparkles, label: 'Modelos prontos', desc: 'Use a aba Modelos' },
            { icon: Zap, label: 'Atalhos', desc: 'Ctrl+S, Ctrl+Z' },
            { icon: TestTube2, label: 'Teste seguro', desc: 'Simule antes de ativar' },
          ].map(tip => (
            <div key={tip.label} className="text-center">
              <tip.icon className="h-5 w-5 text-white/15 mx-auto mb-2" />
              <p className="text-[10px] font-semibold text-white/30">{tip.label}</p>
              <p className="text-[9px] text-white/15">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
