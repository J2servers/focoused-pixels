import { Plus, Zap, Settings2, Activity as ActivityIcon } from 'lucide-react';
import type { SidebarTab } from './constants';

interface Props {
  tab: SidebarTab;
  onChange: (tab: SidebarTab) => void;
}

export function TabNav({ tab, onChange }: Props) {
  const tabs: { key: SidebarTab; label: string; icon: React.ElementType }[] = [
    { key: 'nodes', label: 'Blocos', icon: Plus },
    { key: 'presets', label: 'Modelos', icon: Zap },
    { key: 'saved', label: 'Salvos', icon: Settings2 },
    { key: 'history', label: 'Logs', icon: ActivityIcon },
  ];
  return (
    <div className="flex border-b border-white/[0.06]">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wide transition-all relative ${
            tab === t.key ? 'text-white' : 'text-white/30 hover:text-white/60'
          }`}
        >
          <t.icon className="h-4 w-4" />
          <span>{t.label}</span>
          {tab === t.key && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
