import { useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Keyboard, AlertTriangle, Zap, Send } from 'lucide-react';
import {
  WhatsAppTemplate, SYSTEM_EVENTS, replaceVariables,
  getWhatsAppSegmentInfo, countWords, findUnknownVars, isEventDefault,
} from '../TemplateConstants';
import { dlgCls, inpCls, mutedText, labelCls } from './styles';
import { VariableInserter } from './VariableInserter';

export function WhatsAppEditorDialog({ editWhats, setEditWhats, onSave }: {
  editWhats: Partial<WhatsAppTemplate> | null;
  setEditWhats: (v: Partial<WhatsAppTemplate> | null) => void;
  onSave: () => void;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertVar = useCallback((key: string) => {
    if (!editWhats) return;
    const el = bodyRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newContent = (editWhats.content || '').slice(0, start) + key + (editWhats.content || '').slice(end);
      setEditWhats({ ...editWhats, content: newContent });
      setTimeout(() => { el.focus(); el.setSelectionRange(start + key.length, start + key.length); }, 0);
    } else {
      setEditWhats({ ...editWhats, content: `${editWhats.content || ''}${key}` });
    }
  }, [editWhats, setEditWhats]);

  const segInfo = editWhats?.content ? getWhatsAppSegmentInfo(editWhats.content) : { length: 0, segments: 0, isLong: false };
  const unknownVars = editWhats?.content ? findUnknownVars(editWhats.content) : [];

  return (
    <Dialog open={!!editWhats} onOpenChange={() => setEditWhats(null)}>
      <DialogContent className={`${dlgCls} max-h-[92vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 flex items-center justify-center border border-green-500/20">
              <Send className="h-4 w-4 text-green-400" />
            </div>
            {editWhats?.id ? 'Editar Template WhatsApp' : 'Novo Template WhatsApp'}
          </DialogTitle>
          <DialogDescription className={`flex items-center gap-3 text-xs ${mutedText}`}>
            <span className="flex items-center gap-1"><Keyboard className="h-3 w-3" />Ctrl+S salvar</span>
            {segInfo.length > 0 && (
              <>
                <span>• {segInfo.length} chars</span>
                <span>• {segInfo.segments} segmento{segInfo.segments > 1 ? 's' : ''}</span>
                <span>• {countWords(editWhats?.content || '')} palavras</span>
              </>
            )}
            {segInfo.isLong && <Badge className="bg-red-500/10 text-red-400 border-0 text-[10px]">Mensagem longa!</Badge>}
          </DialogDescription>
        </DialogHeader>

        {editWhats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={labelCls}>Nome do template</span>
                <Input value={editWhats.name || ''} onChange={e => setEditWhats({ ...editWhats, name: e.target.value })} placeholder="ex: payment_confirmed" className={inpCls} />
              </div>
              <div>
                <span className={labelCls}>Categoria</span>
                <Select value={editWhats.category || 'transacional'} onValueChange={v => setEditWhats({ ...editWhats, category: v })}>
                  <SelectTrigger className={inpCls}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transacional">Transacional</SelectItem>
                    <SelectItem value="promocao">Promoção</SelectItem>
                    <SelectItem value="recuperacao">Recuperação</SelectItem>
                    <SelectItem value="pos_venda">Pós-venda</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editWhats.name && isEventDefault(editWhats.name) && (
              <div className="flex items-center gap-2 text-xs p-3 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.08)] border border-[hsl(var(--admin-accent-purple)/0.2)]">
                <Zap className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))]" />
                <span className="text-white">Vinculado ao evento <strong>"{SYSTEM_EVENTS.find(ev => ev.value === editWhats.name)?.label}"</strong></span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className={labelCls}>Mensagem</span>
                <Textarea
                  ref={bodyRef}
                  rows={12}
                  value={editWhats.content || ''}
                  onChange={e => setEditWhats({ ...editWhats, content: e.target.value })}
                  className={inpCls}
                  placeholder="*negrito*, _itálico_, ~riscado~"
                />
                <p className={`text-[10px] ${mutedText} mt-1.5`}>Formatação: *negrito* | _itálico_ | ~riscado~</p>
              </div>
              <div>
                <span className={labelCls}>Preview em tempo real</span>
                <div className="bg-[#0b141a] rounded-2xl overflow-hidden border border-white/5">
                  <div className="bg-[#202c33] px-4 py-2.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-400">PL</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Pincel de Luz</p>
                      <p className="text-[10px] text-[#8696a0]">online</p>
                    </div>
                  </div>
                  <div className="p-3 min-h-[200px] max-h-[300px] overflow-y-auto">
                    <div className="bg-[#005c4b] rounded-lg rounded-tr-none p-3 text-[13px] text-white whitespace-pre-wrap max-w-[90%] ml-auto shadow-sm leading-relaxed">
                      {replaceVariables(editWhats.content || '') || 'Digite sua mensagem...'}
                      <span className="block text-right text-[10px] text-white/40 mt-1.5">
                        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <VariableInserter onInsert={insertVar} />

            {unknownVars.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-xs text-red-300">Variáveis desconhecidas: <strong>{unknownVars.join(', ')}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))]">
              <Switch checked={editWhats.is_active ?? true} onCheckedChange={v => setEditWhats({ ...editWhats, is_active: v })} className="admin-switch-orange" />
              <div>
                <span className="text-sm font-medium text-white">Template ativo</span>
                <p className={`text-[11px] ${mutedText}`}>Templates inativos não são usados nas notificações automáticas</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white hover:bg-white/5" onClick={() => setEditWhats(null)}>
            Cancelar
          </Button>
          <Button onClick={onSave} className="admin-btn admin-btn-save">
            <Save className="h-4 w-4 mr-2" />Salvar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
