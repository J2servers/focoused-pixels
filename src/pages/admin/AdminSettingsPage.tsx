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
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCompanyInfo, useUpdateCompanyInfo, CompanyInfo } from '@/hooks/useCompanyInfo';
import { useTestMercadoPago, useTestEfiBank, useTestStripe } from '@/hooks/usePaymentGateway';
import { toast } from 'sonner';
import { 
  Loader2, Save, User, Lock, Search, Palette, ShoppingCart, 
  Bell, Bot, Truck, AlertTriangle, Shield, CreditCard,
  Eye, MessageSquare, Cookie, Wallet, QrCode, Building2, Landmark,
  CheckCircle2, XCircle, Zap
} from 'lucide-react';

const AdminSettingsPage = () => {
  const { profile, updatePassword, canEdit } = useAuthContext();
  const { data: companyInfo, isLoading: isLoadingCompany } = useCompanyInfo();
  const updateCompany = useUpdateCompanyInfo();
  
  // Payment gateway test mutations
  const testMercadoPago = useTestMercadoPago();
  const testEfiBank = useTestEfiBank();
  const testStripe = useTestStripe();
  
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

  const togglePaymentMethod = (method: string) => {
    const current = settings.payment_methods_enabled || ['pix', 'credit_card', 'boleto'];
    if (current.includes(method)) {
      updateSetting('payment_methods_enabled', current.filter(m => m !== method));
    } else {
      updateSetting('payment_methods_enabled', [...current, method]);
    }
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

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 h-auto p-2">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="checkout" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Checkout</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Frete</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
          </TabsList>

          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 h-auto p-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Manutenção</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">LGPD</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Métodos de Pagamento
                </CardTitle>
                <CardDescription>
                  Configure quais formas de pagamento estarão disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="pix"
                      checked={(settings.payment_methods_enabled || []).includes('pix')}
                      onCheckedChange={() => togglePaymentMethod('pix')}
                    />
                    <div className="flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-emerald-500" />
                      <Label htmlFor="pix" className="font-medium cursor-pointer">PIX</Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="credit_card"
                      checked={(settings.payment_methods_enabled || []).includes('credit_card')}
                      onCheckedChange={() => togglePaymentMethod('credit_card')}
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <Label htmlFor="credit_card" className="font-medium cursor-pointer">Cartão de Crédito</Label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="boleto"
                      checked={(settings.payment_methods_enabled || []).includes('boleto')}
                      onCheckedChange={() => togglePaymentMethod('boleto')}
                    />
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-orange-500" />
                      <Label htmlFor="boleto" className="font-medium cursor-pointer">Boleto Bancário</Label>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="pix_discount">Desconto PIX (%)</Label>
                    <Input
                      id="pix_discount"
                      type="number"
                      value={settings.pix_discount_percent || 5}
                      onChange={(e) => updateSetting('pix_discount_percent', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="boleto_days">Dias extras Boleto</Label>
                    <Input
                      id="boleto_days"
                      type="number"
                      value={settings.boleto_extra_days || 3}
                      onChange={(e) => updateSetting('boleto_extra_days', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_installments">Máx. Parcelas</Label>
                    <Input
                      id="max_installments"
                      type="number"
                      value={settings.max_installments || 12}
                      onChange={(e) => updateSetting('max_installments', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_installment">Parcela Mín. (R$)</Label>
                    <Input
                      id="min_installment"
                      type="number"
                      value={settings.min_installment_value || 50}
                      onChange={(e) => updateSetting('min_installment_value', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gateway Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Gateway Principal
                </CardTitle>
                <CardDescription>
                  Selecione qual gateway será usado para processar pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={settings.payment_gateway_primary || 'mercadopago'}
                  onValueChange={(value) => updateSetting('payment_gateway_primary', value)}
                >
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                    <SelectItem value="efi">EFI Bank (Gerencianet)</SelectItem>
                    <SelectItem value="pagseguro">PagSeguro</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="asaas">Asaas</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Mercado Pago */}
            <Card className={settings.mercadopago_enabled ? 'border-emerald-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#009ee3] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">MP</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Mercado Pago</CardTitle>
                      <CardDescription>Gateway mais popular do Brasil</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.mercadopago_enabled ?? false}
                    onCheckedChange={(checked) => updateSetting('mercadopago_enabled', checked)}
                  />
                </div>
              </CardHeader>
              {settings.mercadopago_enabled && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Modo Sandbox (Testes)</Label>
                      <p className="text-xs text-muted-foreground">Ativar para ambiente de testes</p>
                    </div>
                    <Switch
                      checked={settings.mercadopago_sandbox ?? true}
                      onCheckedChange={(checked) => updateSetting('mercadopago_sandbox', checked)}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="mp_public_key">Public Key</Label>
                      <Input
                        id="mp_public_key"
                        value={settings.mercadopago_public_key || ''}
                        onChange={(e) => updateSetting('mercadopago_public_key', e.target.value)}
                        placeholder="APP_USR-xxxx..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mp_access_token">Access Token</Label>
                      <Input
                        id="mp_access_token"
                        type="password"
                        value={settings.mercadopago_access_token || ''}
                        onChange={(e) => updateSetting('mercadopago_access_token', e.target.value)}
                        placeholder="APP_USR-xxxx..."
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Salve as configurações antes de testar a conexão
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await testMercadoPago.mutateAsync();
                          if (result.success) {
                            toast.success('Mercado Pago conectado com sucesso!', {
                              description: `Conta: ${result.account?.email || 'Verificada'}`,
                            });
                          } else {
                            toast.error('Falha na conexão', { description: result.message });
                          }
                        } catch (error) {
                          toast.error('Erro ao testar conexão');
                        }
                      }}
                      disabled={testMercadoPago.isPending || !settings.mercadopago_access_token}
                    >
                      {testMercadoPago.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* EFI Bank */}
            <Card className={settings.efi_enabled ? 'border-emerald-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00b4e6] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">EFI</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">EFI Bank (Gerencianet)</CardTitle>
                      <CardDescription>PIX instantâneo e boletos</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.efi_enabled ?? false}
                    onCheckedChange={(checked) => updateSetting('efi_enabled', checked)}
                  />
                </div>
              </CardHeader>
              {settings.efi_enabled && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Modo Sandbox (Testes)</Label>
                      <p className="text-xs text-muted-foreground">Ativar para ambiente de testes</p>
                    </div>
                    <Switch
                      checked={settings.efi_sandbox ?? true}
                      onCheckedChange={(checked) => updateSetting('efi_sandbox', checked)}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="efi_client_id">Client ID</Label>
                      <Input
                        id="efi_client_id"
                        value={settings.efi_client_id || ''}
                        onChange={(e) => updateSetting('efi_client_id', e.target.value)}
                        placeholder="Client_Id_xxxxx..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="efi_client_secret">Client Secret</Label>
                      <Input
                        id="efi_client_secret"
                        type="password"
                        value={settings.efi_client_secret || ''}
                        onChange={(e) => updateSetting('efi_client_secret', e.target.value)}
                        placeholder="Client_Secret_xxxxx..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="efi_pix_key">Chave PIX</Label>
                    <Input
                      id="efi_pix_key"
                      value={settings.efi_pix_key || ''}
                      onChange={(e) => updateSetting('efi_pix_key', e.target.value)}
                      placeholder="email@empresa.com ou CNPJ"
                    />
                    <p className="text-xs text-muted-foreground">Chave PIX cadastrada na EFI</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Salve as configurações antes de testar a conexão
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await testEfiBank.mutateAsync();
                          if (result.success) {
                            toast.success('EFI Bank conectado com sucesso!', {
                              description: result.sandbox ? 'Modo Sandbox' : 'Modo Produção',
                            });
                          } else {
                            toast.error('Falha na conexão', { description: result.message });
                          }
                        } catch (error) {
                          toast.error('Erro ao testar conexão');
                        }
                      }}
                      disabled={testEfiBank.isPending || !settings.efi_client_id || !settings.efi_client_secret}
                    >
                      {testEfiBank.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* PagSeguro */}
            <Card className={settings.pagseguro_enabled ? 'border-emerald-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#ffc107] flex items-center justify-center">
                      <span className="text-black font-bold text-sm">PS</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">PagSeguro</CardTitle>
                      <CardDescription>Solução completa do UOL</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pagseguro_enabled ?? false}
                    onCheckedChange={(checked) => updateSetting('pagseguro_enabled', checked)}
                  />
                </div>
              </CardHeader>
              {settings.pagseguro_enabled && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Modo Sandbox (Testes)</Label>
                      <p className="text-xs text-muted-foreground">Ativar para ambiente de testes</p>
                    </div>
                    <Switch
                      checked={settings.pagseguro_sandbox ?? true}
                      onCheckedChange={(checked) => updateSetting('pagseguro_sandbox', checked)}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ps_email">Email da Conta</Label>
                      <Input
                        id="ps_email"
                        type="email"
                        value={settings.pagseguro_email || ''}
                        onChange={(e) => updateSetting('pagseguro_email', e.target.value)}
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ps_token">Token</Label>
                      <Input
                        id="ps_token"
                        type="password"
                        value={settings.pagseguro_token || ''}
                        onChange={(e) => updateSetting('pagseguro_token', e.target.value)}
                        placeholder="xxxxx-xxxxx-xxxxx..."
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Stripe */}
            <Card className={settings.stripe_enabled ? 'border-emerald-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#635bff] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Stripe</CardTitle>
                      <CardDescription>Gateway internacional</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.stripe_enabled ?? false}
                    onCheckedChange={(checked) => updateSetting('stripe_enabled', checked)}
                  />
                </div>
              </CardHeader>
              {settings.stripe_enabled && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Modo Sandbox (Testes)</Label>
                      <p className="text-xs text-muted-foreground">Ativar para ambiente de testes</p>
                    </div>
                    <Switch
                      checked={settings.stripe_sandbox ?? true}
                      onCheckedChange={(checked) => updateSetting('stripe_sandbox', checked)}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="stripe_pk">Publishable Key</Label>
                      <Input
                        id="stripe_pk"
                        value={settings.stripe_public_key || ''}
                        onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                        placeholder="pk_test_xxxxx..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe_sk">Secret Key</Label>
                      <Input
                        id="stripe_sk"
                        type="password"
                        value={settings.stripe_secret_key || ''}
                        onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                        placeholder="sk_test_xxxxx..."
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Salve as configurações antes de testar a conexão
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const result = await testStripe.mutateAsync();
                          if (result.success) {
                            toast.success('Stripe conectado com sucesso!', {
                              description: `Conta: ${result.account?.email || 'Verificada'}`,
                            });
                          } else {
                            toast.error('Falha na conexão', { description: result.message });
                          }
                        } catch (error) {
                          toast.error('Erro ao testar conexão');
                        }
                      }}
                      disabled={testStripe.isPending || !settings.stripe_secret_key}
                    >
                      {testStripe.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Asaas */}
            <Card className={settings.asaas_enabled ? 'border-emerald-500/50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0d6efd] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">Asaas</CardTitle>
                      <CardDescription>Cobranças e assinaturas</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={settings.asaas_enabled ?? false}
                    onCheckedChange={(checked) => updateSetting('asaas_enabled', checked)}
                  />
                </div>
              </CardHeader>
              {settings.asaas_enabled && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Modo Sandbox (Testes)</Label>
                      <p className="text-xs text-muted-foreground">Ativar para ambiente de testes</p>
                    </div>
                    <Switch
                      checked={settings.asaas_sandbox ?? true}
                      onCheckedChange={(checked) => updateSetting('asaas_sandbox', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asaas_key">API Key</Label>
                    <Input
                      id="asaas_key"
                      type="password"
                      value={settings.asaas_api_key || ''}
                      onChange={(e) => updateSetting('asaas_api_key', e.target.value)}
                      placeholder="$aact_xxxxx..."
                    />
                  </div>
                </CardContent>
              )}
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
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="free_shipping_min">Frete Grátis Acima de (R$)</Label>
                    <Input
                      id="free_shipping_min"
                      type="number"
                      value={settings.free_shipping_minimum || 159}
                      onChange={(e) => updateSetting('free_shipping_minimum', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="free_shipping_msg">Mensagem Frete Grátis</Label>
                    <Input
                      id="free_shipping_msg"
                      value={settings.free_shipping_message || ''}
                      onChange={(e) => updateSetting('free_shipping_message', e.target.value)}
                      placeholder="Frete grátis em compras acima de R$ 159"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Analytics e Rastreamento</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="ga_id">Google Analytics ID</Label>
                      <Input
                        id="ga_id"
                        value={settings.google_analytics_id || ''}
                        onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gtm_id">Google Tag Manager</Label>
                      <Input
                        id="gtm_id"
                        value={settings.google_tag_manager_id || ''}
                        onChange={(e) => updateSetting('google_tag_manager_id', e.target.value)}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fb_pixel">Facebook Pixel</Label>
                      <Input
                        id="fb_pixel"
                        value={settings.facebook_pixel_id || ''}
                        onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
                        placeholder="XXXXXXXXXXXXXXX"
                      />
                    </div>
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
                <div className="space-y-4">
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
                      <Label>Alertas de Estoque</Label>
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
                <CardTitle>Status da Loja</CardTitle>
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
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;