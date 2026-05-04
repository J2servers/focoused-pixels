import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Copy, Key, Trash2, Eye, EyeOff, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cardCls, inputCls, mutedText, btnOutline, generateApiKey, copyText } from './primitives';

export function ApiKeysSection() {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => { const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false }); if (error) throw error; return data; },
  });

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      const key = generateApiKey();
      const { error } = await supabase.from('api_keys').insert({ name, key_hash: key, key_prefix: key.substring(0, 8), permissions: ['read', 'write', 'sync'] });
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => { setGeneratedKey(key); setShowKey(true); setNewKeyName(''); queryClient.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Chave API criada!'); },
    onError: () => toast.error('Erro ao criar chave API'),
  });

  const deleteKey = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('api_keys').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['api-keys'] }); toast.success('Chave removida'); },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminSummaryCard title="Total de Chaves" value={apiKeys.length} icon={Key} variant="purple" />
        <AdminSummaryCard title="Ativas" value={apiKeys.filter(k => k.is_active).length} icon={CheckCircle} variant="green" />
        <AdminSummaryCard title="Último Uso" value={apiKeys.some(k => k.last_used_at) ? format(new Date(apiKeys.filter(k => k.last_used_at).sort((a,b) => new Date(b.last_used_at!).getTime() - new Date(a.last_used_at!).getTime())[0]?.last_used_at || ''), 'dd/MM', { locale: ptBR }) : 'Nunca'} icon={Clock} variant="blue" />
      </div>

      {generatedKey && (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-300 mb-2">Copie esta chave agora! Ela não será exibida novamente.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white/[0.03] p-2.5 rounded-lg font-mono break-all text-white border border-white/[0.08]">{showKey ? generatedKey : '••••••••••••••••••••••••••'}</code>
                  <Button size="icon" variant="outline" className={btnOutline} onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button size="icon" variant="outline" className={btnOutline} onClick={() => copyText(generatedKey)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={cardCls}>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-purple-400" />Criar Nova Chave</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className={`${mutedText} text-xs uppercase tracking-wide`}>Nome da integração</Label>
              <Input placeholder="Ex: CRM Principal, ERP, Sistema Externo..." value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className={`${inputCls} mt-1`} />
            </div>
            <Button className="admin-btn admin-btn-create self-end" onClick={() => newKeyName && createKey.mutate(newKeyName)} disabled={!newKeyName || createKey.isPending}>
              <Key className="h-4 w-4 mr-2" />Gerar Chave
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={cardCls}>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Chaves Existentes</h3>
          {isLoading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 bg-white/[0.03] animate-pulse rounded-lg" />)}</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <Key className="h-8 w-8 text-purple-400" />
              </div>
              <p className="text-white font-medium">Nenhuma chave API criada</p>
              <p className={`text-sm ${mutedText} mt-1`}>Crie sua primeira chave para integrar com sistemas externos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Key className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{key.name}</p>
                    <p className={`text-xs ${mutedText} font-mono`}>{key.key_prefix}••••••••</p>
                  </div>
                  <AdminStatusBadge label={key.is_active ? 'Ativa' : 'Inativa'} variant={key.is_active ? 'success' : 'neutral'} />
                  <div className="text-right shrink-0">
                    <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>Último uso</p>
                    <p className="text-xs text-white">{key.last_used_at ? format(new Date(key.last_used_at), 'dd/MM/yy HH:mm', { locale: ptBR }) : 'Nunca'}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="admin-btn admin-btn-delete !min-h-0 !p-1 h-8 w-8 shrink-0" onClick={() => deleteKey.mutate(key.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
