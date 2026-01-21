import { useState, useEffect } from 'react';
import { AdminLayout, DataTable, Column } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string;
  } | null;
  role?: string;
}

const AdminUsersPage = () => {
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'support',
  });

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch profiles and roles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name');

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    // Combine data
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

    // Get unique user IDs from roles (admin users)
    const adminUsers: UserWithRole[] = [];
    roleMap.forEach((role, userId) => {
      const profile = profileMap.get(userId);
      adminUsers.push({
        id: userId,
        email: '', // We don't have direct access to auth.users
        created_at: new Date().toISOString(),
        profile: profile ? { full_name: profile.full_name } : null,
        role,
      });
    });

    setUsers(adminUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            full_name: formData.full_name,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Usuário não foi criado');

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        full_name: formData.full_name,
      });

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      // Assign role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: formData.role as any,
      });

      if (roleError) throw roleError;

      toast.success('Usuário criado com sucesso!');
      setIsDialogOpen(false);
      setFormData({ email: '', password: '', full_name: '', role: 'support' });
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '';
      console.error('Error creating user:', errorMessage);
      if (errorMessage.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error(errorMessage || 'Erro ao criar usuário');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);

      if (error) throw error;
      toast.success('Acesso removido com sucesso!');
      setIsDeleteDialogOpen(false);
      fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao remover acesso';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>;
      case 'editor':
        return <Badge className="bg-blue-500">Editor</Badge>;
      case 'support':
        return <Badge variant="secondary">Suporte</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const columns: Column<UserWithRole>[] = [
    {
      key: 'full_name',
      header: 'Nome',
      render: (user) => user.profile?.full_name || 'Sem nome',
    },
    {
      key: 'role',
      header: 'Função',
      render: (user) => getRoleBadge(user.role || 'support'),
    },
    {
      key: 'id',
      header: 'ID',
      render: (user) => (
        <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      className: 'w-24',
      render: (user) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setSelectedUser(user); setIsDeleteDialogOpen(true); }}
            disabled={user.id === currentUser?.id}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Usuários" requireAdmin>
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Buscar usuários..."
        emptyMessage="Nenhum usuário com acesso ao painel"
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        }
      />

      {/* Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Novo Usuário Admin
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin (acesso total)</SelectItem>
                  <SelectItem value="editor">Editor (gerencia conteúdo)</SelectItem>
                  <SelectItem value="support">Suporte (somente leitura)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover acesso</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o acesso de "{selectedUser?.profile?.full_name}" ao painel administrativo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remover Acesso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsersPage;
