/**
 * NotifyWhenAvailable - Email signup for out-of-stock products
 * Improvements: #22 Back-in-stock notification, #23 Lead capture, #24 Auto-save to leads table
 */
import { useState } from 'react';
import { Bell, Loader2, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotifyWhenAvailableProps {
  productName: string;
  productId: string;
  inStock: boolean;
}

export function NotifyWhenAvailable({ productName, productId, inStock }: NotifyWhenAvailableProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (inStock) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await supabase.from('leads').upsert(
        {
          email,
          name: email.split('@')[0],
          source: 'back_in_stock',
          tags: [`notify:${productId}`],
        },
        { onConflict: 'email' }
      );
      setSubmitted(true);
      toast.success('Você será notificado quando o produto voltar!');
    } catch {
      toast.error('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 p-3 text-sm text-primary">
        <CheckCircle className="h-4 w-4" />
        <span>Pronto! Avisaremos quando <strong>{productName}</strong> estiver disponível.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2.5">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Bell className="h-4 w-4 text-primary" />
        Avise-me quando disponível
      </div>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 text-sm"
          required
        />
        <Button type="submit" size="sm" className="h-9 shrink-0" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Notificar'}
        </Button>
      </div>
    </form>
  );
}
