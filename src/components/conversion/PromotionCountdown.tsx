import { useEffect, useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';

interface PromotionCountdownProps {
  endDate: string;
  className?: string;
}

function getTimeLeft(endDate: string) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    expired: diff <= 0,
    days,
    hours,
    minutes,
    seconds,
  };
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function PromotionCountdown({ endDate, className }: PromotionCountdownProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const left = useMemo(() => getTimeLeft(endDate), [endDate, tick]);
  if (left.expired) return null;

  return (
    <div
      className={
        className ||
        'inline-flex items-center gap-1 rounded-lg bg-destructive/10 text-destructive px-2 py-1 text-xs font-semibold'
      }
      title="Tempo restante da promocao"
    >
      <Clock3 className="h-3.5 w-3.5" />
      <span>
        {left.days > 0 ? `${left.days}d ` : ''}
        {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)}
      </span>
    </div>
  );
}

