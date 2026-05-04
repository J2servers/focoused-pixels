import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Mail, MessageSquare, Sparkles } from 'lucide-react';
import {
  EmailTemplateCard,
  WhatsAppTemplateCard,
} from '@/components/admin/templates/TemplateCards';
import type {
  Channel,
  EmailTemplate,
  WhatsAppTemplate,
} from '@/components/admin/templates/TemplateConstants';

const cardCls = 'liquid-glass';
const mutedText = 'text-white/50';

interface SectionShellProps {
  variant: 'email' | 'whatsapp';
  count: number;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  loading: boolean;
  isEmpty: boolean;
  onInstallSuggested: () => void;
  children: React.ReactNode;
}

function SectionShell({
  variant, count, collapsed, setCollapsed, loading, isEmpty, onInstallSuggested, children,
}: SectionShellProps) {
  const isEmailVariant = variant === 'email';
  const Icon = isEmailVariant ? Mail : MessageSquare;
  const ringCls = isEmailVariant
    ? 'from-blue-500/20 to-blue-600/10 border-blue-500/20'
    : 'from-green-500/20 to-emerald-600/10 border-green-500/20';
  const iconCls = isEmailVariant ? 'text-blue-400' : 'text-green-400';
  const badgeCls = isEmailVariant ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400';
  const emptyIconCls = isEmailVariant ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400';
  const title = isEmailVariant ? 'Templates de E-mail' : 'Templates WhatsApp';
  const emptyMsg = isEmailVariant ? 'Nenhum template de e-mail' : 'Nenhum template WhatsApp';

  return (
    <section>
      <button
        className="flex items-center gap-3 w-full mb-3 group"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ringCls} flex items-center justify-center border`}>
          <Icon className={`h-4 w-4 ${iconCls}`} />
        </div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <Badge className={`${badgeCls} border-0 text-xs`}>{count}</Badge>
        <div className="flex-1" />
        {collapsed
          ? <ChevronDown className="h-4 w-4 text-white/50" />
          : <ChevronUp className="h-4 w-4 text-white/50" />}
      </button>

      {!collapsed && (loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white/[0.03] animate-pulse rounded-2xl border border-white/[0.08]" />
          ))}
        </div>
      ) : isEmpty ? (
        <Card className={`${cardCls} rounded-2xl`}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className={`w-16 h-16 rounded-2xl ${emptyIconCls} flex items-center justify-center mb-4`}>
              <Icon className={`h-8 w-8 ${iconCls}`} />
            </div>
            <p className="text-white font-semibold mb-1">{emptyMsg}</p>
            <p className={`text-sm ${mutedText} mb-4`}>Comece instalando os templates sugeridos</p>
            <Button onClick={onInstallSuggested} className="admin-btn admin-btn-save">
              <Sparkles className="h-4 w-4 mr-2" />Instalar templates padrão
            </Button>
          </CardContent>
        </Card>
      ) : children)}
    </section>
  );
}

interface EmailListProps {
  templates: EmailTemplate[];
  viewMode: 'grid' | 'list';
  selected: Set<string>;
  templateStats: Record<string, number>;
  workflowLinks: Record<string, string[]>;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  loading: boolean;
  onInstallSuggested: () => void;
  onSelect: (id: string) => void;
  onPreview: (t: EmailTemplate) => void;
  onEdit: (t: EmailTemplate) => void;
  onTestSend: (t: EmailTemplate) => void;
  onDuplicate: (t: EmailTemplate) => void;
  onCloneToWhats: (t: EmailTemplate) => void;
  onDelete: (t: EmailTemplate) => void;
  onToggle: (channel: Channel, id: string, v: boolean) => void;
}

export function EmailTemplatesSection(props: EmailListProps) {
  const {
    templates, viewMode, selected, templateStats, workflowLinks, collapsed, setCollapsed,
    loading, onInstallSuggested, onSelect, onPreview, onEdit, onTestSend, onDuplicate,
    onCloneToWhats, onDelete, onToggle,
  } = props;

  const wrapperCls = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
    : 'space-y-2';

  return (
    <SectionShell
      variant="email"
      count={templates.length}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      loading={loading}
      isEmpty={templates.length === 0}
      onInstallSuggested={onInstallSuggested}
    >
      <div className={wrapperCls}>
        {templates.map((t) => (
          <EmailTemplateCard
            key={t.id}
            t={t}
            viewMode={viewMode}
            isSelected={selected.has(t.id)}
            onSelect={() => onSelect(t.id)}
            templateStats={templateStats}
            workflowLinks={workflowLinks}
            onPreview={() => onPreview(t)}
            onEdit={() => onEdit(t)}
            onTestSend={() => onTestSend(t)}
            onDuplicate={() => onDuplicate(t)}
            onCloneToWhats={() => onCloneToWhats(t)}
            onDelete={() => onDelete(t)}
            onToggle={(v) => onToggle('email', t.id, v)}
          />
        ))}
      </div>
    </SectionShell>
  );
}

interface WhatsListProps {
  templates: WhatsAppTemplate[];
  viewMode: 'grid' | 'list';
  selected: Set<string>;
  templateStats: Record<string, number>;
  workflowLinks: Record<string, string[]>;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  loading: boolean;
  onInstallSuggested: () => void;
  onSelect: (id: string) => void;
  onPreview: (t: WhatsAppTemplate) => void;
  onEdit: (t: WhatsAppTemplate) => void;
  onTestSend: (t: WhatsAppTemplate) => void;
  onDuplicate: (t: WhatsAppTemplate) => void;
  onCloneToEmail: (t: WhatsAppTemplate) => void;
  onDelete: (t: WhatsAppTemplate) => void;
  onToggle: (channel: Channel, id: string, v: boolean) => void;
}

export function WhatsAppTemplatesSection(props: WhatsListProps) {
  const {
    templates, viewMode, selected, templateStats, workflowLinks, collapsed, setCollapsed,
    loading, onInstallSuggested, onSelect, onPreview, onEdit, onTestSend, onDuplicate,
    onCloneToEmail, onDelete, onToggle,
  } = props;

  const wrapperCls = viewMode === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
    : 'space-y-2';

  return (
    <SectionShell
      variant="whatsapp"
      count={templates.length}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      loading={loading}
      isEmpty={templates.length === 0}
      onInstallSuggested={onInstallSuggested}
    >
      <div className={wrapperCls}>
        {templates.map((t) => (
          <WhatsAppTemplateCard
            key={t.id}
            t={t}
            viewMode={viewMode}
            isSelected={selected.has(t.id)}
            onSelect={() => onSelect(t.id)}
            templateStats={templateStats}
            workflowLinks={workflowLinks}
            onPreview={() => onPreview(t)}
            onEdit={() => onEdit(t)}
            onTestSend={() => onTestSend(t)}
            onDuplicate={() => onDuplicate(t)}
            onCloneToEmail={() => onCloneToEmail(t)}
            onDelete={() => onDelete(t)}
            onToggle={(v) => onToggle('whatsapp', t.id, v)}
          />
        ))}
      </div>
    </SectionShell>
  );
}
