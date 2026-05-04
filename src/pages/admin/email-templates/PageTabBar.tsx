import { Mail, Workflow } from 'lucide-react';

export type PageTab = 'templates' | 'workflows';

interface Props {
  activeTab: PageTab;
  setActiveTab: (t: PageTab) => void;
  templatesActiveCount: number;
}

export function PageTabBar({ activeTab, setActiveTab, templatesActiveCount }: Props) {
  const tabs = [
    { key: 'templates' as PageTab, label: 'Templates', icon: Mail, desc: `${templatesActiveCount} ativos` },
    { key: 'workflows' as PageTab, label: 'Workflows', icon: Workflow, desc: 'Automações visuais' },
  ];

  return (
    <div className="rounded-2xl border overflow-hidden liquid-glass">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 transition-all border-b-2
                ${isActive
                  ? 'border-[hsl(var(--admin-accent-purple))] bg-[hsl(var(--admin-accent-purple)/0.06)] text-white'
                  : 'border-transparent text-white/50 hover:bg-white/3 hover:text-white'
                }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : ''}`} />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold">{tab.label}</p>
                <p className="text-[10px] opacity-60">{tab.desc}</p>
              </div>
              <span className="sm:hidden text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
