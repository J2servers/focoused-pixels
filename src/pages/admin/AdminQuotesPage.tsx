import { useState } from 'react';
import { AdminLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateOrderFromQuote } from '@/hooks/useOrders';
import { Search, Eye, FileText, ArrowRightCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Quote {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string | null;
  product_types: string[];
  quantity: number;
  cart_total: number | null;
  status: string;
  created_at: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500' },
  approved: { label: 'Aprovado', icon: CheckCircle, color: 'bg-green-500' },
  rejected: { label: 'Rejeitado', icon: XCircle, color: 'bg-red-500' },
  converted: { label: 'Convertido', icon: ArrowRightCircle, color: 'bg-blue-500' },
};

const AdminQuotesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  
  const createOrderFromQuote = useCreateOrderFromQuote();

  const { data: quotes = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Quote[];
    },
  });

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      quote.customer_email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (quoteId: string, status: string) => {
    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', quoteId);

    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success('Status atualizado!');
      refetch();
    }
  };

  const handleConvertToOrder = async (quoteId: string) => {
    await createOrderFromQuote.mutateAsync(quoteId);
    setSelectedQuote(null);
  };

  return (
    <AdminLayout title="Orçamentos" requireEditor>
      <div className="space-y-6">
        {/* Filters */}
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: quotes.length, color: 'text-white' },
            { label: 'Pendentes', value: quotes.filter(q => q.status === 'pending').length, color: 'text-yellow-400' },
            { label: 'Aprovados', value: quotes.filter(q => q.status === 'approved').length, color: 'text-green-400' },
            { label: 'Convertidos', value: quotes.filter(q => q.status === 'converted').length, color: 'text-blue-400' },
          ].map((stat) => (
            <Card key={stat.label} className="admin-card">
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quotes Table */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lista de Orçamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum orçamento encontrado</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium">Cliente</th>
                      <th className="text-left p-3 font-medium">Produtos</th>
                      <th className="text-left p-3 font-medium">Qtd</th>
                      <th className="text-left p-3 font-medium">Valor</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Data</th>
                      <th className="text-right p-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((quote) => {
                      const status = STATUS_CONFIG[quote.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;

                      return (
                        <tr key={quote.id} className="border-b border-border/50 hover:bg-muted/5">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{quote.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{quote.customer_email}</p>
                              {quote.customer_company && (
                                <p className="text-xs text-muted-foreground">{quote.customer_company}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {quote.product_types.slice(0, 2).map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                              {quote.product_types.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{quote.product_types.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">{quote.quantity}</td>
                          <td className="p-3 font-semibold">
                            {quote.cart_total 
                              ? `R$ ${quote.cart_total.toFixed(2).replace('.', ',')}` 
                              : 'A calcular'
                            }
                          </td>
                          <td className="p-3">
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {format(new Date(quote.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedQuote(quote)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {quote.status === 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConvertToOrder(quote.id)}
                                  disabled={createOrderFromQuote.isPending}
                                >
                                  <ArrowRightCircle className="h-4 w-4 mr-1" />
                                  Converter
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quote Details Modal */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Detalhes do Orçamento</DialogTitle>
          </DialogHeader>
          
          {selectedQuote && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-1">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                    <p><strong>Nome:</strong> {selectedQuote.customer_name}</p>
                    <p><strong>Email:</strong> {selectedQuote.customer_email}</p>
                    <p><strong>Telefone:</strong> {selectedQuote.customer_phone}</p>
                    {selectedQuote.customer_company && (
                      <p><strong>Empresa:</strong> {selectedQuote.customer_company}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Products */}
                <div>
                  <h4 className="font-semibold mb-2">Produtos Solicitados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuote.product_types.map((type) => (
                      <Badge key={type}>{type}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Status Control */}
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <Select
                    value={selectedQuote.status}
                    onValueChange={(value) => handleUpdateStatus(selectedQuote.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            {selectedQuote?.status === 'approved' && (
              <Button 
                onClick={() => handleConvertToOrder(selectedQuote.id)}
                disabled={createOrderFromQuote.isPending}
              >
                <ArrowRightCircle className="h-4 w-4 mr-2" />
                Converter em Pedido
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminQuotesPage;
