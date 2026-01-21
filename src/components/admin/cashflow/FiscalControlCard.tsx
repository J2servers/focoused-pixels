import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Building2, FileText, Calculator, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTaxSettings, useFinancialSummary, calculateSimplesTax } from '@/hooks/useFinancialData';
import { useCashSummary } from '@/hooks/useCashFlow';
import { cn } from '@/lib/utils';

const SIMPLES_ANEXO_LABELS: Record<string, string> = {
  'II': 'Anexo II - Indústria',
  'III': 'Anexo III - Serviços',
};

const TAX_REGIME_LABELS: Record<string, string> = {
  'simples_nacional': 'Simples Nacional',
  'lucro_presumido': 'Lucro Presumido',
  'lucro_real': 'Lucro Real',
};

export function FiscalControlCard() {
  const { data: taxSettings, isLoading } = useTaxSettings();
  const { receitaBruta, aliquotaEfetiva, faixaSimples, impostos } = useFinancialSummary();
  const { totalEntries } = useCashSummary();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calcular imposto estimado sobre entradas do caixa
  const anexo = (taxSettings?.simples_anexo || 'III') as 'II' | 'III';
  const estimatedTax = calculateSimplesTax(totalEntries * 12, anexo); // Projeção anual

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5 text-primary" />
          Controle Fiscal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <>
            {/* Dados da Empresa */}
            <div className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dados Fiscais</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">CNPJ</p>
                  <p className="font-medium">{taxSettings?.cnpj || 'Não configurado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">CNAE</p>
                  <p className="font-medium">{taxSettings?.cnae_primary || 'Não configurado'}</p>
                </div>
              </div>
            </div>

            {/* Regime Tributário */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Regime Tributário</span>
                </div>
                <Badge className="bg-blue-600">
                  {TAX_REGIME_LABELS[taxSettings?.tax_regime || 'simples_nacional']}
                </Badge>
              </div>
              {taxSettings?.tax_regime === 'simples_nacional' && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-blue-700">
                    {SIMPLES_ANEXO_LABELS[taxSettings?.simples_anexo || 'III']}
                  </span>
                  <span className="text-blue-700 font-medium">Faixa {faixaSimples}</span>
                </div>
              )}
            </div>

            {/* Estimativa de Impostos */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Estimativa Mensal</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Alíquota Efetiva</p>
                  <p className={cn(
                    "text-xl font-bold",
                    aliquotaEfetiva > 15 ? 'text-amber-600' : 'text-emerald-600'
                  )}>
                    {aliquotaEfetiva.toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Imposto Estimado</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(totalEntries * (estimatedTax.aliquotaEfetiva / 100))}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-700">
                  💡 <strong>Dica:</strong> Mantenha suas vendas documentadas para cálculos precisos de impostos.
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/admin/configuracoes">
                <Settings className="h-4 w-4" />
                Configurar Dados Fiscais
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
