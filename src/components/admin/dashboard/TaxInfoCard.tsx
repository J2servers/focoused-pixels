import { Calculator, Building2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTaxSettings, useFinancialSummary } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// CNAEs comuns para comunicação visual
const CNAE_DESCRIPTIONS: Record<string, string> = {
  '1813-0/01': 'Impressão de material para outros usos',
  '1813-0/99': 'Impressão de material para outros usos',
  '1821-1/00': 'Serviços de pré-impressão',
  '1822-9/01': 'Serviços de encadernação e plastificação',
  '3299-0/05': 'Fabricação de avisos, placas e painéis luminosos',
  '4649-4/08': 'Comércio atacadista de produtos de sinalização',
  '7319-0/02': 'Promoção de vendas',
  '7319-0/99': 'Outras atividades de publicidade',
  '7420-0/01': 'Atividades de produção de fotografias',
};

export function TaxInfoCard() {
  const { data: taxSettings, isLoading } = useTaxSettings();
  const summary = useFinancialSummary();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="h-4 w-4 text-blue-500" />
            Informações Tributárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const cnaeDescription = taxSettings?.cnae_primary 
    ? CNAE_DESCRIPTIONS[taxSettings.cnae_primary] || 'CNAE não identificado'
    : 'Não configurado';

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-blue-500" />
          Informações Tributárias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Regime */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Regime Tributário</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {taxSettings?.tax_regime === 'simples_nacional' ? 'Simples Nacional' : 
             taxSettings?.tax_regime === 'lucro_presumido' ? 'Lucro Presumido' : 
             'Lucro Real'}
          </Badge>
          {taxSettings?.tax_regime === 'simples_nacional' && (
            <p className="text-xs text-blue-700 mt-2">
              Anexo {taxSettings.simples_anexo} • Faixa {summary.faixaSimples} • 
              Alíquota efetiva: <strong>{summary.aliquotaEfetiva.toFixed(2)}%</strong>
            </p>
          )}
        </div>

        {/* CNAE */}
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">CNAE Principal</span>
          </div>
          <p className="text-sm font-mono text-gray-700">
            {taxSettings?.cnae_primary || '---'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {cnaeDescription}
          </p>
        </div>

        {/* CNPJ */}
        {taxSettings?.cnpj && (
          <div className="text-xs text-muted-foreground">
            CNPJ: <span className="font-mono">{taxSettings.cnpj}</span>
          </div>
        )}

        <Link to="/admin/configuracoes">
          <Button variant="outline" size="sm" className="w-full mt-2">
            Editar Configurações Fiscais
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
