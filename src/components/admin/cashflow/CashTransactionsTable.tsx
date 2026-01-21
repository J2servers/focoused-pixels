import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Pencil, Trash2, TrendingUp, TrendingDown, List } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  CashTransaction,
  useCashTransactions,
  useDeleteCashTransaction,
  ENTRY_CATEGORIES,
  EXIT_CATEGORIES,
  PAYMENT_METHODS,
} from '@/hooks/useCashFlow';
import { CashTransactionDialog } from './CashTransactionDialog';

interface CashTransactionsTableProps {
  startDate?: string;
  endDate?: string;
}

export function CashTransactionsTable({ startDate, endDate }: CashTransactionsTableProps) {
  const { data: transactions, isLoading } = useCashTransactions(startDate, endDate);
  const deleteMutation = useDeleteCashTransaction();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CashTransaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryLabel = (type: string, category: string) => {
    const categories = type === 'entry' ? ENTRY_CATEGORIES : EXIT_CATEGORIES;
    return categories.find(c => c.value === category)?.label || category;
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return '-';
    return PAYMENT_METHODS.find(m => m.value === method)?.label || method;
  };

  const handleEdit = (transaction: CashTransaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteMutation.mutateAsync(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <List className="h-5 w-5 text-primary" />
            Movimentações
          </CardTitle>
          <Button onClick={handleNewTransaction} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Transação
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">Data</TableHead>
                    <TableHead className="w-[80px]">Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {format(new Date(transaction.transaction_date), 'dd/MM/yy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'entry' ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                            <TrendingUp className="h-3 w-3" />
                            E
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                            <TrendingDown className="h-3 w-3" />
                            S
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getCategoryLabel(transaction.type, transaction.category)}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getPaymentMethodLabel(transaction.payment_method)}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-semibold",
                        transaction.type === 'entry' ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {transaction.type === 'entry' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(transaction.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação registrada</p>
              <p className="text-sm">Clique em "Nova Transação" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CashTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTransaction}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
