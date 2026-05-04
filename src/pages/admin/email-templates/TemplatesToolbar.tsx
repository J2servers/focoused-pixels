import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpDown, Filter, LayoutGrid, LayoutList, Mail, MessageSquare, Plus, Search, Trash2,
} from 'lucide-react';
import type { Channel } from '@/components/admin/templates/TemplateConstants';

const inputCls = 'liquid-input text-white';
const btnOutline = 'border-white/10 bg-transparent text-white hover:bg-white/[0.06] transition-colors';
const mutedText = 'text-white/50';

export type ChannelTab = 'all' | 'email' | 'whatsapp';
export type FilterStatus = 'all' | 'active' | 'inactive';
export type ViewMode = 'grid' | 'list';

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  channelTab: ChannelTab;
  setChannelTab: (v: ChannelTab) => void;
  filterStatus: FilterStatus;
  setFilterStatus: (v: FilterStatus) => void;
  sortAsc: boolean;
  setSortAsc: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onNewEmail: () => void;
  onNewWhats: () => void;
  selectedEmailsCount: number;
  selectedWhatsCount: number;
  onBulk: (channel: Channel, action: 'activate' | 'deactivate' | 'delete') => void;
}

export function TemplatesToolbar({
  searchQuery, setSearchQuery, channelTab, setChannelTab,
  filterStatus, setFilterStatus, sortAsc, setSortAsc, viewMode, setViewMode,
  onNewEmail, onNewWhats, selectedEmailsCount, selectedWhatsCount, onBulk,
}: Props) {
  const totalSelected = selectedEmailsCount + selectedWhatsCount;
  const showEmailBtn = channelTab === 'all' || channelTab === 'email';
  const showWhatsBtn = channelTab === 'all' || channelTab === 'whatsapp';

  return (
    <div className="rounded-2xl border p-4 liquid-glass">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${mutedText}`} />
          <Input
            placeholder="Buscar templates por nome, assunto ou conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-10 ${inputCls}`}
          />
        </div>

        <Tabs value={channelTab} onValueChange={(v) => setChannelTab(v as ChannelTab)}>
          <TabsList className="admin-tabs-vivid bg-white/[0.03] border border-white/[0.08] h-9">
            <TabsTrigger value="all" className="text-xs h-7 data-[state=active]:bg-purple-500/15 data-[state=active]:text-white">Todos</TabsTrigger>
            <TabsTrigger value="email" className="text-xs h-7 gap-1 data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-400">
              <Mail className="h-3 w-3" />E-mail
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-xs h-7 gap-1 data-[state=active]:bg-green-500/15 data-[state=active]:text-green-400">
              <MessageSquare className="h-3 w-3" />WhatsApp
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
          <SelectTrigger className={`w-[120px] h-9 ${inputCls}`}>
            <Filter className="h-3 w-3 mr-1.5" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className={`h-9 ${btnOutline}`} onClick={() => setSortAsc(!sortAsc)}>
          <ArrowUpDown className="h-3 w-3 mr-1.5" />{sortAsc ? 'A→Z' : 'Z→A'}
        </Button>

        <div className="flex border rounded-lg overflow-hidden border-white/[0.08]">
          <Button variant="ghost" size="sm"
            className={`h-9 rounded-none px-2.5 ${viewMode === 'grid' ? 'bg-purple-500/15 text-white' : 'text-white/50 hover:text-white'}`}
            onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm"
            className={`h-9 rounded-none px-2.5 ${viewMode === 'list' ? 'bg-purple-500/15 text-white' : 'text-white/50 hover:text-white'}`}
            onClick={() => setViewMode('list')}>
            <LayoutList className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="ml-auto flex gap-2">
          {showEmailBtn && (
            <Button onClick={onNewEmail} className="admin-btn admin-btn-create h-9">
              <Plus className="h-4 w-4 mr-1.5" />Novo E-mail
            </Button>
          )}
          {showWhatsBtn && (
            <Button onClick={onNewWhats} className="admin-btn admin-btn-create h-9">
              <Plus className="h-4 w-4 mr-1.5" />Novo WhatsApp
            </Button>
          )}
        </div>
      </div>

      {totalSelected > 0 && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
          <Badge className="bg-purple-500/15 text-purple-400 border-0">
            {totalSelected} selecionado{totalSelected > 1 ? 's' : ''}
          </Badge>
          {selectedEmailsCount > 0 && (
            <>
              <Button className="admin-btn admin-btn-save !min-h-0 !py-1 !px-3 text-xs" onClick={() => onBulk('email', 'activate')}>Ativar</Button>
              <Button className="admin-btn admin-btn-edit !min-h-0 !py-1 !px-3 text-xs" onClick={() => onBulk('email', 'deactivate')}>Desativar</Button>
              <Button className="admin-btn admin-btn-delete !min-h-0 !py-1 !px-3 text-xs" onClick={() => onBulk('email', 'delete')}>
                <Trash2 className="h-3 w-3 mr-1" />Deletar
              </Button>
            </>
          )}
          {selectedWhatsCount > 0 && (
            <>
              <div className="w-px h-4 bg-white/10" />
              <Button className="admin-btn admin-btn-save !min-h-0 !py-1 !px-3 text-xs" onClick={() => onBulk('whatsapp', 'activate')}>Ativar WA</Button>
              <Button className="admin-btn admin-btn-delete !min-h-0 !py-1 !px-3 text-xs" onClick={() => onBulk('whatsapp', 'delete')}>
                <Trash2 className="h-3 w-3 mr-1" />Deletar WA
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
