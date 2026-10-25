import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  ScanSearch,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  BookOpenCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
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
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    drafts,
    rules,
    analyses,
    reviews,
    auditEvents,
    activeDraftFindings,
    setActiveView,
    setNewDraftModalOpen,
    activeWorkspace,
  } = useApp();

  // Compute metrics from actual data
  const totalDrafts = drafts.length;
  const completedAnalyses = analyses.length;
  const allFindings = activeDraftFindings;
  const openFindings = allFindings.filter((f) => f.status === 'open').length;
  const criticalHighFindings = allFindings.filter(
    (f) => (f.severity === 'critical' || f.severity === 'high') && f.status === 'open'
  ).length;
  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;
  const activeRulesCount = rules.filter((r) => r.isActive).length;

  // Severity data for charts
  const severityData = [
    { name: 'Critical', value: allFindings.filter((f) => f.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: allFindings.filter((f) => f.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: allFindings.filter((f) => f.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: allFindings.filter((f) => f.severity === 'low').length, color: '#06b6d4' },
    { name: 'Info', value: allFindings.filter((f) => f.severity === 'informational').length, color: '#64748b' },
  ].filter((d) => d.value > 0);

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  allFindings.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([key, count]) => ({
    category: key.replace(/_/g, ' '),
    count,
  }));

  // Review outcome distribution
  const approvedReviews = reviews.filter((r) => r.status === 'approved').length;
  const changesReviews = reviews.filter((r) => r.status === 'changes_requested').length;
  const rejectedReviews = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 w-full gap-5 min-h-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-medium">{activeWorkspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Brand Governance Dashboard
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time compliance telemetry, explainable findings, and accountable human reviews.
          </p>
        </div>

        {/* Quick Launch Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewDraftModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-cyan-400 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Draft</span>
          </button>
          <button
            onClick={() => setActiveView('studio')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <ScanSearch className="w-3.5 h-3.5 text-cyan-500" />
            <span>Open Review Studio</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Total Drafts</span>
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-2">
            {totalDrafts}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1">Active content assets</span>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Analyses Run</span>
            <ScanSearch className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-2">
            {completedAnalyses}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1">Deterministic scans</span>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Open Findings</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-2">
            {openFindings}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Awaiting resolution</span>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Critical / High</span>
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">
            {criticalHighFindings}
          </div>
          <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">Legal & brand risk</span>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Review Queue</span>
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-2">
            {pendingReviews}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1">Pending sign-off</span>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs">
            <span>Active Rules</span>
            <BookOpenCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-2">
            {activeRulesCount}
          </div>
          <span className="text-[10px] text-neutral-400 mt-1">Enforced guidelines</span>
        </div>
      </div>

      {/* Data Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Severity Breakdown */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Findings by Severity
              </h2>
              <p className="text-[11px] text-neutral-500">Distribution of compliance violations</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">{allFindings.length} Total</span>
          </div>

          {severityData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
              No findings recorded yet. Run a content analysis in the Studio.
            </div>
          ) : (
            <div className="h-56 w-full flex items-center">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 flex flex-col gap-1.5 pl-4 text-xs">
                {severityData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-neutral-700 dark:text-neutral-300">{d.name}</span>
                    </div>
                    <span className="font-mono font-medium text-neutral-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Violations by Category */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Findings by Category
              </h2>
              <p className="text-[11px] text-neutral-500">Breakdown across brand governance disciplines</p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
              Run content analysis to see category breakdowns.
            </div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Review Outcomes & Recent Audit Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Review Outcomes */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Human Review Governance
            </h2>
            <p className="text-[11px] text-neutral-500">Sign-off and approval audit statistics</p>

            <div className="flex flex-col gap-2.5 mt-4">
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Approved Drafts
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{approvedReviews}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                <span className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                  <Clock className="w-4 h-4" /> Changes Requested
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{changesReviews}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-50 dark:bg-neutral-800/40 text-xs">
                <span className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                  <AlertTriangle className="w-4 h-4" /> Rejected Drafts
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{rejectedReviews}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveView('reviews')}
            className="mt-4 w-full py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 border border-cyan-500/20 rounded-md hover:bg-cyan-500/5 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Review Queue ({pendingReviews} pending)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Audit Events */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Governance Audit Trail
                </h2>
                <p className="text-[11px] text-neutral-500">Immutable ledger of brand decisions</p>
              </div>
              <button
                onClick={() => setActiveView('audit')}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                View full log →
              </button>
            </div>

            <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-56 overflow-y-auto">
              {auditEvents.slice(0, 5).map((evt) => (
                <div key={evt.id} className="py-2 flex items-start justify-between gap-3 text-xs">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {evt.resourceTitle}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {evt.actor}
                      </span>
                    </div>
                    <span className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate mt-0.5">
                      {evt.details}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
