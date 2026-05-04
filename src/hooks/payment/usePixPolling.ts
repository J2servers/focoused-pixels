import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PIX_POLL_TIMEOUT_MS, type PixData } from '@/hooks/payment/types';

interface PixStatusChecker {
  mutateAsync: (input: { action: 'check_status'; paymentId: string }) => Promise<{ status: string }>;
}

interface Args {
  pixData: PixData | null;
  paymentStatus: string;
  setPaymentStatus: (s: string) => void;
  setPixData: (d: PixData | null) => void;
  mercadoPago: PixStatusChecker;
}

const POLL_INTERVAL_MS = 5000;
const SUCCESS_REDIRECT_DELAY_MS = 2000;

export function usePixPolling({
  pixData, paymentStatus, setPaymentStatus, setPixData, mercadoPago,
}: Args) {
  const navigate = useNavigate();
  const pollStart = useRef(0);

  useEffect(() => {
    if (!pixData?.paymentId || paymentStatus === 'approved') return;
    pollStart.current = Date.now();

    const checkStatus = async () => {
      if (Date.now() - pollStart.current > PIX_POLL_TIMEOUT_MS) {
        toast.error('O tempo do PIX expirou. Gere um novo código.');
        setPixData(null);
        return;
      }
      try {
        const result = await mercadoPago.mutateAsync({
          action: 'check_status', paymentId: pixData.paymentId,
        });
        if (result.status === 'approved') {
          setPaymentStatus('approved');
          toast.success('Pagamento confirmado!');
          sessionStorage.removeItem('pending_payment');
          setTimeout(() => navigate('/pagamento/sucesso'), SUCCESS_REDIRECT_DELAY_MS);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      }
    };

    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pixData, paymentStatus, mercadoPago, navigate, setPaymentStatus, setPixData]);
}
