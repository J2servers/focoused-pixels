import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Webhook, Shield, Package } from 'lucide-react';
import { API_BASE_URL, cardCls, mutedText, copyText } from './primitives';

function EndpointCard({ method, event, title, description, payload, response }: {
  method: string; event: string; title: string; description: string; payload: string; response?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className={`${cardCls} hover:border-purple-500/30 transition-colors`}>
      <CardContent className="p-0">
        <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 flex items-center gap-3">
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/15 text-green-400 shrink-0">{method}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">{title}</h4>
              <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] text-purple-400">{event}</code>
            </div>
            <p className={`text-xs ${mutedText} mt-0.5`}>{description}</p>
          </div>
          <span className={`text-xs ${mutedText} transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/[0.08]">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] uppercase tracking-wider ${mutedText}`}>Payload</span>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-white/50 hover:text-white" onClick={() => copyText(payload)}><Copy className="h-3 w-3 mr-1" />Copiar</Button>
              </div>
              <pre className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 overflow-x-auto text-xs font-mono text-white/50">{payload}</pre>
            </div>
            {response && (
              <div>
                <span className={`text-[10px] uppercase tracking-wider ${mutedText}`}>Resposta</span>
                <pre className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 overflow-x-auto text-xs font-mono text-green-400/70 mt-1">{response}</pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ApiDocumentation() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className={cardCls}>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Webhook className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">URL Base</h3>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-white/[0.03] rounded-lg border border-white/[0.08]">
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
            <div className="p-2.5 bg-white/[0.03] rounded-lg border border-white/[0.08]">
              <code className="text-xs font-mono text-white/50">
                Header: <span className="text-purple-400">x-api-key</span>: <span className="text-green-400">pdl_SuaChave...</span>
              </code>
            </div>
            <p className={`text-[11px] ${mutedText} mt-2`}>Gere chaves na aba "Chaves de API". Sem chave válida → <span className="text-red-400">401</span></p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-purple-400" />
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
