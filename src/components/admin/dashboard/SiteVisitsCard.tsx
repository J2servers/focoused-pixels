/**
 * SiteVisitsCard - Card de visitas do site para o dashboard admin
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Globe, TrendingUp, Monitor } from 'lucide-react';
import { usePageViewStats } from '@/hooks/usePageViews';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function SiteVisitsCard() {
  const { data: stats, isLoading } = usePageViewStats();

  const metrics = [
    { label: 'Hoje', value: stats?.todayViews || 0, icon: Eye, color: 'text-[hsl(var(--admin-accent-green))]' },
    { label: 'Semana', value: stats?.weekViews || 0, icon: TrendingUp, color: 'text-[hsl(var(--admin-accent-blue))]' },
    { label: 'Mês', value: stats?.monthViews || 0, icon: Globe, color: 'text-[hsl(var(--admin-accent-purple))]' },
    { label: 'Visitantes Únicos', value: stats?.uniqueSessions || 0, icon: Users, color: 'text-[hsl(var(--admin-accent-pink))]' },
  ];

  return (
    <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-blue))] shadow-lg">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          Visitas do Site
          {!isLoading && stats && (
            <span className="ml-auto text-sm font-normal text-[hsl(var(--admin-text-muted))]">
              Total: {stats.totalViews.toLocaleString('pt-BR')}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-[hsl(var(--admin-sidebar))]" />
            ))}
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[hsl(var(--admin-sidebar))] border border-[hsl(var(--admin-card-border))]"
                >
                  <m.icon className={cn("h-5 w-5", m.color)} />
                  <span className="text-2xl font-bold text-white">{m.value.toLocaleString('pt-BR')}</span>
                  <span className="text-xs text-[hsl(var(--admin-text-muted))]">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Top Pages */}
            {stats && stats.topPages.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[hsl(var(--admin-text-muted))] mb-3">Páginas Mais Visitadas</h4>
                <div className="space-y-2">
                  {stats.topPages.map((page, i) => {
                    const maxViews = stats.topPages[0]?.views || 1;
                    const percentage = (page.views / maxViews) * 100;
                    return (
                      <div key={page.page_path} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[hsl(var(--admin-text-muted))] w-6 text-right">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white truncate">{page.page_path === '/' ? 'Página Inicial' : page.page_path}</span>
                            <span className="text-xs font-semibold text-[hsl(var(--admin-accent-purple))] ml-2">{page.views}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[hsl(var(--admin-card-border))] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
