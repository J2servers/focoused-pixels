import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Eye, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export function DarkProductCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success('Adicionado ao carrinho!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        to={`/produto/${product.slug}`}
        className="group block rounded-3xl overflow-hidden border border-[hsl(var(--primary))/0.12] bg-white/[0.04] backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.24)] hover:-translate-y-2 hover:border-[hsl(var(--primary))/0.4] hover:shadow-[0_24px_48px_hsl(var(--primary)/0.16)] transition-all duration-500"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-white/[0.06] to-[hsl(var(--primary))/0.04]">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a]/70 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.discount && (
              <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase bg-[hsl(var(--primary))] text-[#050d1a] font-bold shadow-lg">
                -{product.discount}%
              </span>
            )}
            {product.badge === 'lancamento' && (
              <span className="px-3 py-1 rounded-full font-mono text-[10px] tracking-wider uppercase bg-white/10 text-white border border-white/20 backdrop-blur-md">
                Novo
              </span>
            )}
          </div>

          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            <button className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))/0.3] transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-red-400 hover:border-red-400/30 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
            <button 
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-xl bg-[hsl(var(--primary))/0.2] border border-[hsl(var(--primary))/0.3] backdrop-blur-md flex items-center justify-center text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.4] transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>

          {product.id && (
            <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.12em] uppercase text-white/40">
              #{product.id.slice(0, 6)}
            </span>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs font-mono tracking-wide uppercase">{product.category}</span>
            <div className="flex items-center gap-1 text-[hsl(var(--primary))]">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-medium">{product.rating}</span>
            </div>
          </div>
          <h3 className="text-white font-medium text-sm leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-baseline gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-white font-semibold text-lg">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-white/30 text-xs line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
