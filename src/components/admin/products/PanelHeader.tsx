import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, X, ImageIcon, Star, Save, Loader2 } from 'lucide-react';
import type { ProductLike } from './buildForm';

interface Props {
  product: ProductLike & { id: string };
  editing: boolean;
  hasPromo: boolean;
  discountPct: number;
  status: { label: string; cls: string };
  canEdit: boolean;
  isSaving?: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onClose?: () => void;
}

export function PanelHeader({
  product, editing, hasPromo, discountPct, status, canEdit, isSaving,
  onEdit, onCancelEdit, onSave, onDelete, onClose,
}: Props) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] liquid-glass-lighter">
      <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/[0.08] bg-black/20 shrink-0">
        {product.cover_image
          ? <img src={product.cover_image} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-3.5 w-3.5 text-white/15" /></div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge className={`${status.cls} border text-[9px] px-1.5 py-0 h-4`}>{status.label}</Badge>
          {product.is_featured && <Badge className="bg-violet-500/15 text-violet-300 border border-violet-500/25 text-[9px] px-1.5 py-0 h-4"><Star className="h-2 w-2 mr-0.5 fill-current" />Destaque</Badge>}
          {hasPromo && <Badge className="bg-rose-500/15 text-rose-300 border border-rose-500/25 text-[9px] px-1.5 py-0 h-4">-{discountPct}%</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {editing ? (
          <>
            <Button className="admin-btn admin-btn-save admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={onSave} disabled={isSaving} title="Salvar">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/35 hover:bg-white/[0.06]" onClick={onCancelEdit} title="Cancelar"><X className="h-3.5 w-3.5" /></Button>
          </>
        ) : (
          <Button className="admin-btn admin-btn-edit admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={onEdit} disabled={!canEdit} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
        )}
        <Button className="admin-btn admin-btn-delete admin-btn-icon !min-h-0 !p-1 h-9 w-9" onClick={onDelete} disabled={!canEdit} title="Deletar"><Trash2 className="h-3.5 w-3.5" /></Button>
        {onClose && <Button variant="ghost" size="icon" className="h-8 w-8 text-white/35 hover:text-white hover:bg-white/[0.06]" onClick={onClose} title="Fechar"><X className="h-4 w-4" /></Button>}
      </div>
    </div>
  );
}
