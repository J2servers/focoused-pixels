import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Copy, Key, RefreshCw, Trash2, Eye, EyeOff, Shield, Webhook, ArrowRightLeft, Package, ShoppingCart, BarChart3, Zap, Clock, CheckCircle, AlertTriangle, ExternalLink, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

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

function copyText(text: string) { navigator.clipboard.writeText(text); toast.success('Copiado!'); }

// ─── API Keys Section ─────────────────────────────────────────
function ApiKeysSection() {
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
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminSummaryCard title="Total de Chaves" value={apiKeys.length} icon={Key} variant="purple" />
        <AdminSummaryCard title="Ativas" value={apiKeys.filter(k => k.is_active).length} icon={CheckCircle} variant="green" />
        <AdminSummaryCard title="Último Uso" value={apiKeys.some(k => k.last_used_at) ? format(new Date(apiKeys.filter(k => k.last_used_at).sort((a,b) => new Date(b.last_used_at!).getTime() - new Date(a.last_used_at!).getTime())[0]?.last_used_at || ''), 'dd/MM', { locale: ptBR }) : 'Nunca'} icon={Clock} variant="blue" />
      </div>

      {/* Generated Key Alert */}
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
                  <code className="flex-1 text-xs bg-[hsl(var(--admin-bg))] p-2.5 rounded-lg font-mono break-all text-white border border-[hsl(var(--admin-card-border))]">{showKey ? generatedKey : '••••••••••••••••••••••••••'}</code>
                  <Button size="icon" variant="outline" className={btnOutline} onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button size="icon" variant="outline" className={btnOutline} onClick={() => copyText(generatedKey)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Key */}
      <Card className={cardCls}>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />Criar Nova Chave</h3>
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

      {/* Keys Table */}
      <Card className={cardCls}>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Chaves Existentes</h3>
          {isLoading ? (
            <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 bg-[hsl(var(--admin-bg))] animate-pulse rounded-lg" />)}</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--admin-accent-purple)/0.1)] flex items-center justify-center mx-auto mb-3">
                <Key className="h-8 w-8 text-[hsl(var(--admin-accent-purple))]" />
              </div>
              <p className="text-white font-medium">Nenhuma chave API criada</p>
              <p className={`text-sm ${mutedText} mt-1`}>Crie sua primeira chave para integrar com sistemas externos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--admin-bg)/0.5)] border border-[hsl(var(--admin-card-border))] hover:border-[hsl(var(--admin-accent-purple)/0.3)] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.1)] flex items-center justify-center shrink-0">
                    <Key className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />
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

