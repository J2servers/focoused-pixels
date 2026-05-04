import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Monitor, Smartphone, Keyboard, AlertTriangle, Zap, Send, Code2, EyeIcon } from 'lucide-react';
import {
  EmailTemplate, SYSTEM_EVENTS, replaceVariables, sanitizePreviewHtml,
  countWords, findUnknownVars, isEventDefault,
} from '../TemplateConstants';
import { dlgCls, inpCls, mutedText, labelCls } from './styles';
import { VariableInserter } from './VariableInserter';

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

            {editEmail.name && isEventDefault(editEmail.name) && (
              <div className="flex items-center gap-2 text-xs p-3 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.08)] border border-[hsl(var(--admin-accent-purple)/0.2)]">
                <Zap className="h-3.5 w-3.5 text-[hsl(var(--admin-accent-purple))]" />
                <span className="text-white">Vinculado ao evento <strong>"{SYSTEM_EVENTS.find(ev => ev.value === editEmail.name)?.label}"</strong></span>
              </div>
            )}

            <Tabs value={editorTab} onValueChange={v => setEditorTab(v as 'code' | 'preview')}>
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

            <VariableInserter onInsert={insertVar} />

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))]">
              <Switch checked={editEmail.is_active ?? true} onCheckedChange={v => setEditEmail({ ...editEmail, is_active: v })} className="admin-switch-orange" />
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
