import { AdminLayout } from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Webhook } from 'lucide-react';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { ApiKeysSection } from './apiDocs/ApiKeysSection';
import { WebhookLogsSection } from './apiDocs/WebhookLogsSection';
import { ApiDocumentation } from './apiDocs/ApiDocumentation';
import { mutedText } from './apiDocs/primitives';

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
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Webhook className="h-5 w-5 text-purple-400" />
              </div>
              API & Integração CRM
            </h1>
            <p className={`${mutedText} mt-1 text-sm`}>Gerencie chaves, monitore webhooks e consulte a documentação da API</p>
          </div>
        </div>

        <Tabs defaultValue="docs" className="space-y-4">
          <TabsList className="admin-tabs-vivid bg-[hsl(var(--admin-card))] border border-white/[0.08]">
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
