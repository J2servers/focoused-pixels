import { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Wifi, WifiOff, Phone } from 'lucide-react';
import WhatsAppInstanceCard from '@/components/admin/whatsapp/WhatsAppInstanceCard';
import WhatsAppTestMessage from '@/components/admin/whatsapp/WhatsAppTestMessage';
import WhatsAppMessageLog from '@/components/admin/whatsapp/WhatsAppMessageLog';

const AdminWhatsAppPage = () => {
  const [instanceStatuses, setInstanceStatuses] = useState<Record<string, string>>({});
  const [instancePhones, setInstancePhones] = useState<Record<string, string>>({});

  const handleStatusChange = useCallback((name: string, status: string) => {
    setInstanceStatuses(prev => ({ ...prev, [name]: status }));
  }, []);

  const handlePhoneChange = useCallback((name: string, phone: string) => {
    setInstancePhones(prev => ({ ...prev, [name]: phone }));
  }, []);

  const connectedInstances = Object.entries(instanceStatuses).filter(([, s]) => s === 'connected');

  return (
    <AdminLayout title="WhatsApp Business">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-green-400" />
            WhatsApp Business
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))] mt-1">
            Gerencie seus números com failover automático e acompanhe todas as mensagens
          </p>
        </div>

        {/* Connected Numbers Summary */}
        <Card className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-green-700/40">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="h-5 w-5 text-green-400" />
              <h2 className="text-white font-semibold text-lg">Números Conectados</h2>
              <Badge className={`ml-auto text-xs ${connectedInstances.length > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                {connectedInstances.length} de 2 online
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
                    className={`flex items-center gap-3 rounded-lg p-3 border ${
                      isConnected
                        ? 'bg-green-500/10 border-green-600/30'
                        : 'bg-red-500/10 border-red-600/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isConnected ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {isConnected
                        ? <Wifi className="h-5 w-5 text-green-400" />
                        : <WifiOff className="h-5 w-5 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        {inst.label}
                        <span className="text-[hsl(var(--admin-text-muted))] text-xs">#{inst.priority}</span>
                      </p>
                      {isConnected && phone ? (
                        <p className="text-green-400 text-sm font-mono">
                          📱 {phone}
                        </p>
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

        {/* Tabs for management */}
        <Tabs defaultValue="instances" className="space-y-4">
          <TabsList className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))]">
            <TabsTrigger value="instances">🔌 Conexões</TabsTrigger>
            <TabsTrigger value="messages">📨 Mensagens</TabsTrigger>
            <TabsTrigger value="test">🧪 Testar</TabsTrigger>
          </TabsList>

          {/* Connections Tab */}
          <TabsContent value="instances" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <WhatsAppInstanceCard
                instanceName="pinceldeluz1"
                displayName="WhatsApp Principal"
                priority={1}
                onStatusChange={handleStatusChange}
                onPhoneChange={handlePhoneChange}
              />
              <WhatsAppInstanceCard
                instanceName="pinceldeluz2"
                displayName="WhatsApp Secundário"
                priority={2}
                onStatusChange={handleStatusChange}
                onPhoneChange={handlePhoneChange}
              />
            </div>

            {/* How failover works */}
            <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
              <CardHeader>
                <CardTitle className="text-white text-lg">🔄 Como funciona o failover?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { num: '1', color: 'green', title: 'Tenta o Principal', desc: 'O sistema envia pelo número de maior prioridade.' },
                    { num: '2', color: 'yellow', title: 'Falhou? Tenta o Secundário', desc: 'Se o primeiro falhar, o sistema automaticamente tenta o segundo número.' },
                    { num: '3', color: 'blue', title: 'Tudo é registrado', desc: 'Cada tentativa é logada com qual número enviou, status e erros.' },
                  ].map(step => (
                    <div key={step.num} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-${step.color}-500/20 flex items-center justify-center shrink-0`}>
                        <span className={`text-${step.color}-400 font-bold text-sm`}>{step.num}</span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm">{step.title}</h3>
                        <p className="text-[hsl(var(--admin-text-muted))] text-xs">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <WhatsAppMessageLog />
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            <div className="max-w-lg">
              <WhatsAppTestMessage instanceStatuses={instanceStatuses} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWhatsAppPage;

