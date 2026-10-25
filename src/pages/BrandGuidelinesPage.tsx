import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandRule, RuleCategory, Severity } from '../types';
import { analysisEngine } from '../services/analysisEngine';
import {
  BookOpenCheck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Play,
  Edit2,
  Trash2,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

export const BrandGuidelinesPage: React.FC = () => {
  const { rules, saveBrandRule, deleteBrandRule, activeWorkspace, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<RuleCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');

  // Rule Test Simulator state
  const [simulatorRuleId, setSimulatorRuleId] = useState<string>(rules[0]?.id || '');
  const [simulatorSampleText, setSimulatorSampleText] = useState(
    'Our platform is the cheapest solution with zero downtime guaranteed!'
  );
  const [simulatorResults, setSimulatorResults] = useState<any[] | null>(null);

  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<BrandRule> | null>(null);

  const categories: { key: RuleCategory; label: string }[] = [
    { key: 'tone_of_voice', label: 'Tone of Voice' },
    { key: 'approved_terminology', label: 'Approved Terminology' },
    { key: 'prohibited_terminology', label: 'Prohibited Terminology' },
    { key: 'product_naming', label: 'Product Naming' },
    { key: 'messaging_requirements', label: 'Messaging Requirements' },
    { key: 'factual_claims', label: 'Factual Claims' },
    { key: 'formatting_style', label: 'Formatting & Style' },
    { key: 'accessibility', label: 'Accessibility & Readability' },
    { key: 'promotional_language', label: 'Promotional Language' },
    { key: 'legal_policy', label: 'Legal & Policy' },
  ];

  const filteredRules = rules.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.matchPattern.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingRule({
      id: `rule-${Date.now()}`,
      workspaceId: activeWorkspace.id,
      name: '',
      category: 'prohibited_terminology',
      description: '',
      severity: 'high',
      matchPattern: '',
      isRegex: false,
      isCaseSensitive: false,
      recommendedAction: '',
      approvedWording: '',
      rationale: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (rule: BrandRule) => {
    setEditingRule({ ...rule });
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule?.name || !editingRule.matchPattern) {
      showToast('Validation Error', 'Rule name and match pattern are required.', 'error');
      return;
    }
    saveBrandRule(editingRule as BrandRule);
    setModalOpen(false);
    setEditingRule(null);
  };

  const runSimulator = () => {
    const targetRule = rules.find((r) => r.id === simulatorRuleId);
    if (!targetRule) return;
    const matches = analysisEngine.evaluateRule(targetRule, simulatorSampleText);
    setSimulatorResults(matches);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 w-full gap-5 min-h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Workspace</span>
            <span>/</span>
            <span>{activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Brand Guidelines Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure approved terminology, prohibited terms, tone benchmarks, and legal restrictions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Brand Rule</span>
        </button>
      </div>

      {/* Interactive Rule Simulator Banner */}
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              Interactive Rule Test Simulator
            </h2>
          </div>
          <span className="text-[11px] text-neutral-500">Test rules before active deployment</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-neutral-500">Select Rule to Test</label>
            <select
              value={simulatorRuleId}
              onChange={(e) => {
                setSimulatorRuleId(e.target.value);
                setSimulatorResults(null);
              }}
              className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
            >
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.severity})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[11px] font-medium text-neutral-500">Sample Text to Test</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={simulatorSampleText}
                onChange={(e) => setSimulatorSampleText(e.target.value)}
                placeholder="Enter sample sentence to test..."
                className="flex-1 p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={runSimulator}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Match</span>
              </button>
            </div>
          </div>
        </div>

        {/* Simulator Results */}
        {simulatorResults !== null && (
          <div className="mt-2 p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between font-semibold">
              <span>Simulation Outcome:</span>
              <span
                className={
                  simulatorResults.length > 0 ? 'text-amber-500 font-mono' : 'text-emerald-500 font-mono'
                }
              >
                {simulatorResults.length} match(es) triggered
              </span>
            </div>
            {simulatorResults.length === 0 ? (
              <p className="text-neutral-500 text-[11px]">
                No match detected. The rule conditions were not triggered by this text sample.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {simulatorResults.map((res, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-rose-500 font-medium">"{res.title.split(': "')[1]?.replace(/"$/, '')}"</span>
                    <span className="text-neutral-500">Suggested: "{res.suggestedCorrection || '[Remove]'}"</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules, phrases, descriptions..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
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
        </div>
      </div>

      {/* Rules Table / Grid */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Pattern / Condition</th>
                <th className="py-3 px-4">Recommended Replacement</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No brand rules found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                      <div>{rule.name}</div>
                      <div className="text-[11px] font-normal text-neutral-400 line-clamp-1 mt-0.5">
                        {rule.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 capitalize">
                      {rule.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold uppercase text-[10px]">
                      <span
                        className={
                          rule.severity === 'critical'
                            ? 'text-rose-500'
                            : rule.severity === 'high'
                            ? 'text-orange-500'
                            : rule.severity === 'medium'
                            ? 'text-amber-500'
                            : 'text-cyan-500'
                        }
                      >
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                      <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {rule.matchPattern}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {rule.approvedWording ? (
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                          {rule.approvedWording}
                        </span>
                      ) : (
                        <em className="text-neutral-400">Remove phrase</em>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          saveBrandRule({
                            ...rule,
                            isActive: !rule.isActive,
                          })
                        }
                        className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                          rule.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          className="p-1 text-neutral-500 hover:text-cyan-500 rounded"
                          title="Edit rule"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteBrandRule(rule.id)}
                          className="p-1 text-neutral-500 hover:text-rose-500 rounded"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Rule Modal */}
      {modalOpen && editingRule && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveModal}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4 text-xs"
          >
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingRule.id && rules.some((r) => r.id === editingRule.id)
                  ? 'Edit Brand Compliance Rule'
                  : 'Create Brand Compliance Rule'}
              </h2>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Rules define deterministic constraints evaluated across all draft content.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={editingRule.name || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  placeholder="e.g., Unconditional SLA Guarantee Filter"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Category</label>
                <select
                  value={editingRule.category || 'prohibited_terminology'}
                  onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value as any })}
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Severity</label>
                <select
                  value={editingRule.severity || 'high'}
                  onChange={(e) => setEditingRule({ ...editingRule, severity: e.target.value as any })}
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="informational">Informational</option>
                </select>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Match Pattern (Word, Phrase, or Regex) *
                </label>
                <input
                  type="text"
                  required
                  value={editingRule.matchPattern || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, matchPattern: e.target.value })}
                  placeholder="e.g., 100% uptime|zero downtime guaranteed"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-neutral-900 dark:text-white focus:outline-none"
                />
                <div className="flex items-center gap-4 mt-1 text-[11px] text-neutral-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.isRegex || false}
                      onChange={(e) => setEditingRule({ ...editingRule, isRegex: e.target.checked })}
                    />
                    <span>Treat as Regular Expression (Regex)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.isCaseSensitive || false}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, isCaseSensitive: e.target.checked })
                      }
                    />
                    <span>Case Sensitive</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Approved Replacement Wording
                </label>
                <input
                  type="text"
                  value={editingRule.approvedWording || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, approvedWording: e.target.value })}
                  placeholder="Leave blank if the phrase should simply be removed"
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent font-mono text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Issue Description & Guidance
                </label>
                <textarea
                  value={editingRule.description || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="Explain why this violates brand standards and what action the writer should take."
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Brand Governance Rationale
                </label>
                <textarea
                  value={editingRule.rationale || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, rationale: e.target.value })}
                  placeholder="Underlying brand, legal, or stylistic principle backing this rule."
                  className="p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-md hover:bg-slate-800"
              >
                Save Brand Rule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
