/**
 * VideoUpload — Componente de upload de vídeos para o storage
 */

import { useState, useRef } from 'react';
import { Upload, Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  maxSizeMB?: number;
}

export function VideoUpload({ value, onChange, folder = 'video-stories', maxSizeMB = 100 }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use MP4, WebM, MOV ou AVI.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      setProgress(30);

      const { data, error } = await supabase.storage
        .from('video-stories')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      setProgress(80);

      const { data: urlData } = supabase.storage
        .from('video-stories')
        .getPublicUrl(data.path);

      setProgress(100);
      onChange(urlData.publicUrl);
      toast.success('Vídeo enviado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar vídeo');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border bg-black aspect-[9/16] max-w-[200px]">
          <video
            src={value}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="absolute bottom-2 left-2">
            <Video className="h-4 w-4 text-white" />
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            "hover:border-primary hover:bg-primary/5",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Enviando... {progress}%</p>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Clique para enviar vídeo</p>
              <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV • Máx {maxSizeMB}MB</p>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
