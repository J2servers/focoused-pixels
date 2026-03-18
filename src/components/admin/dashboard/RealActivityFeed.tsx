import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ShoppingCart, Package, Star, UserPlus, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  action: string;
  table_name: string;
  created_at: string;
  record_id: string | null;
}

const tableConfig: Record<string, { icon: typeof ShoppingCart; color: string; label: string }> = {
  orders: { icon: ShoppingCart, color: 'text-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.15)]', label: 'Pedido' },
  quotes: { icon: FileText, color: 'text-[hsl(var(--admin-accent-blue))] bg-[hsl(var(--admin-accent-blue)/0.15)]', label: 'Orçamento' },
  products: { icon: Package, color: 'text-[hsl(var(--admin-accent-cyan))] bg-[hsl(var(--admin-accent-cyan)/0.15)]', label: 'Produto' },
  reviews: { icon: Star, color: 'text-[hsl(var(--admin-accent-orange))] bg-[hsl(var(--admin-accent-orange)/0.15)]', label: 'Avaliação' },
  leads: { icon: UserPlus, color: 'text-[hsl(var(--admin-accent-green))] bg-[hsl(var(--admin-accent-green)/0.15)]', label: 'Lead' },
};

const actionLabels: Record<string, string> = {
  INSERT: 'criado',
  UPDATE: 'atualizado',
  DELETE: 'removido',
};

export function RealActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, table_name, created_at, record_id')
        .in('table_name', ['orders', 'quotes', 'products', 'reviews', 'leads'])
        .order('created_at', { ascending: false })
        .limit(8);

      setActivities(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Activity className="h-5 w-5 text-[hsl(var(--admin-accent-pink))]" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-[hsl(var(--admin-sidebar))] animate-pulse rounded-lg" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-[hsl(var(--admin-text-muted))] text-center py-8">
            Nenhuma atividade recente registrada.
          </p>
        ) : (
          <div className="space-y-2">
            {activities.map((item) => {
              const config = tableConfig[item.table_name] || { icon: Activity, color: 'text-gray-400 bg-gray-400/15', label: item.table_name };
              const Icon = config.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors">
                  <div className={cn("p-2 rounded-lg shrink-0", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {config.label} {actionLabels[item.action] || item.action.toLowerCase()}
                    </p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
