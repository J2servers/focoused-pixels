import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, ChevronRight, MessageSquare, Mail } from 'lucide-react';
import { PRESETS, PRESET_CATEGORIES, type PresetDef } from '@/hooks/useWorkflows';
import { CAT_ICONS, DIFF_COLORS } from './constants';

interface Props {
  onLoadPreset: (preset: PresetDef) => void;
}

export function PresetsTab({ onLoadPreset }: Props) {
  const [presetCategory, setPresetCategory] = useState('all');
  const filteredPresets = presetCategory === 'all' ? PRESETS : PRESETS.filter(p => p.category === presetCategory);

  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap gap-1.5 mb-1">
        <button
          onClick={() => setPresetCategory('all')}
          className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${presetCategory === 'all' ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-transparent text-white/40 border-white/[0.06] hover:text-white/60'}`}
        >
          Todos ({PRESETS.length})
        </button>
        {PRESET_CATEGORIES.map(cat => {
          const Icon = CAT_ICONS[cat.key] || Zap;
          const count = PRESETS.filter(p => p.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setPresetCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all border ${presetCategory === cat.key ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-transparent text-white/40 border-white/[0.06] hover:text-white/60'}`}
            >
              <Icon className="h-3 w-3" />{cat.label} ({count})
            </button>
          );
        })}
      </div>

      {filteredPresets.map((p, i) => {
        const diff = DIFF_COLORS[p.difficulty];
        const whatsCount = p.steps.filter(s => s.type === 'send_whatsapp').length;
        const emailCount = p.steps.filter(s => s.type === 'send_email').length;
        return (
          <button
            key={i}
            onClick={() => onLoadPreset(p)}
            className="w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-violet-500/30 hover:bg-violet-500/[0.03] transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white truncate">{p.name}</span>
                  <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-violet-400 ml-auto shrink-0 transition-colors" />
                </div>
                <p className="text-[10px] text-white/40 mb-2.5 line-clamp-2">{p.description}</p>
                <div className="flex gap-1.5 items-center flex-wrap">
                  {whatsCount > 0 && (
                    <Badge className="text-[8px] h-[18px] bg-green-500/10 text-green-400 border-green-500/20 gap-0.5">
                      <MessageSquare className="h-2.5 w-2.5" />{whatsCount}
                    </Badge>
                  )}
                  {emailCount > 0 && (
                    <Badge className="text-[8px] h-[18px] bg-blue-500/10 text-blue-400 border-blue-500/20 gap-0.5">
                      <Mail className="h-2.5 w-2.5" />{emailCount}
                    </Badge>
                  )}
                  <Badge className="text-[8px] h-[18px] bg-white/5 text-white/40 border-white/[0.06]">
                    {p.steps.length} passos
                  </Badge>
                  <Badge className={`text-[8px] h-[18px] ml-auto ${diff.cls}`}>{diff.label}</Badge>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
