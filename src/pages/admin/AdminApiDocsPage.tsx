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

const API_BASE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/crm-webhook`;

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'pdl_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
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
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      const key = generateApiKey();
      const { error } = await supabase.from('api_keys').insert({
        name,
        key_hash: key, // In production, hash this
        key_prefix: key.substring(0, 8),
        permissions: ['read', 'write', 'sync'],
      });
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      setGeneratedKey(key);
      setShowKey(true);
      setNewKeyName('');
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Chave API criada com sucesso!');
    },
    onError: () => toast.error('Erro ao criar chave API'),
  });

  const deleteKey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('Chave removida');
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Chaves de API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {generatedKey && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Copie esta chave agora! Ela não será exibida novamente.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white dark:bg-black p-2 rounded font-mono break-all">
                {showKey ? generatedKey : '••••••••••••••••••••••••••'}
              </code>
              <Button size="icon" variant="outline" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(generatedKey)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="key-name">Nome da integração</Label>
            <Input
              id="key-name"
              placeholder="Ex: CRM Principal, ERP, Sistema Externo..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <Button
            className="self-end"
            onClick={() => newKeyName && createKey.mutate(newKeyName)}
            disabled={!newKeyName || createKey.isPending}
          >
            <Key className="h-4 w-4 mr-2" />
            Gerar Chave
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Prefixo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último uso</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell><code className="text-xs">{key.key_prefix}...</code></TableCell>
                  <TableCell>
                    <Badge variant={key.is_active ? 'default' : 'secondary'}>
                      {key.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString('pt-BR') : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteKey.mutate(key.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {apiKeys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma chave API criada ainda
                  </TableCell>
                </TableRow>
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Logs de Webhook (últimos 50)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}</div>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum log registrado ainda</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Direção</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{new Date(log.created_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell><Badge variant="outline">{log.event_type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={log.direction === 'inbound' ? 'default' : 'secondary'}>
                        {log.direction === 'inbound' ? '⬇ Entrada' : '⬆ Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.status_code === 200 ? 'default' : 'destructive'}>
                        {log.status_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-destructive max-w-[200px] truncate">{log.error_message || '-'}</TableCell>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CodeBlock({ code, language = 'json' }: { code: string; language?: string }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  return (
    <div className="relative group">
      <pre className="bg-muted/50 border rounded-lg p-4 overflow-x-auto text-xs font-mono">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
        onClick={copyToClipboard}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}

function ApiDocumentation() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  return (
    <div className="space-y-6">
      {/* Base URL */}
      <DocSection title="URL Base da API" icon={Webhook}>
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <code className="flex-1 text-sm font-mono break-all">{API_BASE_URL}</code>
          <Button size="icon" variant="outline" onClick={() => copyToClipboard(API_BASE_URL)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Todas as requisições devem incluir o header <code className="bg-muted px-1 rounded">x-api-key</code> com sua chave de API.
        </p>
      </DocSection>

      {/* Authentication */}
      <DocSection title="Autenticação" icon={Shield}>
        <CodeBlock code={`// Headers obrigatórios
{
  "Content-Type": "application/json",
  "x-api-key": "pdl_SuaChaveApiAqui..."
}`} />
        <p className="text-sm text-muted-foreground mt-3">
          Gere sua chave na aba "Chaves de API". Toda requisição sem chave válida retorna <code>401 Unauthorized</code>.
        </p>
      </DocSection>

      {/* Product Sync */}
      <DocSection title="Sincronizar Produto" icon={Package}>
        <p className="text-sm text-muted-foreground mb-3">
          Cria ou atualiza um produto. Se o SKU ou slug já existir, atualiza. Caso contrário, cria novo.
        </p>
        <CodeBlock code={`POST ${API_BASE_URL}

{
  "event": "product.sync",
  "data": {
    "external_id": "CRM-001",
    "name": "Letreiro Neon LED Personalizado",
    "sku": "LN-001",
    "price": 189.90,
    "promotional_price": 159.90,
    "stock": 50,
    "cost_material": 45.00,
    "cost_labor": 30.00,
    "cost_shipping": 12.00,
    "status": "active"
  },
  "timestamp": "2026-02-26T10:00:00Z"
}

// Resposta:
{
  "success": true,
  "event": "product.sync",
  "result": {
    "action": "created",  // ou "updated"
    "product_id": "uuid-do-produto"
  },
  "processed_at": "2026-02-26T10:00:01Z"
}`} />
      </DocSection>

      {/* Sale Created */}
      <DocSection title="Registrar Venda (CRM → Pincel de Luz)" icon={ShoppingCart}>
        <p className="text-sm text-muted-foreground mb-3">
          Quando uma venda é feita no CRM, este evento cria o pedido e dá baixa no estoque automaticamente.
        </p>
        <CodeBlock code={`POST ${API_BASE_URL}

{
  "event": "sale.created",
  "data": {
    "external_order_id": "CRM-VENDA-1234",
    "customer_name": "João Silva",
    "customer_email": "joao@email.com",
    "customer_phone": "(11) 99999-9999",
    "payment_method": "pix",
    "total": 319.80,
    "items": [
      {
        "product_sku": "LN-001",
        "quantity": 2,
        "unit_price": 159.90
      }
    ],
    "notes": "Venda originada do CRM"
  }
}

