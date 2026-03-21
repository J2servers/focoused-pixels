import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatCountdown = (ms: number) => {
  if (ms <= 0) return 'Agenda encerrada para esta semana';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}min`;
};

function getWeekDeadline() {
  const now = new Date();
  const deadline = new Date(now);
  const day = now.getDay();
  const daysUntilSunday = (7 - day) % 7;
  deadline.setDate(now.getDate() + daysUntilSunday);
  deadline.setHours(23, 59, 59, 999);
  return deadline;
}

export function WeeklyUrgencySection() {
  const deadline = useMemo(() => getWeekDeadline(), []);
  const [remaining, setRemaining] = useState(deadline.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(deadline.getTime() - Date.now());
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-primary/15 via-primary/5 to-accent/10 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-2">
                <Clock3 className="h-4 w-4" />
                Agenda semanal em andamento
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Fechamento da produção desta semana em {formatCountdown(remaining)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Se quiser garantir prazo desta semana, fale com o time agora e reserve sua produção.
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <Link to="/checkout">
                <Button size="lg" className="font-semibold">
                  Reservar minha produção
                </Button>
              </Link>
              <Link to="/por-que-escolher">
                <Button size="lg" variant="outline" className="font-semibold">
                  Ver bastidores
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


