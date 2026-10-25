import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  Lightbulb,
  Sparkles,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  BookOpenCheck,
  ShieldCheck,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileJson,
  ChevronDown,
} from 'lucide-react';

export const GovernanceAnalyticsPage: React.FC = () => {
  const { rules, activeDraftFindings, reviews, auditEvents, saveBrandRule, showToast, activeWorkspace } = useApp();

  const [aiClarificationText, setAiClarificationText] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // 1. Tally rule triggers
  const ruleCounts: Record<string, { name: string; count: number; category: string; ruleId: string }> = {};
  activeDraftFindings.forEach((f) => {
    if (f.ruleId) {
      if (!ruleCounts[f.ruleId]) {
        ruleCounts[f.ruleId] = {
          ruleId: f.ruleId,
          name: f.title.split(':')[0] || 'Unknown Rule',
          count: 0,
          category: f.category,
        };
      }
      ruleCounts[f.ruleId].count++;
    }
  });

  const ruleFrequencyData = Object.values(ruleCounts).sort((a, b) => b.count - a.count);

  // 2. Identify potential ambiguous or frequently triggered rules for the Guideline Improvement Workflow
  const candidateRules = rules.filter((r) => {
    const trigger = ruleCounts[r.id]?.count || 0;
    return trigger > 0 || r.category === 'promotional_language' || r.category === 'tone_of_voice';
  });

  // 3. Category distribution
  const categoryCounts: Record<string, number> = {};
  activeDraftFindings.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat.replace(/_/g, ' '),
    count,
  }));

  // 4. Severity distribution
  const severityData = [
    { name: 'Critical', value: activeDraftFindings.filter((f) => f.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: activeDraftFindings.filter((f) => f.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: activeDraftFindings.filter((f) => f.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: activeDraftFindings.filter((f) => f.severity === 'low').length, color: '#06b6d4' },
    { name: 'Info', value: activeDraftFindings.filter((f) => f.severity === 'informational').length, color: '#64748b' },
  ].filter((d) => d.value > 0);

  // AI-assisted rule clarification suggestion generator
  const handleGenerateClarification = async (ruleId: string) => {
    const targetRule = rules.find((r) => r.id === ruleId);
    if (!targetRule) return;

    setLoadingAi((prev) => ({ ...prev, [ruleId]: true }));
    try {
      const suggestion = await geminiService.suggestGuidelineClarification(
        targetRule,
        'Users report this rule flags valid technical jargon in developer-focused whitepapers.'
      );
      setAiClarificationText((prev) => ({ ...prev, [ruleId]: suggestion }));
      showToast('Guideline Insight Generated', 'Proposed human-reviewed rule clarification ready.', 'info');
    } finally {
      setLoadingAi((prev) => ({ ...prev, [ruleId]: false }));
    }
  };

  const handleApplyClarification = (ruleId: string) => {
    const targetRule = rules.find((r) => r.id === ruleId);
    const clarification = aiClarificationText[ruleId];
    if (!targetRule || !clarification) return;

    saveBrandRule({
      ...targetRule,
      description: `${targetRule.description} [Clarification: ${clarification}]`,
      updatedAt: new Date().toISOString(),
    });
    showToast('Rule Clarified', `Updated "${targetRule.name}" with human-approved guidance.`, 'success');
  };

  // Export report as downloadable JSON
  const handleExportJSON = () => {
    const reportData = {
      workspace: {
        id: activeWorkspace.id,
        name: activeWorkspace.name,
        description: activeWorkspace.description,
        brandIdentity: activeWorkspace.brandIdentity,
        toneGuidelines: activeWorkspace.toneGuidelines,
      },
      exportedAt: new Date().toISOString(),
      platform: 'BrandGuard AI',
      summary: {
        totalRulesEnforced: rules.length,
        activeRules: rules.filter((r) => r.isActive).length,
        totalInfractionsLogged: activeDraftFindings.length,
        criticalViolations: activeDraftFindings.filter((f) => f.severity === 'critical').length,
        highViolations: activeDraftFindings.filter((f) => f.severity === 'high').length,
        mediumViolations: activeDraftFindings.filter((f) => f.severity === 'medium').length,
        lowViolations: activeDraftFindings.filter((f) => f.severity === 'low').length,
        informationalViolations: activeDraftFindings.filter((f) => f.severity === 'informational').length,
        pendingHumanReviews: reviews.filter((r) => r.status === 'pending').length,
        approvedReviews: reviews.filter((r) => r.status === 'approved').length,
        changesRequestedReviews: reviews.filter((r) => r.status === 'changes_requested').length,
        rejectedReviews: reviews.filter((r) => r.status === 'rejected').length,
      },
      frequentlyTriggeredRules: ruleFrequencyData.map((rf) => ({
        ruleId: rf.ruleId,
        ruleName: rf.name,
        category: rf.category,
        triggerCount: rf.count,
      })),
      categoryDistribution: categoryData,
      severityDistribution: severityData.map((s) => ({ severity: s.name, count: s.value })),
      reviewOutcomes: [
        { status: 'Approved', count: reviews.filter((r) => r.status === 'approved').length },
        { status: 'Changes Requested', count: reviews.filter((r) => r.status === 'changes_requested').length },
        { status: 'Rejected', count: reviews.filter((r) => r.status === 'rejected').length },
        { status: 'Pending Review', count: reviews.filter((r) => r.status === 'pending').length },
      ],
      recentAuditEvents: auditEvents.slice(0, 20).map((a) => ({
        timestamp: a.timestamp,
        eventType: a.eventType,
        resourceType: a.resourceType,
        resourceTitle: a.resourceTitle,
        details: a.details,
        actor: a.actor,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brandguard-analytics-${activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
    showToast('Report Exported', 'Governance analytics report downloaded as JSON.', 'success');
  };

  // Export report as downloadable CSV
  const handleExportCSV = () => {
    const rows: string[] = [];
    rows.push(`"BRANDGUARD AI - GOVERNANCE ANALYTICS REPORT"`);
    rows.push(`"Workspace:","${activeWorkspace.name.replace(/"/g, '""')}"`);
    rows.push(`"Brand Identity:","${activeWorkspace.brandIdentity.replace(/"/g, '""')}"`);
    rows.push(`"Generated At:","${new Date().toISOString()}"`);
    rows.push(`""`);
    rows.push(`"=== SUMMARY METRICS ==="`);
    rows.push(`"Metric","Value"`);
    rows.push(`"Total Rules Enforced","${rules.length}"`);
    rows.push(`"Active Rules","${rules.filter((r) => r.isActive).length}"`);
    rows.push(`"Total Infractions Logged","${activeDraftFindings.length}"`);
    rows.push(`"Critical Violations","${activeDraftFindings.filter((f) => f.severity === 'critical').length}"`);
    rows.push(`"High Violations","${activeDraftFindings.filter((f) => f.severity === 'high').length}"`);
    rows.push(`"Medium Violations","${activeDraftFindings.filter((f) => f.severity === 'medium').length}"`);
    rows.push(`"Low Violations","${activeDraftFindings.filter((f) => f.severity === 'low').length}"`);
    rows.push(`"Informational Violations","${activeDraftFindings.filter((f) => f.severity === 'informational').length}"`);
    rows.push(`"Pending Reviews","${reviews.filter((r) => r.status === 'pending').length}"`);
    rows.push(`"Approved Reviews","${reviews.filter((r) => r.status === 'approved').length}"`);
    rows.push(`"Changes Requested","${reviews.filter((r) => r.status === 'changes_requested').length}"`);
    rows.push(`"Rejected Reviews","${reviews.filter((r) => r.status === 'rejected').length}"`);
    rows.push(`""`);
    rows.push(`"=== FREQUENTLY TRIGGERED RULES ==="`);
    rows.push(`"Rule ID","Rule Name","Category","Trigger Count"`);
    ruleFrequencyData.forEach((rf) => {
      rows.push(`"${rf.ruleId}","${rf.name.replace(/"/g, '""')}","${rf.category}","${rf.count}"`);
    });
    rows.push(`""`);
    rows.push(`"=== CATEGORY DISTRIBUTION ==="`);
    rows.push(`"Category","Count"`);
    categoryData.forEach((c) => {
      rows.push(`"${c.name}","${c.count}"`);
    });
    rows.push(`""`);
    rows.push(`"=== SEVERITY BREAKDOWN ==="`);
    rows.push(`"Severity","Count"`);
    severityData.forEach((s) => {
      rows.push(`"${s.name}","${s.value}"`);
    });

    const csvContent = rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brandguard-analytics-${activeWorkspace.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
    showToast('Report Exported', 'Governance analytics report downloaded as CSV.', 'success');
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
            Governance Analytics &amp; Guideline Intelligence
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Empirical compliance metrics, violation frequency distributions, and human-in-the-loop guideline improvement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-neutral-500 pr-3 border-r border-neutral-200 dark:border-neutral-800">
            <span>{rules.length} Rules Enforced</span>
            <span>·</span>
            <span>{activeDraftFindings.length} Total Infractions Logged</span>
          </div>

          {/* Export Report Dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors shadow-xs cursor-pointer"
              aria-label="Export Analytics Report"
              aria-expanded={exportMenuOpen}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Download Format
                </div>
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <FileJson className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div>
                    <div className="font-medium">Export as JSON</div>
                    <div className="text-[10px] text-neutral-400">Structured telemetry &amp; full schema</div>
                  </div>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-medium">Export as CSV</div>
                    <div className="text-[10px] text-neutral-400">Spreadsheet-compatible summary</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Triggered Rules Bar Chart */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Frequently Triggered Rules
              </h2>
              <p className="text-[11px] text-neutral-500">Top policies generating content corrections</p>
            </div>
          </div>

          {ruleFrequencyData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
              No rule triggers recorded. Run analysis in the Review Studio.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ruleFrequencyData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Severity & Discipline Distribution */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Compliance Risk Concentration
                </h2>
                <p className="text-[11px] text-neutral-500">Breakdown of active compliance risks by severity</p>
              </div>
            </div>

            {severityData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                No active severity infractions found.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {severityData.map((s) => (
                  <div
                    key={s.name}
                    className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{s.name}</span>
                    </div>
                    <span className="text-base font-bold font-mono text-neutral-900 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 mt-4 leading-relaxed">
            💡 <strong>Governance Insight:</strong> Critical legal risks like absolute 100% SLA promises require immediate triage prior to distribution, while low-severity items can be addressed during final polish.
          </div>
        </div>
      </div>

      {/* Guideline Improvement Intelligence Workflow (Section 20) */}
      <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-500" />
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Self-Improving Guideline Intelligence
              </h2>
              <p className="text-[11px] text-neutral-500 mt-0.2">
                Identify recurring confusion patterns, suggest concrete policy clarifications, and empower human brand stewards to update rules.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
            Human-in-the-Loop
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidateRules.slice(0, 4).map((rule) => {
            const hasClarification = aiClarificationText[rule.id];
            const isLoading = loadingAi[rule.id];

            return (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/80 shadow-xs flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="capitalize text-neutral-400">{rule.category.replace(/_/g, ' ')}</span>
                    <span className="text-amber-500 font-semibold">{rule.severity.toUpperCase()}</span>
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
                    {rule.name}
                  </h3>
                  <p className="text-neutral-500 text-[11px] mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                {hasClarification ? (
                  <div className="p-2.5 rounded bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 flex flex-col gap-2">
                    <div>
                      <strong>Proposed Guideline Clarification:</strong>
                      <p className="mt-0.5 leading-snug">{hasClarification}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-indigo-200/50">
                      <button
                        onClick={() => handleApplyClarification(rule.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                      >
                        Apply Clarification
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateClarification(rule.id)}
                    disabled={isLoading}
                    className="w-full py-1.5 px-3 rounded text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isLoading ? 'Analyzing Telemetry...' : 'Propose Clarification'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
