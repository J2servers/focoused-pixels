import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Image } from 'lucide-react';
import { LogoEditorRow, clamp, normalizeHexColor } from './CompanyFormUtils';
import type { CompanyInfo } from '@/hooks/useCompanyInfo';

interface Props {
  formData: Partial<CompanyInfo>;
  setFormData: (data: Partial<CompanyInfo>) => void;
  previewColors: { primary: string; secondary: string; accent: string };
}

export const CompanyIdentitySection = ({ formData, setFormData, previewColors }: Props) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Identidade Visual</CardTitle>
      <CardDescription>Upload e tamanho das logos, paleta da marca e preview rápido.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <LogoEditorRow
          label="Logo do cabeçalho"
          description="Upload menor, com tamanhos e previews ao lado para desktop e mobile."
          value={formData.header_logo || ''}
          onChange={(url) => setFormData({ ...formData, header_logo: url || '' })}
        >
          <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
            <div className="space-y-2">
              <Label htmlFor="header_logo_height">Altura desktop (px)</Label>
              <Input id="header_logo_height" type="number" min={24} max={180}
                value={formData.header_logo_height || 64}
                onChange={(e) => setFormData({ ...formData, header_logo_height: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="header_logo_mobile_height">Altura mobile (px)</Label>
              <Input id="header_logo_mobile_height" type="number" min={20} max={140}
                value={formData.header_logo_mobile_height || 36}
                onChange={(e) => setFormData({ ...formData, header_logo_mobile_height: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-xs text-muted-foreground">Preview desktop</p>
              <div className="min-h-[56px] rounded bg-muted/30 px-3 flex items-center">
                {formData.header_logo ? (
                  <img src={formData.header_logo} alt="Logo header" style={{ height: `${clamp(formData.header_logo_height, 64, 24, 180)}px` }} className="max-w-full w-auto object-contain" />
                ) : <Badge variant="secondary">Sem logo</Badge>}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-xs text-muted-foreground">Preview mobile</p>
              <div className="min-h-[56px] rounded bg-muted/30 px-3 flex items-center">
                {formData.header_logo ? (
                  <img src={formData.header_logo} alt="Logo mobile" style={{ height: `${clamp(formData.header_logo_mobile_height, 36, 20, 140)}px` }} className="max-w-full w-auto object-contain" />
                ) : <Badge variant="secondary">Sem logo</Badge>}
              </div>
            </div>
          </div>
        </LogoEditorRow>

        <LogoEditorRow
          label="Logo do rodapé"
          description="Preview menor e configuração ao lado."
          value={formData.footer_logo || ''}
          onChange={(url) => setFormData({ ...formData, footer_logo: url || '' })}
        >
          <div className="grid gap-4 xl:grid-cols-[0.7fr,1.3fr] xl:items-end">
            <div className="space-y-2">
              <Label htmlFor="footer_logo_height">Altura do rodapé (px)</Label>
              <Input id="footer_logo_height" type="number" min={20} max={160}
                value={formData.footer_logo_height || 48}
                onChange={(e) => setFormData({ ...formData, footer_logo_height: Number(e.target.value) })}
              />
            </div>
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-xs text-muted-foreground">Preview rodapé</p>
              <div className="min-h-[56px] rounded bg-muted/30 px-3 flex items-center">
                {formData.footer_logo ? (
                  <img src={formData.footer_logo} alt="Logo rodapé" style={{ height: `${clamp(formData.footer_logo_height, 48, 20, 160)}px` }} className="max-w-full w-auto object-contain" />
                ) : <Badge variant="secondary">Sem logo</Badge>}
              </div>
            </div>
          </div>
        </LogoEditorRow>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'primary_color', label: 'Cor primária', fallback: '#7c3aed' },
          { id: 'secondary_color', label: 'Cor secundária', fallback: '#10b981' },
          { id: 'accent_color', label: 'Cor de destaque', fallback: '#f59e0b' },
        ].map(({ id, label, fallback }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex gap-2">
              <Input id={id} type="color"
                value={(formData as Record<string, any>)[id] || fallback}
                onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                className="w-14 h-10 p-1"
              />
              <Input
                value={(formData as Record<string, any>)[id] || fallback}
                onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="rounded-xl border p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium">Preview ativo da identidade</p>
            <p className="text-xs text-muted-foreground">As cores reagem imediatamente nesta área.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: previewColors.primary }} />
            <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: previewColors.secondary }} />
            <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: previewColors.accent }} />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-2xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${previewColors.primary}, ${previewColors.secondary})` }}>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Loja personalizada</p>
            <h3 className="mt-2 text-2xl font-semibold">{formData.company_name || 'Pincel de Luz'}</h3>
            <p className="mt-2 max-w-xl text-sm text-white/80">Header, destaques e componentes visuais refletem esta combinação após salvar.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: previewColors.accent, color: '#111827' }}>Cor de destaque</span>
              <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium">Identidade visual</span>
            </div>
          </div>
          <div className="rounded-2xl border p-4 space-y-3">
            <div className="rounded-xl p-3 text-sm font-medium text-white" style={{ backgroundColor: previewColors.primary }}>Botão principal</div>
            <div className="rounded-xl p-3 text-sm font-medium text-white" style={{ backgroundColor: previewColors.secondary }}>Selo secundário</div>
            <div className="rounded-xl p-3 text-sm font-medium" style={{ backgroundColor: previewColors.accent, color: '#111827' }}>Destaque promocional</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_css">CSS personalizado (opcional)</Label>
        <Textarea id="custom_css" value={formData.custom_css || ''}
          onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
          placeholder="/* Ajustes finos de marca */"
          className="font-mono text-xs min-h-[120px]"
        />
      </div>
    </CardContent>
  </Card>
);
