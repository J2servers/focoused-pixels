import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductColorDropdownProps {
  label: string;
  colors: string[];
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
  required?: boolean;
}

const colorSwatchMap: Record<string, string> = {
  'Branco': '#FFFFFF',
  'Preto': '#1a1a1a',
  'Azul Royal': '#1a3a8a',
  'Azul Claro': '#60a5fa',
  'Dourado': '#d4a017',
  'Prata': '#c0c0c0',
  'Bronze': '#8B4513',
  'Lilás': '#c084fc',
  'Verde': '#22c55e',
  'Laranja': '#f97316',
  'Rosé': '#f9a8d4',
  'Rose Gold': '#f9a8d4',
  'Rosa': '#ec4899',
  'Vermelho': '#ef4444',
  'Transparente': 'transparent',
  'RGB': 'linear-gradient(90deg, #ef4444, #22c55e, #3b82f6)',
  'Branco Quente': '#fff5e1',
  'Branco Frio': '#f0f8ff',
  'Amarelo': '#facc15',
};

export const ProductColorDropdown = ({
  label,
  colors,
  selectedColor,
  onSelectColor,
  required = false,
}: ProductColorDropdownProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {required && !selectedColor && (
          <span className="text-xs text-destructive font-medium">
            Selecione uma das opções *
          </span>
        )}
      </div>

      <Select value={selectedColor || ''} onValueChange={onSelectColor}>
        <SelectTrigger className="w-full h-11 rounded-xl border-border/50 bg-background">
          <SelectValue placeholder="Selecione">
            {selectedColor && (
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full border border-border/50 shrink-0"
                  style={{
                    background: colorSwatchMap[selectedColor] || '#ccc',
                  }}
                />
                <span>{selectedColor}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {colors.map((color) => (
            <SelectItem key={color} value={color}>
              <div className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full border border-border/50 shrink-0"
                  style={{
                    background: colorSwatchMap[color] || '#ccc',
                  }}
                />
                <span>{color}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
