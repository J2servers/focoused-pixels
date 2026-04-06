import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, Trash2, Loader2, Star, Clock, MessageSquare } from 'lucide-react';
import { ReviewStars } from '@/components/reviews';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAdminReviews, useApproveReview, useDeleteReview, type Review } from '@/hooks/useAdminReviews';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';

const AdminReviewsPage = () => {
  const { canEdit } = useAuthContext();
  const { data: reviews = [], isLoading } = useAdminReviews();
  const approveReview = useApproveReview();
  const deleteReview = useDeleteReview();

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isProcessing = approveReview.isPending || deleteReview.isPending;
  const pendingCount = reviews.filter(r => !r.is_approved).length;
  const approvedCount = reviews.filter(r => r.is_approved).length;
  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const handleDelete = async () => {
    if (!selectedReview) return;
    await deleteReview.mutateAsync(selectedReview.id);
    setIsDeleteDialogOpen(false);
  };

  const columns: Column<Review>[] = [
    { key: 'product_slug', header: 'Produto', render: (r) => <span className="font-medium text-white">{r.product_slug}</span> },
    { key: 'customer_name', header: 'Cliente', sortable: true },
    { key: 'rating', header: 'Nota', render: (r) => <ReviewStars rating={r.rating} size="sm" /> },
    { key: 'comment', header: 'Comentário', render: (r) => <span className="line-clamp-2 max-w-xs text-white/50">{r.comment}</span> },
    {
      key: 'is_approved', header: 'Status',
      render: (r) => <AdminStatusBadge label={r.is_approved ? 'Aprovada' : 'Pendente'} variant={r.is_approved ? 'success' : 'warning'} />,
    },
    { key: 'created_at', header: 'Data', render: (r) => format(new Date(r.created_at), 'dd/MM/yyyy', { locale: ptBR }) },
    {
      key: 'actions', header: 'Ações', className: 'w-40',
      render: (review) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => { setSelectedReview(review); setIsViewDialogOpen(true); }}><Eye className="h-4 w-4" /></Button>
          {!review.is_approved && (
            <Button variant="ghost" size="icon" onClick={() => approveReview.mutate({ id: review.id, approved: true })} disabled={!canEdit() || isProcessing}>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </Button>
          )}
          {review.is_approved && (
            <Button variant="ghost" size="icon" onClick={() => approveReview.mutate({ id: review.id, approved: false })} disabled={!canEdit() || isProcessing}>
              <XCircle className="h-4 w-4 text-orange-400" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="admin-btn admin-btn-delete !min-h-0 !p-1 h-8 w-8" onClick={() => { setSelectedReview(review); setIsDeleteDialogOpen(true); }} disabled={!canEdit()}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Avaliações" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="⭐ Guia de Avaliações"
          description="Modere avaliações de clientes sobre os produtos."
          steps={[
            { title: "Aprovar/Rejeitar", description: "Revise cada avaliação e aprove para exibir na loja ou rejeite conteúdo inadequado." },
            { title: "Filtrar por status", description: "Veja apenas avaliações pendentes, aprovadas ou rejeitadas." },
            { title: "Ver imagens", description: "Clientes podem enviar fotos nas avaliações — visualize-as aqui." },
            { title: "Excluir avaliação", description: "Remova permanentemente avaliações spam ou ofensivas." },
            { title: "Compra verificada", description: "O badge 'Compra verificada' aparece automaticamente para compradores reais." },
          ]}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminSummaryCard title="Total" value={reviews.length} icon={MessageSquare} variant="purple" />
          <AdminSummaryCard title="Pendentes" value={pendingCount} icon={Clock} variant="orange" />
          <AdminSummaryCard title="Aprovadas" value={approvedCount} icon={CheckCircle} variant="green" />
          <AdminSummaryCard title="Média" value={avgRating.toFixed(1)} icon={Star} variant="blue" />
        </div>

        <DataTable data={reviews} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar avaliações..."
          actions={
            <ExportButtons data={reviews.map(r => ({ cliente: r.customer_name, produto: r.product_slug, nota: r.rating, comentario: r.comment, aprovada: r.is_approved ? 'Sim' : 'Não', data: r.created_at }))} filename="avaliacoes" title="Avaliações" columns={[{key:'cliente',header:'Cliente'},{key:'produto',header:'Produto'},{key:'nota',header:'Nota'},{key:'comentario',header:'Comentário'},{key:'aprovada',header:'Aprovada'},{key:'data',header:'Data'}]} />
          }
        />
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl liquid-glass">
          <DialogHeader><DialogTitle className="text-white">Detalhes da Avaliação</DialogTitle></DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-white/50">Produto</p><p className="font-medium text-white">{selectedReview.product_slug}</p></div>
                <div><p className="text-sm text-white/50">Cliente</p><p className="font-medium text-white">{selectedReview.customer_name}</p><p className="text-sm text-white/50">{selectedReview.customer_email}</p></div>
              </div>
              <div><p className="text-sm text-white/50 mb-1">Avaliação</p><ReviewStars rating={selectedReview.rating} size="md" /></div>
              {selectedReview.title && <div><p className="text-sm text-white/50">Título</p><p className="font-medium text-white">{selectedReview.title}</p></div>}
              <div><p className="text-sm text-white/50">Comentário</p><p className="mt-1 text-white">{selectedReview.comment}</p></div>
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div><p className="text-sm text-white/50 mb-2">Imagens</p>
                  <div className="flex gap-2 flex-wrap">{selectedReview.images.map((img, i) => <img key={i} src={img} alt={`Imagem ${i+1}`} className="w-24 h-24 object-cover rounded-lg border border-white/[0.08]" />)}</div>
                </div>
              )}
              <div className="flex items-center gap-4">
                <AdminStatusBadge label={selectedReview.is_approved ? 'Aprovada' : 'Pendente'} variant={selectedReview.is_approved ? 'success' : 'warning'} />
                {selectedReview.is_verified_purchase && <AdminStatusBadge label="Compra Verificada" variant="info" />}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="border-white/[0.08] bg-transparent text-white hover:bg-white/[0.06]">Fechar</Button>
            {selectedReview && !selectedReview.is_approved && (
              <Button onClick={() => { approveReview.mutate({ id: selectedReview.id, approved: true }); setIsViewDialogOpen(false); }}
                className="admin-btn admin-btn-save">Aprovar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="liquid-glass">
          <DialogHeader><DialogTitle className="text-white">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-white/50">Tem certeza que deseja excluir esta avaliação?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/[0.08] bg-transparent text-white">Cancelar</Button>
            <Button className="admin-btn admin-btn-delete" onClick={handleDelete} disabled={isProcessing}>{isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Trash2 className="h-4 w-4 mr-1" />Deletar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReviewsPage;
