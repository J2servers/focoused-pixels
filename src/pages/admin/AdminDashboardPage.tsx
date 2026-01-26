import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  FolderTree, 
  Percent, 
  Star, 
  TrendingUp, 
  ShoppingCart,
  ArrowUpRight,
  Clock,
  Eye,
  BarChart3,
  Wallet,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LowStockAlert,
  ProductMarginTable,
  FinancialSummaryCards,
  ProductRankingCard,
  TaxInfoCard,
} from '@/components/admin/dashboard';
import {
  CashFlowSummaryCards,
  CashTransactionsTable,
  StockControlCard,
  FiscalControlCard,
} from '@/components/admin/cashflow';

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
  
  // Filtros de data para o caixa
  const [cashStartDate, setCashStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Primeiro dia do mês
    return date.toISOString().split('T')[0];
  });
  const [cashEndDate, setCashEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] via-[hsl(var(--admin-accent-pink))] to-[hsl(var(--admin-accent-blue))] p-6 text-white shadow-2xl shadow-[hsl(var(--admin-accent-purple)/0.3)]">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Bem-vindo ao Painel Administrativo</h2>
            <p className="mt-1 text-white/80 max-w-xl">
              Gerencie produtos, categorias, promoções e muito mais. Acompanhe as métricas do seu catálogo em tempo real.
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -right-5 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-lg" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Link 
              key={stat.title} 
              to={stat.href}
              className="group"
            >
              <Card className="h-full overflow-hidden border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[hsl(var(--admin-accent-purple)/0.3)] admin-glow-border">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "p-2.5 rounded-xl bg-gradient-to-br shadow-lg",
                      stat.color
                    )}>
                      <stat.icon className="h-5 w-5 text-white drop-shadow-sm" />
                    </div>
                    {stat.trendUp !== null && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        stat.trendUp 
                          ? "bg-[hsl(var(--admin-accent-green)/0.15)] text-[hsl(var(--admin-accent-green))]" 
                          : "bg-[hsl(var(--admin-accent-orange)/0.15)] text-[hsl(var(--admin-accent-orange))]"
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
                      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-[hsl(var(--admin-accent-purple)/0.15)] text-[hsl(var(--admin-accent-purple))]">
                        <Eye className="h-3 w-3" />
                        {stat.trend}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? (
                        <span className="inline-block w-12 h-7 bg-[hsl(var(--admin-sidebar))] animate-pulse rounded" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))] mt-0.5">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Tabs para Catálogo vs Financeiro */}
        <Tabs defaultValue="cashflow" className="space-y-6">
          <TabsList className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-card-border))]">
            <TabsTrigger value="cashflow" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--admin-accent-purple))] data-[state=active]:to-[hsl(var(--admin-accent-pink))] data-[state=active]:text-white">
              <Wallet className="h-4 w-4" />
              Caixa
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--admin-accent-purple))] data-[state=active]:to-[hsl(var(--admin-accent-pink))] data-[state=active]:text-white">
              <Package className="h-4 w-4" />
              Catálogo
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[hsl(var(--admin-accent-purple))] data-[state=active]:to-[hsl(var(--admin-accent-pink))] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
          </TabsList>

          {/* Tab Caixa */}
          <TabsContent value="cashflow" className="space-y-6">
            {/* Filtro de Período */}
            <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[hsl(var(--admin-accent-purple))]" />
                    <span className="text-sm font-medium text-white">Período:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="startDate" className="text-sm text-[hsl(var(--admin-text-muted))]">De</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={cashStartDate}
                      onChange={(e) => setCashStartDate(e.target.value)}
                      className="w-auto bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="endDate" className="text-sm text-[hsl(var(--admin-text-muted))]">Até</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={cashEndDate}
                      onChange={(e) => setCashEndDate(e.target.value)}
                      className="w-auto bg-[hsl(var(--admin-sidebar))] border-[hsl(var(--admin-card-border))] text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <CashFlowSummaryCards startDate={cashStartDate} endDate={cashEndDate} />

            {/* Grid com Estoque e Fiscal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CashTransactionsTable startDate={cashStartDate} endDate={cashEndDate} />
              </div>
              <div className="space-y-6">
                <StockControlCard />
                <FiscalControlCard />
              </div>
            </div>
          </TabsContent>

          {/* Tab Catálogo */}
          <TabsContent value="catalog" className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <Link 
                      key={action.title}
                      to={action.href} 
                      className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-sidebar))] hover:border-[hsl(var(--admin-accent-purple)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--admin-accent-purple)/0.1)] transition-all duration-300"
                    >
                      <div className={cn(
                        "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                        action.color
                      )}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-semibold text-white">{action.title}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity & Tips Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'Novo orçamento recebido', time: 'há 5 minutos', icon: ShoppingCart, color: 'text-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.15)]' },
                      { action: 'Produto atualizado', time: 'há 1 hora', icon: Package, color: 'text-[hsl(var(--admin-accent-blue))] bg-[hsl(var(--admin-accent-blue)/0.15)]' },
                      { action: 'Nova avaliação pendente', time: 'há 2 horas', icon: Star, color: 'text-[hsl(var(--admin-accent-orange))] bg-[hsl(var(--admin-accent-orange)/0.15)]' },
                      { action: 'Promoção iniciada', time: 'há 3 horas', icon: Percent, color: 'text-[hsl(var(--admin-accent-pink))] bg-[hsl(var(--admin-accent-pink)/0.15)]' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[hsl(var(--admin-sidebar-hover))] transition-colors">
                        <div className={cn("p-2 rounded-lg", item.color)}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.action}</p>
                          <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Dicas do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--admin-accent-blue)/0.1)] to-[hsl(var(--admin-accent-cyan)/0.1)] border border-[hsl(var(--admin-accent-blue)/0.2)]">
                      <h4 className="font-semibold text-[hsl(var(--admin-accent-blue))] text-sm">📦 Otimize suas imagens</h4>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">
                        Use imagens em formato WebP para melhor performance e SEO.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--admin-accent-green)/0.1)] to-[hsl(var(--admin-accent-cyan)/0.1)] border border-[hsl(var(--admin-accent-green)/0.2)]">
                      <h4 className="font-semibold text-[hsl(var(--admin-accent-green))] text-sm">⭐ Responda avaliações</h4>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">
                        Clientes que recebem respostas têm 70% mais chance de comprar novamente.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--admin-accent-orange)/0.1)] to-[hsl(var(--admin-accent-pink)/0.1)] border border-[hsl(var(--admin-accent-orange)/0.2)]">
                      <h4 className="font-semibold text-[hsl(var(--admin-accent-orange))] text-sm">🏷️ Promoções sazonais</h4>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">
                        Configure promoções com antecedência para datas especiais.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Financeiro */}
          <TabsContent value="financial" className="space-y-6">
            {/* Financial Summary Cards */}
            <FinancialSummaryCards />

            {/* Estoque e Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LowStockAlert />
              <ProductRankingCard />
              <TaxInfoCard />
            </div>

            {/* Margem de Lucro */}
            <ProductMarginTable />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
