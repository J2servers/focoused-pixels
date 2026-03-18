import { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import WhatsAppInstanceCard from '@/components/admin/whatsapp/WhatsAppInstanceCard';
import WhatsAppTestMessage from '@/components/admin/whatsapp/WhatsAppTestMessage';
import WhatsAppMessageLog from '@/components/admin/whatsapp/WhatsAppMessageLog';

const AdminWhatsAppPage = () => {
  const [instanceStatuses, setInstanceStatuses] = useState<Record<string, string>>({});

  const handleStatusChange = useCallback((name: string, status: string) => {
    setInstanceStatuses(prev => ({ ...prev, [name]: status }));
  }, []);

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
            Gerencie dois números com failover automático e acompanhe todas as mensagens enviadas
          </p>
        </div>

        {/* Instances Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WhatsAppInstanceCard
            instanceName="pinceldeluz1"
            displayName="WhatsApp Principal"
            priority={1}
            onStatusChange={handleStatusChange}
          />
          <WhatsAppInstanceCard
            instanceName="pinceldeluz2"
            displayName="WhatsApp Secundário"
            priority={2}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Test + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WhatsAppTestMessage instanceStatuses={instanceStatuses} />

          {/* How it works */}
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
            <CardHeader>
              <CardTitle className="text-white text-lg">🔄 Como funciona o failover?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <span className="text-green-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Tenta o Principal</h3>
                    <p className="text-[hsl(var(--admin-text-muted))] text-xs">O sistema envia pelo número de maior prioridade.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <span className="text-yellow-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Falhou? Tenta o Secundário</h3>
                    <p className="text-[hsl(var(--admin-text-muted))] text-xs">Se o primeiro falhar, o sistema automaticamente tenta o segundo número.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-blue-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Tudo é registrado</h3>
                    <p className="text-[hsl(var(--admin-text-muted))] text-xs">Cada tentativa é logada com qual número enviou, status e erros.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Log */}
        <WhatsAppMessageLog />
      </div>
    </AdminLayout>
  );
};

export default AdminWhatsAppPage;
