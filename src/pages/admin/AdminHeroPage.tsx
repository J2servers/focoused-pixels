import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HeroSlide {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  desktop_image: string;
  mobile_image: string | null;
  display_order: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  theme: string;
  created_at: string;
}

const AdminHeroPage = () => {
  const { canEdit } = useAuthContext();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    desktop_image: '',
    mobile_image: '',
    display_order: '0',
    status: 'active',
    theme: 'dark',
  });

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setSlides(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateDialog = () => {
    setSelectedSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      cta_text: '',
      cta_link: '',
      desktop_image: '',
      mobile_image: '',
      display_order: '0',
      status: 'active',
      theme: 'dark',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setFormData({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      cta_text: slide.cta_text || '',
      cta_link: slide.cta_link || '',
      desktop_image: slide.desktop_image,
      mobile_image: slide.mobile_image || '',
      display_order: slide.display_order.toString(),
      status: slide.status,
      theme: slide.theme,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.desktop_image) {
      toast.error('Imagem desktop é obrigatória');
      return;
    }

    setIsSaving(true);

    const slideData = {
      title: formData.title || null,
      subtitle: formData.subtitle || null,
      cta_text: formData.cta_text || null,
      cta_link: formData.cta_link || null,
      desktop_image: formData.desktop_image,
      mobile_image: formData.mobile_image || null,
      display_order: parseInt(formData.display_order) || 0,
      status: formData.status,
      theme: formData.theme,
    };

    try {
      if (selectedSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update(slideData)
          .eq('id', selectedSlide.id);

        if (error) throw error;
        toast.success('Slide atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('hero_slides').insert(slideData);
        if (error) throw error;
        toast.success('Slide criado com sucesso!');
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar slide');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlide) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', selectedSlide.id);

      if (error) throw error;
      toast.success('Slide excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir slide');
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<HeroSlide>[] = [
    {
      key: 'desktop_image',
      header: 'Preview',
      className: 'w-32',
      render: (slide) => (
        <div className="w-28 h-16 rounded-lg bg-muted overflow-hidden">
          <img src={slide.desktop_image} alt={slide.title || 'Slide'} className="w-full h-full object-cover" />
        </div>
      ),
    },
    { key: 'title', header: 'Título', sortable: true },
    { key: 'display_order', header: 'Ordem', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (slide) => (
        <Badge variant={slide.status === 'active' ? 'default' : 'secondary'}>
          {slide.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'theme',
      header: 'Tema',
      render: (slide) => (
        <Badge variant="outline">
          {slide.theme === 'dark' ? 'Escuro' : 'Claro'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-32',
      render: (slide) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedSlide(slide); setIsPreviewOpen(true); }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(slide)} disabled={!canEdit()}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedSlide(slide); setIsDeleteDialogOpen(true); }}
            disabled={!canEdit()}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Banner Hero" requireEditor>
      <DataTable
        data={slides}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar slides..."
        actions={
          <Button onClick={openCreateDialog} disabled={!canEdit()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Slide
          </Button>
        }
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSlide ? 'Editar Slide' : 'Novo Slide'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cta_text">Texto do Botão (CTA)</Label>
                <Input
                  id="cta_text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_link">Link do Botão</Label>
                <Input
                  id="cta_link"
                  value={formData.cta_link}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  placeholder="/categoria/letreiros"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desktop_image">Imagem Desktop (URL) *</Label>
              <Input
                id="desktop_image"
                value={formData.desktop_image}
                onChange={(e) => setFormData({ ...formData, desktop_image: e.target.value })}
                placeholder="https://..."
              />
              {formData.desktop_image && (
                <img 
                  src={formData.desktop_image} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_image">Imagem Mobile (URL)</Label>
              <Input
                id="mobile_image"
                value={formData.mobile_image}
                onChange={(e) => setFormData({ ...formData, mobile_image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Ordem</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview do Slide</DialogTitle>
          </DialogHeader>

          {selectedSlide && (
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
              <img 
                src={selectedSlide.desktop_image} 
                alt={selectedSlide.title || 'Slide'} 
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 flex flex-col justify-center p-8 ${selectedSlide.theme === 'dark' ? 'bg-black/50 text-white' : 'bg-white/50 text-black'}`}>
                {selectedSlide.title && (
                  <h2 className="text-4xl font-bold mb-2">{selectedSlide.title}</h2>
                )}
                {selectedSlide.subtitle && (
                  <p className="text-xl mb-4">{selectedSlide.subtitle}</p>
                )}
                {selectedSlide.cta_text && (
                  <Button className="w-fit">{selectedSlide.cta_text}</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este slide? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminHeroPage;
