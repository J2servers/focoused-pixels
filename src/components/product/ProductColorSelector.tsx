import { cn } from '@/lib/utils';

interface ProductColorSelectorProps {
  colors: string[];
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
}

// Mapeamento de cores para classes CSS
const colorMap: Record<string, string> = {
  'Rosa': 'bg-pink-400',
  'Azul': 'bg-blue-500',
  'Verde': 'bg-green-500',
  'Amarelo': 'bg-yellow-400',
  'Vermelho': 'bg-red-500',
  'Branco Quente': 'bg-amber-100',
  'Branco Frio': 'bg-white border-gray-300',
  'RGB': 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500',
  'Dourado': 'bg-amber-500',
  'Prata': 'bg-gray-300',
  'Rose Gold': 'bg-rose-300',
  'Bronze': 'bg-amber-700',
  'Lilás': 'bg-purple-300',
  'Laranja': 'bg-orange-500',
  'Preto': 'bg-gray-900',
  'Branco': 'bg-white border-gray-300',
  'Transparente': 'bg-white/50 border-gray-300 border-dashed',
  'Azul Royal': 'bg-blue-700',
};

export const ProductColorSelector = ({ 
  colors, 
  selectedColor, 
  onSelectColor 
}: ProductColorSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Cor
        </label>
        {selectedColor && (
          <span className="text-sm text-muted-foreground">
            {selectedColor}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={cn(
              "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
              colorMap[color] || 'bg-gray-200',
              selectedColor === color 
                ? 'ring-2 ring-primary ring-offset-2 border-primary' 
                : 'border-transparent hover:scale-110'
            )}
            title={color}
            aria-label={`Selecionar cor ${color}`}
          >
            {selectedColor === color && (
              <svg 
                className={cn(
                  "w-5 h-5",
                  ['Branco', 'Branco Quente', 'Branco Frio', 'Transparente', 'Amarelo', 'Prata'].includes(color)
                    ? 'text-gray-800'
                    : 'text-white'
                )} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
