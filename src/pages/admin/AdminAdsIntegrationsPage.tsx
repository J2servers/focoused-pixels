import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Megaphone, Save, Loader2, KeyRound } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

type Platform =
  | 'meta' | 'google_ads' | 'ga4' | 'tiktok' | 'kwai' | 'pinterest'
  | 'awin' | 'hotmart' | 'eduzz' | 'shopee_ads' | 'mercado_livre_ads';

interface AdsIntegration {
  id: string;
  platform: Platform;
  display_name: string;
  enabled: boolean;
  pixel_id: string | null;
  account_id: string | null;
  measurement_id: string | null;
  conversion_id: string | null;
  conversion_label: string | null;
  domain_verification_id: string | null;
  pixel_enabled: boolean;
  capi_enabled: boolean;
  catalog_sync_enabled: boolean;
  metrics_sync_enabled: boolean;
  capi_token_secret_name: string | null;
  api_token_secret_name: string | null;
}

const FIELD_HINT: Record<Platform, { primary: string; secondary?: string }> = {
  meta: { primary: 'Pixel ID' },
  google_ads: { primary: 'AW-XXXXXXXXX', secondary: 'Conversion Label' },
  ga4: { primary: 'G-XXXXXXX (Measurement ID)' },
  tiktok: { primary: 'Pixel ID' },
  kwai: { primary: 'Pixel ID' },
  pinterest: { primary: 'Tag ID' },
  awin: { primary: 'Advertiser ID' },
  hotmart: { primary: 'Hotmart ID' },
  eduzz: { primary: 'Eduzz ID' },
  shopee_ads: { primary: 'Shopee Account ID' },
  mercado_livre_ads: { primary: 'ML Account ID' },
};

export default function AdminAdsIntegrationsPage() {
  const [items, setItems] = useState<AdsIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ads_integrations')
      .select('*')
      .order('display_name');
    if (error) toast.error('Erro ao carregar integrações');
    setItems((data as AdsIntegration[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateLocal = (id: string, patch: Partial<AdsIntegration>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const save = async (item: AdsIntegration) => {
    setSavingId(item.id);
    const { error } = await supabase
      .from('ads_integrations')
      .update({
        enabled: item.enabled,
        pixel_id: item.pixel_id,
        account_id: item.account_id,
        measurement_id: item.measurement_id,
        conversion_id: item.conversion_id,
        conversion_label: item.conversion_label,
        domain_verification_id: item.domain_verification_id,
        pixel_enabled: item.pixel_enabled,
        capi_enabled: item.capi_enabled,
        catalog_sync_enabled: item.catalog_sync_enabled,
        metrics_sync_enabled: item.metrics_sync_enabled,
      })
      .eq('id', item.id);
    setSavingId(null);
    if (error) { toast.error('Falha ao salvar: ' + error.message); return; }
    toast.success(`${item.display_name} atualizado`);
  };

  return (
    <AdminLayout title="Tráfego Pago">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
            <Megaphone className="h-6 w-6 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Integrações de Ads</h1>
            <p className="text-sm text-muted-foreground">
              Pixels, Conversions API (CAPI), métricas e catálogos
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item) => {
              const hint = FIELD_HINT[item.platform];
              const needsSecret = item.capi_enabled || item.metrics_sync_enabled;
              return (
                <Card key={item.id} className="border-border/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{item.display_name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {item.platform}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`en-${item.id}`} className="text-xs">Ativo</Label>
                        <Switch
                          id={`en-${item.id}`}
                          checked={item.enabled}
                          onCheckedChange={(v) => updateLocal(item.id, { enabled: v })}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">{hint.primary}</Label>
                      <Input
                        value={item.pixel_id ?? ''}
                        onChange={(e) => updateLocal(item.id, { pixel_id: e.target.value })}
                        placeholder={hint.primary}
                        className="mt-1"
                      />
                    </div>

                    {item.platform === 'ga4' && (
                      <div>
                        <Label className="text-xs">Measurement ID</Label>
                        <Input
                          value={item.measurement_id ?? ''}
                          onChange={(e) => updateLocal(item.id, { measurement_id: e.target.value })}
                          placeholder="G-XXXXXXX"
                          className="mt-1"
                        />
                      </div>
                    )}

                    {item.platform === 'google_ads' && (
                      <>
                        <div>
                          <Label className="text-xs">Conversion ID</Label>
                          <Input
                            value={item.conversion_id ?? ''}
                            onChange={(e) => updateLocal(item.id, { conversion_id: e.target.value })}
                            placeholder="AW-XXXXXXXXX"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Conversion Label</Label>
                          <Input
                            value={item.conversion_label ?? ''}
                            onChange={(e) => updateLocal(item.id, { conversion_label: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}

                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={item.pixel_enabled}
                          onCheckedChange={(v) => updateLocal(item.id, { pixel_enabled: v })}
                        />
                        Pixel
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={item.capi_enabled}
                          onCheckedChange={(v) => updateLocal(item.id, { capi_enabled: v })}
                        />
                        CAPI
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={item.metrics_sync_enabled}
                          onCheckedChange={(v) => updateLocal(item.id, { metrics_sync_enabled: v })}
                        />
                        Métricas
                      </label>
                      <label className="flex items-center gap-2">
                        <Switch
                          checked={item.catalog_sync_enabled}
                          onCheckedChange={(v) => updateLocal(item.id, { catalog_sync_enabled: v })}
                        />
                        Catálogo
                      </label>
                    </div>

                    {needsSecret && item.capi_token_secret_name && (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/30">
                        <KeyRound className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="text-xs text-amber-200">
                          Secret necessário: <Badge variant="outline" className="ml-1 font-mono text-[10px]">{item.capi_token_secret_name}</Badge>
                        </span>
                      </div>
                    )}

                    <Button
                      onClick={() => save(item)}
                      disabled={savingId === item.id}
                      className="w-full"
                      size="sm"
                    >
                      {savingId === item.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
