import { useState } from 'react';
import { QuoteFormData } from '@/pages/CheckoutPage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Ruler, Palette, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CheckoutStepSpecificationsProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
}

export function CheckoutStepSpecifications({ formData, updateFormData }: CheckoutStepSpecificationsProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use PNG, JPG, SVG ou PDF.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('quote-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('quote-attachments')
        .getPublicUrl(filePath);

      updateFormData({ logoUrl: publicUrl });
      toast.success('Logo enviado com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Text & Logo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Palette className="h-5 w-5" />
          <h3 className="font-semibold">Texto e Arte</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customText">Texto ou Nome para Impressão</Label>
            <Textarea
              id="customText"
              value={formData.customText}
              onChange={(e) => updateFormData({ customText: e.target.value })}
              placeholder="Digite exatamente o texto que deseja no produto..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo ou Imagem</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {formData.logoUrl ? (
                <div className="space-y-3">
                  <img
                    src={formData.logoUrl}
                    alt="Logo enviado"
                    className="max-h-32 mx-auto object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateFormData({ logoUrl: '' })}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="space-y-2">
                    {isUploading ? (
                      <Loader2 className="h-10 w-10 mx-auto text-muted-foreground animate-spin" />
                    ) : (
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isUploading ? 'Enviando...' : 'Clique para enviar logo ou arte'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, SVG ou PDF (máx. 10MB)
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredColors">Cores Desejadas</Label>
            <Input
              id="preferredColors"
              value={formData.preferredColors}
              onChange={(e) => updateFormData({ preferredColors: e.target.value })}
              placeholder="Ex: Preto com dourado, cores da marca, etc."
            />
          </div>
        </div>
      </div>

      {/* Dimensions & Materials */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Ruler className="h-5 w-5" />
          <h3 className="font-semibold">Medidas e Materiais</h3>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dimensions">Medidas Específicas</Label>
            <Input
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => updateFormData({ dimensions: e.target.value })}
              placeholder="Ex: 30x20cm, 50cm de largura, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade Total</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={formData.quantity}
              onChange={(e) => updateFormData({ quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Material Preferido</Label>
            <Select
              value={formData.material}
              onValueChange={(value) => updateFormData({ material: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acrilico">Acrílico</SelectItem>
                <SelectItem value="acrilico-led">Acrílico com LED</SelectItem>
                <SelectItem value="mdf">MDF</SelectItem>
                <SelectItem value="mdf-pintado">MDF Pintado</SelectItem>
                <SelectItem value="espelhado">Acrílico Espelhado</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
                <SelectItem value="outro">Outro (especificar)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="thickness">Espessura</Label>
            <Select
              value={formData.thickness}
              onValueChange={(value) => updateFormData({ thickness: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a espessura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2mm">2mm</SelectItem>
                <SelectItem value="3mm">3mm</SelectItem>
                <SelectItem value="5mm">5mm</SelectItem>
                <SelectItem value="6mm">6mm</SelectItem>
                <SelectItem value="10mm">10mm</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="borderFinish">Tipo de Borda / Acabamento</Label>
          <Select
            value={formData.borderFinish}
            onValueChange={(value) => updateFormData({ borderFinish: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o acabamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="polido">Polido</SelectItem>
              <SelectItem value="fosco">Fosco</SelectItem>
              <SelectItem value="chanfrado">Chanfrado</SelectItem>
              <SelectItem value="reto">Reto</SelectItem>
              <SelectItem value="arredondado">Arredondado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Style References */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <ImageIcon className="h-5 w-5" />
          <h3 className="font-semibold">Inspiração / Referências</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referenceLinks">Links de Referência</Label>
            <Textarea
              id="referenceLinks"
              value={formData.referenceLinks}
              onChange={(e) => updateFormData({ referenceLinks: e.target.value })}
              placeholder="Cole links de imagens ou produtos similares que você gostou..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Preferência de Estilo</Label>
            <Select
              value={formData.stylePreference}
              onValueChange={(value) => updateFormData({ stylePreference: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moderno">Moderno</SelectItem>
                <SelectItem value="classico">Clássico</SelectItem>
                <SelectItem value="minimalista">Minimalista</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
                <SelectItem value="elegante">Elegante</SelectItem>
                <SelectItem value="divertido">Divertido</SelectItem>
                <SelectItem value="corporativo">Corporativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visualNotes">Observações Visuais</Label>
            <Textarea
              id="visualNotes"
              value={formData.visualNotes}
              onChange={(e) => updateFormData({ visualNotes: e.target.value })}
              placeholder="Detalhes importantes sobre o visual do produto..."
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
