import { useState } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Trash2, Loader2, Save, X, ImageIcon, FolderOpen, Folder, Layers, Eye, Hash, Link2,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useAdminCategoriesAll, useCreateCategory, useUpdateCategory, useDeleteCategory,
  type Category, type CategoryFormData,
} from '@/hooks/useAdminCategories';

const generateSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* ═══ Vivid helpers ═══ */
const SECTION_COLORS = {
  cyan: { border: 'border-[hsl(var(--admin-accent-cyan)/0.2)]', headerBg: 'bg-[hsl(var(--admin-accent-cyan)/0.06)]', text: 'text-[hsl(var(--admin-accent-cyan))]', glow: 'shadow-[0_0_10px_hsl(var(--admin-accent-cyan)/0.08)]' },
  purple: { border: 'border-[hsl(var(--admin-accent-purple)/0.2)]', headerBg: 'bg-[hsl(var(--admin-accent-purple)/0.06)]', text: 'text-[hsl(var(--admin-accent-purple))]', glow: 'shadow-[0_0_10px_hsl(var(--admin-accent-purple)/0.08)]' },
  pink: { border: 'border-[hsl(var(--admin-accent-pink)/0.2)]', headerBg: 'bg-[hsl(var(--admin-accent-pink)/0.06)]', text: 'text-[hsl(var(--admin-accent-pink))]', glow: 'shadow-[0_0_10px_hsl(var(--admin-accent-pink)/0.08)]' },
};

