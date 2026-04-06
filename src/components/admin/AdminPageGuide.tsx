import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';

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
    <div className="rounded-xl overflow-hidden relative" style={{
      background: 'linear-gradient(135deg, hsl(45 100% 50% / 0.08), hsl(210 100% 55% / 0.08))',
      border: '1.5px solid transparent',
      backgroundClip: 'padding-box',
    }}>
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl -z-10" style={{
        background: 'linear-gradient(135deg, hsl(45 100% 55% / 0.5), hsl(210 100% 60% / 0.5), hsl(45 100% 55% / 0.5))',
        backgroundSize: '200% 200%',
        animation: 'guideGlow 3s ease-in-out infinite',
        padding: '1.5px',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }} />

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors rounded-xl"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{
          background: 'linear-gradient(135deg, hsl(45 100% 55% / 0.2), hsl(210 100% 60% / 0.2))',
        }}>
          <Sparkles className="h-4 w-4" style={{ color: 'hsl(45 100% 60%)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{
            background: 'linear-gradient(90deg, hsl(45 100% 65%), hsl(210 100% 70%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{title}</p>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] truncate">{description}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0" style={{ color: 'hsl(45 100% 60%)' }} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'hsl(45 100% 60%)' }} />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid hsl(45 100% 55% / 0.15)' }}>
          <div className="grid gap-3 mt-3 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg transition-colors hover:bg-white/5"
                style={{
                  background: i % 2 === 0
                    ? 'linear-gradient(135deg, hsl(45 100% 55% / 0.06), transparent)'
                    : 'linear-gradient(135deg, hsl(210 100% 60% / 0.06), transparent)',
                  border: `1px solid ${i % 2 === 0 ? 'hsl(45 100% 55% / 0.2)' : 'hsl(210 100% 60% / 0.2)'}`,
                }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{
                  background: i % 2 === 0
                    ? 'hsl(45 100% 55% / 0.15)'
                    : 'hsl(210 100% 60% / 0.15)',
                }}>
                  <Lightbulb className="h-3 w-3" style={{
                    color: i % 2 === 0 ? 'hsl(45 100% 60%)' : 'hsl(210 100% 70%)',
                  }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{
                    color: i % 2 === 0 ? 'hsl(45 100% 70%)' : 'hsl(210 100% 75%)',
                  }}>{step.title}</p>
                  <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes guideGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
