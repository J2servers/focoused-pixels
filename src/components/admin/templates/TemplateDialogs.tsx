import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Eye, Monitor, Smartphone, Keyboard, AlertTriangle, Zap, Send, TestTube2 } from 'lucide-react';
import {
  EmailTemplate, WhatsAppTemplate, Channel, SYSTEM_EVENTS, TEMPLATE_VARIABLES,
  replaceVariables, sanitizePreviewHtml, detectVariables, getWhatsAppSegmentInfo,
  countWords, findUnknownVars, isEventDefault, cardCls, inputCls, mutedText,
} from './TemplateConstants';

const dialogCardCls = "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))] text-white";

// ─── Email Editor Dialog ───
export function EmailEditorDialog({ editEmail, setEditEmail, onSave }: {
  editEmail: Partial<EmailTemplate> | null;
  setEditEmail: (v: Partial<EmailTemplate> | null) => void;
  onSave: () => void;
}) {
  const [splitView, setSplitView] = useState(false);
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);

  const insertVarAtCursor = (varKey: string) => {
    if (!editEmail) return;
    const el = emailBodyRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newBody = (editEmail.body || '').slice(0, start) + varKey + (editEmail.body || '').slice(end);
      setEditEmail({ ...editEmail, body: newBody });
      setTimeout(() => { el.focus(); el.setSelectionRange(start + varKey.length, start + varKey.length); }, 0);
    } else {
      setEditEmail({ ...editEmail, body: `${editEmail.body || ''} ${varKey}` });
    }
  };

  return (
    <Dialog open={!!editEmail} onOpenChange={() => setEditEmail(null)}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${dialogCardCls}`}>
        <DialogHeader>
          <DialogTitle className="text-white">{editEmail?.id ? 'Editar Template de E-mail' : 'Novo Template de E-mail'}</DialogTitle>
          <DialogDescription className={`flex items-center gap-2 text-xs ${mutedText}`}>
            <Keyboard className="h-3 w-3" /> Ctrl+S para salvar
            {editEmail?.body && <span>• {countWords(editEmail.body.replace(/<[^>]*>/g, ''))} palavras</span>}
            {editEmail?.body && findUnknownVars(editEmail.body).length > 0 && (
              <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2 w-2 mr-1" />{findUnknownVars(editEmail.body).join(', ')}</Badge>
            )}
          </DialogDescription>
        </DialogHeader>
        {editEmail && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={editEmail.name || ''} onChange={e => setEditEmail({ ...editEmail, name: e.target.value })} placeholder="Nome do template" className={inputCls} />
              <Input value={editEmail.subject || ''} onChange={e => setEditEmail({ ...editEmail, subject: e.target.value })} placeholder="Assunto do e-mail" className={inputCls} />
            </div>
            {editEmail.name && isEventDefault(editEmail.name) && (
              <div className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-[hsl(var(--admin-accent-purple)/0.1)] border border-[hsl(var(--admin-accent-purple)/0.2)] text-white">
                <Zap className="h-3 w-3 text-[hsl(var(--admin-accent-purple))]" />
                Vinculado ao evento "{SYSTEM_EVENTS.find(ev => ev.value === editEmail.name)?.label}"
              </div>
            )}
            <div className={splitView ? 'grid grid-cols-2 gap-3' : ''}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${mutedText}`}>Corpo (HTML)</span>
                  <Button size="sm" variant="ghost" className="text-white" onClick={() => setSplitView(!splitView)}>
                    {splitView ? <Monitor className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span className="ml-1 text-xs">{splitView ? 'Simples' : 'Split'}</span>
                  </Button>
                </div>
                <Textarea ref={emailBodyRef} rows={splitView ? 20 : 12} className={`font-mono text-xs ${inputCls}`} value={editEmail.body || ''} onChange={e => setEditEmail({ ...editEmail, body: e.target.value })} />
              </div>
              {splitView && (
                <div>
                  <span className={`text-xs font-medium mb-1 block ${mutedText}`}>Preview</span>
                  <div className="border rounded-lg p-3 max-h-[400px] overflow-y-auto bg-white text-black prose prose-sm" dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(replaceVariables(editEmail.body || '')) }} />
                </div>
              )}
            </div>
            <div>
              <span className={`text-xs font-medium mb-1 block ${mutedText}`}>Inserir variável:</span>
              <TooltipProvider>
                <div className="flex flex-wrap gap-1">
                  {TEMPLATE_VARIABLES.map(v => (
                    <Tooltip key={v.key}>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 border-[hsl(var(--admin-card-border))] text-white hover:bg-[hsl(var(--admin-sidebar-hover))]" onClick={() => insertVarAtCursor(v.key)}>{v.key}</Button>
                      </TooltipTrigger>
                      <TooltipContent><p>{v.desc}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={editEmail.is_active ?? true} onCheckedChange={v => setEditEmail({ ...editEmail, is_active: v })} />
              <span className="text-sm text-white">Ativo</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white" onClick={() => setEditEmail(null)}>Cancelar</Button>
          <Button onClick={onSave} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white"><Save className="h-4 w-4 mr-2" />Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── WhatsApp Editor Dialog ───
export function WhatsAppEditorDialog({ editWhats, setEditWhats, onSave }: {
  editWhats: Partial<WhatsAppTemplate> | null;
  setEditWhats: (v: Partial<WhatsAppTemplate> | null) => void;
  onSave: () => void;
}) {
  const whatsBodyRef = useRef<HTMLTextAreaElement>(null);

  const insertVarAtCursor = (varKey: string) => {
    if (!editWhats) return;
    const el = whatsBodyRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newContent = (editWhats.content || '').slice(0, start) + varKey + (editWhats.content || '').slice(end);
      setEditWhats({ ...editWhats, content: newContent });
      setTimeout(() => { el.focus(); el.setSelectionRange(start + varKey.length, start + varKey.length); }, 0);
    } else {
      setEditWhats({ ...editWhats, content: `${editWhats.content || ''} ${varKey}` });
    }
  };

  return (
    <Dialog open={!!editWhats} onOpenChange={() => setEditWhats(null)}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-y-auto ${dialogCardCls}`}>
        <DialogHeader>
          <DialogTitle className="text-white">{editWhats?.id ? 'Editar Template WhatsApp' : 'Novo Template WhatsApp'}</DialogTitle>
          <DialogDescription className={`flex items-center gap-2 text-xs ${mutedText}`}>
            <Keyboard className="h-3 w-3" /> Ctrl+S para salvar
            {editWhats?.content && (() => {
              const info = getWhatsAppSegmentInfo(editWhats.content);
              return (<><span>• {info.length} chars</span><span>• {countWords(editWhats.content)} palavras</span>{info.isLong && <Badge variant="destructive" className="text-[10px]">Longa!</Badge>}</>);
            })()}
          </DialogDescription>
        </DialogHeader>
        {editWhats && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={editWhats.name || ''} onChange={e => setEditWhats({ ...editWhats, name: e.target.value })} placeholder="Nome do template" className={inputCls} />
              <Select value={editWhats.category || 'transacional'} onValueChange={v => setEditWhats({ ...editWhats, category: v })}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="transacional">Transacional</SelectItem>
                  <SelectItem value="promocao">Promoção</SelectItem>
                  <SelectItem value="recuperacao">Recuperação</SelectItem>
                  <SelectItem value="pos_venda">Pós-venda</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editWhats.name && isEventDefault(editWhats.name) && (
              <div className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-[hsl(var(--admin-accent-purple)/0.1)] border border-[hsl(var(--admin-accent-purple)/0.2)] text-white">
                <Zap className="h-3 w-3 text-[hsl(var(--admin-accent-purple))]" />
                Vinculado ao evento "{SYSTEM_EVENTS.find(ev => ev.value === editWhats.name)?.label}"
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className={`text-xs font-medium mb-1 block ${mutedText}`}>Mensagem</span>
                <Textarea ref={whatsBodyRef} rows={10} value={editWhats.content || ''} onChange={e => setEditWhats({ ...editWhats, content: e.target.value })} className={inputCls} placeholder="*negrito*, _itálico_, ~riscado~" />
                <p className={`text-[10px] ${mutedText} mt-1`}>Formatação: *negrito* | _itálico_ | ~riscado~</p>
              </div>
              <div>
                <span className={`text-xs font-medium mb-1 block ${mutedText}`}>Preview</span>
                <div className="bg-[#0b141a] rounded-2xl p-3 max-h-[300px] overflow-y-auto">
                  <div className="bg-[#005c4b] rounded-lg p-3 text-[13px] text-white whitespace-pre-wrap max-w-[85%] ml-auto">
                    {replaceVariables(editWhats.content || '')}
                    <span className="block text-right text-[10px] text-white/50 mt-1">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                  </div>
                </div>
              </div>
            </div>
            <TooltipProvider>
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_VARIABLES.map(v => (
                  <Tooltip key={v.key}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="text-[11px] h-7 border-[hsl(var(--admin-card-border))] text-white hover:bg-[hsl(var(--admin-sidebar-hover))]" onClick={() => insertVarAtCursor(v.key)}>{v.key}</Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{v.desc}</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
            {editWhats.content && findUnknownVars(editWhats.content).length > 0 && (
              <Badge variant="destructive" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Variáveis desconhecidas: {findUnknownVars(editWhats.content).join(', ')}</Badge>
            )}
            <div className="flex items-center gap-3">
              <Switch checked={editWhats.is_active ?? true} onCheckedChange={v => setEditWhats({ ...editWhats, is_active: v })} />
              <span className="text-sm text-white">Ativo</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white" onClick={() => setEditWhats(null)}>Cancelar</Button>
          <Button onClick={onSave} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white"><Save className="h-4 w-4 mr-2" />Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Preview Dialog ───
export function PreviewDialog({ preview, setPreview }: {
  preview: { channel: Channel; title: string; content: string; subject?: string } | null;
  setPreview: (v: null) => void;
}) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  return (
    <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
      <DialogContent className={`max-w-3xl ${dialogCardCls}`}>
        <DialogHeader>
          <DialogTitle className="text-white">Preview: {preview?.title}</DialogTitle>
          {preview?.channel === 'email' && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant={device === 'desktop' ? 'default' : 'outline'} className={device !== 'desktop' ? 'border-[hsl(var(--admin-card-border))] text-white' : ''} onClick={() => setDevice('desktop')}><Monitor className="h-3 w-3 mr-1" />Desktop</Button>
              <Button size="sm" variant={device === 'mobile' ? 'default' : 'outline'} className={device !== 'mobile' ? 'border-[hsl(var(--admin-card-border))] text-white' : ''} onClick={() => setDevice('mobile')}><Smartphone className="h-3 w-3 mr-1" />Mobile</Button>
            </div>
          )}
        </DialogHeader>
        {preview && (preview.channel === 'email' ? (
          <div className="space-y-3">
            <div className="bg-[hsl(var(--admin-bg))] p-2.5 rounded-lg text-sm text-white"><strong>Assunto:</strong> {replaceVariables(preview.subject || '')}</div>
            <div className={`mx-auto border rounded-lg bg-white text-black overflow-hidden ${device === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}`}>
              <div className="p-4 max-h-[500px] overflow-y-auto prose prose-sm" dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(replaceVariables(preview.content)) }} />
            </div>
          </div>
        ) : (
          <div className="max-w-sm mx-auto">
            <div className="bg-[#0b141a] rounded-2xl overflow-hidden">
              <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2a3942]" />
                <div><p className="text-white text-sm font-medium">Pincel de Luz</p><p className="text-[11px] text-[#8696a0]">online</p></div>
              </div>
              <div className="p-3 min-h-[200px]">
                <div className="bg-[#005c4b] rounded-lg p-3 text-[13px] text-white whitespace-pre-wrap max-w-[85%] ml-auto shadow-sm">
                  {replaceVariables(preview.content)}
                  <span className="block text-right text-[10px] text-white/50 mt-1">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <DialogFooter><Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white" onClick={() => setPreview(null)}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation ───
export function DeleteTemplateDialog({ deleteTarget, setDeleteTarget, onConfirm }: {
  deleteTarget: { channel: Channel; id: string; name: string } | null;
  setDeleteTarget: (v: null) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
      <AlertDialogContent className={dialogCardCls}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Excluir template</AlertDialogTitle>
          <AlertDialogDescription className={mutedText}>
            Tem certeza que deseja excluir "<strong className="text-white">{deleteTarget?.name}</strong>"?
            {deleteTarget && isEventDefault(deleteTarget.name) && (
              <span className="block mt-2 text-amber-400 font-medium">⚠️ Vinculado a evento do sistema.</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[hsl(var(--admin-card-border))] text-white">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-500 text-white hover:bg-red-600">Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Test Send Dialog ───
export function TestSendDialog({ testSend, setTestSend, onSend, isSending }: {
  testSend: { channel: Channel; templateId: string; templateName: string } | null;
  setTestSend: (v: null) => void;
  onSend: (to: string) => void;
  isSending: boolean;
}) {
  const [to, setTo] = useState('');
  return (
    <Dialog open={!!testSend} onOpenChange={() => setTestSend(null)}>
      <DialogContent className={dialogCardCls}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white"><TestTube2 className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />Enviar teste: {testSend?.templateName}</DialogTitle>
          <DialogDescription className={mutedText}>
            {testSend?.channel === 'email' ? 'Informe o e-mail de destino' : 'Informe o telefone com DDD'}
          </DialogDescription>
        </DialogHeader>
        <Input value={to} onChange={e => setTo(e.target.value)} placeholder={testSend?.channel === 'email' ? 'email@exemplo.com' : '11999990000'} type={testSend?.channel === 'email' ? 'email' : 'tel'} className={inputCls} />
        <p className={`text-xs ${mutedText}`}>Variáveis serão substituídas por dados de exemplo.</p>
        <DialogFooter>
          <Button variant="outline" className="border-[hsl(var(--admin-card-border))] text-white" onClick={() => setTestSend(null)}>Cancelar</Button>
          <Button onClick={() => { onSend(to); setTo(''); }} disabled={isSending || !to} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
            {isSending ? 'Enviando...' : 'Enviar'}<Send className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
