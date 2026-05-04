import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileImage, Loader2, Type, Upload, X } from 'lucide-react';
import { UploadedFile } from './types';

interface Props {
  customText: string;
  setCustomText: (v: string) => void;
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (i: number) => void;
}

export function CustomizationCard({
  customText, setCustomText, uploadedFiles, isUploading, handleFileUpload, removeFile,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Personalização
          <Badge variant="outline" className="text-xs ml-auto">Opcional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="det-customText" className="flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Texto para gravação
          </Label>
          <Textarea id="det-customText" placeholder="Ex: Nome da empresa, frase personalizada..."
            value={customText} onChange={(e) => setCustomText(e.target.value)} rows={2} maxLength={1000} className="resize-none" />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            Logo, imagem ou QR Code
          </Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center hover:border-primary/50 transition-colors">
            <input id="det-fileUpload" type="file" accept="image/*,.pdf,.svg,.ai,.eps,.cdr" multiple
              onChange={handleFileUpload} className="hidden" disabled={isUploading} />
            <label htmlFor="det-fileUpload" className="cursor-pointer space-y-1">
              {isUploading ? (
                <Loader2 className="h-6 w-6 mx-auto text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
              )}
              <p className="text-xs text-muted-foreground">
                {isUploading ? 'Enviando...' : 'Clique para enviar (máx. 10MB)'}
              </p>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-1.5">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm">
                  <FileImage className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate flex-1 text-xs">{file.name}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
