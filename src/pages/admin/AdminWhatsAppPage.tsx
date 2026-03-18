import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  QrCode, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Send, 
  Trash2, 
  Phone,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Smartphone
} from 'lucide-react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'unknown';

const AdminWhatsAppPage = () => {
  const [status, setStatus] = useState<ConnectionStatus>('unknown');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [instanceName] = useState('pinceldeluz');
  
  // Test message
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste da Pincel de Luz 🎨');

  const callEvolution = useCallback(async (action: string, extra: Record<string, string> = {}) => {
    const { data, error } = await supabase.functions.invoke('whatsapp-evolution', {
      body: { action, instanceName, ...extra },
    });
    if (error) throw new Error(error.message);
    return data;
  }, [instanceName]);

  const checkStatus = useCallback(async () => {
    try {
      const result = await callEvolution('status');
      const state = result?.data?.instance?.state || result?.data?.state;
      
      if (state === 'open' || state === 'connected') {
        setStatus('connected');
        setQrCode(null);
      } else if (state === 'connecting') {
        setStatus('connecting');
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('unknown');
    }
  }, [callEvolution]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Auto-refresh QR code and status
  useEffect(() => {
    if (status !== 'connected') {
      const interval = setInterval(checkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [status, checkStatus]);

  const handleCreateInstance = async () => {
    setActionLoading('create');
    try {
      const result = await callEvolution('create');
      toast.success('Instância criada com sucesso!');
      
      // If QR code was returned on creation
      if (result?.data?.qrcode?.base64) {
        setQrCode(result.data.qrcode.base64);
        setStatus('connecting');
      } else {
        // Get QR code
        await handleConnect();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      // If instance already exists, just connect
      if (msg.includes('already') || msg.includes('exists')) {
        toast.info('Instância já existe. Gerando QR Code...');
        await handleConnect();
      } else {
        toast.error(`Erro ao criar instância: ${msg}`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleConnect = async () => {
    setActionLoading('connect');
    try {
      const result = await callEvolution('connect');
      
      if (result?.data?.base64) {
        setQrCode(result.data.base64);
        setStatus('connecting');
        toast.success('QR Code gerado! Escaneie com o WhatsApp.');
      } else if (result?.data?.instance?.state === 'open') {
        setStatus('connected');
        setQrCode(null);
        toast.success('WhatsApp já está conectado!');
      } else {
        toast.info('Gerando QR Code...');
        // Retry after short delay
        setTimeout(async () => {
          const retry = await callEvolution('connect');
          if (retry?.data?.base64) {
            setQrCode(retry.data.base64);
            setStatus('connecting');
          }
        }, 2000);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro';
      toast.error(`Erro ao conectar: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async () => {
    setActionLoading('logout');
    try {
      await callEvolution('logout');
      setStatus('disconnected');
      setQrCode(null);
      toast.success('WhatsApp desconectado');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro';
      toast.error(`Erro: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir a instância? Será necessário reconfigurar.')) return;
    setActionLoading('delete');
    try {
      await callEvolution('delete');
      setStatus('disconnected');
      setQrCode(null);
      toast.success('Instância excluída');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro';
      toast.error(`Erro: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      toast.error('Informe o número de telefone');
      return;
    }
    setActionLoading('send');
    try {
      await callEvolution('sendText', { number: testPhone, text: testMessage });
      toast.success(`Mensagem enviada para ${testPhone}!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro';
      toast.error(`Erro ao enviar: ${msg}`);
    } finally {
      setActionLoading(null);
    }
  };

  const StatusBadge = () => {
    const configs = {
      connected: { label: 'Conectado', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-600' },
      connecting: { label: 'Conectando...', variant: 'secondary' as const, icon: Loader2, className: 'bg-yellow-600' },
      disconnected: { label: 'Desconectado', variant: 'destructive' as const, icon: WifiOff, className: '' },
      unknown: { label: 'Verificando...', variant: 'outline' as const, icon: AlertCircle, className: '' },
    };
    const cfg = configs[status];
    return (
      <Badge variant={cfg.variant} className={`gap-1.5 text-sm py-1 px-3 ${cfg.className}`}>
        <cfg.icon className={`h-3.5 w-3.5 ${status === 'connecting' ? 'animate-spin' : ''}`} />
        {cfg.label}
      </Badge>
    );
  };

  return (
    <AdminLayout title="WhatsApp Business">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="h-7 w-7 text-green-400" />
              WhatsApp Business
            </h1>
            <p className="text-[hsl(var(--admin-text-muted))] mt-1">
              Conecte seu WhatsApp para enviar notificações automáticas de vendas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge />
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={loading}
              className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Card */}
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <QrCode className="h-5 w-5 text-green-400" />
                Conexão WhatsApp
              </CardTitle>
              <CardDescription className="text-[hsl(var(--admin-text-muted))]">
                Escaneie o QR Code com o WhatsApp para conectar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === 'connected' ? (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                    <Wifi className="h-12 w-12 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">WhatsApp Conectado!</p>
                    <p className="text-[hsl(var(--admin-text-muted))] text-sm mt-1">
                      Mensagens automáticas estão ativas
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={!!actionLoading}
                      className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
                    >
                      <WifiOff className="h-4 w-4 mr-1" />
                      Desconectar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDelete}
                      disabled={!!actionLoading}
                      className="border-red-600/50 text-red-400 hover:bg-red-600/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ) : qrCode ? (
                <div className="text-center space-y-4">
                  <div className="bg-white rounded-xl p-4 inline-block mx-auto">
                    <img 
                      src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`} 
                      alt="QR Code WhatsApp" 
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">Escaneie o QR Code</p>
                    <p className="text-[hsl(var(--admin-text-muted))] text-xs mt-1">
                      Abra o WhatsApp → Menu (⋮) → Aparelhos conectados → Conectar um aparelho
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnect}
                    disabled={!!actionLoading}
                    className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-white"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${actionLoading === 'connect' ? 'animate-spin' : ''}`} />
                    Gerar Novo QR Code
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-[hsl(var(--admin-card-border)/0.3)] flex items-center justify-center">
                    <Smartphone className="h-12 w-12 text-[hsl(var(--admin-text-muted))]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Nenhum WhatsApp conectado</p>
                    <p className="text-[hsl(var(--admin-text-muted))] text-sm mt-1">
                      Clique no botão abaixo para iniciar a conexão
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateInstance}
                    disabled={!!actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {actionLoading === 'create' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4 mr-2" />
                    )}
                    Conectar WhatsApp
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Message Card */}
          <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-400" />
                Enviar Mensagem de Teste
              </CardTitle>
              <CardDescription className="text-[hsl(var(--admin-text-muted))]">
                Teste o envio de mensagens pelo WhatsApp conectado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-[hsl(var(--admin-text-muted))] mb-1.5 block">
                  Número (com DDD)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
                  <Input
                    placeholder="11999999999"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="pl-10 bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[hsl(var(--admin-text-muted))] mb-1.5 block">
                  Mensagem
                </label>
                <Textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={4}
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-card-border))] text-white resize-none"
                />
              </div>
              <Button
                onClick={handleSendTest}
                disabled={status !== 'connected' || !!actionLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading === 'send' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Mensagem de Teste
              </Button>
              {status !== 'connected' && (
                <p className="text-xs text-yellow-400 text-center">
                  ⚠️ Conecte o WhatsApp primeiro para enviar mensagens
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <CardHeader>
            <CardTitle className="text-white text-lg">📱 Como funciona?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold">1</span>
                </div>
                <h3 className="text-white font-medium">Conecte seu WhatsApp</h3>
                <p className="text-[hsl(var(--admin-text-muted))] text-sm">
                  Escaneie o QR Code com seu celular para vincular o WhatsApp ao sistema.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">2</span>
                </div>
                <h3 className="text-white font-medium">Notificações Automáticas</h3>
                <p className="text-[hsl(var(--admin-text-muted))] text-sm">
                  Quando uma venda é confirmada, o cliente recebe automaticamente uma mensagem.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <h3 className="text-white font-medium">Email + WhatsApp</h3>
                <p className="text-[hsl(var(--admin-text-muted))] text-sm">
                  O sistema envia email de confirmação E mensagem no WhatsApp simultaneamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminWhatsAppPage;
