import React, { useState, useRef, useEffect } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import {
  ShieldCheck,
  Search,
  Sun,
  Moon,
  Laptop,
  ChevronDown,
  Plus,
  Building2,
  Check,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    theme,
    setTheme,
    setCommandPaletteOpen,
    setNewDraftModalOpen,
  } = useApp();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navLinks: { view: AppView; label: string }[] = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'studio', label: 'Review Studio' },
    { view: 'guidelines', label: 'Guidelines' },
    { view: 'reviews', label: 'Human Review' },
    { view: 'analytics', label: 'Analytics' },
    { view: 'landing', label: 'Product Tour' },
  ];

  return (
    <header className="h-14 shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between gap-8 transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 text-left group focus-visible:outline-none"
        >
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
            BrandGuard AI
          </span>
        </button>

        {/* Workspace Quick Switcher */}
        <div className="relative ml-2" ref={workspaceRef}>
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 transition-colors whitespace-nowrap"
            aria-label="Select active workspace"
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-500" />
            <span className="max-w-[120px] truncate font-medium">{activeWorkspace?.name || 'Workspace'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-1 w-56 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id);
                    setWorkspaceMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === activeWorkspace?.id && <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
                </button>
              ))}
              <div className="border-t border-neutral-200 dark:border-neutral-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setWorkspaceMenuOpen(false);
                    setActiveView('workspaces');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Manage Workspaces →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: 4-5 Clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600 dark:text-neutral-400">
        {navLinks.map((item) => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-neutral-900 dark:hover:text-white py-1 relative ${
              activeView === item.view
                ? 'text-neutral-900 dark:text-white font-semibold'
                : ''
            }`}
          >
            {item.label}
            {activeView === item.view && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action button + auxiliary controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search / Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          title="Search actions and pages (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-block font-mono text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-neutral-600 dark:text-neutral-300">
            ⌘K
          </kbd>
        </button>

        {/* Theme Switcher Toggle & Dropdown */}
        <div className="relative flex items-center" ref={themeRef}>
          <div className="flex items-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-0.5">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 px-2 text-xs"
              aria-label="Toggle between dark and light mode"
              title={`Currently ${theme}. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline text-[11px] font-medium">Dark</span>
                </>
              ) : theme === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline text-[11px] font-medium">Light</span>
                </>
              ) : (
                <>
                  <Laptop className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="hidden sm:inline text-[11px] font-medium">System</span>
                </>
              )}
            </button>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors"
              title="More theme options"
              aria-label="More theme options"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {themeMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-32 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => {
                  setTheme('dark');
                  setThemeMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  theme === 'dark' ? 'text-cyan-500 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5" /> Dark
                </span>
                {theme === 'dark' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setTheme('light');
                  setThemeMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  theme === 'light' ? 'text-cyan-500 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5" /> Light
                </span>
                {theme === 'light' && <Check className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setTheme('system');
                  setThemeMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  theme === 'system' ? 'text-cyan-500 font-semibold' : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5" /> System
                </span>
                {theme === 'system' && <Check className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={() => setNewDraftModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-md hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Draft</span>
        </button>
      </div>
    </header>
  );
};
