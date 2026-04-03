import { useState } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2, Shield } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAdminUsers, useCreateAdminUser, useDeleteAdminUser, type AdminUser } from '@/hooks/useAdminUsers';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuthContext();
  const { data: users = [], isLoading } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'support' });

  const isSaving = createUser.isPending || deleteUser.isPending;

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-red-500">Admin</Badge>;
      case 'editor': return <Badge className="bg-blue-500">Editor</Badge>;
      default: return <Badge variant="secondary">Suporte</Badge>;
    }
  };

  const columns: Column<AdminUser>[] = [
    { key: 'full_name', header: 'Nome', render: (u) => u.profile?.full_name || 'Sem nome' },
    { key: 'role', header: 'Função', render: (u) => getRoleBadge(u.role || 'support') },
    { key: 'id', header: 'ID', render: (u) => <span className="font-mono text-xs">{u.id.slice(0, 8)}...</span> },
    {
      key: 'actions', header: 'Ações', className: 'w-24',
      render: (user) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon"
            onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true); }}
            disabled={user.id === currentUser?.id}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Usuários" requireAdmin>
      <DataTable data={users} columns={columns} isLoading={isLoading} searchPlaceholder="Buscar usuários..."
        emptyMessage="Nenhum usuário com acesso ao painel"
        actions={<Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Usuário</Button>} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Novo Usuário Admin</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Nome Completo *</Label><Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Senha *</Label><Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Mínimo 6 caracteres" /></div>
            <div className="space-y-2"><Label>Função</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (acesso total)</SelectItem>
                  <SelectItem value="editor">Editor (gerencia conteúdo)</SelectItem>
                  <SelectItem value="support">Suporte (somente leitura)</SelectItem>
                </SelectContent></Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddUser} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remover acesso</DialogTitle>
            <DialogDescription>Remover acesso de "{selectedUser?.profile?.full_name}" ao painel?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsersPage;
