import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Key, RefreshCw, Trash2, Eye, EyeOff, Shield, Webhook, ArrowRightLeft, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

const API_BASE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/crm-webhook`;

const cardCls = "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]";
const inputCls = "bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white";
const mutedText = "text-[hsl(var(--admin-text-muted))]";
const btnOutline = "border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]";

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'pdl_';
  for (let i = 0; i < 40; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

function ApiKeysSection() {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
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

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copiado!'); };

  return (
    <Card className={cardCls}>
      <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Key className="h-5 w-5" />Chaves de API</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {generatedKey && (
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm font-medium text-amber-300 mb-2">⚠️ Copie esta chave agora! Ela não será exibida novamente.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-[hsl(var(--admin-bg))] p-2 rounded font-mono break-all text-white">{showKey ? generatedKey : '••••••••••••••••••••••••••'}</code>
              <Button size="icon" variant="outline" className={btnOutline} onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
              <Button size="icon" variant="outline" className={btnOutline} onClick={() => copyToClipboard(generatedKey)}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <Label className={mutedText}>Nome da integração</Label>
            <Input placeholder="Ex: CRM Principal, ERP..." value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className={inputCls} />
          </div>
          <Button className="self-end bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white" onClick={() => newKeyName && createKey.mutate(newKeyName)} disabled={!newKeyName || createKey.isPending}>
            <Key className="h-4 w-4 mr-2" />Gerar Chave
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 bg-[hsl(var(--admin-bg))] animate-pulse rounded" />)}</div>
        ) : (
          <Table>
            <TableHeader><TableRow className="border-[hsl(var(--admin-card-border))]">
              <TableHead className={mutedText}>Nome</TableHead><TableHead className={mutedText}>Prefixo</TableHead>
              <TableHead className={mutedText}>Status</TableHead><TableHead className={mutedText}>Último uso</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id} className="border-[hsl(var(--admin-card-border))]">
                  <TableCell className="font-medium text-white">{key.name}</TableCell>
                  <TableCell><code className="text-xs text-[hsl(var(--admin-text-muted))]">{key.key_prefix}...</code></TableCell>
                  <TableCell><AdminStatusBadge label={key.is_active ? 'Ativa' : 'Inativa'} variant={key.is_active ? 'success' : 'neutral'} /></TableCell>
                  <TableCell className={`text-sm ${mutedText}`}>{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString('pt-BR') : 'Nunca'}</TableCell>
                  <TableCell><Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => deleteKey.mutate(key.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
              {apiKeys.length === 0 && (
                <TableRow><TableCell colSpan={5} className={`text-center ${mutedText} py-8`}>Nenhuma chave API criada ainda</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function WebhookLogsSection() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => { const { data, error } = await supabase.from('webhook_logs').select('*').order('created_at', { ascending: false }).limit(50); if (error) throw error; return data; },
    refetchInterval: 10000,
  });

  return (
    <Card className={cardCls}>
      <CardHeader><CardTitle className="flex items-center gap-2 text-white"><RefreshCw className="h-5 w-5" />Logs de Webhook (últimos 50)</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-[hsl(var(--admin-bg))] animate-pulse rounded" />)}</div>
        ) : logs.length === 0 ? (
          <p className={`text-center ${mutedText} py-8`}>Nenhum log registrado ainda</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow className="border-[hsl(var(--admin-card-border))]">
                <TableHead className={mutedText}>Data</TableHead><TableHead className={mutedText}>Evento</TableHead>
                <TableHead className={mutedText}>Direção</TableHead><TableHead className={mutedText}>Status</TableHead><TableHead className={mutedText}>Erro</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-[hsl(var(--admin-card-border))]">
                    <TableCell className={`text-xs ${mutedText}`}>{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell><Badge variant="outline" className={`border-[hsl(var(--admin-card-border))] ${mutedText}`}>{log.event_type}</Badge></TableCell>
                    <TableCell><AdminStatusBadge label={log.direction === 'inbound' ? '⬇ Entrada' : '⬆ Saída'} variant={log.direction === 'inbound' ? 'info' : 'neutral'} /></TableCell>
                    <TableCell><AdminStatusBadge label={String(log.status_code)} variant={log.status_code === 200 ? 'success' : 'danger'} /></TableCell>
                    <TableCell className="text-xs text-red-400 max-w-[200px] truncate">{log.error_message || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DocSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card className={cardCls}>
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg text-white"><Icon className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))] rounded-lg p-4 overflow-x-auto text-xs font-mono text-[hsl(var(--admin-text-muted))]"><code>{code}</code></pre>
      <Button size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-white" onClick={() => { navigator.clipboard.writeText(code); toast.success('Código copiado!'); }}><Copy className="h-3 w-3" /></Button>
    </div>
  );
}

function ApiDocumentation() {
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copiado!'); };

  return (
    <div className="space-y-6">
      <DocSection title="URL Base da API" icon={Webhook}>
        <div className="flex items-center gap-2 p-3 bg-[hsl(var(--admin-bg))] rounded-lg border border-[hsl(var(--admin-card-border))]">
          <code className={`flex-1 text-sm font-mono break-all ${mutedText}`}>{API_BASE_URL}</code>
          <Button size="icon" variant="outline" className={btnOutline} onClick={() => copyToClipboard(API_BASE_URL)}><Copy className="h-4 w-4" /></Button>
        </div>
        <p className={`text-sm ${mutedText} mt-3`}>Todas as requisições devem incluir o header <code className="bg-[hsl(var(--admin-bg))] px-1 rounded text-white">x-api-key</code> com sua chave de API.</p>
      </DocSection>

      <DocSection title="Autenticação" icon={Shield}>
        <CodeBlock code={`// Headers obrigatórios\n{\n  "Content-Type": "application/json",\n  "x-api-key": "pdl_SuaChaveApiAqui..."\n}`} />
        <p className={`text-sm ${mutedText} mt-3`}>Gere sua chave na aba "Chaves de API". Toda requisição sem chave válida retorna <code className="text-red-400">401 Unauthorized</code>.</p>
      </DocSection>

      <DocSection title="Sincronizar Produto" icon={Package}>
        <p className={`text-sm ${mutedText} mb-3`}>Cria ou atualiza um produto. Se o SKU ou slug já existir, atualiza. Caso contrário, cria novo.</p>
        <CodeBlock code={`POST ${API_BASE_URL}\n\n{\n  "event": "product.sync",\n  "data": {\n    "external_id": "CRM-001",\n    "name": "Letreiro Neon LED Personalizado",\n    "sku": "LN-001",\n    "price": 189.90,\n    "promotional_price": 159.90,\n    "stock": 50,\n    "status": "active"\n  }\n}`} />
      </DocSection>

      <DocSection title="Registrar Venda" icon={ShoppingCart}>
        <p className={`text-sm ${mutedText} mb-3`}>Quando uma venda é feita no CRM, este evento cria o pedido e dá baixa no estoque automaticamente.</p>
        <CodeBlock code={`POST ${API_BASE_URL}\n\n{\n  "event": "sale.created",\n  "data": {\n    "external_order_id": "CRM-VENDA-1234",\n    "customer_name": "João Silva",\n    "customer_email": "joao@email.com",\n    "payment_method": "pix",\n    "total": 319.80,\n    "items": [{ "product_sku": "LN-001", "quantity": 2, "unit_price": 159.90 }]\n  }\n}`} />
      </DocSection>

      <DocSection title="Atualizar Estoque" icon={ArrowRightLeft}>
        <CodeBlock code={`POST ${API_BASE_URL}\n\n{\n  "event": "stock.update",\n  "data": {\n    "product_sku": "LN-001",\n    "new_stock": 45,\n    "reason": "Ajuste de inventário CRM"\n  }\n}`} />
      </DocSection>

      <DocSection title="Listar Produtos" icon={Package}>
        <CodeBlock code={`POST ${API_BASE_URL}\n\n{\n  "event": "products.list",\n  "data": { "status": "active", "limit": 100 }\n}`} />
      </DocSection>

      <DocSection title="Listar Pedidos" icon={ShoppingCart}>
        <CodeBlock code={`POST ${API_BASE_URL}\n\n{\n  "event": "orders.list",\n  "data": { "status": "completed", "limit": 50 }\n}`} />
      </DocSection>

      <DocSection title="Consultar Estoque" icon={BarChart3}>
        <CodeBlock code={`POST ${API_BASE_URL}\n\n{\n  "event": "stock.list",\n  "data": { "low_stock_only": true }\n}`} />
      </DocSection>
    </div>
  );
}

export default function AdminApiDocsPage() {
  return (
    <AdminLayout title="API & Integração CRM">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Webhook className="h-6 w-6 text-[hsl(var(--admin-accent-purple))]" />
            API & Integração CRM
          </h1>
          <p className={`${mutedText} mt-1`}>Gerencie chaves de API, visualize logs e consulte a documentação para integrar com seu CRM.</p>
        </div>

        <Tabs defaultValue="docs" className="space-y-4">
          <TabsList className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))]">
            <TabsTrigger value="docs">📄 Documentação</TabsTrigger>
            <TabsTrigger value="keys">🔑 Chaves de API</TabsTrigger>
            <TabsTrigger value="logs">📊 Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="docs"><ApiDocumentation /></TabsContent>
          <TabsContent value="keys"><ApiKeysSection /></TabsContent>
          <TabsContent value="logs"><WebhookLogsSection /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
