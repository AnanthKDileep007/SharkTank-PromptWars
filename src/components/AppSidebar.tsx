import React from 'react';
import { SharkLogo } from './SharkLogo.tsx';
import {
  LayoutDashboard,
  Presentation,
  Award,
  History as HistoryIcon,
  Users,
  Settings,
  ChevronRight
} from 'lucide-react';

export type NavItemKey = 'dashboard' | 'pitch_room' | 'results' | 'history' | 'leaderboard' | 'settings';

interface AppSidebarProps {
  activeKey: NavItemKey;
  onNavigate: (key: NavItemKey) => void;
  className?: string;
  hasActiveSession?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeKey,
  onNavigate,
  className = '',
  hasActiveSession = false
}) => {
  const navItems = [
    { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'pitch_room' as NavItemKey, label: 'Pitch Room', icon: Presentation, disabled: !hasActiveSession },
    { key: 'results' as NavItemKey, label: 'Results', icon: Award },
    { key: 'history' as NavItemKey, label: 'History', icon: HistoryIcon },
    { key: 'leaderboard' as NavItemKey, label: 'Leaderboard', icon: Users },
    { key: 'settings' as NavItemKey, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`w-56 bg-[#0B1120] border-r border-slate-800/80 flex flex-col justify-between py-6 px-4 shrink-0 select-none ${className}`}>
      <div>
        {/* Logo */}
        <div className="px-2 mb-8">
          <SharkLogo onClick={() => onNavigate('dashboard')} />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;

            return (
              <button
                key={item.key}
                disabled={item.disabled}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 shadow-sm'
                    : item.disabled
                    ? 'text-slate-600 opacity-40 cursor-not-allowed'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#E5A93C]' : 'text-slate-500'
                  }`}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] shadow-[0_0_8px_#E5A93C]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom status badge */}
      <div className="px-3 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300">Tank Ready</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">v2.5</span>
      </div>
    </aside>
  );
};
