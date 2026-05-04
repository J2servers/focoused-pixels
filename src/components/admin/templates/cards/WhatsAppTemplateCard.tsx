import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import {
  Eye, Edit2, Send, Copy, Trash2, Mail, MessageSquare,
  Zap, Activity, AlertTriangle, Hash, ArrowRight,
} from 'lucide-react';
import {
  WhatsAppTemplate, ViewMode,
  detectVariables, getWhatsAppSegmentInfo, findUnknownVars, isEventDefault, isNew,
} from '../TemplateConstants';
import {
  ActionBar, EventLabel, nodeBase, statBadge, varBadge, type CardAction,
} from './cardPrimitives';

interface Props {
  t: WhatsAppTemplate; viewMode: ViewMode; isSelected: boolean;
  onSelect: () => void; templateStats: Record<string, number>; workflowLinks: Record<string, string[]>;
  onPreview: () => void; onEdit: () => void; onTestSend: () => void;
  onDuplicate: () => void; onCloneToEmail: () => void; onDelete: () => void;
  onToggle: (v: boolean) => void;
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  transacional: { label: 'Transacional', color: 'bg-cyan-500/10 text-cyan-400' },
  promocao: { label: 'Promoção', color: 'bg-amber-500/10 text-amber-400' },
  recuperacao: { label: 'Recuperação', color: 'bg-orange-500/10 text-orange-400' },
  pos_venda: { label: 'Pós-venda', color: 'bg-emerald-500/10 text-emerald-400' },
  custom: { label: 'Personalizado', color: 'bg-purple-500/10 text-purple-400' },
};

export function WhatsAppTemplateCard({
  t, viewMode, isSelected, onSelect, templateStats, workflowLinks,
  onPreview, onEdit, onTestSend, onDuplicate, onCloneToEmail, onDelete, onToggle,
}: Props) {
  const usageCount = templateStats[t.name] || 0;
  const linked = workflowLinks[t.id] || workflowLinks[t.name] || [];
  const segInfo = getWhatsAppSegmentInfo(t.content);
  const unknownVars = findUnknownVars(t.content);
  const isDefault = isEventDefault(t.name);
  const vars = detectVariables(t.content);
  const cat = CATEGORY_MAP[t.category] || CATEGORY_MAP.custom;

  const actions: CardAction[] = [
    { icon: Eye, label: 'Preview', onClick: onPreview },
    { icon: Edit2, label: 'Editar', onClick: onEdit },
    { icon: Send, label: 'Enviar teste', onClick: onTestSend },
    { icon: Copy, label: 'Duplicar', onClick: onDuplicate },
    { icon: Mail, label: 'Converter p/ E-mail', onClick: onCloneToEmail },
    { icon: Trash2, label: 'Excluir', onClick: onDelete, danger: true },
  ];

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
          ${isSelected
            ? 'bg-green-500/8 border-2 border-green-500/40 shadow-[0_0_20px_-5px_hsl(var(--admin-accent-green)/0.15)]'
            : 'bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))] hover:border-green-500/20 hover:bg-[hsl(var(--admin-card))]/80'
          }`}
        onClick={onEdit}
      >
        <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); onSelect(); }} className="rounded accent-green-500" />
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center shrink-0 border border-green-500/20">
          <MessageSquare className="h-4.5 w-4.5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white truncate">{t.name}</span>
            <Badge className={`${statBadge} ${cat.color}`}>{cat.label}</Badge>
            {isDefault && <EventLabel name={t.name} />}
          </div>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate mt-0.5">{t.content.slice(0, 80)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge className={`${statBadge} ${segInfo.isLong ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-[hsl(var(--admin-text-muted))]'}`}>
            <Hash className="h-2.5 w-2.5 mr-1" />{segInfo.length}c
          </Badge>
          {usageCount > 0 && (
            <Badge className={`${statBadge} bg-green-500/10 text-green-400`}><Activity className="h-2.5 w-2.5 mr-1" />{usageCount}</Badge>
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
          ? 'border-green-500/50 bg-green-500/5 shadow-[0_0_30px_-8px_hsl(var(--admin-accent-green)/0.2)]'
          : 'border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] hover:border-green-500/30 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]'
        }`}
      onClick={onEdit}
    >
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 border-2 border-[hsl(var(--admin-bg))] z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />

      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); onSelect(); }} className="rounded accent-green-500 shrink-0" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 flex items-center justify-center shrink-0 border border-green-500/20">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-0.5">WhatsApp</p>
              <p className="text-sm font-semibold text-white truncate">{t.name}</p>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Switch checked={t.is_active} onCheckedChange={onToggle} className="admin-switch-orange" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pl-[52px]">
          <Badge className={`${statBadge} ${cat.color}`}>{cat.label}</Badge>
          {isDefault && <EventLabel name={t.name} />}
          {isNew(t.created_at) && <AdminStatusBadge label="Novo" variant="success" />}
          {linked.length > 0 && (
            <Badge className={`${statBadge} bg-amber-500/10 text-amber-400`}>
              <Zap className="h-2.5 w-2.5 mr-1" />{linked.length} workflow{linked.length > 1 ? 's' : ''}
            </Badge>
          )}
          {usageCount > 0 && (
            <Badge className={`${statBadge} bg-green-500/10 text-green-400`}>
              <Activity className="h-2.5 w-2.5 mr-1" />{usageCount} envio{usageCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Badge className={`${statBadge} ${segInfo.isLong ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-[hsl(var(--admin-text-muted))]'}`}>
            <Hash className="h-2.5 w-2.5 mr-1" />{segInfo.length}c • {segInfo.segments} seg
          </Badge>
          {unknownVars.length > 0 && (
            <Badge className={`${statBadge} bg-red-500/10 text-red-400`}>
              <AlertTriangle className="h-2.5 w-2.5 mr-1" />var desconhecida
            </Badge>
          )}
        </div>

        {vars.length > 0 && (
          <div className="flex flex-wrap gap-1 pl-[52px]">
            {vars.slice(0, 5).map(v => (<Badge key={v} className={varBadge}>{v}</Badge>))}
            {vars.length > 5 && <Badge className={varBadge}>+{vars.length - 5}</Badge>}
          </div>
        )}

        <p className="text-[11px] text-[hsl(var(--admin-text-muted))] line-clamp-3 pl-[52px] whitespace-pre-wrap leading-relaxed">
          {t.content.slice(0, 160)}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
          <ActionBar actions={actions} />
          <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--admin-text-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>

      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 border-2 border-[hsl(var(--admin-bg))] z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
