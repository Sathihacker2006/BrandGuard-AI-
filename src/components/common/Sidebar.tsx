import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  BookOpenCheck,
  Library,
  FileText,
  ScanSearch,
  SlidersHorizontal,
  UserCheck,
  History,
  BarChart3,
  ScrollText,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, drafts, activeDraftFindings } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navigationSections: {
    category: string;
    items: {
      view: AppView;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: number;
    }[];
  }[] = [
    {
      category: 'Overview',
      items: [
        { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { view: 'workspaces', label: 'Workspaces', icon: Building2 },
      ],
    },
    {
      category: 'Governance Configuration',
      items: [
        { view: 'guidelines', label: 'Brand Guidelines', icon: BookOpenCheck },
        { view: 'references', label: 'Reference Library', icon: Library },
      ],
    },
    {
      category: 'Content & Review',
      items: [
        { view: 'drafts', label: 'Drafts', icon: FileText, badge: drafts.length },
        {
          view: 'studio',
          label: 'Content Review Studio',
          icon: ScanSearch,
          badge: activeDraftFindings.filter((f) => f.status === 'open').length || undefined,
        },
        { view: 'findings', label: 'Findings Explorer', icon: SlidersHorizontal },
        { view: 'reviews', label: 'Human Review Centre', icon: UserCheck },
        { view: 'revisions', label: 'Revision History', icon: History },
      ],
    },
    {
      category: 'Intelligence & Audit',
      items: [
        { view: 'analytics', label: 'Governance Analytics', icon: BarChart3 },
        { view: 'audit', label: 'Audit History', icon: ScrollText },
        { view: 'settings', label: 'Docs & Hackathon Info', icon: FileCode2 },
      ],
    },
  ];

  return (
    <aside
      className={`border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-slate-950/80 flex flex-col justify-between transition-all duration-300 z-30 select-none h-full min-h-0 shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header / Collapse Trigger */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-5">
        <div className="flex items-center justify-between px-2">
          {!collapsed && (
            <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              Platform Hub
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition-colors ml-auto"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        {navigationSections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {!collapsed && (
              <span className="px-2 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {section.category}
              </span>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group text-left relative ${
                      isActive
                        ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200'
                      }`}
                    />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-mono rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-cyan-500 rounded-r" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
        {!collapsed ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5 text-cyan-500" />
              <span>FutureStack R2</span>
            </div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Team: INNOVATION NINJAS
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="FutureStack Hackathon Round 2">
            <Shield className="w-4 h-4 text-cyan-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