// ─── Webhook Logs Section ─────────────────────────────────────
function WebhookLogsSection() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => { const { data, error } = await supabase.from('webhook_logs').select('*').order('created_at', { ascending: false }).limit(50); if (error) throw error; return data; },
    refetchInterval: 10000,
  });

  const successCount = useMemo(() => logs.filter(l => l.status_code === 200).length, [logs]);
  const errorCount = useMemo(() => logs.filter(l => l.status_code !== 200).length, [logs]);
  const inboundCount = useMemo(() => logs.filter(l => l.direction === 'inbound').length, [logs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminSummaryCard title="Total de Logs" value={logs.length} icon={BarChart3} variant="purple" />
        <AdminSummaryCard title="Sucesso" value={successCount} icon={CheckCircle} variant="green" />
        <AdminSummaryCard title="Erros" value={errorCount} icon={AlertTriangle} variant="orange" />
        <AdminSummaryCard title="Entrada" value={inboundCount} icon={ArrowRightLeft} variant="blue" />
      </div>

      <Card className={cardCls}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><RefreshCw className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />Últimos 50 webhooks</h3>
            <Badge className="bg-green-500/15 text-green-400 border-0 text-[10px]">Auto-refresh 10s</Badge>
          </div>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-[hsl(var(--admin-bg))] animate-pulse rounded" />)}</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--admin-accent-purple)/0.1)] flex items-center justify-center mx-auto mb-3">
                <Webhook className="h-8 w-8 text-[hsl(var(--admin-accent-purple))]" />
              </div>
              <p className="text-white font-medium">Nenhum webhook registrado</p>
              <p className={`text-sm ${mutedText} mt-1`}>Quando sua API receber ou enviar chamadas, os logs aparecerão aqui</p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[hsl(var(--admin-bg)/0.3)] border border-[hsl(var(--admin-card-border))] hover:border-[hsl(var(--admin-accent-purple)/0.2)] transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${log.status_code === 200 ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className={`text-xs ${mutedText} w-28 shrink-0`}>{format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--admin-accent-purple)/0.1)] text-[hsl(var(--admin-accent-purple))] font-mono">{log.event_type}</span>
                  <AdminStatusBadge label={log.direction === 'inbound' ? '⬇ IN' : '⬆ OUT'} variant={log.direction === 'inbound' ? 'info' : 'neutral'} />
                  <span className="flex-1" />
                  <AdminStatusBadge label={String(log.status_code)} variant={log.status_code === 200 ? 'success' : 'danger'} />
                  {log.error_message && <span className="text-xs text-red-400 max-w-[150px] truncate">{log.error_message}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── API Documentation Section ────────────────────────────────
function EndpointCard({ method, event, title, description, payload, response }: {
  method: string; event: string; title: string; description: string; payload: string; response?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className={`${cardCls} hover:border-[hsl(var(--admin-accent-purple)/0.3)] transition-colors`}>
      <CardContent className="p-0">
        <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 flex items-center gap-3">
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/15 text-green-400 shrink-0">{method}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-accent-purple))]">{event}</code>
            </div>
            <p className={`text-xs ${mutedText} mt-0.5`}>{description}</p>
          </div>
          <span className={`text-xs ${mutedText} transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-[hsl(var(--admin-card-border))]">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] uppercase tracking-wider ${mutedText}`}>Payload</span>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-[hsl(var(--admin-text-muted))] hover:text-white" onClick={() => copyText(payload)}><Copy className="h-3 w-3 mr-1" />Copiar</Button>
              </div>
              <pre className="bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))] rounded-lg p-3 overflow-x-auto text-xs font-mono text-[hsl(var(--admin-text-muted))]">{payload}</pre>
            </div>
            {response && (
              <div>
                <span className={`text-[10px] uppercase tracking-wider ${mutedText}`}>Resposta</span>
                <pre className="bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border))] rounded-lg p-3 overflow-x-auto text-xs font-mono text-green-400/70 mt-1">{response}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApiDocumentation() {
  return (
    <div className="space-y-6">
      {/* Base URL + Auth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={cardCls}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Webhook className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />
              <h3 className="text-sm font-semibold text-white">URL Base</h3>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-[hsl(var(--admin-bg))] rounded-lg border border-[hsl(var(--admin-card-border))]">
              <code className={`flex-1 text-xs font-mono break-all ${mutedText}`}>{API_BASE_URL}</code>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-white shrink-0" onClick={() => copyText(API_BASE_URL)}><Copy className="h-3 w-3" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cardCls}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Autenticação</h3>
            </div>
            <div className="p-2.5 bg-[hsl(var(--admin-bg))] rounded-lg border border-[hsl(var(--admin-card-border))]">
              <code className="text-xs font-mono text-[hsl(var(--admin-text-muted))]">
                Header: <span className="text-[hsl(var(--admin-accent-purple))]">x-api-key</span>: <span className="text-green-400">pdl_SuaChave...</span>
              </code>
            </div>
            <p className={`text-[11px] ${mutedText} mt-2`}>Gere chaves na aba "Chaves de API". Sem chave válida → <span className="text-red-400">401</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Endpoints */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />
          Endpoints Disponíveis
        </h3>
        <div className="space-y-3">
          <EndpointCard method="POST" event="product.sync" title="Sincronizar Produto" description="Cria ou atualiza produto por SKU/slug"
            payload={`{\n  "event": "product.sync",\n  "data": {\n    "name": "Letreiro Neon LED",\n    "sku": "LN-001",\n    "price": 189.90,\n    "stock": 50,\n    "status": "active"\n  }\n}`}
            response={`{ "success": true, "result": { "action": "created", "product_id": "uuid" } }`} />

          <EndpointCard method="POST" event="sale.created" title="Registrar Venda" description="Cria pedido e dá baixa no estoque"
            payload={`{\n  "event": "sale.created",\n  "data": {\n    "customer_name": "João Silva",\n    "customer_email": "joao@email.com",\n    "payment_method": "pix",\n    "total": 319.80,\n    "items": [{ "product_sku": "LN-001", "quantity": 2 }]\n  }\n}`}
            response={`{ "success": true, "result": { "order_id": "uuid", "order_number": "PL-1234" } }`} />

          <EndpointCard method="POST" event="stock.update" title="Atualizar Estoque" description="Atualiza estoque direto por SKU"
            payload={`{\n  "event": "stock.update",\n  "data": {\n    "product_sku": "LN-001",\n    "new_stock": 45,\n    "reason": "Ajuste CRM"\n  }\n}`} />

          <EndpointCard method="POST" event="products.list" title="Listar Produtos" description="Retorna catálogo para sincronização"
            payload={`{\n  "event": "products.list",\n  "data": { "status": "active", "limit": 100 }\n}`} />

          <EndpointCard method="POST" event="orders.list" title="Listar Pedidos" description="Consulta pedidos por status"
            payload={`{\n  "event": "orders.list",\n  "data": { "status": "completed", "limit": 50 }\n}`} />

          <EndpointCard method="POST" event="stock.list" title="Consultar Estoque" description="Lista produtos com estoque baixo"
            payload={`{\n  "event": "stock.list",\n  "data": { "low_stock_only": true }\n}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminApiDocsPage() {
  return (
    <AdminLayout title="API & Integração CRM">
      <div className="space-y-6">
        <AdminPageGuide
          title="🔌 Guia da Documentação API"
          description="Consulte endpoints e configure chaves de acesso à API."
          steps={[
            { title: "Endpoints", description: "Veja a lista completa de endpoints disponíveis com método, URL e descrição." },
            { title: "Autenticação", description: "Todas as requisições exigem uma chave API válida no header Authorization." },
            { title: "Testar chamadas", description: "Use os exemplos de cURL para testar endpoints diretamente no terminal." },
            { title: "Criar chave API", description: "Gere novas chaves de acesso com permissões específicas para cada integração." },
          ]}
        />

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-[hsl(var(--admin-accent-purple)/0.15)] flex items-center justify-center">
                <Webhook className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />
              </div>
              API & Integração CRM
            </h1>
            <p className={`${mutedText} mt-1 text-sm`}>Gerencie chaves, monitore webhooks e consulte a documentação da API</p>
          </div>
        </div>

        <Tabs defaultValue="docs" className="space-y-4">
          <TabsList className="admin-tabs-vivid bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))]">
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
