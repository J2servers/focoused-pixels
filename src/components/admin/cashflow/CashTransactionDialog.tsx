import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  CashTransaction,
  CashTransactionInput,
  ENTRY_CATEGORIES,
  EXIT_CATEGORIES,
  PAYMENT_METHODS,
  useCreateCashTransaction,
  useUpdateCashTransaction,
} from '@/hooks/useCashFlow';

interface CashTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: CashTransaction | null;
}

export function CashTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: CashTransactionDialogProps) {
  const [type, setType] = useState<'entry' | 'exit'>('entry');
  const [formData, setFormData] = useState<Partial<CashTransactionInput>>({
    category: '',
    description: '',
    amount: 0,
    payment_method: '',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const createMutation = useCreateCashTransaction();
  const updateMutation = useUpdateCashTransaction();
  const isEditing = !!transaction;

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setFormData({
        category: transaction.category,
        description: transaction.description,
        amount: transaction.amount,
        payment_method: transaction.payment_method || '',
        notes: transaction.notes || '',
        transaction_date: transaction.transaction_date,
      });
    } else {
      setType('entry');
      setFormData({
        category: '',
        description: '',
        amount: 0,
        payment_method: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CashTransactionInput = {
      type,
      category: formData.category || '',
      description: formData.description || '',
      amount: Number(formData.amount) || 0,
      payment_method: formData.payment_method || undefined,
      notes: formData.notes || undefined,
      transaction_date: formData.transaction_date,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: transaction.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const categories = type === 'entry' ? ENTRY_CATEGORIES : EXIT_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <Tabs value={type} onValueChange={(v) => setType(v as 'entry' | 'exit')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entry" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Entrada
                </TabsTrigger>
                <TabsTrigger value="exit" className="gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Saída
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Venda de letreiro em LED"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionais (opcional)"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
