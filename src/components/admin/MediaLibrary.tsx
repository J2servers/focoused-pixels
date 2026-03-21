import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Image, File, Trash2, Copy, Search, FolderOpen, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface MediaFile {
  name: string;
  id: string;
  created_at: string;
  metadata: { size?: number; mimetype?: string } | null;
  url: string;
}

const BUCKET = 'admin-uploads';

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const MediaLibrary = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [folder, setFolder] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    const path = folder || '';
    const { data, error } = await supabase.storage.from(BUCKET).list(path, {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (data) {
      const filesWithUrls = data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => ({
          ...f,
          url: supabase.storage.from(BUCKET).getPublicUrl(`${path ? path + '/' : ''}${f.name}`).data.publicUrl,
        }));
      setFiles(filesWithUrls);
    }
    if (error) toast.error('Erro ao carregar arquivos');
    setIsLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [folder]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;
    setUploading(true);

    for (const file of Array.from(selectedFiles)) {
      const path = `${folder ? folder + '/' : ''}${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file);
      if (error) toast.error(`Erro: ${file.name}`);
    }

    toast.success('Upload concluído!');
    setUploading(false);
    fetchFiles();
    e.target.value = '';
  };

  const handleDelete = async (file: MediaFile) => {
    const path = `${folder ? folder + '/' : ''}${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) toast.error('Erro ao excluir');
    else { toast.success('Arquivo excluído'); fetchFiles(); }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada!');
  };

  const isImage = (file: MediaFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext || '');
  };

  const filteredFiles = files.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'images' ? isImage(f) : !isImage(f));
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="admin-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar arquivo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="images">Imagens</SelectItem>
                <SelectItem value="documents">Documentos</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Pasta (ex: banners)" value={folder} onChange={e => setFolder(e.target.value)} className="w-[160px]" />
            <Button asChild className="gap-2" disabled={uploading}>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4" />
                {uploading ? 'Enviando...' : 'Upload'}
                <input type="file" multiple className="hidden" onChange={handleUpload} accept="image/*,.pdf,.mp4,.webm" />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="admin-card animate-pulse">
              <CardContent className="p-2 aspect-square" />
            </Card>
          ))
        ) : filteredFiles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum arquivo encontrado</p>
          </div>
        ) : (
          filteredFiles.map(file => (
            <Card key={file.id || file.name} className="admin-card group hover:ring-1 hover:ring-primary/50 transition-all">
              <CardContent className="p-2">
                <div className="aspect-square rounded overflow-hidden bg-muted/20 mb-2 relative">
                  {isImage(file) ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <File className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {isImage(file) && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-white" onClick={() => setPreviewFile(file)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white" onClick={() => copyUrl(file.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(file)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs truncate font-medium">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">{formatFileSize(file.metadata?.size)}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="truncate">{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="flex flex-col items-center gap-4">
              <img src={previewFile.url} alt={previewFile.name} className="max-h-[60vh] object-contain rounded" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyUrl(previewFile.url)} className="gap-2">
                  <Copy className="h-3 w-3" /> Copiar URL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

