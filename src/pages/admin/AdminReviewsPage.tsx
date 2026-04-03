import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ReviewStars } from '@/components/reviews';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAdminReviews, useApproveReview, useDeleteReview, type Review } from '@/hooks/useAdminReviews';

const AdminReviewsPage = () => {
  const { canEdit } = useAuthContext();
  const { data: reviews = [], isLoading } = useAdminReviews();
  const approveReview = useApproveReview();
  const deleteReview = useDeleteReview();

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isProcessing = approveReview.isPending || deleteReview.isPending;

  const handleDelete = async () => {
    if (!selectedReview) return;
    await deleteReview.mutateAsync(selectedReview.id);
    setIsDeleteDialogOpen(false);
  };

  const pendingCount = reviews.filter(r => !r.is_approved).length;

  const columns: Column<Review>[] = [
    { key: 'product_slug', header: 'Produto', render: (r) => <span className="font-medium">{r.product_slug}</span> },
    { key: 'customer_name', header: 'Cliente', sortable: true },
    { key: 'rating', header: 'Nota', render: (r) => <ReviewStars rating={r.rating} size="sm" /> },
    { key: 'comment', header: 'Comentário', render: (r) => <span className="line-clamp-2 max-w-xs">{r.comment}</span> },
    { key: 'is_approved', header: 'Status', render: (r) => <Badge variant={r.is_approved ? 'default' : 'secondary'}>{r.is_approved ? 'Aprovada' : 'Pendente'}</Badge> },
    { key: 'created_at', header: 'Data', render: (r) => format(new Date(r.created_at), 'dd/MM/yyyy', { locale: ptBR }) },
    {
      key: 'actions', header: 'Ações', className: 'w-40',
      render: (review) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedReview(review); setIsViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
          {!review.is_approved && (
            <Button variant="ghost" size="icon" onClick={() => approveReview.mutate({ id: review.id, approved: true })} disabled={!canEdit() || isProcessing}>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
          )}
          {review.is_approved && (
            <Button variant="ghost" size="icon" onClick={() => approveReview.mutate({ id: review.id, approved: false })} disabled={!canEdit() || isProcessing}>
              <XCircle className="h-4 w-4 text-orange-500" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => { setSelectedReview(review); setIsDeleteDialogOpen(true); }} disabled={!canEdit()}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Avaliações" requireEditor>
      <div className="mb-4">
        <Badge variant="secondary" className="text-sm bg-[hsl(var(--admin-accent-orange)/0.2)] text-[hsl(var(--admin-accent-orange))] border border-[hsl(var(--admin-accent-orange)/0.3)]">
          {pendingCount} avaliações pendentes de moderação
        </Badge>
      </div>
      <DataTable data={reviews} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar avaliações..." />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-white">Detalhes da Avaliação</DialogTitle></DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-[hsl(var(--admin-text-muted))]">Produto</p><p className="font-medium text-white">{selectedReview.product_slug}</p></div>
                <div><p className="text-sm text-[hsl(var(--admin-text-muted))]">Cliente</p><p className="font-medium text-white">{selectedReview.customer_name}</p><p className="text-sm text-[hsl(var(--admin-text-muted))]">{selectedReview.customer_email}</p></div>
              </div>
              <div><p className="text-sm text-[hsl(var(--admin-text-muted))] mb-1">Avaliação</p><ReviewStars rating={selectedReview.rating} size="md" /></div>
              {selectedReview.title && <div><p className="text-sm text-[hsl(var(--admin-text-muted))]">Título</p><p className="font-medium text-white">{selectedReview.title}</p></div>}
              <div><p className="text-sm text-[hsl(var(--admin-text-muted))]">Comentário</p><p className="mt-1 text-white">{selectedReview.comment}</p></div>
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div><p className="text-sm text-[hsl(var(--admin-text-muted))] mb-2">Imagens</p>
                  <div className="flex gap-2 flex-wrap">{selectedReview.images.map((img, i) => <img key={i} src={img} alt={`Imagem ${i+1}`} className="w-24 h-24 object-cover rounded-lg border border-[hsl(var(--admin-card-border))]" />)}</div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Badge variant={selectedReview.is_approved ? 'default' : 'secondary'} className={selectedReview.is_approved ? "bg-[hsl(var(--admin-accent-green))] text-white" : ""}>{selectedReview.is_approved ? 'Aprovada' : 'Pendente'}</Badge>
                {selectedReview.is_verified_purchase && <Badge variant="outline" className="border-[hsl(var(--admin-accent-blue))] text-[hsl(var(--admin-accent-blue))]">Compra Verificada</Badge>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white hover:bg-[hsl(var(--admin-sidebar-hover))]">Fechar</Button>
            {selectedReview && !selectedReview.is_approved && (
              <Button onClick={() => { approveReview.mutate({ id: selectedReview.id, approved: true }); setIsViewDialogOpen(false); }}
                className="bg-gradient-to-r from-[hsl(var(--admin-accent-green))] to-emerald-600 text-white">Aprovar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader><DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">Tem certeza que deseja excluir esta avaliação?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-white">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>{isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
