/**
 * SizeGuideModal - Size guide with dimensions table
 * Improvements: #13 Size guide modal, #14 Dimensions reference, #15 Help text
 */
import { Ruler } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SizeGuideModalProps {
  sizes: string[];
  productName: string;
}

export function SizeGuideModal({ sizes, productName }: SizeGuideModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-xs text-primary p-0 h-auto gap-1">
          <Ruler className="h-3 w-3" />
          Guia de tamanhos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            Guia de Tamanhos
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Confira as dimensões disponíveis para <strong>{productName}</strong>:
          </p>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium">Tamanho</th>
                  <th className="text-left px-4 py-2.5 font-medium">Indicação</th>
                </tr>
              </thead>
              <tbody>
                {sizes.map((size, i) => (
                  <tr key={size} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    <td className="px-4 py-2.5 font-medium">{size}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {getSizeIndication(size)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Dúvidas sobre qual tamanho escolher? Entre em contato pelo WhatsApp.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getSizeIndication(size: string): string {
  const s = size.toLowerCase();
  if (s.includes('p ') || s === 'p') return 'Ambientes pequenos / Uso pessoal';
  if (s.includes('m ') || s === 'm') return 'Ambientes médios / Escritórios';
  if (s.includes('g ') || s.startsWith('g')) return 'Ambientes amplos / Lojas';
  if (s.includes('gg') || s.includes('150')) return 'Fachadas / Grandes espaços';
  if (s.includes('cm')) return 'Medida exata conforme descrição';
  if (s.includes('metro')) return 'Medida em metros lineares';
  return 'Consulte especificações';
}
