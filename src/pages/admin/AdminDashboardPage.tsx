import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderTree, Percent, Star, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    { title: 'Produtos', value: stats.totalProducts, icon: Package, color: 'text-blue-500' },
    { title: 'Categorias', value: stats.totalCategories, icon: FolderTree, color: 'text-green-500' },
    { title: 'Promoções Ativas', value: stats.activePromotions, icon: Percent, color: 'text-orange-500' },
    { title: 'Avaliações Pendentes', value: stats.pendingReviews, icon: Star, color: 'text-yellow-500' },
    { title: 'Orçamentos', value: stats.totalQuotes, icon: ShoppingCart, color: 'text-purple-500' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? '...' : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/admin/produtos" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Novo Produto</span>
              </a>
              <a href="/admin/categorias" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <FolderTree className="h-8 w-8 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Nova Categoria</span>
              </a>
              <a href="/admin/promocoes" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Nova Promoção</span>
              </a>
              <a href="/admin/avaliacoes" className="p-4 border rounded-lg hover:bg-muted transition-colors text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Moderar Avaliações</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
