/**
 * FreeShippingBar — CRO progress bar.
 * Reads from useFreeShippingProgress; renders nothing when disabled.
 */
import { useFreeShippingProgress } from '@/hooks/useFreeShippingProgress';

interface FreeShippingBarProps {
  className?: string;
}

export const FreeShippingBar = ({ className = '' }: FreeShippingBarProps) => {
  const { enabled, applied, progress, message } = useFreeShippingProgress();
  if (!enabled) return null;

  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  if (applied) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-2xl neu-flat p-5 flex items-center gap-2 text-success ${className}`}
      >
        <span className="text-lg" aria-hidden="true">🎉</span>
        <p className="font-medium">{message}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-2xl neu-concave p-5 ${className}`}
    >
      <p className="text-sm">{message}</p>
      <div className="mt-2 h-2 rounded-full overflow-hidden neu-pressed" aria-hidden="true">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default FreeShippingBar;
