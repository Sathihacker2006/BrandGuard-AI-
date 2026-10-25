import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Draft, Finding, Severity } from '../../types';
import {
  Search,
  ScanSearch,
  BookOpenCheck,
  Library,
  FileText,
  UserCheck,
  BarChart3,
  ScrollText,
  Moon,
  Sun,
  RotateCcw,
  Plus,
  Building2,
  X,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

type PaletteTier = 'all' | 'drafts' | 'findings' | 'actions' | 'navigation';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  tier: 'drafts' | 'findings' | 'actions' | 'navigation';
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  quickJumpLabel: string;
  action: () => void;
  searchCorpus: string;
}

// Robust fuzzy search scorer
function calculateFuzzyScore(pattern: string, corpus: string): number {
  if (!pattern) return 1;
  const p = pattern.trim().toLowerCase();
  const t = corpus.toLowerCase();

  // 1. Exact match / prefix match
  if (t === p) return 100;
  if (t.startsWith(p)) return 95;
  if (t.includes(p)) {
    // Word boundary match bonus
    const regex = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    if (regex.test(t)) return 85;
    return 75 - Math.min(20, t.indexOf(p));
  }

  // 2. Multi-word token match (all words in pattern exist in text)
  const tokens = p.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every((token) => t.includes(token));
    if (allTokensMatch) {
      return 70;
    }
  }

  // 3. Subsequence match (all letters appear in order)
  let pIdx = 0;
  let score = 0;
  let prevMatchIdx = -1;

  for (let i = 0; i < t.length && pIdx < p.length; i++) {
    if (t[i] === p[pIdx]) {
      pIdx++;
      // Consecutive characters bonus
      if (prevMatchIdx === i - 1) score += 6;
      else score += 2;
      // Start of word bonus
      if (i === 0 || t[i - 1] === ' ' || t[i - 1] === '-' || t[i - 1] === '_' || t[i - 1] === '"') {
        score += 8;
      }
      prevMatchIdx = i;
    }
  }

  if (pIdx === p.length) {
    return Math.max(15, score);
  }

  return 0; // No match
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
    drafts,
    activeDraft,
    setActiveDraft,
    allFindings,
    activeDraftFindings,
    setTargetFindingId,
    runAnalysis,
    createNewDraft,
    theme,
    setTheme,
    resetToSeedData,
    showToast,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<PaletteTier>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedTier('all');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Combine active findings with all findings to guarantee rich search corpus
  const unifiedFindings = useMemo(() => {
    const list = [...activeDraftFindings];
    for (const f of allFindings) {
      if (!list.some((existing) => existing.id === f.id)) {
        list.push(f);
      }
    }
    return list;
  }, [activeDraftFindings, allFindings]);

  // Build the complete catalogue of searchable items across all 4 tiers
  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [];

    // --- TIER 1: DRAFTS ---
    drafts.forEach((draft) => {
      const wordCount = draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0;
      const snippet = draft.content.slice(0, 120).replace(/\s+/g, ' ');
      items.push({
        id: `draft-${draft.id}`,
        title: draft.title,
        subtitle: `${draft.contentType.replace(/_/g, ' ')} · ${wordCount} words · "${snippet}..."`,
        tier: 'drafts',
        icon: FileText,
        badge: draft.status.replace(/_/g, ' '),
        badgeColor:
          draft.status === 'approved'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
            : draft.status === 'in_review'
            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        quickJumpLabel: 'Jump to Draft →',
        action: () => {
          setActiveDraft(draft);
          setActiveView('studio');
          setCommandPaletteOpen(false);
          showToast('Draft Opened', `Jumped to "${draft.title}".`, 'info');
        },
        searchCorpus: `${draft.title} ${draft.content} ${draft.contentType} ${draft.status} ${draft.creator}`,
      });
    });

    // --- TIER 2: COMPLIANCE FINDINGS ---
    unifiedFindings.forEach((finding) => {
      const parentDraft = drafts.find((d) => d.id === finding.draftId);
      const draftName = parentDraft ? parentDraft.title : 'Current Draft';

      let sevBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
      if (finding.severity === 'critical') {
        sevBadgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
      } else if (finding.severity === 'high') {
        sevBadgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300';
      } else if (finding.severity === 'low') {
        sevBadgeColor = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300';
      }

      items.push({
        id: `finding-${finding.id}`,
        title: finding.title,
        subtitle: `In ${draftName} · Excerpt: "${finding.excerpt}" · Suggestion: "${finding.suggestedCorrection || '[Remove]'}"`,
        tier: 'findings',
        icon: AlertCircle,
        badge: `${finding.severity.toUpperCase()}`,
        badgeColor: sevBadgeColor,
        quickJumpLabel: 'Jump to Finding →',
        action: () => {
          if (parentDraft) {
            setActiveDraft(parentDraft);
          }
          setTargetFindingId(finding.id);
          setActiveView('studio');
          setCommandPaletteOpen(false);
          showToast('Finding Focused', `Jumped to "${finding.title}".`, 'warning');
        },
        searchCorpus: `${finding.title} ${finding.excerpt} ${finding.explanation} ${finding.category} ${finding.severity} ${finding.suggestedCorrection || ''} ${draftName}`,
      });
    });

    // --- TIER 3: ACTIONS & TOOLS ---
    items.push(
      {
        id: 'act-run-analysis',
        title: activeDraft ? `Run Analysis on "${activeDraft.title}"` : 'Run Content Compliance Analysis',
        subtitle: 'Evaluate all active brand rules and cross-reference factual statistics',
        tier: 'actions',
        icon: ScanSearch,
        badge: 'ACTION',
        badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300',
        quickJumpLabel: 'Run Scan →',
        action: () => {
          if (activeDraft) {
            runAnalysis(activeDraft.id);
            setActiveView('studio');
          } else {
            setActiveView('drafts');
          }
          setCommandPaletteOpen(false);
        },
        searchCorpus: 'run analysis scan content verify rules evaluate compliance check',
      },
      {
        id: 'act-new-draft',
        title: 'Create New Content Draft',
        subtitle: 'Start drafting marketing copy, press release, or social campaign',
        tier: 'actions',
        icon: Plus,
        badge: 'ACTION',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
        quickJumpLabel: 'Create Draft →',
        action: () => {
          createNewDraft('New Content Draft', 'marketing_copy');
          setActiveView('studio');
          setCommandPaletteOpen(false);
        },
        searchCorpus: 'new draft create copy marketing campaign post write compose',
      },
      {
        id: 'pref-theme-toggle',
        title: `Switch Display Theme (Current: ${theme.toUpperCase()})`,
        subtitle: `Toggle to ${theme === 'dark' ? 'Light' : 'Dark'} mode for optimal contrast`,
        tier: 'actions',
        icon: theme === 'dark' ? Sun : Moon,
        badge: 'PREFERENCE',
        badgeColor: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
        quickJumpLabel: 'Toggle Theme →',
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          setCommandPaletteOpen(false);
        },
        searchCorpus: 'theme dark light mode switch toggle background appearance',
      },
      {
        id: 'act-reset-seed',
        title: 'Restore Default Enterprise Seed Data',
        subtitle: 'Reset Acme Cloud Platform workspace with 5 pre-configured violations',
        tier: 'actions',
        icon: RotateCcw,
        badge: 'RESET',
        badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
        quickJumpLabel: 'Reset Data →',
        action: () => {
          resetToSeedData();
          setCommandPaletteOpen(false);
        },
        searchCorpus: 'reset seed default demo data restore initial acme cloud',
      }
    );

    // --- TIER 4: NAVIGATION ---
    const navItems = [
      { view: 'dashboard' as const, label: 'Dashboard & Telemetry', desc: 'KPI cards, severity charts, and recent audit activity' },
      { view: 'studio' as const, label: 'Content Review Studio', desc: 'Flagship 3-panel editor with synchronized explainable findings' },
      { view: 'guidelines' as const, label: 'Brand Guidelines Studio', desc: 'Configure active brand rules and test simulator' },
      { view: 'references' as const, label: 'Approved Reference Library', desc: 'Audited metrics, SLA specs, and factual truth benchmarks' },
      { view: 'drafts' as const, label: 'Content Drafts Library', desc: 'Manage, duplicate, and filter drafts' },
      { view: 'findings' as const, label: 'Findings Explorer', desc: 'Cross-draft triage table and mass resolution' },
      { view: 'reviews' as const, label: 'Human Review Centre', desc: 'Review queue, approval state machine, and reviewer comments' },
      { view: 'revisions' as const, label: 'Revision History & Diffs', desc: 'Word-level diff comparison across draft versions' },
      { view: 'analytics' as const, label: 'Governance Analytics', desc: 'Recharts visualisations and self-improving guideline intelligence' },
      { view: 'audit' as const, label: 'Audit History Ledger', desc: 'Chronological immutable record of brand decisions' },
      { view: 'workspaces' as const, label: 'Workspace Management', desc: 'Brand identity perimeters and multi-workspace settings' },
      { view: 'settings' as const, label: 'FutureStack Round 2 Docs', desc: 'Evaluator walkthrough script, verified evolution, and Round 3 roadmap' },
      { view: 'landing' as const, label: 'Product Tour & Landing Page', desc: 'Public brand governance platform overview' },
    ];

    navItems.forEach((n) => {
      items.push({
        id: `nav-${n.view}`,
        title: n.label,
        subtitle: n.desc,
        tier: 'navigation',
        icon: Layers,
        badge: 'PAGE',
        badgeColor: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        quickJumpLabel: 'Navigate →',
        action: () => {
          setActiveView(n.view);
          setCommandPaletteOpen(false);
        },
        searchCorpus: `${n.label} ${n.desc} go to open view navigate page`,
      });
    });

    return items;
  }, [
    drafts,
    unifiedFindings,
    activeDraft,
    theme,
    setActiveDraft,
    setActiveView,
    setTargetFindingId,
    setCommandPaletteOpen,
    runAnalysis,
    createNewDraft,
    setTheme,
    resetToSeedData,
    showToast,
  ]);

  // Filter items using fuzzy scorer and tier selector
  const scoredItems = useMemo(() => {
    return allItems
      .map((item) => {
        const score = query ? calculateFuzzyScore(query, item.searchCorpus) : 1;
        return { item, score };
      })
      .filter(({ item, score }) => {
        if (score === 0) return false;
        if (selectedTier !== 'all' && item.tier !== selectedTier) return false;
        return true;
      })
      .sort((a, b) => {
        // First sort by score descending
        if (query && b.score !== a.score) {
          return b.score - a.score;
        }
        return 0;
      });
  }, [allItems, query, selectedTier]);

  // Group scored items into tiers for rendering
  const tieredGroups = useMemo(() => {
    const draftsGroup: CommandItem[] = [];
    const findingsGroup: CommandItem[] = [];
    const actionsGroup: CommandItem[] = [];
    const navigationGroup: CommandItem[] = [];

    scoredItems.forEach(({ item }) => {
      if (item.tier === 'drafts') draftsGroup.push(item);
      else if (item.tier === 'findings') findingsGroup.push(item);
      else if (item.tier === 'actions') actionsGroup.push(item);
      else if (item.tier === 'navigation') navigationGroup.push(item);
    });

    const groups: { key: 'drafts' | 'findings' | 'actions' | 'navigation'; label: string; count: number; items: CommandItem[] }[] = [];
    if (draftsGroup.length > 0) groups.push({ key: 'drafts', label: 'Drafts', count: draftsGroup.length, items: draftsGroup });
    if (findingsGroup.length > 0) groups.push({ key: 'findings', label: 'Compliance Findings', count: findingsGroup.length, items: findingsGroup });
    if (actionsGroup.length > 0) groups.push({ key: 'actions', label: 'Actions & Tools', count: actionsGroup.length, items: actionsGroup });
    if (navigationGroup.length > 0) groups.push({ key: 'navigation', label: 'Navigation & Views', count: navigationGroup.length, items: navigationGroup });

    return groups;
  }, [scoredItems]);

  // Flattened array for index-based keyboard navigation
  const flattenedList: CommandItem[] = useMemo(() => {
    return tieredGroups.flatMap((g) => g.items);
  }, [tieredGroups]);

  // Ensure selectedIndex stays in range
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedTier]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flattenedList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flattenedList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flattenedList.length) % flattenedList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flattenedList[selectedIndex];
      if (current) {
        current.action();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  // Counts for tier tabs
  const countDrafts = allItems.filter((i) => i.tier === 'drafts').length;
  const countFindings = allItems.filter((i) => i.tier === 'findings').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-16 md:pt-24 px-4 transition-all"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-black/5 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          <Search className="w-4 h-4 text-cyan-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Fuzzy search drafts, findings, rules, actions, or pages... (e.g. 'sla', 'cheap', 'launch', 'review')"
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
            aria-label="Search drafts and findings"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tier Filter Tabs Strip */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
              selectedTier === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All Results ({flattenedList.length})
          </button>

          <button
            onClick={() => setSelectedTier('drafts')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
              selectedTier === 'drafts'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3 text-cyan-500" />
            <span>Drafts ({countDrafts})</span>
          </button>

          <button
            onClick={() => setSelectedTier('findings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
              selectedTier === 'findings'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span>Findings ({countFindings})</span>
          </button>

          <button
            onClick={() => setSelectedTier('actions')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
              selectedTier === 'actions'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Actions
          </button>

          <button
            onClick={() => setSelectedTier('navigation')}
            className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap text-xs font-medium ${
              selectedTier === 'navigation'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Navigation
          </button>
        </div>

        {/* Tiered Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 min-h-[220px]">
          {flattenedList.length === 0 ? (
            <div className="py-14 text-center text-xs text-neutral-400 flex flex-col items-center gap-2">
              <Search className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                No matching drafts, findings, or actions found for "{query}".
              </p>
              <p className="text-[11px] text-neutral-500 max-w-xs">
                Try searching for keywords like "SLA", "cheap", "100%", "customers", or "launch".
              </p>
            </div>
          ) : (
            tieredGroups.map((group) => {
              return (
                <div key={group.key} className="flex flex-col gap-1">
                  {/* Tier Group Header */}
                  <div className="px-3 pt-2 pb-1 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                    <span>{group.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                      {group.count}
                    </span>
                  </div>

                  {/* Tier Items */}
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const globalIdx = flattenedList.findIndex((fi) => fi.id === item.id);
                      const isSelected = globalIdx === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          data-selected={isSelected}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`group px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-3 cursor-pointer select-none border ${
                            isSelected
                              ? 'bg-neutral-100 dark:bg-neutral-800/90 border-cyan-500/50 shadow-xs'
                              : 'bg-transparent border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          {/* Item Left: Icon + Content Lockup */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div
                              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                item.tier === 'findings'
                                  ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
                                  : item.tier === 'drafts'
                                  ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                                  : item.tier === 'actions'
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                  : 'bg-neutral-200/50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold rounded shrink-0 ${
                                      item.badgeColor || 'bg-neutral-100 text-neutral-700'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {item.subtitle && (
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-snug font-sans">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Item Right: Quick-Jump Link Affordance */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[11px] font-medium transition-all flex items-center gap-1 ${
                                isSelected
                                  ? 'text-cyan-600 dark:text-cyan-400 opacity-100'
                                  : 'text-neutral-400 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <span>{item.quickJumpLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts strip */}
        <div className="px-4 py-2.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-400 shrink-0 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px]">↑↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px]">↵</kbd>
              <span>quick-jump</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px]">esc</kbd>
              <span>close</span>
            </span>
          </div>
          <span className="text-[10px] text-neutral-500">
            BrandGuard AI Fuzzy Tiers
          </span>
        </div>
      </div>
    </div>
  );
};
