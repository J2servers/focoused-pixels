import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';

interface GuideStep { title: string; description: string; }
interface AdminPageGuideProps { title: string; description: string; steps: GuideStep[]; }

export function AdminPageGuide({ title, description, steps }: AdminPageGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden liquid-glass-lighter">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors rounded-xl"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(45 100% 55% / 0.2), hsl(210 100% 60% / 0.2))' }}>
          <Sparkles className="h-4 w-4" style={{ color: 'hsl(45 100% 60%)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold liquid-gradient-text">{title}</p>
          <p className="text-xs text-white/40 truncate">{description}</p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-white/30" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-white/30" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.06]">
          <div className="grid gap-3 mt-3 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => {
              const isYellow = i % 2 === 0;
              return (
                <div key={i}
                  className="flex gap-3 p-3 rounded-lg transition-all hover:scale-[1.02]"
                  style={{
                    background: isYellow ? 'hsl(45 100% 50% / 0.10)' : 'hsl(210 100% 55% / 0.10)',
                    border: isYellow ? '1px solid hsl(45 100% 55% / 0.25)' : '1px solid hsl(210 100% 60% / 0.25)',
                  }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: isYellow ? 'hsl(45 100% 50% / 0.25)' : 'hsl(210 100% 55% / 0.25)' }}>
                    <Lightbulb className="h-3 w-3"
                      style={{ color: isYellow ? 'hsl(45 100% 60%)' : 'hsl(210 100% 70%)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold"
                      style={{ color: isYellow ? 'hsl(45 100% 65%)' : 'hsl(210 100% 75%)' }}>
                      {step.title}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
