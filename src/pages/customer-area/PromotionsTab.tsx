import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, Gift, Percent, Eye } from 'lucide-react';
import { PromotionCountdown } from '@/components/conversion/PromotionCountdown';

interface PromoLike {
  id: string; name: string; banner_url?: string | null;
  type: 'percentage' | 'fixed' | string; value: number; rule: string;
  end_date: string;
}

export function PromotionsTab({ promotions, isLoading }: { promotions: PromoLike[]; isLoading: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Promoções Ativas</h2>
          <p className="text-muted-foreground">Aproveite nossos descontos especiais!</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando promoções...</p>
        </div>
      ) : promotions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma promoção ativa no momento</h3>
            <p className="text-muted-foreground mb-4">Fique de olho! Em breve teremos novos descontos.</p>
            <Button onClick={() => navigate('/categorias')}>Ver Produtos</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <motion.div key={promo.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden h-full flex flex-col">
                {promo.banner_url && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={promo.banner_url} alt={promo.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{promo.name}</CardTitle>
                    <Badge className="shrink-0 bg-primary">
                      <Percent className="h-3 w-3 mr-1" />
                      {promo.type === 'percentage' ? `${promo.value}% OFF` : `R$ ${promo.value.toFixed(2)} OFF`}
                    </Badge>
                  </div>
                  <CardDescription>
                    {promo.rule === 'general' && 'Válido para todos os produtos'}
                    {promo.rule === 'category' && 'Válido para categorias selecionadas'}
                    {promo.rule === 'product' && 'Válido para produtos selecionados'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>Válido até:</span>
                    <span className="font-medium">{format(new Date(promo.end_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="mb-4"><PromotionCountdown endDate={promo.end_date} /></div>
                  <Button className="w-full" onClick={() => navigate('/categorias')}>
                    <Eye className="h-4 w-4 mr-2" /> Ver Produtos
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
