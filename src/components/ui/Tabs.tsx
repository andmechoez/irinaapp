import { useState, type ReactNode } from 'react';

// =============================================
// Tabs — Navegación por pestañas
// =============================================

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export default function Tabs({ tabs, activeTab, onChange, variant = 'underline', className = '' }: TabsProps) {
  if (variant === 'pills') {
    return (
      <div className={`flex gap-1.5 bg-bg-elevated p-1 rounded-[var(--radius-lg)] ${className}`}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]
                text-sm font-semibold transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-bg-card text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`
                  min-w-[18px] h-[18px] rounded-full text-[10px] font-bold
                  flex items-center justify-center
                  ${isActive ? 'bg-salud-blue text-white' : 'bg-bg-card text-text-tertiary'}
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex border-b border-border/60 ${className}`}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5
              text-sm font-semibold transition-all duration-200 cursor-pointer
              relative
              ${isActive
                ? 'text-salud-blue'
                : 'text-text-tertiary hover:text-text-secondary'
              }
            `}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`
                min-w-[18px] h-[18px] rounded-full text-[10px] font-bold
                flex items-center justify-center
                ${isActive ? 'bg-salud-blue text-white' : 'bg-bg-elevated text-text-tertiary'}
              `}>
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-salud-blue rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Hook helper for tab state management */
export function useTabs(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return { activeTab, setActiveTab };
}
