import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuideStep {
  title: string;
  description: string;
}

interface AdminPageGuideProps {
  title: string;
  description: string;
  steps: GuideStep[];
}

export function AdminPageGuide({ title, description, steps }: AdminPageGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[hsl(var(--admin-card-border))] bg-[hsl(var(--admin-card))] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-accent-cyan)/0.15)] flex items-center justify-center shrink-0">
          <HelpCircle className="h-4 w-4 text-[hsl(var(--admin-accent-cyan))]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">{description}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-[hsl(var(--admin-text-muted))] shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[hsl(var(--admin-text-muted))] shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-[hsl(var(--admin-card-border))]">
          <div className="grid gap-3 mt-3 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-card-border)/0.5)]"
              >
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--admin-accent-purple)/0.2)] flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="h-3 w-3 text-[hsl(var(--admin-accent-purple))]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
