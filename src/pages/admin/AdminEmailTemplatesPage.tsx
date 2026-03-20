import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Plus, Edit2, Trash2, Eye, Copy, Save } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_VARIABLES = [
  '{{customer_name}}',
  '{{order_number}}',
  '{{total}}',
  '{{tracking_code}}',
  '{{company_name}}',
  '{{production_status}}',
];

const AdminEmailTemplatesPage = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editTemplate, setEditTemplate] = useState<Partial<EmailTemplate> | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isNew, setIsNew] = useState(false);

  const fetchTemplates = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('email_templates').select('*').order('created_at', { ascending: false });
    if (data) setTemplates(data as EmailTemplate[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSave = async () => {
    if (!editTemplate?.name || !editTemplate?.subject || !editTemplate?.body) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isNew) {
      const { error } = await supabase.from('email_templates').insert({
        name: editTemplate.name,
        subject: editTemplate.subject,
        body: editTemplate.body,
        variables: editTemplate.variables || [],
        is_active: editTemplate.is_active ?? true,
      });
      if (error) toast.error('Erro ao criar template');
      else toast.success('Template criado!');
    } else {
      const { error } = await supabase.from('email_templates').update({
        name: editTemplate.name,
        subject: editTemplate.subject,
        body: editTemplate.body,
        variables: editTemplate.variables || [],
        is_active: editTemplate.is_active,
      }).eq('id', editTemplate.id!);
      if (error) toast.error('Erro ao salvar');
      else toast.success('Template salvo!');
    }

    setEditTemplate(null);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('email_templates').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir');
    else { toast.success('Template excluído'); fetchTemplates(); }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from('email_templates').update({ is_active: active }).eq('id', id);
    fetchTemplates();
  };

  const openNew = () => {
    setIsNew(true);
    setEditTemplate({ name: '', subject: '', body: '', variables: [], is_active: true });
  };

  return (
    <AdminLayout title="Templates de E-mail" requireEditor>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground text-sm">Modelos de e-mail para confirmação de pedido, envio, produção e mais.</p>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : templates.length === 0 ? (
          <Card className="admin-card">
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium">Nenhum template criado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie modelos de e-mail para automatizar comunicações.</p>
              <Button onClick={openNew} className="mt-4 gap-2">
                <Plus className="h-4 w-4" /> Criar primeiro template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="admin-card hover:ring-1 hover:ring-primary/30 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={(v) => handleToggleActive(template.id, v)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Assunto: {template.subject}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{template.body.replace(/<[^>]*>/g, '').slice(0, 150)}...</p>
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.map(v => (
                        <Badge key={v} variant="secondary" className="text-[10px]">{v}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setPreviewTemplate(template)}>
                      <Eye className="h-3 w-3" /> Ver
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => { setIsNew(false); setEditTemplate(template); }}>
                      <Edit2 className="h-3 w-3" /> Editar
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editTemplate} onOpenChange={() => setEditTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Novo Template' : 'Editar Template'}</DialogTitle>
          </DialogHeader>
          {editTemplate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do template *</label>
                <Input
                  value={editTemplate.name || ''}
                  onChange={e => setEditTemplate({ ...editTemplate, name: e.target.value })}
                  placeholder="Ex: Confirmação de Pedido"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assunto do e-mail *</label>
                <Input
                  value={editTemplate.subject || ''}
                  onChange={e => setEditTemplate({ ...editTemplate, subject: e.target.value })}
                  placeholder="Ex: Seu pedido {{order_number}} foi confirmado!"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Corpo do e-mail (HTML suportado) *</label>
                <Textarea
                  value={editTemplate.body || ''}
                  onChange={e => setEditTemplate({ ...editTemplate, body: e.target.value })}
                  placeholder="Olá {{customer_name}}, seu pedido..."
                  rows={12}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Variáveis disponíveis</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_VARIABLES.map(v => (
                    <Button
                      key={v}
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => {
                        const body = (editTemplate.body || '') + ' ' + v;
                        const vars = [...new Set([...(editTemplate.variables || []), v])];
                        setEditTemplate({ ...editTemplate, body, variables: vars });
                      }}
                    >
                      <Copy className="h-3 w-3" /> {v}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editTemplate.is_active ?? true}
                  onCheckedChange={v => setEditTemplate({ ...editTemplate, is_active: v })}
                />
                <label className="text-sm">Template ativo</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplate(null)}>Cancelar</Button>
            <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-3">
              <div className="bg-muted/30 p-2 rounded text-sm">
                <strong>Assunto:</strong> {previewTemplate.subject}
              </div>
              <div
                className="border rounded p-4 bg-white text-black text-sm max-h-[50vh] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: previewTemplate.body }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEmailTemplatesPage;
