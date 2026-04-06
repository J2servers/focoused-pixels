import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Phone, Loader2 } from 'lucide-react';

interface WhatsAppTestMessageProps {
  instanceStatuses: Record<string, string>;
}

const WhatsAppTestMessage = ({ instanceStatuses }: WhatsAppTestMessageProps) => {
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste da Pincel de Luz 🎨');
  const [sendMode, setSendMode] = useState<string>('auto');
  const [sending, setSending] = useState(false);

  const hasConnected = Object.values(instanceStatuses).some(s => s === 'connected');

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      toast.error('Informe o número de telefone');
      return;
    }
    setSending(true);
    try {
      const body: Record<string, string> = {
        action: 'sendText',
        number: testPhone,
        text: testMessage,
      };
      if (sendMode !== 'auto') {
        body.instanceName = sendMode;
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-evolution', { body });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Falha no envio');

      const sentVia = data?.data?.sentVia || sendMode;
      toast.success(`Mensagem enviada via ${sentVia === 'pinceldeluz1' ? 'Principal' : sentVia === 'pinceldeluz2' ? 'Secundário' : sentVia}!`);
    } catch (e: unknown) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'Desconhecido'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-400" />
          Enviar Mensagem de Teste
        </CardTitle>
        <CardDescription className="text-[hsl(var(--admin-text-muted))]">
          Teste o envio com failover automático ou escolha a instância
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-[hsl(var(--admin-text-muted))] mb-1.5 block">Enviar via</label>
          <Select value={sendMode} onValueChange={setSendMode}>
            <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">🔄 Automático (failover)</SelectItem>
              <SelectItem value="pinceldeluz1">📱 Principal</SelectItem>
              <SelectItem value="pinceldeluz2">📱 Secundário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-[hsl(var(--admin-text-muted))] mb-1.5 block">Número (com DDD)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
            <Input placeholder="11999999999" value={testPhone} onChange={e => setTestPhone(e.target.value)}
              className="pl-10 bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white" />
          </div>
        </div>
        <div>
          <label className="text-sm text-[hsl(var(--admin-text-muted))] mb-1.5 block">Mensagem</label>
          <Textarea value={testMessage} onChange={e => setTestMessage(e.target.value)} rows={3}
            className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white resize-none" />
        </div>
        <Button onClick={handleSendTest} disabled={!hasConnected || sending}
          className="admin-btn admin-btn-save w-full">
          {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Enviar Mensagem
        </Button>
        {!hasConnected && (
          <p className="text-xs text-yellow-400 text-center">⚠️ Conecte ao menos um WhatsApp primeiro</p>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppTestMessage;

