import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, RefreshCw, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WhatsAppMessage {
  id: string;
  instance_name: string;
  recipient_phone: string;
  recipient_name: string | null;
  message_text: string;
  status: string;
  error_message: string | null;
  order_number: string | null;
  sent_at: string | null;
  created_at: string;
}

const WhatsAppMessageLog = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterInstance, setFilterInstance] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filterInstance !== 'all') {
        query = query.eq('instance_name', filterInstance);
      }
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setMessages((data as WhatsAppMessage[]) || []);
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  }, [filterInstance, filterStatus]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const filtered = messages.filter(m => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.recipient_phone.includes(s) ||
      (m.recipient_name || '').toLowerCase().includes(s) ||
      (m.order_number || '').toLowerCase().includes(s) ||
      m.message_text.toLowerCase().includes(s)
    );
  });

  const statusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />;
    if (status === 'failed') return <XCircle className="h-3.5 w-3.5 text-red-400" />;
    return <Clock className="h-3.5 w-3.5 text-yellow-400" />;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      sent: { label: 'Enviado', className: 'bg-green-600/20 text-green-400 border-green-600/30' },
      failed: { label: 'Falhou', className: 'bg-red-600/20 text-red-400 border-red-600/30' },
      pending: { label: 'Pendente', className: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' },
    };
    const cfg = map[status] || map.pending;
    return (
      <Badge variant="outline" className={`gap-1 text-xs ${cfg.className}`}>
        {statusIcon(status)}
        {cfg.label}
      </Badge>
    );
  };

  // Stats
  const totalSent = messages.filter(m => m.status === 'sent').length;
  const totalFailed = messages.filter(m => m.status === 'failed').length;
  const inst1Sent = messages.filter(m => m.status === 'sent' && m.instance_name === 'pinceldeluz1').length;
  const inst2Sent = messages.filter(m => m.status === 'sent' && m.instance_name === 'pinceldeluz2').length;

  return (
    <Card className="bg-white/[0.04] border-white/[0.08]">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-400" />
            Histórico de Mensagens
          </CardTitle>
          <Button onClick={fetchMessages} disabled={loading}
            className="admin-btn admin-btn-view !min-h-0 !py-1.5 !px-3">
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{totalSent}</p>
            <p className="text-xs text-white/50">Enviadas</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{totalFailed}</p>
            <p className="text-xs text-white/50">Falharam</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{inst1Sent}</p>
            <p className="text-xs text-white/50">Via Principal</p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{inst2Sent}</p>
            <p className="text-xs text-white/50">Via Secundário</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input placeholder="Buscar por telefone, nome, pedido..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/[0.03] border-white/[0.08] text-white text-sm" />
          </div>
          <Select value={filterInstance} onValueChange={setFilterInstance}>
            <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/[0.08] text-white text-sm">
              <SelectValue placeholder="Instância" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas instâncias</SelectItem>
              <SelectItem value="pinceldeluz1">Principal</SelectItem>
              <SelectItem value="pinceldeluz2">Secundário</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] bg-white/[0.03] border-white/[0.08] text-white text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sent">Enviados</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-white/50 mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-white/50 py-8 text-sm">
            Nenhuma mensagem encontrada
          </p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map(msg => (
              <div key={msg.id}
                className="bg-white/[0.03] rounded-lg p-3 border border-[rgb(255 255 255 / 0.5)] hover:border-white/[0.08] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm">
                        {msg.recipient_name || msg.recipient_phone}
                      </span>
                      {msg.recipient_name && (
                        <span className="text-white/50 text-xs">{msg.recipient_phone}</span>
                      )}
                      {msg.order_number && (
                        <Badge variant="outline" className="text-xs border-white/[0.08] text-white/50">
                          #{msg.order_number}
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mt-1 line-clamp-2">
                      {msg.message_text}
                    </p>
                    {msg.error_message && (
                      <p className="text-red-400 text-xs mt-1">❌ {msg.error_message}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {statusBadge(msg.status)}
                    <Badge variant="outline" className="text-[10px] border-white/[0.08] text-white/50">
                      {msg.instance_name === 'pinceldeluz1' ? '📱 Principal' : '📱 Secundário'}
                    </Badge>
                    <span className="text-[10px] text-white/50">
                      {format(new Date(msg.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessageLog;

