import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { DynamicMainHeader } from '@/components/layout/DynamicMainHeader';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { DynamicFooter } from '@/components/layout/DynamicFooter';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import { TrackingResult } from './tracking/trackingHelpers';
import { TrackingSearchCard } from './tracking/TrackingSearchCard';
import { TrackingResultCard } from './tracking/TrackingResultCard';
import { TrackingInfoCards } from './tracking/TrackingInfoCards';
import { logger } from '@/lib/logger';

export default function TrackingPage() {
  const siteSettings = useSiteSettings();
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
        if (data.events?.length === 0) toast.info('Nenhum evento de rastreio encontrado ainda');
      }
    } catch (err) {
      logger.error('tracking', 'Tracking error:', err);
      toast.error('Erro ao consultar rastreio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DynamicMainHeader />
      <NavigationBar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
          >
            <Package className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-2"
          >
            Rastreie seu Pedido
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-lg mx-auto"
          >
            Acompanhe a entrega do seu pedido em tempo real usando o código de rastreio dos Correios
          </motion.p>
        </div>

        <TrackingSearchCard
          searchType={searchType}
          setSearchType={setSearchType}
          trackingCode={trackingCode}
          setTrackingCode={setTrackingCode}
          orderNumber={orderNumber}
          setOrderNumber={setOrderNumber}
          loading={loading}
          onSubmit={handleSearch}
        />

        <AnimatePresence mode="wait">
          {result && <TrackingResultCard result={result} whatsappLink={siteSettings.whatsappLink} />}
        </AnimatePresence>

        {!result && <TrackingInfoCards />}
      </main>

      <DynamicFooter />
      <WhatsAppButton />
    </div>
  );
}
