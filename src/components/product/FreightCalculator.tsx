/**
 * FreightCalculator - CEP-based freight estimate using real API
 * Improvements: #43 Save last CEP, #44 Auto-fill saved CEP, #45 Delivery date estimate
 */
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Truck, Loader2, MapPin, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

interface FreightResult {
  method: string;
  price: number;
  originalPrice: number;
  days: string;
  daysMin: number;
  daysMax: number;
}

interface FreightDestination {
  city: string;
  state: string;
  cep: string;
}

interface FreightCalculatorProps {
  productPrice: number;
  onFreightSelect?: (freight: { method: string; price: number; days: string; cep: string; city: string; state: string }) => void;
}

const CEP_STORAGE_KEY = 'pinceldluz_last_cep';

export function FreightCalculator({ productPrice, onFreightSelect }: FreightCalculatorProps) {
  const { data: companyInfo } = useCompanyInfo();
  const freeShippingMinimum = companyInfo?.free_shipping_minimum ?? 159;
  // #43 Load saved CEP
  const [cep, setCep] = useState(() => {
    try {
      return localStorage.getItem(CEP_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [results, setResults] = useState<FreightResult[] | null>(null);
  const [destination, setDestination] = useState<FreightDestination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // #44 Auto-calculate if we have a saved CEP
  useEffect(() => {
    const savedCep = cep.replace(/\D/g, '');
    if (savedCep.length === 8) {
      calculateFreight();
    }
  }, []); // Only on mount

  const calculateFreight = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length < 8) return;

    setIsLoading(true);
    setResults(null);
    setSelectedMethod(null);

    try {
      // #43 Save CEP
      try { localStorage.setItem(CEP_STORAGE_KEY, cep); } catch {}

      const { data, error } = await supabase.functions.invoke('calculate-freight', {
        body: {
          destinationCep: cleanCep,
          productPrice,
          weight: 0.5,
          freeShippingMinimum,
        },
      });

      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setResults(data.results);
      setDestination(data.destination);

      if (data.results?.length > 0) {
        const cheapest = data.results[0];
        setSelectedMethod(cheapest.method);
        onFreightSelect?.({
          method: cheapest.method,
          price: cheapest.price,
          days: cheapest.days,
          cep: cleanCep,
          city: data.destination.city,
          state: data.destination.state,
        });
      }
    } catch (err) {
      console.error('Freight error:', err);
      toast.error('Erro ao calcular frete. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (r: FreightResult) => {
    setSelectedMethod(r.method);
    onFreightSelect?.({
      method: r.method,
      price: r.price,
      days: r.days,
      cep: cep.replace(/\D/g, ''),
      city: destination?.city || '',
      state: destination?.state || '',
    });
  };

  return (
    <div className="rounded-xl neu-concave p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Truck className="h-4 w-4 text-primary" />
        Calcular Frete
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Digite seu CEP"
            value={cep}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 8);
              setCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
            }}
            className="pl-9 h-9 text-sm"
            maxLength={9}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); calculateFreight(); }
            }}
          />
        </div>
        <Button
          size="sm"
          onClick={calculateFreight}
          disabled={cep.replace(/\D/g, '').length < 8 || isLoading}
          className="h-9"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Calcular'}
        </Button>
      </div>

      {destination && (
        <p className="text-xs text-muted-foreground">
          📍 {destination.city} - {destination.state}
        </p>
      )}

      {results && (
        <div className="space-y-2">
          {results.map((r) => (
            <button
              key={r.method}
              onClick={() => handleSelect(r)}
              className={`w-full flex items-center justify-between text-sm py-2.5 px-3 rounded-lg transition-all duration-200 text-left ${
                selectedMethod === r.method
                  ? 'bg-primary/10 ring-1 ring-primary/30'
                  : 'bg-muted/50 hover:bg-muted/80'
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedMethod === r.method && (
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
                <div>
                  <span className="font-medium">{r.method}</span>
                  <span className="text-xs text-muted-foreground ml-2">{r.days}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold ${r.price === 0 ? 'text-emerald-600' : ''}`}>
                  {r.price === 0 ? 'Grátis' : `R$ ${r.price.toFixed(2)}`}
                </span>
                {/* #45 Show original price if discounted */}
                {r.originalPrice > r.price && r.price > 0 && (
                  <span className="text-[10px] text-muted-foreground line-through ml-1">
                    R$ {r.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      
      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        Não sei meu CEP
      </a>
    </div>
  );
}
