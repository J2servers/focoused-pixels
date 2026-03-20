/**
 * FreightCalculator - CEP-based freight estimate on product page
 */
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Truck, Loader2, MapPin } from 'lucide-react';

interface FreightCalculatorProps {
  productPrice: number;
  freeShippingMinimum?: number;
}

interface FreightResult {
  method: string;
  price: number;
  days: string;
}

export function FreightCalculator({ productPrice, freeShippingMinimum = 159 }: FreightCalculatorProps) {
  const [cep, setCep] = useState('');
  const [results, setResults] = useState<FreightResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasFreeShipping = productPrice >= freeShippingMinimum;

  const calculateFreight = () => {
    if (cep.replace(/\D/g, '').length < 8) return;

    setIsLoading(true);
    // Simulated freight calculation
    setTimeout(() => {
      const basePAC = 15 + Math.random() * 10;
      const baseSEDEX = basePAC * 1.8;
      
      setResults([
        {
          method: 'PAC',
          price: hasFreeShipping ? 0 : Math.round(basePAC * 100) / 100,
          days: '8 a 12 dias úteis',
        },
        {
          method: 'SEDEX',
          price: hasFreeShipping ? 0 : Math.round(baseSEDEX * 100) / 100,
          days: '3 a 5 dias úteis',
        },
      ]);
      setIsLoading(false);
    }, 1000);
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

      {results && (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.method} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-muted/50">
              <div>
                <span className="font-medium">{r.method}</span>
                <span className="text-xs text-muted-foreground ml-2">{r.days}</span>
              </div>
              <span className={`font-bold ${r.price === 0 ? 'text-success' : ''}`}>
                {r.price === 0 ? 'Grátis' : `R$ ${r.price.toFixed(2)}`}
              </span>
            </div>
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
