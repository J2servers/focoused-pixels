import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  maxImages?: number;
  maxSizeMB?: number;
}

export function MultiImageUpload({
  value = [], onChange, folder = 'uploads', maxImages = 6, maxSizeMB = 5,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (files: FileList) => {
    const filesToUpload = Array.from(files).slice(0, maxImages - value.length);
    if (filesToUpload.length === 0) {
      toast.error(`Máximo de ${maxImages} imagens`);
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo: ${maxSizeMB}MB`);
        continue;
      }
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
        toast.error(`${file.name}: tipo não suportado`);
        continue;
      }

      try {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from('admin-uploads').upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from('admin-uploads').getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      } catch (error: unknown) {
        console.error('Upload error:', error);
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
      toast.success(`${newUrls.length} imagem(ns) enviada(s)!`);
    }

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newUrls = [...value];
    const [removed] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, removed);
    onChange(newUrls);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <Button type="button" variant="secondary" size="icon" className="h-7 w-7" onClick={() => handleReorder(index, index - 1)}>?</Button>
                )}
                {index < value.length - 1 && (
                  <Button type="button" variant="secondary" size="icon" className="h-7 w-7" onClick={() => handleReorder(index, index + 1)}>?</Button>
                )}
                <Button type="button" variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleRemove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">Capa</span>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <label
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors p-4',
            isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
          <input
            type="file" accept="image/jpeg,image/png,image/webp" multiple
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="sr-only" disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Enviando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span>Adicionar imagens ({value.length}/{maxImages})</span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
