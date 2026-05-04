import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import {
  PRODUCTION_STATUS_LABELS,
  type ProductionStatus,
  type Order,
} from '@/hooks/useOrders';
import { ORDER_STATUS_CONFIG, fmtCurrency } from './constants';

interface ShippingOrder extends Order {
  shipping_address?: string;
  shipping_cep?: string;
  shipping_city?: string;
  shipping_state?: string;
}

interface Props {
  order: Order | null;
  onClose: () => void;
  onUpdateOrder: (id: string, data: { order_status?: string }) => void;
  onUpdateProduction: (id: string, status: ProductionStatus) => void;
  onDelete: (id: string) => void;
}

export function OrderDetailDialog({ order, onClose, onUpdateOrder, onUpdateProduction, onDelete }: Props) {
  const o = order as ShippingOrder | null;
  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] liquid-glass border-white/[0.1] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Venda {order?.order_number}</DialogTitle>
        </DialogHeader>

        {o && (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 p-1">
              <div>
                <h4 className="font-semibold mb-2 text-white">Cliente</h4>
                <div className="liquid-glass-lighter rounded-lg p-4 space-y-1 text-white/70">
                  <p><strong className="text-white">Nome:</strong> {o.customer_name}</p>
                  <p><strong className="text-white">Email:</strong> {o.customer_email}</p>
                  <p><strong className="text-white">Telefone:</strong> {o.customer_phone}</p>
                  {o.shipping_address && <p><strong className="text-white">Endereço:</strong> {o.shipping_address}</p>}
                  {o.shipping_cep && <p><strong className="text-white">CEP:</strong> {o.shipping_cep}</p>}
                  {o.shipping_city && <p><strong className="text-white">Cidade:</strong> {o.shipping_city} - {o.shipping_state}</p>}
                </div>
              </div>

              <Separator className="bg-white/[0.08]" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2 text-white/60">Status da venda</label>
                  <Select
                    value={o.order_status}
                    onValueChange={(v) => onUpdateOrder(o.id, { order_status: v })}
                  >
                    <SelectTrigger className="liquid-input text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ORDER_STATUS_CONFIG).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2 text-white/60">Status de produção</label>
                  <Select
                    value={o.production_status}
                    onValueChange={(v) => onUpdateProduction(o.id, v as ProductionStatus)}
                  >
                    <SelectTrigger className="liquid-input text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRODUCTION_STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-white/[0.08]" />

              <div>
                <h4 className="font-semibold mb-2 text-white">Resumo</h4>
                <div className="liquid-glass-lighter rounded-lg p-4 space-y-2 text-white/70">
                  <div className="flex justify-between"><span>Subtotal:</span><span>{fmtCurrency(o.subtotal)}</span></div>
                  {o.shipping_cost != null && o.shipping_cost > 0 && (
                    <div className="flex justify-between"><span>Frete:</span><span>{fmtCurrency(o.shipping_cost)}</span></div>
                  )}
                  {o.discount != null && o.discount > 0 && (
                    <div className="flex justify-between text-green-400"><span>Desconto:</span><span>- {fmtCurrency(o.discount)}</span></div>
                  )}
                  <Separator className="bg-white/[0.08]" />
                  <div className="flex justify-between font-bold text-lg text-white"><span>Total:</span><span>{fmtCurrency(o.total)}</span></div>
                </div>
              </div>

              {o.tracking_code && (
                <>
                  <Separator className="bg-white/[0.08]" />
                  <div>
                    <h4 className="font-semibold mb-2 text-white">Rastreio</h4>
                    <div className="liquid-glass-lighter rounded-lg p-4 text-white/70">
                      <p><strong className="text-white">Código:</strong> {o.tracking_code}</p>
                      <p><strong className="text-white">Transportadora:</strong> {o.shipping_company || 'Correios'}</p>
                    </div>
                  </div>
                </>
              )}

              {o.notes && (
                <>
                  <Separator className="bg-white/[0.08]" />
                  <div>
                    <h4 className="font-semibold mb-2 text-white">Observações</h4>
                    <p className="text-white/60">{o.notes}</p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        )}

        {o && (
          <div className="flex justify-end pt-4 border-t border-white/[0.08]">
            <Button className="admin-btn admin-btn-delete" onClick={() => onDelete(o.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Pedido
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
