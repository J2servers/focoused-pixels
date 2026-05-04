import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Send, TestTube2, Loader2 } from 'lucide-react';
import { Channel } from '../TemplateConstants';
import { dlgClsSm, inpCls, mutedText, labelCls } from './styles';

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
