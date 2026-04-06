import { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Wifi, WifiOff, Phone, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import WhatsAppInstanceCard from '@/components/admin/whatsapp/WhatsAppInstanceCard';
import WhatsAppTestMessage from '@/components/admin/whatsapp/WhatsAppTestMessage';
import WhatsAppMessageLog from '@/components/admin/whatsapp/WhatsAppMessageLog';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const cardCls = "bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]";
const mutedText = "text-[hsl(var(--admin-text-muted))]";

const AdminWhatsAppPage = () => {
  const [instanceStatuses, setInstanceStatuses] = useState<Record<string, string>>({});
  const [instancePhones, setInstancePhones] = useState<Record<string, string>>({});

  const handleStatusChange = useCallback((name: string, status: string) => {
    setInstanceStatuses(prev => ({ ...prev, [name]: status }));
  }, []);

  const handlePhoneChange = useCallback((name: string, phone: string) => {
    setInstancePhones(prev => ({ ...prev, [name]: phone }));
  }, []);

  const connectedCount = Object.values(instanceStatuses).filter(s => s === 'connected').length;
  const totalInstances = 2;

  return (
    <AdminLayout title="WhatsApp Business">
      <div className="space-y-6">
        <AdminPageGuide
          title="📱 Guia do WhatsApp Business"
          description="Configure a integração com WhatsApp para atendimento e notificações."
          steps={[
            { title: "Conectar instância", description: "Configure a API Evolution com URL e chave para conectar seu WhatsApp." },
            { title: "Testar mensagem", description: "Envie uma mensagem de teste para validar a conexão antes de usar." },
            { title: "Logs de mensagem", description: "Acompanhe o histórico de todas as mensagens enviadas via WhatsApp." },
            { title: "Templates", description: "Use templates pré-definidos para mensagens de pedido, entrega e promoções." },
          ]}
        />

        {/* ─── Header ─── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-400" />
              </div>
              WhatsApp Business
            </h1>
            <p className={`${mutedText} mt-1 text-sm`}>Gerencie números com failover automático e acompanhe mensagens</p>
          </div>
        </div>

        {/* ─── Summary Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminSummaryCard title="Números Online" value={`${connectedCount}/${totalInstances}`} icon={Wifi} variant={connectedCount > 0 ? 'green' : 'orange'} />
          <AdminSummaryCard title="Status Geral" value={connectedCount === totalInstances ? 'Operacional' : connectedCount > 0 ? 'Parcial' : 'Offline'} icon={connectedCount === totalInstances ? CheckCircle : AlertTriangle} variant={connectedCount === totalInstances ? 'green' : 'orange'} />
          <AdminSummaryCard title="Failover" value={connectedCount >= 2 ? 'Ativo' : 'Limitado'} icon={Activity} variant={connectedCount >= 2 ? 'blue' : 'orange'} />
          <AdminSummaryCard title="Instâncias" value={totalInstances} icon={Phone} variant="purple" />
        </div>

        {/* ─── Connected Numbers Panel ─── */}
        <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/10 border-green-700/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-white font-semibold">Números Conectados</h2>
              <Badge className={`ml-auto text-xs ${connectedCount === totalInstances ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
                {connectedCount} de {totalInstances} online
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'pinceldeluz1', label: 'Principal', priority: 1 },
                { key: 'pinceldeluz2', label: 'Secundário', priority: 2 },
              ].map(inst => {
                const status = instanceStatuses[inst.key] || 'unknown';
                const phone = instancePhones[inst.key];
                const isConnected = status === 'connected';

                return (
                  <div key={inst.key}
                    className={`flex items-center gap-3 rounded-xl p-3.5 border transition-colors ${
                      isConnected
                        ? 'bg-green-500/5 border-green-600/20 hover:border-green-500/40'
                        : 'bg-red-500/5 border-red-600/20 hover:border-red-500/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isConnected ? 'bg-green-500/15' : 'bg-red-500/15'
                    }`}>
                      {isConnected
                        ? <Wifi className="h-5 w-5 text-green-400" />
                        : <WifiOff className="h-5 w-5 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        {inst.label}
                        <span className={`${mutedText} text-xs`}>#{inst.priority}</span>
                      </p>
                      {isConnected && phone ? (
                        <p className="text-green-400 text-sm font-mono">📱 {phone}</p>
                      ) : (
                        <p className="text-red-400 text-xs">
                          {status === 'connecting' ? 'Conectando...' : 'Desconectado'}
                        </p>
                      )}
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ─── Tabs ─── */}
        <Tabs defaultValue="instances" className="space-y-4">
          <TabsList className={`border ${cardCls}`}>
            <TabsTrigger value="instances">🔌 Conexões</TabsTrigger>
            <TabsTrigger value="messages">📨 Mensagens</TabsTrigger>
            <TabsTrigger value="test">🧪 Testar</TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WhatsAppInstanceCard instanceName="pinceldeluz1" displayName="WhatsApp Principal" priority={1} onStatusChange={handleStatusChange} onPhoneChange={handlePhoneChange} />
              <WhatsAppInstanceCard instanceName="pinceldeluz2" displayName="WhatsApp Secundário" priority={2} onStatusChange={handleStatusChange} onPhoneChange={handlePhoneChange} />
            </div>

            {/* Failover explanation */}
            <Card className={cardCls}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-accent-purple)/0.15)] flex items-center justify-center">🔄</div>
                  Como funciona o failover?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {[
                    { num: '1', color: 'green', title: 'Tenta o Principal', desc: 'Envia pelo número de maior prioridade.' },
                    { num: '2', color: 'amber', title: 'Falhou? Tenta o Secundário', desc: 'Se falhar, tenta automaticamente o segundo.' },
                    { num: '3', color: 'blue', title: 'Tudo é registrado', desc: 'Cada tentativa é logada com status e erros.' },
                  ].map(step => (
                    <div key={step.num} className="flex gap-3 items-start">
                      <div className={`w-8 h-8 rounded-lg bg-${step.color}-500/15 flex items-center justify-center shrink-0`}>
                        <span className={`text-${step.color}-400 font-bold text-sm`}>{step.num}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">{step.title}</h3>
                        <p className={`${mutedText} text-xs`}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages"><WhatsAppMessageLog /></TabsContent>
          <TabsContent value="test"><div className="max-w-lg"><WhatsAppTestMessage instanceStatuses={instanceStatuses} /></div></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWhatsAppPage;
