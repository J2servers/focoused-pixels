import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, DollarSign } from 'lucide-react';
import { QUOTE_STATUS_MAP, type Quote } from './constants';

interface Props {
  quotes: Quote[];
  statusFilter: string;
  onStatusToggle: (key: string) => void;
}

export function QuotePipeline({ quotes, statusFilter, onStatusToggle }: Props) {
  const stages = ['pending', 'approved', 'converted', 'rejected'];
  const pipeline = stages.map((s) => ({
    key: s,
    ...QUOTE_STATUS_MAP[s],
    count: quotes.filter((q) => q.status === s).length,
    value: quotes.filter((q) => q.status === s).reduce((sum, q) => sum + (q.cart_total || 0), 0),
  }));

  const totalValue = quotes.reduce((s, q) => s + (q.cart_total || 0), 0);
  const approvedValue = quotes
    .filter((q) => q.status === 'approved' || q.status === 'converted')
    .reduce((s, q) => s + (q.cart_total || 0), 0);
  const convertedCount = quotes.filter((q) => q.status === 'converted').length;
  const conversionRate = quotes.length > 0 ? Math.round((convertedCount / quotes.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="liquid-glass lg:col-span-2">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Pipeline de Orçamentos</h3>
          </div>
          <div className="flex items-stretch gap-2">
            {pipeline.filter((p) => p.key !== 'rejected').map((stage, i) => (
              <div key={stage.key} className="flex-1 relative">
                <div
                  className={`p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-center ${statusFilter === stage.key ? 'ring-1 ring-purple-500' : ''}`}
                  role="button"
                  onClick={() => onStatusToggle(stage.key)}
                >
                  <p className="text-2xl font-bold text-white">{stage.count}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">{stage.label}</p>
                  {stage.value > 0 && (
                    <p className="text-xs text-purple-400 mt-1 font-medium">
                      R$ {stage.value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    </p>
                  )}
                </div>
                {i < 2 && (
                  <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 text-white/50 z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="liquid-glass">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-green-400" />
            <h3 className="text-sm font-semibold text-white">Resumo Financeiro</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Valor Total Orçado</p>
              <p className="text-xl font-bold text-white">R$ {totalValue.toFixed(2).replace('.', ',')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50">Aprovado / Convertido</p>
              <p className="text-lg font-bold text-green-400">R$ {approvedValue.toFixed(2).replace('.', ',')}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase tracking-wider text-white/50">Taxa de Conversão</p>
                <span className="text-sm font-bold text-white">{conversionRate}%</span>
              </div>
              <Progress value={conversionRate} className="h-2 bg-white/[0.03]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
