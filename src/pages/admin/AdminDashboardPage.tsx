import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  FolderTree, 
  Percent, 
  Star, 
  TrendingUp, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  activePromotions: number;
  pendingReviews: number;
  totalQuotes: number;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    activePromotions: 0,
    pendingReviews: 0,
    totalQuotes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, categories, promotions, reviews, quotes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('promotions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
          supabase.from('quotes').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
          totalProducts: products.count || 0,
          totalCategories: categories.count || 0,
          activePromotions: promotions.count || 0,
          pendingReviews: reviews.count || 0,
          totalQuotes: quotes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Total de Produtos', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'from-blue-500 to-blue-600',
      bgAccent: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
      href: '/admin/produtos'
    },
    { 
      title: 'Categorias', 
      value: stats.totalCategories, 
      icon: FolderTree, 
      color: 'from-emerald-500 to-emerald-600',
      bgAccent: 'bg-emerald-500',
      trend: '+3',
      trendUp: true,
      href: '/admin/categorias'
    },
    { 
      title: 'Promoções Ativas', 
      value: stats.activePromotions, 
      icon: Percent, 
      color: 'from-orange-500 to-orange-600',
      bgAccent: 'bg-orange-500',
      trend: '2 expirando',
      trendUp: false,
      href: '/admin/promocoes'
    },
    { 
      title: 'Avaliações Pendentes', 
      value: stats.pendingReviews, 
      icon: Star, 
      color: 'from-amber-500 to-amber-600',
      bgAccent: 'bg-amber-500',
      trend: 'Moderar',
      trendUp: null,
      href: '/admin/avaliacoes'
    },
    { 
      title: 'Total de Orçamentos', 
      value: stats.totalQuotes, 
      icon: ShoppingCart, 
      color: 'from-purple-500 to-purple-600',
      bgAccent: 'bg-purple-500',
      trend: '+8%',
      trendUp: true,
      href: '/admin'
    },
  ];

  const quickActions = [
    { title: 'Novo Produto', icon: Package, href: '/admin/produtos', color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Nova Categoria', icon: FolderTree, href: '/admin/categorias', color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Nova Promoção', icon: Percent, href: '/admin/promocoes', color: 'text-orange-500 bg-orange-500/10' },
    { title: 'Ver Avaliações', icon: Star, href: '/admin/avaliacoes', color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-purple-700 p-6 text-white">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Bem-vindo ao Painel Administrativo</h2>
            <p className="mt-1 text-white/80 max-w-xl">
              Gerencie produtos, categorias, promoções e muito mais. Acompanhe as métricas do seu catálogo em tempo real.
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -right-5 bottom-0 h-24 w-24 rounded-full bg-white/10" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Link 
              key={stat.title} 
              to={stat.href}
              className="group"
            >
              <Card className="h-full overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-2.5 rounded-xl bg-gradient-to-br",
                      stat.color
                    )}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    {stat.trendUp !== null && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        stat.trendUp 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {stat.trendUp ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {stat.trend}
                      </div>
                    )}
                    {stat.trendUp === null && (
                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                        <Eye className="h-3 w-3" />
                        {stat.trend}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? (
                        <span className="inline-block w-12 h-7 bg-muted animate-pulse rounded" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link 
                  key={action.title}
                  to={action.href} 
                  className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
                >
                  <div className={cn(
                    "p-3 rounded-xl transition-transform group-hover:scale-110",
                    action.color
                  )}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{action.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Novo orçamento recebido', time: 'há 5 minutos', icon: ShoppingCart, color: 'text-purple-500 bg-purple-500/10' },
                  { action: 'Produto atualizado', time: 'há 1 hora', icon: Package, color: 'text-blue-500 bg-blue-500/10' },
                  { action: 'Nova avaliação pendente', time: 'há 2 horas', icon: Star, color: 'text-amber-500 bg-amber-500/10' },
                  { action: 'Promoção iniciada', time: 'há 3 horas', icon: Percent, color: 'text-orange-500 bg-orange-500/10' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={cn("p-2 rounded-lg", item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Dicas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <h4 className="font-semibold text-blue-900 text-sm">📦 Otimize suas imagens</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Use imagens em formato WebP para melhor performance e SEO.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                  <h4 className="font-semibold text-emerald-900 text-sm">⭐ Responda avaliações</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Clientes que recebem respostas têm 70% mais chance de comprar novamente.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                  <h4 className="font-semibold text-amber-900 text-sm">🏷️ Promoções sazonais</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Configure promoções com antecedência para datas especiais.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