function VSection({ icon: Icon, title, color = 'cyan', children }: { icon: React.ComponentType<{ className?: string }>; title: string; color?: keyof typeof SECTION_COLORS; children: React.ReactNode }) {
  const c = SECTION_COLORS[color];
  return (
    <div className={`rounded-xl border ${c.border} ${c.glow} overflow-hidden`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${c.headerBg} border-b ${c.border}`}>
        <Icon className={`h-3.5 w-3.5 ${c.text}`} />
        <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${c.text}`}>{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90 focus:border-[hsl(var(--admin-accent-cyan)/0.5)]" />
    </div>
  );
}

/* ═══ FORM STATE ═══ */
function buildForm(cat?: Category) {
  if (!cat) return { name: '', slug: '', description: '', image_url: '' as string | null, parent_id: '', display_order: '0', status: 'active' };
  return {
    name: cat.name, slug: cat.slug, description: cat.description || '',
    image_url: cat.image_url || null, parent_id: cat.parent_id || '',
    display_order: cat.display_order.toString(), status: cat.status,
  };
}

/* ═══ DETAIL PANEL — 3/5, split 2/3 fields + 1/3 image ═══ */
function CategoryPanel({ category, parentCategories, canEdit, onSave, isSaving, onDelete, onClose, isNew, childCount }: {
  category: Category | null; parentCategories: Category[]; canEdit: boolean;
  onSave: (data: CategoryFormData, id?: string) => Promise<void>;
  isSaving: boolean; onDelete?: (c: Category) => void; onClose?: () => void; isNew?: boolean; childCount?: number;
}) {
  const [form, setForm] = useState(() => buildForm(category || undefined));
  const [lastId, setLastId] = useState(category?.id || '__new__');

  const currentId = category?.id || '__new__';
  if (currentId !== lastId) {
    setLastId(currentId);
    setForm(buildForm(category || undefined));
  }

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const isChild = !!form.parent_id;

  const handleSave = async () => {
    if (!form.name) { toast.error('Nome é obrigatório'); return; }
    const slug = form.slug || generateSlug(form.name);
    const data: CategoryFormData = {
      name: form.name, slug, description: form.description || null,
      image_url: form.image_url || null,
      parent_id: form.parent_id || null,
      display_order: parseInt(form.display_order) || 0,
      status: form.status,
    };
    await onSave(data, category?.id);
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--admin-bg))]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--admin-accent-purple)/0.2)] bg-[hsl(var(--admin-card))]"
        style={{ boxShadow: '0 4px 20px hsl(var(--admin-accent-purple) / 0.06)' }}>
        <div className="flex items-center gap-2 min-w-0">
          {isChild ? <Folder className="h-4 w-4 text-[hsl(var(--admin-accent-cyan))] shrink-0" /> : <FolderOpen className="h-4 w-4 text-[hsl(var(--admin-accent-purple))] shrink-0" />}
          <h3 className="text-sm font-bold text-white truncate">
            {isNew ? (isChild ? '✨ Nova Subcategoria' : '✨ Nova Categoria') : category?.name || 'Categoria'}
          </h3>
          {childCount !== undefined && childCount > 0 && (
            <Badge variant="outline" className="border-[hsl(var(--admin-accent-cyan)/0.3)] text-[hsl(var(--admin-accent-cyan))] text-[9px] shrink-0">{childCount} sub</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" className="h-8 text-xs bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 hover:from-emerald-500/30 hover:to-emerald-600/30 border border-emerald-500/30"
            onClick={handleSave} disabled={isSaving || !canEdit}>
            {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}Salvar
          </Button>
          {category && onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-400/5" onClick={() => onDelete(category)} disabled={!canEdit}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {onClose && <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5" onClick={onClose}><X className="h-4 w-4" /></Button>}
        </div>
      </div>

      {/* Body: 2/3 fields + 1/3 image */}
      <ScrollArea className="flex-1">
        <div className="flex h-full">
          {/* LEFT 2/3 */}
          <div className="w-2/3 p-4 space-y-3 border-r border-white/[0.04]">
            <VSection icon={Layers} title="Informações" color="cyan">
              <div className="space-y-2">
                <Field label="Nome *" value={form.name} onChange={(v) => set('name', v)} placeholder="Nome da categoria" />
                <Field label="Slug (URL)" value={form.slug} onChange={(v) => set('slug', v)} placeholder="auto-gerado" />
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1 block">Descrição</label>
                  <Textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                    className="text-xs bg-white/[0.04] border-white/[0.08] text-white/90 min-h-[60px]" rows={3} />
                </div>
              </div>
            </VSection>

            <VSection icon={Layers} title="Organização" color="purple">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Categoria Pai</label>
                    <Select value={form.parent_id || '__none__'} onValueChange={(v) => set('parent_id', v === '__none__' ? '' : v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90"><SelectValue placeholder="Nenhuma (principal)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhuma (principal)</SelectItem>
                        {parentCategories.filter(c => c.id !== category?.id).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Status</label>
                    <Select value={form.status} onValueChange={(v) => set('status', v)}>
                      <SelectTrigger className="h-8 text-xs bg-white/[0.04] border-white/[0.08] text-white/90"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">✅ Ativa</SelectItem>
                        <SelectItem value="inactive">⏸️ Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Field label="Ordem de exibição" value={form.display_order} onChange={(v) => set('display_order', v)} type="number" />
              </div>
            </VSection>
          </div>

          {/* RIGHT 1/3 */}
          <div className="w-1/3 p-4">
            <VSection icon={ImageIcon} title="Imagem" color="pink">
              <ImageUpload value={form.image_url} onChange={(url) => set('image_url', url)} folder="categories" aspectRatio="aspect-square" />
            </VSection>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
const AdminCategoriesPage = () => {
  const { canEdit } = useAuthContext();
  const isMobile = useIsMobile();
  const { data: categories = [], isLoading } = useAdminCategoriesAll();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createAsChild, setCreateAsChild] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState('parents');

  const isSaving = createCat.isPending || updateCat.isPending;
  const panelOpen = !!selectedCategory || isCreating;
  const parentCategories = categories.filter(c => !c.parent_id);
  const childCategories = categories.filter(c => c.parent_id);

  const handleSave = async (data: CategoryFormData, id?: string) => {
    if (id) { await updateCat.mutateAsync({ id, data }); }
    else { await createCat.mutateAsync(data); setIsCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteTarget.parent_id && childCategories.some(c => c.parent_id === deleteTarget.id)) {
      toast.error('Remova as subcategorias antes'); setIsDeleteDialogOpen(false); return;
    }
    await deleteCat.mutateAsync(deleteTarget.id);
    setIsDeleteDialogOpen(false);
    if (selectedCategory?.id === deleteTarget.id) setSelectedCategory(null);
  };

  const imgCol = (cat: Category) => (
    <div className="w-9 h-9 rounded-lg bg-[hsl(var(--admin-sidebar))] overflow-hidden flex items-center justify-center border border-white/[0.06]">
      {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="h-3.5 w-3.5 text-white/15" />}
    </div>
  );

  const parentColumns: Column<Category>[] = [
    { key: 'image_url', header: '', className: 'w-10', render: imgCol },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'children_count', header: 'Sub', className: 'w-12', render: (c) => <Badge variant="outline" className="text-[9px] border-[hsl(var(--admin-accent-cyan)/0.3)] text-[hsl(var(--admin-accent-cyan))]">{childCategories.filter(ch => ch.parent_id === c.id).length}</Badge> },
    { key: 'display_order', header: 'Ord.', sortable: true, className: 'w-12' },
    { key: 'status', header: '', className: 'w-14', render: (c) => <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[9px] px-1.5">{c.status === 'active' ? '✅' : '⏸️'}</Badge> },
  ];

  const childColumns: Column<Category>[] = [
    { key: 'image_url', header: '', className: 'w-10', render: imgCol },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'parent_id', header: 'Pai', render: (c) => <span className="text-[11px] text-white/50">{categories.find(p => p.id === c.parent_id)?.name || '-'}</span> },
    { key: 'display_order', header: 'Ord.', sortable: true, className: 'w-12' },
    { key: 'status', header: '', className: 'w-14', render: (c) => <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[9px] px-1.5">{c.status === 'active' ? '✅' : '⏸️'}</Badge> },
  ];

  const childCount = selectedCategory ? childCategories.filter(c => c.parent_id === selectedCategory.id).length : undefined;

  const panelContent = (
    <CategoryPanel
      category={isCreating ? null : selectedCategory}
      parentCategories={parentCategories}
      canEdit={canEdit()}
      onSave={handleSave}
      isSaving={isSaving}
      isNew={isCreating}
      childCount={childCount}
      onDelete={(c) => { setDeleteTarget(c); setIsDeleteDialogOpen(true); }}
      onClose={() => { setSelectedCategory(null); setIsCreating(false); }}
    />
  );

  return (
    <AdminLayout title="Categorias" requireEditor>
      <div className={cn("flex h-[calc(100vh-8rem)]", !isMobile && "flex-row")}>

        {/* LEFT: List — 2/5 */}
        <div className={cn(
          "flex flex-col min-h-0 overflow-hidden transition-all duration-300",
          panelOpen && !isMobile ? "w-2/5" : "w-full",
        )}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-3 pt-3 flex items-center justify-between">
              <TabsList className="bg-[hsl(var(--admin-sidebar))]">
                <TabsTrigger value="parents" className="text-xs gap-1 data-[state=active]:bg-[hsl(var(--admin-accent-purple)/0.2)] data-[state=active]:text-[hsl(var(--admin-accent-purple))]">
                  <FolderOpen className="h-3 w-3" />Principais ({parentCategories.length})
                </TabsTrigger>
                <TabsTrigger value="children" className="text-xs gap-1 data-[state=active]:bg-[hsl(var(--admin-accent-cyan)/0.2)] data-[state=active]:text-[hsl(var(--admin-accent-cyan))]">
                  <Folder className="h-3 w-3" />Sub ({childCategories.length})
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <ExportButtons data={categories.map(c => ({ nome: c.name, slug: c.slug, status: c.status, ordem: c.display_order }))} filename="categorias" title="Categorias" columns={[{ key: 'nome', header: 'Nome' }, { key: 'slug', header: 'Slug' }, { key: 'status', header: 'Status' }, { key: 'ordem', header: 'Ordem' }]} />
                <Button onClick={() => { setSelectedCategory(null); setCreateAsChild(activeTab === 'children'); setIsCreating(true); }} disabled={!canEdit()} size="sm"
                  className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-1" />Nova
                </Button>
              </div>
            </div>
            <TabsContent value="parents" className="flex-1 min-h-0 mt-0">
              <DataTable data={parentCategories} columns={parentColumns} isLoading={isLoading} searchPlaceholder="Buscar categorias..." showAllRows
                onRowClick={(c) => { setIsCreating(false); setSelectedCategory(c); }} />
            </TabsContent>
            <TabsContent value="children" className="flex-1 min-h-0 mt-0">
              <DataTable data={childCategories} columns={childColumns} isLoading={isLoading} searchPlaceholder="Buscar subcategorias..." showAllRows
                onRowClick={(c) => { setIsCreating(false); setSelectedCategory(c); }} />
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: Detail Panel — 3/5 (desktop) */}
        {!isMobile && panelOpen && (
          <div className="w-3/5 border-l border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] overflow-hidden animate-in slide-in-from-right-5 duration-300">
            {panelContent}
          </div>
        )}
      </div>

      {/* Mobile Sheet */}
      {isMobile && (
        <Sheet open={panelOpen} onOpenChange={(open) => { if (!open) { setSelectedCategory(null); setIsCreating(false); } }}>
          <SheetContent side="bottom" className="h-[90vh] p-0 bg-[hsl(var(--admin-card))] border-t border-[hsl(var(--admin-accent-cyan)/0.2)] rounded-t-2xl">
            {panelContent}
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
            <DialogDescription>Excluir "{deleteTarget?.name}"? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteCat.isPending}>
              {deleteCat.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
