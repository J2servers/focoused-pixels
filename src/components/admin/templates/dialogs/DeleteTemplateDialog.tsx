import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { Channel, isEventDefault } from '../TemplateConstants';
import { mutedText } from './styles';

export function DeleteTemplateDialog({ deleteTarget, setDeleteTarget, onConfirm }: {
  deleteTarget: { channel: Channel; id: string; name: string } | null;
  setDeleteTarget: (v: null) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
      <AlertDialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Excluir template
          </AlertDialogTitle>
          <AlertDialogDescription className={mutedText}>
            Tem certeza que deseja excluir "<strong className="text-white">{deleteTarget?.name}</strong>"?
            Esta ação não pode ser desfeita.
            {deleteTarget && isEventDefault(deleteTarget.name) && (
              <span className="block mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                ⚠️ Este template está vinculado a um evento do sistema. Notificações usarão fallback genérico.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[hsl(var(--admin-card-border))] text-white hover:bg-white/5">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 text-white hover:bg-red-600">Excluir permanentemente</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
