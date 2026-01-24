import { useState, useEffect } from 'react';
import { AdminLayout, ImageUpload } from '@/components/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCompanyInfo, useUpdateCompanyInfo, CompanyInfo } from '@/hooks/useCompanyInfo';
import { toast } from 'sonner';
import { 
  Loader2, Save, User, Lock, Search, Palette, Layout, ShoppingCart, 
  Bell, Bot, Percent, Truck, AlertTriangle, Shield, BarChart3, 
  Plug, Eye, MessageSquare, Cookie, Mail
} from 'lucide-react';

const AdminSettingsPage = () => {
  const { profile, updatePassword, canEdit } = useAuthContext();
  const { data: companyInfo, isLoading: isLoadingCompany } = useCompanyInfo();
  const updateCompany = useUpdateCompanyInfo();
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [settings, setSettings] = useState<Partial<CompanyInfo>>({});

  useEffect(() => {
    if (companyInfo) {
      setSettings(companyInfo);
    }
  }, [companyInfo]);

  const handleChangePassword = async () => {
    if (passwords.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await updatePassword(passwords.newPassword);
      if (error) throw error;
      
      toast.success('Senha alterada com sucesso!');
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar senha';
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateCompany.mutateAsync({
        id: companyInfo?.id || null,
        data: settings,
      });
      toast.success('Configurações salvas com sucesso!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar';
      toast.error(message);
    }
  };

  const updateSetting = <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoadingCompany) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configurações Avançadas">
      <div className="space-y-6">
        {/* Save Button - Fixed at top */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Central de Configurações</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie todas as configurações do site em um só lugar
            </p>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={updateCompany.isPending || !canEdit()}
            size="lg"
          >
            {updateCompany.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Todas as Alterações
          </Button>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-auto p-2">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="checkout" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Checkout</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-auto p-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="discounts" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              <span className="hidden sm:inline">Descontos</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Frete</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Manutenção</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">LGPD</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Meu Perfil
                  </CardTitle>
                  <CardDescription>Informações da sua conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={profile?.full_name || ''} disabled />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>Atualize sua senha de acesso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Alterar Senha
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  SEO e Metadados
                  <Badge variant="outline" className="ml-2">Google</Badge>
                </CardTitle>
                <CardDescription>
                  Configure como seu site aparece nos resultados de busca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="seo_title">Título do Site (SEO)</Label>
                    <Input
                      id="seo_title"
                      value={settings.seo_title || ''}
                      onChange={(e) => updateSetting('seo_title', e.target.value)}
                      placeholder="Pincel de Luz Personalizados"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(settings.seo_title?.length || 0)}/60 caracteres
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_keywords">Palavras-chave</Label>
                    <Input
                      id="seo_keywords"
                      value={settings.seo_keywords || ''}
                      onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                      placeholder="acrílico, letreiro, personalizado"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">Meta Descrição</Label>
                  <Textarea
                    id="seo_description"
                    value={settings.seo_description || ''}
                    onChange={(e) => updateSetting('seo_description', e.target.value)}
                    placeholder="Descrição do site para buscadores"
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(settings.seo_description?.length || 0)}/160 caracteres
                  </p>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Imagem de Compartilhamento (OG Image)</Label>
                    <ImageUpload
                      value={settings.og_image || ''}
                      onChange={(url) => updateSetting('og_image', url || null)}
                      folder="seo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 1200x630px
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <ImageUpload
                      value={settings.favicon_url || ''}
                      onChange={(url) => updateSetting('favicon_url', url || null)}
                      folder="seo"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 32x32px ou 64x64px
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Cores e Tema
                </CardTitle>
                <CardDescription>
                  Personalize as cores do seu site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={settings.primary_color || '#7c3aed'}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.primary_color || '#7c3aed'}
                        onChange={(e) => updateSetting('primary_color', e.target.value)}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={settings.secondary_color || '#10b981'}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.secondary_color || '#10b981'}
                        onChange={(e) => updateSetting('secondary_color', e.target.value)}
                        placeholder="#10b981"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={settings.accent_color || '#f59e0b'}
                        onChange={(e) => updateSetting('accent_color', e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={settings.accent_color || '#f59e0b'}
                        onChange={(e) => updateSetting('accent_color', e.target.value)}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar alternância para modo escuro
                    </p>
                  </div>
                  <Switch
                    checked={settings.dark_mode_enabled ?? true}
                    onCheckedChange={(checked) => updateSetting('dark_mode_enabled', checked)}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="custom_css">CSS Personalizado</Label>
                  <Textarea
                    id="custom_css"
                    value={settings.custom_css || ''}
                    onChange={(e) => updateSetting('custom_css', e.target.value)}
                    placeholder="/* Adicione seu CSS customizado aqui */"
                    className="font-mono text-sm min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    CSS avançado para personalização adicional
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Layout e Exibição
                </CardTitle>
                <CardDescription>
                  Configure como os produtos são exibidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="products_per_page">Produtos por Página</Label>
                    <Select
                      value={String(settings.products_per_page || 12)}
                      onValueChange={(value) => updateSetting('products_per_page', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 produtos</SelectItem>
                        <SelectItem value="12">12 produtos</SelectItem>
                        <SelectItem value="16">16 produtos</SelectItem>
                        <SelectItem value="24">24 produtos</SelectItem>
                        <SelectItem value="48">48 produtos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Mostrar Avaliações
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Exibir estrelas de avaliação nos produtos
                      </p>
                    </div>
                    <Switch
                      checked={settings.show_product_ratings ?? true}
                      onCheckedChange={(checked) => updateSetting('show_product_ratings', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mostrar Estoque</Label>
                      <p className="text-sm text-muted-foreground">
                        Exibir quantidade disponível em estoque
                      </p>
                    </div>
                    <Switch
                      checked={settings.show_product_stock ?? false}
                      onCheckedChange={(checked) => updateSetting('show_product_stock', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lista de Desejos</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir salvar produtos favoritos
                      </p>
                    </div>
                    <Switch
                      checked={settings.enable_wishlist ?? true}
                      onCheckedChange={(checked) => updateSetting('enable_wishlist', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Comparar Produtos</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir comparação entre produtos
                      </p>
                    </div>
                    <Switch
                      checked={settings.enable_compare_products ?? false}
                      onCheckedChange={(checked) => updateSetting('enable_compare_products', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Vistos Recentemente</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar produtos visualizados recentemente
                      </p>
                    </div>
                    <Switch
                      checked={settings.show_recently_viewed ?? true}
                      onCheckedChange={(checked) => updateSetting('show_recently_viewed', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checkout Tab */}
          <TabsContent value="checkout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrinho e Checkout
                </CardTitle>
                <CardDescription>
                  Configure regras de compra e checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="min_order_value">Pedido Mínimo (R$)</Label>
                    <Input
                      id="min_order_value"
                      type="number"
                      value={settings.min_order_value || 0}
                      onChange={(e) => updateSetting('min_order_value', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_order_value">Pedido Máximo (R$)</Label>
                    <Input
                      id="max_order_value"
                      type="number"
                      value={settings.max_order_value || ''}
                      onChange={(e) => updateSetting('max_order_value', e.target.value ? Number(e.target.value) : null)}
                      placeholder="Sem limite"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abandoned_cart">Lembrete Carrinho (horas)</Label>
                    <Input
                      id="abandoned_cart"
                      type="number"
                      value={settings.abandoned_cart_reminder_hours || 24}
                      onChange={(e) => updateSetting('abandoned_cart_reminder_hours', Number(e.target.value))}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Checkout como Visitante</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir compras sem login
                      </p>
                    </div>
                    <Switch
                      checked={settings.enable_guest_checkout ?? true}
                      onCheckedChange={(checked) => updateSetting('enable_guest_checkout', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Telefone Obrigatório</Label>
                      <p className="text-sm text-muted-foreground">
                        Exigir telefone no checkout
                      </p>
                    </div>
                    <Switch
                      checked={settings.require_phone_on_checkout ?? true}
                      onCheckedChange={(checked) => updateSetting('require_phone_on_checkout', checked)}
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="checkout_success_message">Mensagem de Sucesso</Label>
                  <Textarea
                    id="checkout_success_message"
                    value={settings.checkout_success_message || ''}
                    onChange={(e) => updateSetting('checkout_success_message', e.target.value)}
                    placeholder="Mensagem exibida após envio do orçamento"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações e Alertas
                </CardTitle>
                <CardDescription>
                  Configure alertas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="low_stock_threshold">Limite Estoque Baixo</Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      value={settings.low_stock_threshold || 5}
                      onChange={(e) => updateSetting('low_stock_threshold', Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alertar quando estoque ficar abaixo deste valor
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification_email">Email para Notificações</Label>
                    <Input
                      id="notification_email"
                      type="email"
                      value={settings.notification_email || ''}
                      onChange={(e) => updateSetting('notification_email', e.target.value)}
                      placeholder="admin@empresa.com"
                    />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Alertas de Estoque
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar quando produtos estiverem com estoque baixo
                      </p>
                    </div>
                    <Switch
                      checked={settings.enable_stock_alerts ?? true}
                      onCheckedChange={(checked) => updateSetting('enable_stock_alerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações de Pedidos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber email a cada novo pedido/orçamento
                      </p>
                    </div>
                    <Switch
                      checked={settings.enable_order_notifications ?? true}
                      onCheckedChange={(checked) => updateSetting('enable_order_notifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Assistente IA
                  <Badge className="ml-2">Luna</Badge>
                </CardTitle>
                <CardDescription>
                  Configure o chatbot de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Ativar Assistente IA</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar chatbot no site
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai_assistant_enabled ?? true}
                    onCheckedChange={(checked) => updateSetting('ai_assistant_enabled', checked)}
                  />
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ai_name">Nome da Assistente</Label>
                    <Input
                      id="ai_name"
                      value={settings.ai_assistant_name || ''}
                      onChange={(e) => updateSetting('ai_assistant_name', e.target.value)}
                      placeholder="Luna"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar da Assistente</Label>
                    <ImageUpload
                      value={settings.ai_assistant_avatar || ''}
                      onChange={(url) => updateSetting('ai_assistant_avatar', url || null)}
                      folder="ai"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai_greeting">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="ai_greeting"
                    value={settings.ai_assistant_greeting || ''}
                    onChange={(e) => updateSetting('ai_assistant_greeting', e.target.value)}
                    placeholder="Olá! Sou a Luna, como posso ajudar?"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure mensagens automáticas do WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_template">Mensagem Padrão do WhatsApp</Label>
                  <Textarea
                    id="whatsapp_template"
                    value={settings.whatsapp_message_template || ''}
                    onChange={(e) => updateSetting('whatsapp_message_template', e.target.value)}
                    placeholder="Olá! Gostaria de saber mais sobre..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Descontos por Quantidade
                </CardTitle>
                <CardDescription>
                  Configure descontos progressivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_10">10+ unidades (%)</Label>
                    <Input
                      id="discount_10"
                      type="number"
                      value={settings.quantity_discount_10 || 5}
                      onChange={(e) => updateSetting('quantity_discount_10', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_20">20+ unidades (%)</Label>
                    <Input
                      id="discount_20"
                      type="number"
                      value={settings.quantity_discount_20 || 10}
                      onChange={(e) => updateSetting('quantity_discount_20', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_50">50+ unidades (%)</Label>
                    <Input
                      id="discount_50"
                      type="number"
                      value={settings.quantity_discount_50 || 15}
                      onChange={(e) => updateSetting('quantity_discount_50', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_100">100+ unidades (%)</Label>
                    <Input
                      id="discount_100"
                      type="number"
                      value={settings.quantity_discount_100 || 20}
                      onChange={(e) => updateSetting('quantity_discount_100', Number(e.target.value))}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cupons de Desconto</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir uso de códigos promocionais
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_coupon_codes ?? true}
                    onCheckedChange={(checked) => updateSetting('enable_coupon_codes', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Avaliações
                </CardTitle>
                <CardDescription>
                  Configure exibição de avaliações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovar Automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Publicar avaliações sem moderação
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable_reviews_auto_approve ?? false}
                    onCheckedChange={(checked) => updateSetting('enable_reviews_auto_approve', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_rating">Nota Mínima para Exibir</Label>
                  <Select
                    value={String(settings.reviews_min_rating_to_show || 1)}
                    onValueChange={(value) => updateSetting('reviews_min_rating_to_show', Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 estrela (todas)</SelectItem>
                      <SelectItem value="2">2+ estrelas</SelectItem>
                      <SelectItem value="3">3+ estrelas</SelectItem>
                      <SelectItem value="4">4+ estrelas</SelectItem>
                      <SelectItem value="5">Apenas 5 estrelas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Tab */}
          <TabsContent value="shipping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Configurações de Frete
                </CardTitle>
                <CardDescription>
                  Configure cálculo e valores de frete
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shipping_origin_cep">CEP de Origem</Label>
                    <Input
                      id="shipping_origin_cep"
                      value={settings.shipping_origin_cep || ''}
                      onChange={(e) => updateSetting('shipping_origin_cep', e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_method">Método de Cálculo</Label>
                    <Select
                      value={settings.shipping_calculation_method || 'fixed'}
                      onValueChange={(value) => updateSetting('shipping_calculation_method', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Valor Fixo</SelectItem>
                        <SelectItem value="weight">Por Peso</SelectItem>
                        <SelectItem value="distance">Por Distância</SelectItem>
                        <SelectItem value="free">Sempre Grátis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fixed_shipping">Valor Fixo do Frete (R$)</Label>
                    <Input
                      id="fixed_shipping"
                      type="number"
                      value={settings.fixed_shipping_value || 15}
                      onChange={(e) => updateSetting('fixed_shipping_value', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="express_multiplier">Multiplicador Frete Expresso</Label>
                    <Input
                      id="express_multiplier"
                      type="number"
                      step="0.1"
                      value={settings.express_shipping_multiplier || 2}
                      onChange={(e) => updateSetting('express_shipping_multiplier', Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ex: 2 = frete expresso custa 2x o normal
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card className={settings.maintenance_mode ? 'border-destructive' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Modo Manutenção
                  {settings.maintenance_mode && (
                    <Badge variant="destructive">ATIVO</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Ative para bloquear acesso ao site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar Modo Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Visitantes verão apenas a mensagem de manutenção
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode ?? false}
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance_message">Mensagem de Manutenção</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.maintenance_message || ''}
                    onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                    placeholder="Estamos em manutenção. Voltamos em breve!"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Status da Loja
                </CardTitle>
                <CardDescription>
                  Configure o status de funcionamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_status">Status da Loja</Label>
                  <Select
                    value={settings.store_status || 'open'}
                    onValueChange={(value) => updateSetting('store_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="closed">Fechada Temporariamente</SelectItem>
                      <SelectItem value="vacation">Em Férias</SelectItem>
                      <SelectItem value="coming_soon">Em Breve</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closed_message">Mensagem de Loja Fechada</Label>
                  <Textarea
                    id="closed_message"
                    value={settings.store_closed_message || ''}
                    onChange={(e) => updateSetting('store_closed_message', e.target.value)}
                    placeholder="Nossa loja está temporariamente fechada."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5" />
                  Cookies e LGPD
                </CardTitle>
                <CardDescription>
                  Configure conformidade com a lei de proteção de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Banner de Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir aviso de uso de cookies
                    </p>
                  </div>
                  <Switch
                    checked={settings.cookie_consent_enabled ?? true}
                    onCheckedChange={(checked) => updateSetting('cookie_consent_enabled', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookie_message">Mensagem do Banner</Label>
                  <Textarea
                    id="cookie_message"
                    value={settings.cookie_consent_message || ''}
                    onChange={(e) => updateSetting('cookie_consent_message', e.target.value)}
                    placeholder="Utilizamos cookies para melhorar sua experiência."
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="lgpd_email">Email DPO (LGPD)</Label>
                  <Input
                    id="lgpd_email"
                    type="email"
                    value={settings.lgpd_contact_email || ''}
                    onChange={(e) => updateSetting('lgpd_contact_email', e.target.value)}
                    placeholder="dpo@empresa.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email do responsável pela proteção de dados
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Rastreamento e Analytics
                </CardTitle>
                <CardDescription>
                  Configure integrações com ferramentas de análise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ga_id">Google Analytics ID</Label>
                  <Input
                    id="ga_id"
                    value={settings.google_analytics_id || ''}
                    onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX ou UA-XXXXXXXX-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gtm_id">Google Tag Manager ID</Label>
                  <Input
                    id="gtm_id"
                    value={settings.google_tag_manager_id || ''}
                    onChange={(e) => updateSetting('google_tag_manager_id', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb_pixel">Facebook Pixel ID</Label>
                  <Input
                    id="fb_pixel"
                    value={settings.facebook_pixel_id || ''}
                    onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
