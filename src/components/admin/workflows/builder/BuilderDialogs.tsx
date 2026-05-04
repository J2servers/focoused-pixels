import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Settings, Upload, X } from 'lucide-react';
import type { ValidationIssue, WorkflowMeta } from '@/hooks/useWorkflows';

export function DeleteWorkflowDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className="border-white/[0.08]">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir workflow?</AlertDialogTitle>
          <AlertDialogDescription>Esta ação não pode ser desfeita. Todas as execuções pendentes serão canceladas.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ValidationDialog({ open, onClose, issues }: { open: boolean; onClose: () => void; issues: ValidationIssue[] }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-400" />Validação</DialogTitle>
          <DialogDescription>Corrija os problemas antes de salvar.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {issues.map((issue, i) => (
            <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${issue.type === 'error' ? 'bg-red-500/5 text-red-400 border border-red-500/10' : 'bg-amber-500/5 text-amber-400 border border-amber-500/10'}`}>
              {issue.type === 'error' ? <X className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WorkflowSettingsDialog({ open, onClose, current, setCurrent }: {
  open: boolean; onClose: () => void; current: WorkflowMeta | null;
  setCurrent: (v: WorkflowMeta | null) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-white/[0.08]">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-violet-400" />Configurações do Workflow</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60">Descrição</label>
            <Textarea
              value={current?.description || ''}
              onChange={e => current && setCurrent({ ...current, description: e.target.value })}
              placeholder="Descreva o objetivo deste workflow..." rows={3}
              className="border-white/[0.06]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60">Delay inicial (minutos)</label>
            <Input type="number" min={0} value={current?.trigger_delay_minutes || 0}
              onChange={e => current && setCurrent({ ...current, trigger_delay_minutes: parseInt(e.target.value) || 0 })}
              className="border-white/[0.06]"
            />
            <p className="text-[10px] text-white/30">Tempo de espera antes de iniciar o primeiro passo.</p>
          </div>
        </div>
        <DialogFooter><Button onClick={onClose}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImportWorkflowDialog({ open, onClose, importJson, setImportJson, onImport }: {
  open: boolean; onClose: () => void; importJson: string;
  setImportJson: (v: string) => void; onImport: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-violet-400" />Importar Workflow</DialogTitle>
          <DialogDescription>Cole o JSON de um workflow exportado.</DialogDescription>
        </DialogHeader>
        <Textarea value={importJson} onChange={e => setImportJson(e.target.value)}
          placeholder='{"name": "...", "trigger_event": "...", "steps": [...]}' rows={8} className="font-mono text-xs border-white/[0.06]" />
        <DialogFooter>
          <Button variant="outline" onClick={() => { onClose(); setImportJson(''); }}>Cancelar</Button>
          <Button onClick={onImport} disabled={!importJson.trim()} className="admin-btn admin-btn-view">Importar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
