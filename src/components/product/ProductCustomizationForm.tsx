import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertTriangle, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface CustomizationData {
  customText: string;
  logoFiles: File[];
  whatsappNumber: string;
}

interface ProductCustomizationFormProps {
  onDataChange: (data: CustomizationData) => void;
  data: CustomizationData;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FORMATS = '.png,.jpg,.jpeg,.svg,.pdf,.ai,.eps,.cdr,.zip,.rar';

export const ProductCustomizationForm = ({
  onDataChange,
  data,
}: ProductCustomizationFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleTextChange = (text: string) => {
    if (text.length <= 400) {
      onDataChange({ ...data, customText: text });
    }
  };

  const handleWhatsAppChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 13);
    onDataChange({ ...data, whatsappNumber: cleaned });
  };

  const formatWhatsApp = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const currentCount = data.logoFiles.length;
    const remaining = MAX_FILES - currentCount;

    if (remaining <= 0) {
      toast.error(`Limite de ${MAX_FILES} arquivos atingido`);
      return;
    }

    const newFiles: File[] = [];
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} excede o limite de 50MB`);
        continue;
      }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      onDataChange({ ...data, logoFiles: [...data.logoFiles, ...newFiles] });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = data.logoFiles.filter((_, i) => i !== index);
    onDataChange({ ...data, logoFiles: newFiles });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Custom Text */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Digite os nomes/textos aqui:
        </label>
        <Textarea
          value={data.customText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Digite aqui ou nos envie pelo WhatsApp"
          className="min-h-[80px] rounded-xl resize-none"
          maxLength={400}
        />
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {data.customText.length}/400
          </span>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Anexe aqui sua Logo em PDF
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${dragActive
              ? 'border-primary bg-primary/10'
              : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
            }
          `}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-primary/60" />
          <p className="text-sm font-medium text-primary">
            Clique ou arraste seu arquivo
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Imagem, PDF, Corel, AI, EPS — até 50MB (Limite de 1 a {MAX_FILES} arquivos)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FORMATS}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* File list */}
        {data.logoFiles.length > 0 && (
          <div className="space-y-2 mt-2">
            {data.logoFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/30"
              >
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm truncate flex-1">{file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Number */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">
          Digite seu WhatsApp para receber a arte:
        </label>
        <div className="relative">
          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={formatWhatsApp(data.whatsappNumber)}
            onChange={(e) => handleWhatsAppChange(e.target.value)}
            placeholder="(11) 99999-9999"
            className="pl-9 rounded-xl h-11"
          />
        </div>
      </div>

      {/* Personalization Notice */}
      <div className="flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
            [ATENÇÃO] ❗
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Após concluir seu pedido aqui no site, nossa equipe entrará em contato com você 
            pelo WhatsApp para personalização. Você receberá uma prévia da arte para aprovação 
            antes da fabricação.
          </p>
        </div>
      </div>
    </div>
  );
};
