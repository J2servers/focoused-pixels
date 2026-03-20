import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  QrCode, Wifi, WifiOff, RefreshCw, Trash2,
  CheckCircle2, Loader2, AlertCircle, Smartphone
} from 'lucide-react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'unknown';

interface WhatsAppInstanceCardProps {
  instanceName: string;
  displayName: string;
  priority: number;
  onStatusChange?: (instanceName: string, status: ConnectionStatus) => void;
  onPhoneChange?: (instanceName: string, phone: string) => void;
}

const WhatsAppInstanceCard = ({ instanceName, displayName, priority, onStatusChange, onPhoneChange }: WhatsAppInstanceCardProps) => {
  const [status, setStatus] = useState<ConnectionStatus>('unknown');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      let newStatus: ConnectionStatus = 'disconnected';
      if (state === 'open' || state === 'connected') {
        newStatus = 'connected';
        setQrCode(null);
      } else if (state === 'connecting') {
        newStatus = 'connecting';
      }
      setStatus(newStatus);
      onStatusChange?.(instanceName, newStatus);
    } catch {
      setStatus('unknown');
      onStatusChange?.(instanceName, 'unknown');
    }
  }, [callEvolution, instanceName, onStatusChange]);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  useEffect(() => {
    if (status !== 'connected') {
      const interval = setInterval(checkStatus, 15000);
      return () => clearInterval(interval);
    }
  }, [status, checkStatus]);

  const handleCreateInstance = async () => {
    setActionLoading('create');
    try {
      const result = await callEvolution('create');
      toast.success(`Instância ${displayName} criada!`);
      if (result?.data?.qrcode?.base64) {
        setQrCode(result.data.qrcode.base64);
        setStatus('connecting');
      } else {
        await handleConnect();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('already') || msg.includes('exists')) {
        toast.info('Instância já existe. Gerando QR Code...');
        await handleConnect();
      } else {
        toast.error(`Erro: ${msg}`);
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
        setTimeout(async () => {
          const retry = await callEvolution('connect');
          if (retry?.data?.base64) {
            setQrCode(retry.data.base64);
            setStatus('connecting');
          }
        }, 2000);
      }
    } catch (e: unknown) {
      toast.error(`Erro: ${e instanceof Error ? e.message : 'Desconhecido'}`);
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
      toast.success(`${displayName} desconectado`);
    } catch (e: unknown) {
      toast.error(`Erro: ${e instanceof Error ? e.message : ''}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a instância ${displayName}?`)) return;
    setActionLoading('delete');
    try {
      await callEvolution('delete');
      setStatus('disconnected');
      setQrCode(null);
      toast.success('Instância excluída');
    } catch (e: unknown) {
      toast.error(`Erro: ${e instanceof Error ? e.message : ''}`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusConfigs = {
    connected: { label: 'Conectado', variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-600' },
    connecting: { label: 'Conectando...', variant: 'secondary' as const, icon: Loader2, className: 'bg-yellow-600' },
    disconnected: { label: 'Desconectado', variant: 'destructive' as const, icon: WifiOff, className: '' },
    unknown: { label: 'Verificando...', variant: 'outline' as const, icon: AlertCircle, className: '' },
  };
  const cfg = statusConfigs[status];

  return (
    <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4 text-green-400" />
              {displayName}
              <span className="text-xs text-[hsl(var(--admin-text-muted))]">#{priority}</span>
            </CardTitle>
            <CardDescription className="text-[hsl(var(--admin-text-muted))] text-xs mt-1">
              {instanceName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={cfg.variant} className={`gap-1 text-xs py-0.5 px-2 ${cfg.className}`}>
              <cfg.icon className={`h-3 w-3 ${status === 'connecting' ? 'animate-spin' : ''}`} />
              {cfg.label}
            </Badge>
            <Button variant="ghost" size="icon" onClick={checkStatus} className="h-7 w-7 text-[hsl(var(--admin-text-muted))] hover:text-white">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {status === 'connected' ? (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Wifi className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-white font-medium text-sm">Conectado e ativo</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={!!actionLoading}
                className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10 text-xs">
                <WifiOff className="h-3.5 w-3.5 mr-1" /> Desconectar
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={!!actionLoading}
                className="border-red-600/50 text-red-400 hover:bg-red-600/10 text-xs">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
              </Button>
            </div>
          </div>
        ) : qrCode ? (
          <div className="text-center space-y-3">
            <div className="bg-white rounded-xl p-3 inline-block mx-auto">
              <img
                src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="QR Code WhatsApp"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-[hsl(var(--admin-text-muted))] text-xs">
              WhatsApp → Menu (⋮) → Aparelhos conectados
            </p>
            <Button variant="outline" size="sm" onClick={handleConnect} disabled={!!actionLoading}
              className="border-[hsl(var(--admin-card-border))] text-[hsl(var(--admin-text-muted))] hover:text-white text-xs">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${actionLoading === 'connect' ? 'animate-spin' : ''}`} />
              Novo QR Code
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(var(--admin-card-border)/0.3)] flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-[hsl(var(--admin-text-muted))]" />
            </div>
            <p className="text-[hsl(var(--admin-text-muted))] text-sm">Não conectado</p>
            <Button onClick={handleCreateInstance} disabled={!!actionLoading} size="sm"
              className="bg-green-600 hover:bg-green-700 text-white">
              {actionLoading === 'create' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <QrCode className="h-4 w-4 mr-1" />}
              Conectar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppInstanceCard;
