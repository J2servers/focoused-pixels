import { AdminLayout } from '@/components/admin';
import { AdminSummaryCard } from '@/components/admin';
import { ExportButtons } from '@/components/admin/ExportButtons';
import { DataTable } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Tag, Percent, DollarSign, TicketPercent, TrendingUp } from 'lucide-react';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { useCouponsPageState } from './coupons/useCouponsPageState';
import { CouponsAlerts } from './coupons/CouponsAlerts';
import { CouponsTopAndTemplates } from './coupons/CouponsTopAndTemplates';
import { CouponFormDialog } from './coupons/CouponFormDialog';
import { buildCouponsColumns } from './coupons/columns';

const AdminCouponsPage = () => {
  const s = useCouponsPageState();
  const { stats } = s;

  const columns = buildCouponsColumns({
    onDuplicate: s.handleDuplicate,
    onEdit: s.openEditDialog,
    onDelete: s.setDeleteId,
  });

  return (
    <AdminLayout title="Cupons de Desconto" requireEditor>
      <div className="space-y-6">
        <AdminPageGuide
          title="🎟️ Guia de Cupons"
          description="Crie e gerencie cupons de desconto para campanhas promocionais."
          steps={[
            { title: 'Criar cupom', description: "Clique em 'Novo Cupom' e defina código, tipo (% ou fixo), valor e validade." },
            { title: 'Limitar uso', description: 'Configure limite de uso total e valor mínimo de pedido para o cupom funcionar.' },
            { title: 'Ativar/Desativar', description: 'Alterne o status do cupom sem precisar excluí-lo.' },
            { title: 'Monitorar uso', description: 'Veja quantas vezes cada cupom foi utilizado na coluna de uso.' },
            { title: 'Copiar código', description: 'Clique no ícone de cópia para copiar o código do cupom rapidamente.' },
          ]}
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminSummaryCard title="Total de Cupons" value={s.coupons.length} icon={Tag} variant="purple" />
          <AdminSummaryCard title="Ativos" value={stats.activeCount} icon={TicketPercent} variant="green" />
          <AdminSummaryCard title="Percentuais" value={stats.percentCount} icon={Percent} variant="blue" />
          <AdminSummaryCard title="Valor Fixo" value={stats.fixedCount} icon={DollarSign} variant="orange" />
          <AdminSummaryCard title="Total de Usos" value={stats.totalUsage} icon={TrendingUp} variant="purple" />
        </div>

        <CouponsAlerts expiringCoupons={stats.expiringCoupons} expiredCoupons={stats.expiredCoupons} />

        <CouponsTopAndTemplates topCoupons={stats.topCoupons} onQuickCreate={s.handleQuickCreate} />

        <DataTable
          data={s.coupons}
          columns={columns}
          isLoading={s.isLoading}
          searchPlaceholder="Buscar por código ou descrição..."
          emptyMessage="Nenhum cupom cadastrado"
          actions={
            <div className="flex items-center gap-2">
              <ExportButtons
                data={s.coupons.map(c => ({ codigo: c.code, tipo: c.type, valor: c.value, usos: c.usage_count || 0, ativo: c.is_active ? 'Sim' : 'Não' }))}
                filename="cupons"
                title="Cupons"
                columns={[
                  { key: 'codigo', header: 'Código' },
                  { key: 'tipo', header: 'Tipo' },
                  { key: 'valor', header: 'Valor' },
                  { key: 'usos', header: 'Usos' },
                  { key: 'ativo', header: 'Ativo' },
                ]}
              />
              <Button onClick={s.openCreateDialog} className="admin-btn admin-btn-create">
                <Plus className="h-4 w-4 mr-2" />Novo Cupom
              </Button>
            </div>
          }
        />
      </div>

      <CouponFormDialog
        open={s.isDialogOpen}
        onOpenChange={s.setIsDialogOpen}
        formData={s.formData}
        setFormData={s.setFormData}
        isEditing={!!s.editingCoupon}
        onSubmit={s.handleSubmit}
      />

      <AlertDialog open={!!s.deleteId} onOpenChange={() => s.setDeleteId(null)}>
        <AlertDialogContent className="liquid-glass">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-white/50">
              Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.08] bg-transparent text-white hover:bg-white/[0.06]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={s.handleDelete} className="admin-btn admin-btn-delete">
              <Trash2 className="h-4 w-4 mr-1" />Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCouponsPage;
