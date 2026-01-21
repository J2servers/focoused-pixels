import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Trash2, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { ReviewStars } from '@/components/reviews';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  product_slug: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[] | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
}

const AdminReviewsPage = () => {
  const { canEdit } = useAuthContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (review: Review) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', review.id);

      if (error) throw error;
      toast.success('Avaliação aprovada!');
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao aprovar avaliação';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (review: Review) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', review.id);

      if (error) throw error;
      toast.success('Avaliação rejeitada!');
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao rejeitar avaliação';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', selectedReview.id);

      if (error) throw error;
      toast.success('Avaliação excluída!');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir avaliação';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: Column<Review>[] = [
    { 
      key: 'product_slug', 
      header: 'Produto',
      render: (review) => (
        <span className="font-medium">{review.product_slug}</span>
      ),
    },
    { key: 'customer_name', header: 'Cliente', sortable: true },
    { 
      key: 'rating', 
      header: 'Nota',
      render: (review) => <ReviewStars rating={review.rating} size="sm" />,
    },
    { 
      key: 'comment', 
      header: 'Comentário',
      render: (review) => (
        <span className="line-clamp-2 max-w-xs">{review.comment}</span>
      ),
    },
    {
      key: 'is_approved',
      header: 'Status',
      render: (review) => (
        <Badge variant={review.is_approved ? 'default' : 'secondary'}>
          {review.is_approved ? 'Aprovada' : 'Pendente'}
        </Badge>
      ),
    },
    { 
      key: 'created_at', 
      header: 'Data',
      render: (review) => format(new Date(review.created_at), 'dd/MM/yyyy', { locale: ptBR }),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-40',
      render: (review) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedReview(review); setIsViewDialogOpen(true); }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!review.is_approved && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleApprove(review)}
              disabled={!canEdit() || isProcessing}
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {review.is_approved && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleReject(review)}
              disabled={!canEdit() || isProcessing}
            >
              <XCircle className="h-4 w-4 text-orange-500" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedReview(review); setIsDeleteDialogOpen(true); }}
            disabled={!canEdit()}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  return (
    <AdminLayout title="Avaliações" requireEditor>
      <div className="mb-4">
        <Badge variant="secondary" className="text-sm">
          {pendingCount} avaliações pendentes de moderação
        </Badge>
      </div>

      <DataTable
        data={reviews}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar avaliações..."
      />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Avaliação</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Produto</p>
                  <p className="font-medium">{selectedReview.product_slug}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedReview.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.customer_email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Avaliação</p>
                <ReviewStars rating={selectedReview.rating} size="md" />
              </div>

              {selectedReview.title && (
                <div>
                  <p className="text-sm text-muted-foreground">Título</p>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Comentário</p>
                <p className="mt-1">{selectedReview.comment}</p>
              </div>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Imagens</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedReview.images.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt={`Imagem ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Badge variant={selectedReview.is_approved ? 'default' : 'secondary'}>
                  {selectedReview.is_approved ? 'Aprovada' : 'Pendente'}
                </Badge>
                {selectedReview.is_verified_purchase && (
                  <Badge variant="outline">Compra Verificada</Badge>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedReview && !selectedReview.is_approved && (
              <Button onClick={() => { handleApprove(selectedReview); setIsViewDialogOpen(false); }}>
                Aprovar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
