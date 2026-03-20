/**
 * ProductShareButtons - Share product on social media
 */
import { Share2, MessageCircle, Facebook, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProductShareButtonsProps {
  productName: string;
  productSlug: string;
  productImage?: string;
}

export function ProductShareButtons({ productName, productSlug }: ProductShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const productUrl = `${window.location.origin}/produto/${productSlug}`;
  const shareText = `Olha esse produto incrível: ${productName}`;

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${productUrl}`)}`,
      '_blank'
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      '_blank'
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" />
        Compartilhar:
      </span>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={shareWhatsApp} title="WhatsApp">
        <MessageCircle className="h-4 w-4 text-success" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={shareFacebook} title="Facebook">
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={copyLink} title="Copiar link">
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
