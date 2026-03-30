/**
 * VideoStoriesManager — CRUD completo de vídeo stories no admin
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Plus, Trash2, Edit, Video, GripVertical, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { useAllVideoStories, useCreateVideoStory, useUpdateVideoStory, useDeleteVideoStory } from '@/hooks/useVideoStories';
import { toast } from 'sonner';

interface StoryForm {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  cta_text: string;
  cta_link: string;
  tags: string;
  status: string;
}

const emptyForm: StoryForm = {
  title: '', description: '', video_url: '', thumbnail_url: '',
  cta_text: '', cta_link: '', tags: '', status: 'active',
};

export function VideoStoriesManager() {
  const { data: stories = [], isLoading } = useAllVideoStories();
  const createMutation = useCreateVideoStory();
  const updateMutation = useUpdateVideoStory();
  const deleteMutation = useDeleteVideoStory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StoryForm>(emptyForm);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (story: any) => {
    setEditingId(story.id);
    setForm({
      title: story.title || '',
      description: story.description || '',
      video_url: story.video_url || '',
      thumbnail_url: story.thumbnail_url || '',
      cta_text: story.cta_text || '',
      cta_link: story.cta_link || '',
      tags: (story.tags || []).join(', '),
      status: story.status || 'active',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.video_url) {
      toast.error('URL do vídeo é obrigatória');
      return;
    }
    const payload = {
      title: form.title || null,
      description: form.description || null,
      video_url: form.video_url,
      thumbnail_url: form.thumbnail_url || null,
      cta_text: form.cta_text || null,
      cta_link: form.cta_link || null,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      status: form.status,
      display_order: editingId ? undefined : stories.length,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload } as any);
        toast.success('Vídeo atualizado!');
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success('Vídeo adicionado!');
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este vídeo?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Vídeo removido!');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleStatus = async (story: any) => {
    const newStatus = story.status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({ id: story.id, status: newStatus } as any);
    toast.success(newStatus === 'active' ? 'Vídeo ativado' : 'Vídeo desativado');
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const idx = stories.findIndex(s => s.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= stories.length) return;
    
    await updateMutation.mutateAsync({ id: stories[idx].id, display_order: swapIdx } as any);
    await updateMutation.mutateAsync({ id: stories[swapIdx].id, display_order: idx } as any);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Vídeos Stories
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar Vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Vídeo' : 'Novo Vídeo Story'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Veja o produto de perto" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição breve do vídeo" rows={2} />
              </div>
              <div>
                <Label>URL do Vídeo *</Label>
                <Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://..." />
                <p className="text-xs text-muted-foreground mt-1">Cole o link do vídeo (MP4, WebM) ou faça upload no storage</p>
              </div>
              <div>
                <Label>Thumbnail (capa)</Label>
                <ImageUpload
                  value={form.thumbnail_url}
                  onChange={(url) => setForm(f => ({ ...f, thumbnail_url: url }))}
                  folder="video-stories"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Texto CTA</Label>
                  <Input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="Comprar agora" />
                </div>
                <div>
                  <Label>Link CTA</Label>
                  <Input value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} placeholder="/produto/..." />
                </div>
              </div>
              <div>
                <Label>Tags (separadas por vírgula)</Label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="produto, novidade, bastidores" />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.status === 'active'}
                  onCheckedChange={(v) => setForm(f => ({ ...f, status: v ? 'active' : 'inactive' }))}
                />
                <Label>Ativo</Label>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : stories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Nenhum vídeo story adicionado ainda</p>
            <p className="text-xs mt-1">Adicione vídeos para exibir no carrossel do site</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stories.map((story, idx) => (
              <div
                key={story.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                {/* Thumbnail */}
                <div className="w-12 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {story.thumbnail_url ? (
                    <img src={story.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{story.title || 'Sem título'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={story.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {story.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Eye className="h-3 w-3" /> {story.views_count}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleReorder(story.id, 'up')} disabled={idx === 0}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleReorder(story.id, 'down')} disabled={idx === stories.length - 1}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Switch
                    checked={story.status === 'active'}
                    onCheckedChange={() => handleToggleStatus(story)}
                    className="scale-75"
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(story)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(story.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
