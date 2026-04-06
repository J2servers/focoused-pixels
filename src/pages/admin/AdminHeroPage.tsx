import { useState } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload } from '@/components/admin';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Eye, Image } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useAdminHeroSlides, useCreateHeroSlide, useUpdateHeroSlide, useDeleteHeroSlide,
  type HeroSlide, type HeroSlideFormData,
} from '@/hooks/useAdminHeroSlides';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const INITIAL_FORM = {
  title: '', subtitle: '', cta_text: '', cta_link: '',
  desktop_image: '' as string | null, mobile_image: '' as string | null,
  display_order: '0', status: 'active', theme: 'dark',
};

const AdminHeroPage = () => {
  const { canEdit } = useAuthContext();
  const { data: slides = [], isLoading } = useAdminHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const isSaving = createSlide.isPending || updateSlide.isPending || deleteSlide.isPending;

  const openCreateDialog = () => { setSelectedSlide(null); setFormData(INITIAL_FORM); setIsDialogOpen(true); };

  const openEditDialog = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setFormData({
      title: slide.title || '', subtitle: slide.subtitle || '',
      cta_text: slide.cta_text || '', cta_link: slide.cta_link || '',
      desktop_image: slide.desktop_image, mobile_image: slide.mobile_image || '',
      display_order: slide.display_order.toString(), status: slide.status, theme: slide.theme,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.desktop_image) return;
    const data: HeroSlideFormData = {
      title: formData.title || null, subtitle: formData.subtitle || null,
      cta_text: formData.cta_text || null, cta_link: formData.cta_link || null,
      desktop_image: formData.desktop_image!, mobile_image: formData.mobile_image || null,
      display_order: parseInt(formData.display_order) || 0,
      status: formData.status, theme: formData.theme,
    };
    if (selectedSlide) { await updateSlide.mutateAsync({ id: selectedSlide.id, data }); }
    else { await createSlide.mutateAsync(data); }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedSlide) return;
    await deleteSlide.mutateAsync(selectedSlide.id);
    setIsDeleteDialogOpen(false);
  };

  const activeCount = slides.filter(s => s.status === 'active').length;
  const inactiveCount = slides.filter(s => s.status !== 'active').length;

  const columns: Column<HeroSlide>[] = [
    {
      key: 'desktop_image', header: 'Preview', className: 'w-32',
      render: (s) => (
        <div className="w-28 h-16 rounded-lg bg-[hsl(var(--admin-bg))] overflow-hidden border border-[hsl(var(--admin-card-border))]">
          <img src={s.desktop_image} alt={s.title || 'Slide'} className="w-full h-full object-cover" />
        </div>
      ),
    },
    { key: 'title', header: 'Título', sortable: true, render: (s) => <span className="font-medium text-[hsl(var(--admin-text))]">{s.title || '—'}</span> },
    { key: 'display_order', header: 'Ordem', sortable: true },
    {
      key: 'status', header: 'Status',
      render: (s) => <AdminStatusBadge label={s.status === 'active' ? 'Ativo' : 'Inativo'} variant={s.status === 'active' ? 'success' : 'neutral'} />,
    },
    {
      key: 'theme', header: 'Tema',
      render: (s) => <AdminStatusBadge label={s.theme === 'dark' ? 'Escuro' : 'Claro'} variant="info" />,
    },
    {
      key: 'actions', header: 'Ações', className: 'w-32',
      render: (slide) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]" onClick={() => { setSelectedSlide(slide); setIsPreviewOpen(true); }}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]" onClick={() => openEditDialog(slide)} disabled={!canEdit()}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { setSelectedSlide(slide); setIsDeleteDialogOpen(true); }} disabled={!canEdit()}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Banner Hero" requireEditor>
      <div className="space-y-5">
        <AdminPageGuide
          title="🖼️ Guia do Banner Hero"
          description="Gerencie os banners rotativos da página inicial da loja."
          steps={[
            { title: "Adicionar banner", description: "Clique em 'Novo Banner' e faça upload das imagens desktop e mobile." },
            { title: "Definir CTA", description: "Configure texto e link do botão de ação que aparece sobre o banner." },
            { title: "Ordenar banners", description: "Use o campo 'Ordem' para definir a sequência de exibição dos banners." },
            { title: "Tema do banner", description: "Escolha entre tema claro ou escuro para melhor contraste do texto." },
            { title: "Ativar/Desativar", description: "Altere o status para controlar quais banners estão visíveis na loja." },
          ]}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <AdminSummaryCard title="Total de Slides" value={slides.length} icon={Image} variant="purple" />
          <AdminSummaryCard title="Ativos" value={activeCount} icon={Eye} variant="green" />
          <AdminSummaryCard title="Inativos" value={inactiveCount} icon={Eye} variant="orange" />
        </div>

        <DataTable data={slides} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar slides..."
          actions={
            <Button onClick={openCreateDialog} disabled={!canEdit()}
              className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />Novo Slide
            </Button>
          } />
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-[hsl(var(--admin-text))]">{selectedSlide ? 'Editar Slide' : 'Novo Slide'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Título</Label><Input className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Subtítulo</Label><Input className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Texto CTA</Label><Input className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Link CTA</Label><Input className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.cta_link} onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Imagem Desktop *</Label>
              <ImageUpload value={formData.desktop_image} onChange={(url) => setFormData({ ...formData, desktop_image: url })} folder="hero" aspectRatio="aspect-[16/9]" /></div>
            <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Imagem Mobile</Label>
              <ImageUpload value={formData.mobile_image} onChange={(url) => setFormData({ ...formData, mobile_image: url })} folder="hero" aspectRatio="aspect-[9/16]" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Ordem</Label><Input type="number" className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} /></div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Ativo</SelectItem><SelectItem value="inactive">Inativo</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-[hsl(var(--admin-text-muted))]">Tema</Label>
                <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}><SelectTrigger className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="dark">Escuro</SelectItem><SelectItem value="light">Claro</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-sidebar-hover))]">Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-[hsl(var(--admin-text))]">Preview do Slide</DialogTitle></DialogHeader>
          {selectedSlide && (
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[hsl(var(--admin-card-border))]">
              <img src={selectedSlide.desktop_image} alt={selectedSlide.title || 'Slide'} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 flex flex-col justify-center p-8 ${selectedSlide.theme === 'dark' ? 'bg-black/50 text-white' : 'bg-white/50 text-black'}`}>
                {selectedSlide.title && <h2 className="text-4xl font-bold mb-2">{selectedSlide.title}</h2>}
                {selectedSlide.subtitle && <p className="text-xl mb-4">{selectedSlide.subtitle}</p>}
                {selectedSlide.cta_text && <Button className="w-fit">{selectedSlide.cta_text}</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-[hsl(var(--admin-text))]">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">Tem certeza que deseja excluir este slide?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text))]">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminHeroPage;
