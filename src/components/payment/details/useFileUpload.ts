import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UploadedFile } from './types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'ai', 'eps', 'cdr'];

export function useFileUpload(setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Arquivo ${file.name} muito grande (máx. 10MB)`);
          continue;
        }
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          toast.error(`Tipo não permitido: .${ext}`);
          continue;
        }
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const filePath = `customer-uploads/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('order-files').upload(filePath, file);
        if (uploadError) {
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }
        const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(filePath);
        setUploadedFiles(prev => [...prev, { name: file.name, url: urlData.publicUrl }]);
        toast.success(`${file.name} enviado!`);
      }
    } catch {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) =>
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));

  return { isUploading, handleFileUpload, removeFile };
}
