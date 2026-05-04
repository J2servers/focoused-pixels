import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketPercent } from 'lucide-react';
import { CouponFormData } from './types';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formData: CouponFormData;
  setFormData: (data: CouponFormData) => void;
  isEditing: boolean;
  onSubmit: () => void;
}

export function CouponFormDialog({ open, onOpenChange, formData, setFormData, isEditing, onSubmit }: Props) {
  const set = <K extends keyof CouponFormData>(k: K, v: CouponFormData[K]) =>
    setFormData({ ...formData, [k]: v });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg liquid-glass text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <TicketPercent className="h-4 w-4 text-purple-400" />
            </div>
            {isEditing ? 'Editar Cupom' : 'Novo Cupom'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {formData.code && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-[hsl(var(--admin-accent-purple)/0.1)] to-[hsl(var(--admin-accent-pink)/0.1)] border border-purple-500/20 text-center">
              <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Prévia do cupom</p>
              <p className="text-lg font-bold font-mono text-white">{formData.code}</p>
              <p className="text-sm text-purple-400">
                {formData.type === 'percentage' ? `${formData.value}% OFF` : `R$ ${formData.value.toFixed(2).replace('.', ',')} OFF`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Código</Label>
              <Input value={formData.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="PROMO10" className="uppercase bg-white/[0.03] border-white/[0.08] text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Tipo</Label>
              <Select value={formData.type} onValueChange={(v: 'percentage' | 'fixed') => set('type', v)}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white/50 text-xs uppercase tracking-wide">Descrição</Label>
            <Textarea value={formData.description} onChange={(e) => set('description', e.target.value)} placeholder="Cupom especial de inauguração" rows={2} className="bg-white/[0.03] border-white/[0.08] text-white mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Valor do Desconto</Label>
              <Input type="number" value={formData.value} onChange={(e) => set('value', parseFloat(e.target.value) || 0)} className="bg-white/[0.03] border-white/[0.08] text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Pedido Mínimo (R$)</Label>
              <Input type="number" value={formData.min_order_value || ''} onChange={(e) => set('min_order_value', e.target.value ? parseFloat(e.target.value) : null)} className="bg-white/[0.03] border-white/[0.08] text-white mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Desconto Máximo (R$)</Label>
              <Input type="number" value={formData.max_discount || ''} onChange={(e) => set('max_discount', e.target.value ? parseFloat(e.target.value) : null)} className="bg-white/[0.03] border-white/[0.08] text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Limite de Uso</Label>
              <Input type="number" value={formData.usage_limit || ''} onChange={(e) => set('usage_limit', e.target.value ? parseInt(e.target.value) : null)} className="bg-white/[0.03] border-white/[0.08] text-white mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Data Início</Label>
              <Input type="date" value={formData.start_date} onChange={(e) => set('start_date', e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/50 text-xs uppercase tracking-wide">Data Fim</Label>
              <Input type="date" value={formData.end_date} onChange={(e) => set('end_date', e.target.value)} className="bg-white/[0.03] border-white/[0.08] text-white mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.04]">
            <div>
              <Label className="text-white text-sm font-medium">Cupom Ativo</Label>
              <p className="text-[10px] text-white/50">Desativado, o cupom não poderá ser utilizado</p>
            </div>
            <Switch checked={formData.is_active} onCheckedChange={(c) => set('is_active', c)} className="admin-switch-orange" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/[0.08] bg-transparent text-white hover:bg-white/[0.06]">Cancelar</Button>
          <Button onClick={onSubmit} disabled={!formData.code || !formData.value} className="admin-btn admin-btn-save">
            {isEditing ? 'Salvar Alterações' : 'Criar Cupom'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
