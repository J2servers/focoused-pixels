import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save, Eye, Monitor, Smartphone, Keyboard, AlertTriangle,
  Zap, Send, TestTube2, Code2, EyeIcon, Loader2,
} from 'lucide-react';
import {
  EmailTemplate, WhatsAppTemplate, Channel, SYSTEM_EVENTS, TEMPLATE_VARIABLES,
  replaceVariables, sanitizePreviewHtml, detectVariables, getWhatsAppSegmentInfo,
  countWords, findUnknownVars, isEventDefault,
} from './TemplateConstants';

/* ─── Shared styles ─── */
const dlgCls = "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white sm:max-w-4xl";
const dlgClsSm = "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white sm:max-w-lg";
const inpCls = "bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))] focus:border-[hsl(var(--admin-accent-purple))] focus:ring-1 focus:ring-[hsl(var(--admin-accent-purple)/0.3)]";
const mutedText = "text-[hsl(var(--admin-text-muted))]";
const labelCls = "text-xs font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] mb-1.5 block";
const varBtn = "text-[10px] h-6 px-2 border-white/10 text-[hsl(var(--admin-text-muted))] hover:text-white hover:bg-white/5 font-mono transition-colors";

/* ─── Variable Inserter ─── */
function VariableInserter({ onInsert }: { onInsert: (key: string) => void }) {
  return (
    <div>
      <span className={labelCls}>Variáveis disponíveis</span>
      <TooltipProvider delayDuration={100}>
        <div className="flex flex-wrap gap-1">
          {TEMPLATE_VARIABLES.map(v => (
            <Tooltip key={v.key}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className={varBtn} onClick={() => onInsert(v.key)}>
                  {v.key}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{v.desc}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EMAIL EDITOR DIALOG
   ═══════════════════════════════════════════════════ */
export function EmailEditorDialog({ editEmail, setEditEmail, onSave }: {
  editEmail: Partial<EmailTemplate> | null;
  setEditEmail: (v: Partial<EmailTemplate> | null) => void;
  onSave: () => void;
}) {
  const [editorTab, setEditorTab] = useState<'code' | 'preview'>('code');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertVar = useCallback((key: string) => {
    if (!editEmail) return;
    const el = bodyRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newBody = (editEmail.body || '').slice(0, start) + key + (editEmail.body || '').slice(end);
      setEditEmail({ ...editEmail, body: newBody });
      setTimeout(() => { el.focus(); el.setSelectionRange(start + key.length, start + key.length); }, 0);
    } else {
      setEditEmail({ ...editEmail, body: `${editEmail.body || ''}${key}` });
    }
  }, [editEmail, setEditEmail]);

  const unknownVars = editEmail?.body ? findUnknownVars(editEmail.body + ' ' + (editEmail.subject || '')) : [];
  const wordCount = editEmail?.body ? countWords(editEmail.body.replace(/<[^>]*>/g, '')) : 0;

  return (
    <Dialog open={!!editEmail} onOpenChange={() => setEditEmail(null)}>
      <DialogContent className={`${dlgCls} max-h-[92vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20">
              <Send className="h-4 w-4 text-blue-400" />
            </div>
            {editEmail?.id ? 'Editar Template de E-mail' : 'Novo Template de E-mail'}
          </DialogTitle>
          <DialogDescription className={`flex items-center gap-3 text-xs ${mutedText}`}>
            <span className="flex items-center gap-1"><Keyboard className="h-3 w-3" />Ctrl+S salvar</span>
            {wordCount > 0 && <span>• {wordCount} palavras</span>}
            {unknownVars.length > 0 && (
              <Badge className="bg-red-500/10 text-red-400 border-0 text-[10px]">
                <AlertTriangle className="h-2.5 w-2.5 mr-1" />{unknownVars.join(', ')}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {editEmail && (
          <div className="space-y-4">
            {/* Name + Subject */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={labelCls}>Nome do template</span>
                <Input value={editEmail.name || ''} onChange={e => setEditEmail({ ...editEmail, name: e.target.value })} placeholder="ex: payment_confirmed" className={inpCls} />
              </div>
              <div>
                <span className={labelCls}>Assunto do e-mail</span>
                <Input value={editEmail.subject || ''} onChange={e => setEditEmail({ ...editEmail, subject: e.target.value })} placeholder="ex: ✅ Pagamento Confirmado" className={inpCls} />
              </div>
            </div>

            {/* Event link */}
            {editEmail.name && isEventDefault(editEmail.name) && (
              <div className="flex items-center gap-2 text-xs p-3 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.08)] border border-[hsl(var(--admin-accent-purple)/0.2)]">
                <Zap className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))]" />
                <span className="text-white">Vinculado ao evento <strong>"{SYSTEM_EVENTS.find(ev => ev.value === editEmail.name)?.label}"</strong></span>
              </div>
            )}

            {/* Editor with tabs */}
            <Tabs value={editorTab} onValueChange={v => setEditorTab(v as any)}>
              <div className="flex items-center justify-between">
                <TabsList className="bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))]">
                  <TabsTrigger value="code" className="text-xs gap-1.5 data-[state=active]:bg-[hsl(var(--admin-accent-purple)/0.15)] data-[state=active]:text-white">
                    <Code2 className="h-3 w-3" />Código HTML
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs gap-1.5 data-[state=active]:bg-[hsl(var(--admin-accent-purple)/0.15)] data-[state=active]:text-white">
                    <EyeIcon className="h-3 w-3" />Preview
                  </TabsTrigger>
                </TabsList>
                {editorTab === 'preview' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant={previewDevice === 'desktop' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setPreviewDevice('desktop')}>
                      <Monitor className="h-3 w-3 mr-1" />Desktop
                    </Button>
                    <Button size="sm" variant={previewDevice === 'mobile' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setPreviewDevice('mobile')}>
                      <Smartphone className="h-3 w-3 mr-1" />Mobile
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="code" className="mt-3">
                <Textarea
                  ref={bodyRef}
                  rows={16}
                  className={`font-mono text-xs leading-relaxed ${inpCls}`}
                  value={editEmail.body || ''}
                  onChange={e => setEditEmail({ ...editEmail, body: e.target.value })}
                  placeholder="<div>Seu HTML aqui...</div>"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-3">
                <div className={`mx-auto border border-[hsl(var(--admin-card-border))] rounded-xl bg-white text-black overflow-hidden transition-all ${previewDevice === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}`}>
                  <div className="bg-gray-100 px-4 py-2 text-xs text-gray-500 border-b">
                    <strong>Assunto:</strong> {replaceVariables(editEmail.subject || '')}
                  </div>
                  <div
                    className="p-4 max-h-[400px] overflow-y-auto prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(replaceVariables(editEmail.body || '')) }}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Variable inserter */}
            <VariableInserter onInsert={insertVar} />

            {/* Active toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))]">
              <Switch checked={editEmail.is_active ?? true} onCheckedChange={v => setEditEmail({ ...editEmail, is_active: v })} />
              <div>
                <span className="text-sm font-medium text-white">Template ativo</span>
                <p className={`text-[11px] ${mutedText}`}>Templates inativos não são usados nas notificações automáticas</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white hover:bg-white/5" onClick={() => setEditEmail(null)}>
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

/* ═══════════════════════════════════════════════════
   WHATSAPP EDITOR DIALOG
   ═══════════════════════════════════════════════════ */
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
            {/* Name + Category */}
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

            {/* Event link */}
            {editWhats.name && isEventDefault(editWhats.name) && (
              <div className="flex items-center gap-2 text-xs p-3 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.08)] border border-[hsl(var(--admin-accent-purple)/0.2)]">
                <Zap className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))]" />
                <span className="text-white">Vinculado ao evento <strong>"{SYSTEM_EVENTS.find(ev => ev.value === editWhats.name)?.label}"</strong></span>
              </div>
            )}

            {/* Split editor + preview */}
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
                  {/* WhatsApp header */}
                  <div className="bg-[#202c33] px-4 py-2.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-400">PL</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Pincel de Luz</p>
                      <p className="text-[10px] text-[#8696a0]">online</p>
                    </div>
                  </div>
                  {/* Message bubble */}
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

            {/* Variable inserter */}
            <VariableInserter onInsert={insertVar} />

            {/* Unknown vars warning */}
            {unknownVars.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span className="text-xs text-red-300">Variáveis desconhecidas: <strong>{unknownVars.join(', ')}</strong></span>
              </div>
            )}

            {/* Active toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))]">
              <Switch checked={editWhats.is_active ?? true} onCheckedChange={v => setEditWhats({ ...editWhats, is_active: v })} />
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

/* ═══════════════════════════════════════════════════
   PREVIEW DIALOG
   ═══════════════════════════════════════════════════ */
export function PreviewDialog({ preview, setPreview }: {
  preview: { channel: Channel; title: string; content: string; subject?: string } | null;
  setPreview: (v: null) => void;
}) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
      <DialogContent className={`${dlgCls} max-h-[90vh]`}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Eye className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />
            Preview: {preview?.title}
          </DialogTitle>
          {preview?.channel === 'email' && (
            <div className="flex gap-1.5 mt-2">
              <Button size="sm" variant={device === 'desktop' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setDevice('desktop')}>
                <Monitor className="h-3 w-3 mr-1" />Desktop
              </Button>
              <Button size="sm" variant={device === 'mobile' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setDevice('mobile')}>
                <Smartphone className="h-3 w-3 mr-1" />Mobile
              </Button>
            </div>
          )}
        </DialogHeader>

        {preview && (preview.channel === 'email' ? (
          <div className="space-y-3">
            <div className="bg-[hsl(var(--admin-bg))] p-3 rounded-xl text-sm">
              <span className={mutedText}>Assunto: </span>
              <span className="text-white font-medium">{replaceVariables(preview.subject || '')}</span>
            </div>
            <div className={`mx-auto border border-[hsl(var(--admin-card-border))] rounded-xl bg-white text-black overflow-hidden transition-all ${device === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}`}>
              <div className="p-4 max-h-[500px] overflow-y-auto prose prose-sm" dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(replaceVariables(preview.content)) }} />
            </div>
          </div>
        ) : (
          <div className="max-w-sm mx-auto">
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
              <div className="p-3 min-h-[200px]">
                <div className="bg-[#005c4b] rounded-lg rounded-tr-none p-3 text-[13px] text-white whitespace-pre-wrap max-w-[85%] ml-auto shadow-sm leading-relaxed">
                  {replaceVariables(preview.content)}
                  <span className="block text-right text-[10px] text-white/40 mt-1.5">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <DialogFooter>
          <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white hover:bg-white/5" onClick={() => setPreview(null)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════════
   DELETE CONFIRMATION
   ═══════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════
   TEST SEND DIALOG
   ═══════════════════════════════════════════════════ */
export function TestSendDialog({ testSend, setTestSend, onSend, isSending }: {
  testSend: { channel: Channel; templateId: string; templateName: string } | null;
  setTestSend: (v: null) => void;
  onSend: (to: string) => void;
  isSending: boolean;
}) {
  const [to, setTo] = useState('');

  return (
    <Dialog open={!!testSend} onOpenChange={() => { setTestSend(null); setTo(''); }}>
      <DialogContent className={dlgClsSm}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${testSend?.channel === 'email' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
              <TestTube2 className={`h-4 w-4 ${testSend?.channel === 'email' ? 'text-blue-400' : 'text-green-400'}`} />
            </div>
            Enviar teste
          </DialogTitle>
          <DialogDescription className={mutedText}>
            Template: <strong className="text-white">{testSend?.templateName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <span className={labelCls}>{testSend?.channel === 'email' ? 'E-mail de destino' : 'Telefone com DDD'}</span>
            <Input
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder={testSend?.channel === 'email' ? 'teste@email.com' : '(11) 99999-0000'}
              className={inpCls}
              onKeyDown={e => e.key === 'Enter' && !isSending && onSend(to)}
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <p className={`text-[11px] ${mutedText}`}>
              Variáveis serão substituídas por dados de exemplo. O envio é marcado como <strong className="text-amber-400">[TESTE]</strong>.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white hover:bg-white/5" onClick={() => { setTestSend(null); setTo(''); }}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSend(to)}
            disabled={isSending || !to.trim()}
            className="admin-btn admin-btn-save"
          >
            {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {isSending ? 'Enviando...' : 'Enviar teste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