// Resposta:
{
  "success": true,
  "event": "sale.created",
  "result": {
    "action": "order_created",
    "order_id": "uuid-do-pedido",
    "order_number": "PL2602-1234"
  }
}`} />
      </DocSection>

      {/* Stock Update */}
      <DocSection title="Atualizar Estoque" icon={ArrowRightLeft}>
        <p className="text-sm text-muted-foreground mb-3">
          Atualiza o estoque de um produto diretamente. Use para sincronizar estoque entre sistemas.
        </p>
        <CodeBlock code={`POST ${API_BASE_URL}

{
  "event": "stock.update",
  "data": {
    "product_sku": "LN-001",
    "new_stock": 45,
    "reason": "Ajuste de inventário CRM"
  }
}

// Alternativas de identificação:
// "product_id": "uuid-do-produto"
// "product_slug": "letreiro-neon-led-personalizado"

// Resposta:
{
  "success": true,
  "result": {
    "action": "stock_updated",
    "product_id": "uuid",
    "old_stock": 50,
    "new_stock": 45
  }
}`} />
      </DocSection>

      {/* List Products */}
      <DocSection title="Listar Produtos" icon={Package}>
        <p className="text-sm text-muted-foreground mb-3">
          Retorna todos os produtos com preços, estoque e custos. Ideal para sincronizar catálogo no CRM.
        </p>
        <CodeBlock code={`POST ${API_BASE_URL}

{
  "event": "products.list",
  "data": {
    "status": "active",
    "limit": 100
  }
}

// Resposta: array de produtos com id, name, sku, price, stock, custos...`} />
      </DocSection>

      {/* List Orders */}
      <DocSection title="Listar Pedidos" icon={ShoppingCart}>
        <CodeBlock code={`POST ${API_BASE_URL}

{
  "event": "orders.list",
  "data": {
    "status": "completed",
    "limit": 50
  }
}`} />
      </DocSection>

      {/* Stock List */}
      <DocSection title="Consultar Estoque" icon={BarChart3}>
        <CodeBlock code={`POST ${API_BASE_URL}

{
  "event": "stock.list",
  "data": {
    "low_stock_only": true
  }
}

// Retorna produtos com estoque baixo (abaixo do mínimo)`} />
      </DocSection>

      {/* Integration Example */}
      <DocSection title="Exemplo de Integração com IA Lovable" icon={ArrowRightLeft}>
        <p className="text-sm text-muted-foreground mb-3">
          Para integrar seu CRM com a Pincel de Luz usando IA, utilize o seguinte prompt no Lovable do outro sistema:
        </p>
        <CodeBlock language="text" code={`// Prompt para o Lovable do CRM:

"Crie uma integração webhook com a API da Pincel de Luz.

URL: ${API_BASE_URL}
Autenticação: Header x-api-key com a chave fornecida

Funcionalidades:
1. Quando um produto for criado/editado no CRM, enviar evento 'product.sync'
2. Quando uma venda for registrada, enviar evento 'sale.created' 
   para dar baixa no estoque da Pincel de Luz
3. A cada hora, consultar 'products.list' para sincronizar preços e estoque
4. Quando receber venda da Pincel de Luz (via webhook), 
   registrar no CRM com 'sale.created'

Formato de todas as requisições:
POST com JSON { event: string, data: object }
Header: x-api-key: [CHAVE_API]"
`} />
      </DocSection>

      {/* Webhook Outbound */}
      <DocSection title="Webhook de Saída (Pincel de Luz → CRM)" icon={ArrowRightLeft}>
        <p className="text-sm text-muted-foreground mb-3">
          Para receber notificações quando uma venda acontecer na Pincel de Luz, configure uma URL de webhook no seu CRM.
          O sistema enviará um POST para sua URL com os dados da venda.
        </p>
        <CodeBlock code={`// Payload enviado para o CRM quando uma venda acontecer:
{
  "event": "sale.notification",
  "source": "pincel-de-luz",
  "data": {
    "order_id": "uuid",
    "order_number": "PL2602-1234",
    "customer_name": "João Silva",
    "customer_email": "joao@email.com",
    "total": 319.80,
    "items": [...],
    "created_at": "2026-02-26T10:00:00Z"
  }
}

// Configure a URL do seu CRM na aba Configurações > 
// Webhook CRM URL para ativar notificações automáticas.`} />
      </DocSection>
    </div>
  );
}

export default function AdminApiDocsPage() {
  return (
    <AdminLayout title="API & Integração CRM">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="h-6 w-6" />
            API & Integração CRM
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie chaves de API, visualize logs e consulte a documentação para integrar com seu CRM.
          </p>
        </div>

        <Tabs defaultValue="docs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="docs">📄 Documentação</TabsTrigger>
            <TabsTrigger value="keys">🔑 Chaves de API</TabsTrigger>
            <TabsTrigger value="logs">📊 Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="docs">
            <ApiDocumentation />
          </TabsContent>

          <TabsContent value="keys">
            <ApiKeysSection />
          </TabsContent>

          <TabsContent value="logs">
            <WebhookLogsSection />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
