import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Mail, Phone, Building2, Package, Trash2, ArrowRightCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QUOTE_STATUS_MAP, type Quote } from './constants';

interface Props {
  quote: Quote | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onConvert: (id: string) => void;
  isConverting: boolean;
}

export function QuoteDetailDialog({ quote, onClose, onStatusChange, onDelete, onConvert, isConverting }: Props) {
  return (
    <Dialog open={!!quote} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] liquid-glass text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p>Orçamento</p>
              <p className="text-xs font-normal text-white/50">
                {quote && format(new Date(quote.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {quote && (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 p-1">
              <div className="bg-white/[0.03] rounded-xl p-4">
                <h4 className="text-xs uppercase tracking-wider text-white/50 mb-3">Dados do Cliente</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-white/50" /><span className="text-sm text-white">{quote.customer_name}</span></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-white/50" /><span className="text-sm text-white">{quote.customer_email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-white/50" /><span className="text-sm text-white">{quote.customer_phone}</span></div>
                  {quote.customer_company && <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-white/50" /><span className="text-sm text-white">{quote.customer_company}</span></div>}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-white/50 mb-2">Produtos Solicitados</h4>
                <div className="flex flex-wrap gap-2">
                  {quote.product_types.map((type) => (
                    <span key={type} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
                      <Package className="h-3 w-3" />{type}
                    </span>
                  ))}
                </div>
              </div>

              <Separator className="bg-[hsl(var(--admin-card-border))]" />

              <div>
                <Label className="text-xs uppercase tracking-wider text-white/50">Alterar Status</Label>
                <Select value={quote.status} onValueChange={(value) => onStatusChange(quote.id, value)}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUOTE_STATUS_MAP).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {quote.cart_total && (
                <div className="bg-white/[0.03] rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm text-white/50">Valor do Orçamento</span>
                  <span className="text-xl font-bold text-white">R$ {quote.cart_total.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {quote && (
            <Button className="admin-btn admin-btn-delete" onClick={() => onDelete(quote.id)}>
              <Trash2 className="h-4 w-4 mr-2" />Excluir
            </Button>
          )}
          {quote?.status === 'approved' && (
            <Button onClick={() => onConvert(quote.id)} disabled={isConverting} className="admin-btn admin-btn-save">
              <ArrowRightCircle className="h-4 w-4 mr-2" />Converter em Pedido
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
