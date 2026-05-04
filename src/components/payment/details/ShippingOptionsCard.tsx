import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Loader2, MapPin, Package, Truck, Zap } from 'lucide-react';
import { FreightOption } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getMethodIcon = (method: string) => {
  if (method.includes('SEDEX 10') || method.includes('Express')) return Zap;
  if (method.includes('SEDEX')) return Truck;
  return Package;
};

interface Props {
  freightLoading: boolean;
  freightOptions: FreightOption[];
  freightError: boolean;
  selectedMethod: string | null;
  destinationInfo: { city: string; state: string } | null;
  onSelect: (option: FreightOption) => void;
}

export function ShippingOptionsCard({
  freightLoading, freightOptions, freightError, selectedMethod, destinationInfo, onSelect,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Escolha o Envio
        </CardTitle>
        {destinationInfo && (
          <CardDescription className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Entrega para {destinationInfo.city} - {destinationInfo.state}
          </CardDescription>
        )}
        {freightError && (
          <div className="flex items-center gap-2 text-xs text-amber-600 mt-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Valores estimados (serviço de cálculo indisponível)
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {freightLoading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Calculando opções de envio...</span>
          </div>
        ) : (
          freightOptions.map((option) => {
            const Icon = getMethodIcon(option.method);
            const isSelected = selectedMethod === option.method;
            return (
              <button
                key={option.method}
                onClick={() => onSelect(option)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{option.method}</span>
                    {option.price === 0 && (
                      <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-0">GRÁTIS</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.days}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-bold text-sm ${option.price === 0 ? 'text-green-600' : ''}`}>
                    {option.price === 0 ? 'Grátis' : formatCurrency(option.price)}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
