import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditEvent, AuditEventType } from '../types';
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Layers,
  ArrowRight,
  Download,
} from 'lucide-react';

export const AuditHistoryPage: React.FC = () => {
  const { auditEvents, activeWorkspace, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<'all' | 'workspace' | 'rule' | 'reference' | 'draft' | 'finding' | 'review'>('all');

  const filteredEvents = auditEvents.filter((evt) => {
    if (resourceFilter !== 'all' && evt.resourceType !== resourceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        evt.details.toLowerCase().includes(q) ||
        evt.resourceTitle.toLowerCase().includes(q) ||
        evt.actor.toLowerCase().includes(q) ||
        evt.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportAuditLog = () => {
    const jsonStr = JSON.stringify(auditEvents, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brandguard-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Audit Log Exported', 'Downloaded complete JSON compliance audit record.', 'success');
  };

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
            Governance Audit History
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Immutable chronological ledger tracking brand rules, scans, corrections, revisions, and human review decisions.
          </p>
        </div>

        <button
          onClick={exportAuditLog}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Ledger</span>
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
            placeholder="Search audit records by actor, details, or ID..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value as any)}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Resource Types</option>
            <option value="draft">Drafts &amp; Revisions</option>
            <option value="finding">Analysis &amp; Findings</option>
            <option value="review">Human Reviews</option>
            <option value="rule">Brand Rules</option>
            <option value="reference">References</option>
            <option value="workspace">Workspaces</option>
          </select>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-sans">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    No audit records match search criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      {evt.eventType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100 max-w-xs truncate">
                      {evt.resourceTitle}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                      {evt.actor}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {evt.details}
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
