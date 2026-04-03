import { useState } from 'react';
import { AdminLayout, DataTable, Column, ImageUpload } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Eye } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  useAdminHeroSlides, useCreateHeroSlide, useUpdateHeroSlide, useDeleteHeroSlide,
  type HeroSlide, type HeroSlideFormData,
} from '@/hooks/useAdminHeroSlides';

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

  const columns: Column<HeroSlide>[] = [
    {
      key: 'desktop_image', header: 'Preview', className: 'w-32',
      render: (s) => <div className="w-28 h-16 rounded-lg bg-muted overflow-hidden"><img src={s.desktop_image} alt={s.title || 'Slide'} className="w-full h-full object-cover" /></div>,
    },
    { key: 'title', header: 'Título', sortable: true },
    { key: 'display_order', header: 'Ordem', sortable: true },
    { key: 'status', header: 'Status', render: (s) => <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status === 'active' ? 'Ativo' : 'Inativo'}</Badge> },
    { key: 'theme', header: 'Tema', render: (s) => <Badge variant="outline">{s.theme === 'dark' ? 'Escuro' : 'Claro'}</Badge> },
    {
      key: 'actions', header: 'Ações', className: 'w-32',
      render: (slide) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedSlide(slide); setIsPreviewOpen(true); }}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(slide)} disabled={!canEdit()}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedSlide(slide); setIsDeleteDialogOpen(true); }} disabled={!canEdit()}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Banner Hero" requireEditor>
      <DataTable data={slides} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar slides..."
        actions={<Button onClick={openCreateDialog} disabled={!canEdit()}><Plus className="h-4 w-4 mr-2" />Novo Slide</Button>} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedSlide ? 'Editar Slide' : 'Novo Slide'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Título</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Subtítulo</Label><Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Texto CTA</Label><Input value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} /></div>
              <div className="space-y-2"><Label>Link CTA</Label><Input value={formData.cta_link} onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Imagem Desktop *</Label>
              <ImageUpload value={formData.desktop_image} onChange={(url) => setFormData({ ...formData, desktop_image: url })} folder="hero" aspectRatio="aspect-[16/9]" /></div>
            <div className="space-y-2"><Label>Imagem Mobile</Label>
              <ImageUpload value={formData.mobile_image} onChange={(url) => setFormData({ ...formData, mobile_image: url })} folder="hero" aspectRatio="aspect-[9/16]" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: e.target.value })} /></div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Ativo</SelectItem><SelectItem value="inactive">Inativo</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Tema</Label>
                <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="dark">Escuro</SelectItem><SelectItem value="light">Claro</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Preview do Slide</DialogTitle></DialogHeader>
          {selectedSlide && (
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir este slide?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminHeroPage;
