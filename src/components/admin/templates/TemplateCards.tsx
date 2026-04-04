import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Eye, Edit2, Send, Copy, Trash2, Mail, MessageSquare, Zap, Activity, AlertTriangle, Hash } from 'lucide-react';
import {
  EmailTemplate, WhatsAppTemplate, Channel, ViewMode, SYSTEM_EVENTS,
  detectVariables, getWhatsAppSegmentInfo, findUnknownVars, isEventDefault, isNew,
  cardCls, mutedText,
} from './TemplateConstants';

const itemBg = "bg-[hsl(var(--admin-bg)/0.5)] border border-[hsl(var(--admin-card-border))] hover:border-[hsl(var(--admin-accent-purple)/0.3)]";
const btnGhost = "text-white hover:bg-[hsl(var(--admin-sidebar-hover))]";

// ─── Email Card ───
export function EmailTemplateCard({ t, viewMode, isSelected, onSelect, templateStats, workflowLinks, onPreview, onEdit, onTestSend, onDuplicate, onCloneToWhats, onDelete, onToggle }: {
  t: EmailTemplate; viewMode: ViewMode; isSelected: boolean;
  onSelect: () => void; templateStats: Record<string, number>; workflowLinks: Record<string, string[]>;
  onPreview: () => void; onEdit: () => void; onTestSend: () => void; onDuplicate: () => void; onCloneToWhats: () => void; onDelete: () => void; onToggle: (v: boolean) => void;
}) {
  const usageCount = templateStats[t.name] || 0;
  const linked = workflowLinks[t.id] || workflowLinks[t.name] || [];
  const unknownVars = findUnknownVars(t.body + ' ' + t.subject);
  const isDefault = isEventDefault(t.name);

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isSelected ? 'bg-[hsl(var(--admin-accent-purple)/0.1)] border border-[hsl(var(--admin-accent-purple))]' : itemBg}`}>
        <input type="checkbox" checked={isSelected} onChange={onSelect} className="rounded" />
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0"><Mail className="h-4 w-4 text-blue-400" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white truncate">{t.name}</span>
            {isDefault && <AdminStatusBadge label="Evento" variant="purple" />}
            {isNew(t.created_at) && <AdminStatusBadge label="Novo" variant="success" />}
            {linked.length > 0 && <Badge variant="secondary" className="text-[10px]"><Zap className="h-2 w-2 mr-1" />{linked.length}</Badge>}
          </div>
          <p className={`text-xs ${mutedText} truncate`}>{t.subject}</p>
        </div>
        {usageCount > 0 && <Badge className="bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))] border-0 text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount}</Badge>}
        <Switch checked={t.is_active} onCheckedChange={onToggle} />
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onPreview}><Eye className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onEdit}><Edit2 className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onTestSend}><Send className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onDuplicate}><Copy className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${cardCls} transition-all hover:border-[hsl(var(--admin-accent-purple)/0.3)] ${isSelected ? 'ring-2 ring-[hsl(var(--admin-accent-purple))]' : ''}`}>
      <CardHeader className="pb-2 p-4">
        <div className="flex justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <input type="checkbox" checked={isSelected} onChange={onSelect} className="rounded" />
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0"><Mail className="h-4 w-4 text-blue-400" /></div>
            <div className="min-w-0">
              <CardTitle className="text-sm text-white truncate">{t.name}</CardTitle>
              <p className={`text-xs ${mutedText} truncate`}>{t.subject}</p>
            </div>
          </div>
          <Switch checked={t.is_active} onCheckedChange={onToggle} />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {isDefault && <AdminStatusBadge label={`${SYSTEM_EVENTS.find(ev => ev.value === t.name)?.icon} Evento`} variant="purple" />}
          {isNew(t.created_at) && <AdminStatusBadge label="Novo" variant="success" />}
          {linked.length > 0 && <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px]"><Zap className="h-2 w-2 mr-1" />{linked.length} workflow</Badge>}
          {usageCount > 0 && <Badge className="bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))] border-0 text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount} envios</Badge>}
          {unknownVars.length > 0 && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2 w-2 mr-1" />{unknownVars.length} var</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <p className={`text-xs ${mutedText} line-clamp-2`}>{t.body.replace(/<[^>]*>/g, '').slice(0, 120)}</p>
        <div className="flex flex-wrap gap-1">{detectVariables(t.body).slice(0, 4).map(v => <Badge key={v} className="bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] border-0 text-[10px]">{v}</Badge>)}</div>
        <div className="flex flex-wrap gap-1 pt-2 border-t border-[hsl(var(--admin-card-border))]">
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onPreview}><Eye className="h-3 w-3 mr-1" />Preview</Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onEdit}><Edit2 className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onTestSend}><Send className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onDuplicate}><Copy className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onCloneToWhats}><MessageSquare className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── WhatsApp Card ───
export function WhatsAppTemplateCard({ t, viewMode, isSelected, onSelect, templateStats, workflowLinks, onPreview, onEdit, onTestSend, onDuplicate, onCloneToEmail, onDelete, onToggle }: {
  t: WhatsAppTemplate; viewMode: ViewMode; isSelected: boolean;
  onSelect: () => void; templateStats: Record<string, number>; workflowLinks: Record<string, string[]>;
  onPreview: () => void; onEdit: () => void; onTestSend: () => void; onDuplicate: () => void; onCloneToEmail: () => void; onDelete: () => void; onToggle: (v: boolean) => void;
}) {
  const usageCount = templateStats[t.name] || 0;
  const linked = workflowLinks[t.id] || workflowLinks[t.name] || [];
  const segInfo = getWhatsAppSegmentInfo(t.content);
  const unknownVars = findUnknownVars(t.content);
  const isDefault = isEventDefault(t.name);

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isSelected ? 'bg-[hsl(var(--admin-accent-purple)/0.1)] border border-[hsl(var(--admin-accent-purple))]' : itemBg}`}>
        <input type="checkbox" checked={isSelected} onChange={onSelect} className="rounded" />
        <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0"><MessageSquare className="h-4 w-4 text-green-400" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white truncate">{t.name}</span>
            <AdminStatusBadge label={t.category} variant="info" />
            {isDefault && <AdminStatusBadge label="Evento" variant="purple" />}
            {segInfo.isLong && <AdminStatusBadge label={`${segInfo.length}c`} variant="danger" />}
          </div>
          <p className={`text-xs ${mutedText} truncate`}>{t.content.slice(0, 80)}</p>
        </div>
        {usageCount > 0 && <Badge className="bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))] border-0 text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount}</Badge>}
        <Switch checked={t.is_active} onCheckedChange={onToggle} />
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onPreview}><Eye className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onEdit}><Edit2 className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onTestSend}><Send className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className={`h-8 w-8 ${btnGhost}`} onClick={onDuplicate}><Copy className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={`${cardCls} transition-all hover:border-[hsl(var(--admin-accent-purple)/0.3)] ${isSelected ? 'ring-2 ring-[hsl(var(--admin-accent-purple))]' : ''}`}>
      <CardHeader className="pb-2 p-4">
        <div className="flex justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <input type="checkbox" checked={isSelected} onChange={onSelect} className="rounded" />
            <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0"><MessageSquare className="h-4 w-4 text-green-400" /></div>
            <div className="min-w-0">
              <CardTitle className="text-sm text-white truncate">{t.name}</CardTitle>
              <AdminStatusBadge label={t.category} variant="info" className="mt-1" />
            </div>
          </div>
          <Switch checked={t.is_active} onCheckedChange={onToggle} />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {isDefault && <AdminStatusBadge label={`${SYSTEM_EVENTS.find(ev => ev.value === t.name)?.icon} Evento`} variant="purple" />}
          {isNew(t.created_at) && <AdminStatusBadge label="Novo" variant="success" />}
          {linked.length > 0 && <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px]"><Zap className="h-2 w-2 mr-1" />{linked.length} workflow</Badge>}
          {usageCount > 0 && <Badge className="bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))] border-0 text-[10px]"><Activity className="h-3 w-3 mr-1" />{usageCount} envios</Badge>}
          <Badge className={`${segInfo.isLong ? 'bg-red-500/15 text-red-400' : 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))]'} border-0 text-[10px]`}><Hash className="h-2 w-2 mr-1" />{segInfo.length}c</Badge>
          {unknownVars.length > 0 && <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2 w-2 mr-1" />var</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <p className={`text-xs ${mutedText} line-clamp-3 whitespace-pre-wrap`}>{t.content.slice(0, 160)}</p>
        <div className="flex flex-wrap gap-1">{detectVariables(t.content).slice(0, 4).map(v => <Badge key={v} className="bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] border-0 text-[10px]">{v}</Badge>)}</div>
        <div className="flex flex-wrap gap-1 pt-2 border-t border-[hsl(var(--admin-card-border))]">
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onPreview}><Eye className="h-3 w-3 mr-1" />Preview</Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onEdit}><Edit2 className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onTestSend}><Send className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onDuplicate}><Copy className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className={btnGhost} onClick={onCloneToEmail}><Mail className="h-3 w-3" /></Button>
          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={onDelete}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
