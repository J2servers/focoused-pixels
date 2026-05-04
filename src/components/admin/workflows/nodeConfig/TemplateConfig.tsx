import { AlertTriangle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TemplateLite } from '@/hooks/useWorkflows';
import { Section, FieldLabel } from './primitives';

type NodeData = Record<string, unknown>;

interface Props {
  type: string;
  data: NodeData;
  templates: TemplateLite[];
  onUpdate: (p: NodeData) => void;
}

export function TemplateConfig({ type, data, templates, onUpdate }: Props) {
  const tpl = templates.find(t => t.id === (data.template_id as string));
  const content = type === 'send_email'
    ? (tpl?.body || '').replace(/<[^>]*>/g, '').slice(0, 500)
    : (tpl?.message_text || '').slice(0, 500);
  const vars = (content.match(/\{\{[^}]+\}\}/g) || []).filter((v, i, a) => a.indexOf(v) === i);

  return (
    <Section label="Template" hint={type === 'send_email' ? 'Selecione o template de e-mail a ser enviado.' : 'Selecione o template de WhatsApp a ser enviado.'}>
      <Select value={(data.template_id as string) || ''} onValueChange={v => {
        const t = templates.find(t => t.id === v);
        onUpdate({ template_id: v, template_name: t?.name || '' });
      }}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Selecione um template" /></SelectTrigger>
        <SelectContent>
          {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      {templates.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          <p className="text-[10px] text-yellow-400">Nenhum template encontrado. Crie na aba Templates.</p>
        </div>
      )}

      {data.template_id && !tpl && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <p className="text-[10px] text-red-400">Template não encontrado ou desativado</p>
        </div>
      )}

      {tpl && (
        <div className="space-y-3 mt-2">
          {type === 'send_email' && tpl.subject && (
            <div>
              <FieldLabel>Assunto</FieldLabel>
              <p className="text-xs text-white/80 font-medium">{tpl.subject}</p>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Eye className="h-3 w-3 text-white/30" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Preview</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 max-h-40 overflow-y-auto">
              <p className="text-[11px] whitespace-pre-wrap leading-relaxed text-white/40">{content}</p>
            </div>
          </div>
          {vars.length > 0 && (
            <div>
              <FieldLabel>Variáveis detectadas</FieldLabel>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {vars.map((v) => <Badge key={v} variant="secondary" className="text-[9px] font-mono bg-violet-500/10 text-violet-300 border-violet-500/20">{v}</Badge>)}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
