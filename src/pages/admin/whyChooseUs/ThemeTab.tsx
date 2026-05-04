import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { fontPresets, ColorField } from '@/components/admin/whychooseus/WhyChooseUsHelpers';
import { LivePreview } from '@/components/admin/whychooseus/WhyChooseUsPreview';
import type { TabProps } from './types';
import type { WhyChooseUsConfig } from '@/lib/whyChooseUsConfig';

export function ThemeTab({ config, setConfig }: TabProps) {
  const updateTheme = (field: keyof WhyChooseUsConfig['theme'], value: string) =>
    setConfig((c) => ({ ...c, theme: { ...c.theme, [field]: value } }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Cores e tipografia</CardTitle>
          <CardDescription>Cada cor definida aqui é aplicada na página pública em tempo real após salvar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fundos</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <ColorField label="Fundo principal" value={config.theme.pageBackground} onChange={(v) => updateTheme('pageBackground', v)} />
              <ColorField label="Fundo alternado (seções)" value={config.theme.sectionBackground} onChange={(v) => updateTheme('sectionBackground', v)} />
              <ColorField label="Fundo escuro" value={config.theme.darkSectionBackground} onChange={(v) => updateTheme('darkSectionBackground', v)} />
              <ColorField label="Fundo dos cards" value={config.theme.cardBackground} onChange={(v) => updateTheme('cardBackground', v)} />
              <ColorField label="Borda dos cards" value={config.theme.cardBorder} onChange={(v) => updateTheme('cardBorder', v)} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Textos</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ColorField label="Texto principal" value={config.theme.textPrimary} onChange={(v) => updateTheme('textPrimary', v)} />
              <ColorField label="Texto secundário" value={config.theme.textSecondary} onChange={(v) => updateTheme('textSecondary', v)} />
              <ColorField label="Texto em fundo escuro" value={config.theme.textOnDark} onChange={(v) => updateTheme('textOnDark', v)} />
              <ColorField label="Texto mutado escuro" value={config.theme.textMutedOnDark} onChange={(v) => updateTheme('textMutedOnDark', v)} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Destaque / Accent</p>
            <div className="grid gap-3 md:grid-cols-2">
              <ColorField label="Cor de destaque" value={config.theme.accent} onChange={(v) => updateTheme('accent', v)} />
              <ColorField label="Destaque suave (fundo ícones)" value={config.theme.accentSoft} onChange={(v) => updateTheme('accentSoft', v)} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Botões</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ColorField label="Fundo botão primário" value={config.theme.buttonPrimaryBackground} onChange={(v) => updateTheme('buttonPrimaryBackground', v)} />
              <ColorField label="Texto botão primário" value={config.theme.buttonPrimaryText} onChange={(v) => updateTheme('buttonPrimaryText', v)} />
              <ColorField label="Fundo botão secundário" value={config.theme.buttonSecondaryBackground} onChange={(v) => updateTheme('buttonSecondaryBackground', v)} />
              <ColorField label="Texto botão secundário" value={config.theme.buttonSecondaryText} onChange={(v) => updateTheme('buttonSecondaryText', v)} />
            </div>
            <div className="mt-3 flex gap-3 items-center p-4 rounded-lg border">
              <span className="px-5 py-2 rounded-xl text-sm font-semibold shadow-md" style={{ backgroundColor: config.theme.buttonPrimaryBackground, color: config.theme.buttonPrimaryText }}>
                {config.hero.primaryCtaLabel}
              </span>
              <span className="px-5 py-2 rounded-xl text-sm font-semibold border-2" style={{ backgroundColor: config.theme.buttonSecondaryBackground, color: config.theme.buttonSecondaryText, borderColor: config.theme.cardBorder }}>
                {config.hero.secondaryCtaLabel}
              </span>
              <span className="text-xs text-muted-foreground ml-2">← Preview dos botões</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tipografia</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Fonte dos títulos</Label>
                <Input value={config.theme.headingFont} onChange={(e) => updateTheme('headingFont', e.target.value)} />
                <div className="flex flex-wrap gap-1.5">
                  {fontPresets.map((font) => (
                    <Button key={font} type="button" variant="outline" size="sm" className="text-xs" onClick={() => updateTheme('headingFont', font)}>
                      {font.split(',')[0].replace(/"/g, '')}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fonte do corpo</Label>
                <Input value={config.theme.bodyFont} onChange={(e) => updateTheme('bodyFont', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tamanho título hero</Label>
                <Input value={config.theme.heroTitleSize} onChange={(e) => updateTheme('heroTitleSize', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tamanho títulos de seção</Label>
                <Input value={config.theme.sectionTitleSize} onChange={(e) => updateTheme('sectionTitleSize', e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview em tempo real</p>
        <LivePreview config={config} />
      </div>
    </div>
  );
}
