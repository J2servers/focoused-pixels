import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { AdminSummaryCard } from '@/components/admin/AdminSummaryCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Loader2, Shield, Users, UserCheck } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAdminUsers, useCreateAdminUser, useUpdateUserRole, useDeleteAdminUser, type AdminUser } from '@/hooks/useAdminUsers';

const ROLE_VARIANTS: Record<string, { label: string; variant: 'danger' | 'info' | 'neutral' }> = {
  admin: { label: 'Admin', variant: 'danger' },
  editor: { label: 'Editor', variant: 'info' },
  support: { label: 'Suporte', variant: 'neutral' },
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuthContext();
  const { data: users = [], isLoading } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteAdminUser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'support' });
  const [editRole, setEditRole] = useState<string>('support');

  const isSaving = createUser.isPending || deleteUser.isPending || updateRole.isPending;

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.full_name) return;
    await createUser.mutateAsync(formData);
    setIsDialogOpen(false);
    setFormData({ email: '', password: '', full_name: '', role: 'support' });
  };

  const handleDeleteRole = async () => {
    if (!selectedUser) return;
    await deleteUser.mutateAsync(selectedUser.id);
    setIsDeleteDialogOpen(false);
  };

  const handleEditRole = async () => {
    if (!selectedUser) return;
    await updateRole.mutateAsync({ userId: selectedUser.id, role: editRole as 'admin' | 'editor' | 'support' });
    setIsEditRoleOpen(false);
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const editorCount = users.filter(u => u.role === 'editor').length;

  const columns: Column<AdminUser>[] = [
    {
      key: 'full_name', header: 'Nome',
      render: (u) => <span className="font-medium text-[hsl(var(--admin-text))]">{u.profile?.full_name || 'Sem nome'}</span>,
    },
    {
      key: 'role', header: 'Função',
      render: (u) => {
        const role = ROLE_VARIANTS[u.role || 'support'] || ROLE_VARIANTS.support;
        return <AdminStatusBadge label={role.label} variant={role.variant} />;
      },
    },
    {
      key: 'id', header: 'ID',
      render: (u) => <span className="font-mono text-xs text-[hsl(var(--admin-text-muted))]">{u.id.slice(0, 8)}…</span>,
    },
    {
      key: 'actions', header: 'Ações', className: 'w-28',
      render: (user) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon"
            className="text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
            onClick={() => { setSelectedUser(user); setEditRole(user.role || 'support'); setIsEditRoleOpen(true); }}
            disabled={user.id === currentUser?.id}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon"
            className="text-red-400 hover:text-red-300"
            onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true); }}
            disabled={user.id === currentUser?.id}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Usuários" requireAdmin>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <AdminSummaryCard title="Total" value={users.length} icon={Users} variant="purple" />
          <AdminSummaryCard title="Admins" value={adminCount} icon={Shield} variant="pink" />
          <AdminSummaryCard title="Editores" value={editorCount} icon={UserCheck} variant="blue" />
        </div>

        <DataTable data={users} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar usuários..."
          emptyMessage="Nenhum usuário com acesso ao painel"
          actions={
            <Button onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />Novo Usuário
            </Button>
          } />
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(var(--admin-text))]">
              <Shield className="h-5 w-5 text-[hsl(var(--admin-accent-purple))]" />Novo Usuário Admin
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">Preencha os dados para criar acesso ao painel</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text-muted))]">Nome Completo *</Label>
              <Input className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text-muted))]">Email *</Label>
              <Input type="email" className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text-muted))]">Senha *</Label>
              <Input type="password" className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text-muted))]">Função</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (acesso total)</SelectItem>
                  <SelectItem value="editor">Editor (gerencia conteúdo)</SelectItem>
                  <SelectItem value="support">Suporte (somente leitura)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text))]">Cancelar</Button>
            <Button onClick={handleAddUser} disabled={isSaving} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-sm bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))]">Alterar função</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Alterar função de "{selectedUser?.profile?.full_name || 'Usuário'}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger className="border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (acesso total)</SelectItem>
                <SelectItem value="editor">Editor (gerencia conteúdo)</SelectItem>
                <SelectItem value="support">Suporte (somente leitura)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text))]">Cancelar</Button>
            <Button onClick={handleEditRole} disabled={isSaving} className="bg-gradient-to-r from-[hsl(var(--admin-accent-purple))] to-[hsl(var(--admin-accent-pink))] text-white">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-card-border))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))]">Remover acesso</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Remover acesso de "{selectedUser?.profile?.full_name}" ao painel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-[hsl(var(--admin-card-border))] bg-transparent text-[hsl(var(--admin-text))]">Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsersPage;
