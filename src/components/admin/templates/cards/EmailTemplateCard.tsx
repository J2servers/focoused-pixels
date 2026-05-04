import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import {
  Eye, Edit2, Send, Copy, Trash2, Mail, MessageSquare,
  Zap, Activity, AlertTriangle, ArrowRight,
} from 'lucide-react';
import {
  EmailTemplate, ViewMode,
  detectVariables, findUnknownVars, isEventDefault, isNew,
} from '../TemplateConstants';
import {
  ActionBar, EventLabel, nodeBase, statBadge, varBadge, type CardAction,
} from './cardPrimitives';

interface Props {
  t: EmailTemplate; viewMode: ViewMode; isSelected: boolean;
  onSelect: () => void; templateStats: Record<string, number>; workflowLinks: Record<string, string[]>;
  onPreview: () => void; onEdit: () => void; onTestSend: () => void;
  onDuplicate: () => void; onCloneToWhats: () => void; onDelete: () => void;
  onToggle: (v: boolean) => void;
}

export function EmailTemplateCard({
  t, viewMode, isSelected, onSelect, templateStats, workflowLinks,
  onPreview, onEdit, onTestSend, onDuplicate, onCloneToWhats, onDelete, onToggle,
}: Props) {
  const usageCount = templateStats[t.name] || 0;
  const linked = workflowLinks[t.id] || workflowLinks[t.name] || [];
  const unknownVars = findUnknownVars(t.body + ' ' + t.subject);
  const isDefault = isEventDefault(t.name);
  const vars = detectVariables(t.body);

  const actions: CardAction[] = [
    { icon: Eye, label: 'Preview', onClick: onPreview },
    { icon: Edit2, label: 'Editar', onClick: onEdit },
    { icon: Send, label: 'Enviar teste', onClick: onTestSend },
    { icon: Copy, label: 'Duplicar', onClick: onDuplicate },
    { icon: MessageSquare, label: 'Converter p/ WhatsApp', onClick: onCloneToWhats },
    { icon: Trash2, label: 'Excluir', onClick: onDelete, danger: true },
  ];

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
          ${isSelected
            ? 'bg-blue-500/8 border-2 border-blue-500/40 shadow-[0_0_20px_-5px_hsl(var(--admin-accent-blue)/0.15)]'
            : 'bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] hover:border-blue-500/20 hover:bg-[hsl(var(--admin-card))]/80'
          }`}
        onClick={onEdit}
      >
        <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); onSelect(); }} className="rounded accent-blue-500" />
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20">
          <Mail className="h-4.5 w-4.5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white truncate">{t.name}</span>
            {isDefault && <EventLabel name={t.name} />}
            {isNew(t.created_at) && <AdminStatusBadge label="Novo" variant="success" />}
          </div>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate mt-0.5">{t.subject}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {linked.length > 0 && (
            <Badge className={`${statBadge} bg-amber-500/10 text-amber-400`}><Zap className="h-2.5 w-2.5 mr-1" />{linked.length}</Badge>
          )}
          {usageCount > 0 && (
            <Badge className={`${statBadge} bg-blue-500/10 text-blue-400`}><Activity className="h-2.5 w-2.5 mr-1" />{usageCount}</Badge>
          )}
          <Switch checked={t.is_active} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} className="admin-switch-orange" />
          <div onClick={(e) => e.stopPropagation()}>
            <ActionBar actions={actions} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`${nodeBase} cursor-pointer
        ${isSelected
          ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_30px_-8px_hsl(var(--admin-accent-blue)/0.2)]'
          : 'border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] hover:border-blue-500/30 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]'
        }`}
      onClick={onEdit}
    >
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-[hsl(var(--admin-bg))] z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />

      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); onSelect(); }} className="rounded accent-blue-500 shrink-0" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">E-mail</p>
              <p className="text-sm font-semibold text-white truncate">{t.name}</p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={t.is_active} onCheckedChange={onToggle} className="admin-switch-orange" />
          </div>
        </div>

        <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate pl-[52px]">{t.subject}</p>

        <div className="flex flex-wrap gap-1.5 pl-[52px]">
          {isDefault && <EventLabel name={t.name} />}
          {isNew(t.created_at) && <AdminStatusBadge label="Novo" variant="success" />}
          {linked.length > 0 && (
            <Badge className={`${statBadge} bg-amber-500/10 text-amber-400`}>
              <Zap className="h-2.5 w-2.5 mr-1" />{linked.length} workflow{linked.length > 1 ? 's' : ''}
            </Badge>
          )}
          {usageCount > 0 && (
            <Badge className={`${statBadge} bg-blue-500/10 text-blue-400`}>
              <Activity className="h-2.5 w-2.5 mr-1" />{usageCount} envio{usageCount > 1 ? 's' : ''}
            </Badge>
          )}
          {unknownVars.length > 0 && (
            <Badge className={`${statBadge} bg-red-500/10 text-red-400`}>
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />{unknownVars.length} var desconhecida
            </Badge>
          )}
        </div>

        {vars.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-[52px]">
            {vars.slice(0, 5).map(v => (<Badge key={v} className={varBadge}>{v}</Badge>))}
            {vars.length > 5 && <Badge className={varBadge}>+{vars.length - 5}</Badge>}
          </div>
        )}

        <p className="text-[11px] text-[hsl(var(--admin-text-muted))] line-clamp-2 pl-[52px] leading-relaxed">
          {t.body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 140)}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
          <ActionBar actions={actions} />
          <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--admin-text-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>

      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 border-2 border-[hsl(var(--admin-bg))] z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
