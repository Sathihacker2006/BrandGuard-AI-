import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Finding, Severity, RuleCategory, FindingStatus } from '../types';
import {
  SlidersHorizontal,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const FindingsExplorerPage: React.FC = () => {
  const { activeDraftFindings, drafts, acceptFinding, dismissFinding, setActiveDraft, setActiveView, activeWorkspace } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<FindingStatus | 'all'>('all');

  const filteredFindings = activeDraftFindings.filter((f) => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q) ||
        f.excerpt.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 w-full gap-5 min-h-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Workspace</span>
            <span>/</span>
            <span>{activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Findings Explorer
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Cross-draft compliance audit log. Inspect, filter, and mass-triage brand rule infractions.
          </p>
        </div>

        <button
          onClick={() => setActiveView('studio')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400"
        >
          <span>Open Review Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings, excerpts, rules..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="accepted">Accepted</option>
            <option value="modified">Modified</option>
            <option value="dismissed">Dismissed</option>
            <option value="review_flagged">Flagged for Review</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Finding Issue</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Flagged Excerpt</th>
                <th className="py-3 px-4">Suggested Correction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No findings recorded. Open the Review Studio and click "Rescan Content".
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr
                    key={finding.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold uppercase text-[10px]">
                      <span
                        className={
                          finding.severity === 'critical'
                            ? 'text-rose-500'
                            : finding.severity === 'high'
                            ? 'text-orange-500'
                            : finding.severity === 'medium'
                            ? 'text-amber-500'
                            : 'text-cyan-500'
                        }
                      >
                        {finding.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 max-w-xs">
                      <div className="truncate">{finding.title}</div>
                      <div className="text-[11px] font-normal text-neutral-400 truncate mt-0.5">
                        {finding.explanation}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 capitalize whitespace-nowrap">
                      {finding.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-rose-600 dark:text-rose-400 max-w-xs truncate">
                      {finding.excerpt}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 max-w-xs truncate">
                      {finding.suggestedCorrection || <em className="text-neutral-400">Remove phrase</em>}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                          finding.status === 'open'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : finding.status === 'accepted'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {finding.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {finding.status === 'open' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => acceptFinding(finding.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded hover:bg-emerald-100"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => dismissFinding(finding.id, 'Triage dismissal from Explorer')}
                            className="px-2 py-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-white rounded"
                          >
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-neutral-400 font-mono">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
