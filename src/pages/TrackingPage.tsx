import { useState } from 'react';
import { Package, Search, MapPin, Calendar, Clock, CheckCircle2, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  date: string;
  time: string;
}

interface TrackingResult {
  code: string;
  events: TrackingEvent[];
  isDelivered: boolean;
  lastStatus: string;
  error?: string;
}

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [searchType, setSearchType] = useState<'tracking' | 'order'>('tracking');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchValue = searchType === 'tracking' ? trackingCode : orderNumber;
    
    if (!searchValue.trim()) {
      toast.error(searchType === 'tracking' ? 'Digite o código de rastreio' : 'Digite o número do pedido');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('track-correios', {
        body: searchType === 'tracking' 
          ? { trackingCode: searchValue.trim() }
          : { orderNumber: searchValue.trim() }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        setResult(data);
      } else {
        setResult(data);
        if (data.events?.length === 0) {
          toast.info('Nenhum evento de rastreio encontrado ainda');
        }
      }
    } catch (error) {
      console.error('Tracking error:', error);
      toast.error('Erro ao consultar rastreio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isFirst: boolean) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('entregue') || lowerStatus.includes('delivered')) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (lowerStatus.includes('trânsito') || lowerStatus.includes('encaminhado')) {
      return <Truck className="h-5 w-5 text-blue-500" />;
    }
    if (lowerStatus.includes('postado')) {
      return <Package className="h-5 w-5 text-primary" />;
    }
    if (isFirst) {
      return <MapPin className="h-5 w-5 text-orange-500" />;
    }
    return <Package className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('entregue') || lowerStatus.includes('delivered')) {
      return 'bg-green-500/10 text-green-700 border-green-500/30';
    }
    if (lowerStatus.includes('trânsito') || lowerStatus.includes('encaminhado')) {
      return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
    }
    if (lowerStatus.includes('postado')) {
      return 'bg-primary/10 text-primary border-primary/30';
    }
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
          >
            <Package className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            Rastreie seu Pedido
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-lg mx-auto"
          >
            Acompanhe a entrega do seu pedido em tempo real usando o código de rastreio dos Correios
          </motion.p>
        </div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Consultar Rastreio
              </CardTitle>
              <CardDescription>
                Digite o código de rastreio (ex: SS123456789BR) ou o número do pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'tracking' | 'order')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="tracking">Código de Rastreio</TabsTrigger>
                  <TabsTrigger value="order">Número do Pedido</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSearch} className="space-y-4">
                  <TabsContent value="tracking" className="m-0">
                    <Input
                      type="text"
                      placeholder="Ex: SS123456789BR"
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      className="h-12 text-lg uppercase tracking-widest"
                      maxLength={13}
                    />
                  </TabsContent>

                  <TabsContent value="order" className="m-0">
                    <Input
                      type="text"
                      placeholder="Ex: PED-2024-001234"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="h-12 text-lg"
                    />
                  </TabsContent>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Rastrear
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {result.isDelivered ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : result.error ? (
                          <AlertCircle className="h-6 w-6 text-destructive" />
                        ) : (
                          <Truck className="h-6 w-6 text-primary" />
                        )}
                        {result.code}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {result.error || result.lastStatus}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(result.lastStatus)}>
                      {result.isDelivered ? 'Entregue' : 'Em trânsito'}
                    </Badge>
                  </div>
                </CardHeader>

                {result.events && result.events.length > 0 && (
                  <CardContent>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />

                      {/* Events */}
                      <div className="space-y-6">
                        {result.events.map((event, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex gap-4"
                          >
                            {/* Icon */}
                            <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                              {getStatusIcon(event.status, index === 0)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-4">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold">{event.status}</span>
                                {index === 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    Último
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {event.date}
                                </span>
                                {event.time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.time}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Help Section */}
              <Card className="mt-6 border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Tem dúvidas sobre seu pedido? Entre em contato conosco!
                    </p>
                    <Button variant="outline" asChild>
                      <a 
                        href="https://wa.me/5511999999999?text=Olá! Gostaria de informações sobre meu pedido com código de rastreio: {result.code}" 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Falar no WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 mt-8"
          >
            <Card className="text-center p-6">
              <Package className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Onde encontro o código?</h3>
              <p className="text-sm text-muted-foreground">
                O código de rastreio é enviado por e-mail e WhatsApp quando seu pedido é despachado
              </p>
            </Card>

            <Card className="text-center p-6">
              <Truck className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Prazo de entrega</h3>
              <p className="text-sm text-muted-foreground">
                O prazo varia de acordo com a região. Geralmente de 3 a 15 dias úteis
              </p>
            </Card>

            <Card className="text-center p-6">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Atualizações automáticas</h3>
              <p className="text-sm text-muted-foreground">
                Você receberá atualizações por e-mail a cada movimentação do seu pedido
              </p>
            </Card>
          </motion.div>
        )}
      </main>

      <DynamicFooter />
      <WhatsAppButton />
    </div>
  );
}
