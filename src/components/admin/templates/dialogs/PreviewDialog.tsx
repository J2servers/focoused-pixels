import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Monitor, Smartphone } from 'lucide-react';
import { Channel, replaceVariables, sanitizePreviewHtml } from '../TemplateConstants';
import { dlgCls, mutedText } from './styles';

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
