import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export { MultiImageUpload } from './MultiImageUpload';

interface ImageUploadProps {
  value?: string | null;
  previewSrc?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  aspectRatio?: string;
  placeholder?: string;
}

export function ImageUpload({
  value, previewSrc, onChange,
  folder = 'uploads',
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
  className,
  aspectRatio = 'aspect-video',
  placeholder = 'Arraste uma imagem ou clique para enviar',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const resolvedPreview = previewSrc || value;

  const handleUpload = async (file: File) => {
    const validTypes = accept.split(',').map(t => t.trim());
    if (!validTypes.some((type) => file.type.match(type.replace('*', '.*')))) {
      toast.error('Tipo de arquivo não suportado');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('admin-uploads').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('admin-uploads').getPublicUrl(fileName);
      onChange(data.publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar imagem';
      console.error('Upload error:', message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  return (
    <div className={cn('relative', className)}>
      {resolvedPreview ? (
        <div className={cn('relative rounded-lg overflow-hidden border border-border', aspectRatio)}>
          <img src={resolvedPreview} alt="Preview" className="w-full h-full object-cover" />
          <Button
            type="button" variant="destructive" size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors',
            aspectRatio,
            isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
            isUploading && 'pointer-events-none opacity-50'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        >
          <input type="file" accept={accept} onChange={handleFileSelect} className="sr-only" disabled={isUploading} />
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Enviando...</span>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  {isDragging ? (
                    <Upload className="h-6 w-6 text-primary" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{placeholder}</p>
                <p className="text-xs text-muted-foreground/70">JPG, PNG ou WebP • Máx. {maxSizeMB}MB</p>
              </>
            )}
          </div>
        </label>
      )}
    </div>
  );
}
