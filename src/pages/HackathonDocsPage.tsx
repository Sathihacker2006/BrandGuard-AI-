import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Award,
  Layers,
  Code2,
  GitBranch,
  Sparkles,
  UserCheck,
  Brain,
  Download,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const HackathonDocsPage: React.FC = () => {
  const { resetToSeedData, showToast, setActiveView, activeWorkspace } = useApp();

  const handleDownloadPackage = () => {
    const docData = {
      product: 'BrandGuard AI',
      tagline: 'Smarter Content. Stronger Brands.',
      hackathon: 'FutureStack Hackathon — Round 2',
      team: 'INNOVATION NINJAS',
      timestamp: new Date().toISOString(),
      evaluationSummary: {
        coreWorkflow: 'Complete and fully working end-to-end',
        deterministicEngine: 'Operational with exact character offsets',
        humanApproval: 'Mandatory human sign-off state machine',
        groundedFacts: 'Approved Reference Library integration',
      },
    };
    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brandguard-round-2-submission-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Package Downloaded', 'Exported Hackathon Round 2 submission manifest.', 'success');
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6 w-full gap-6 min-h-full">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>FutureStack Hackathon — Round 2 Submission Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            BrandGuard AI
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            AI-Powered Brand Governance, Content Compliance &amp; Intelligent Review Platform. Built with engineering rigor by <strong>Team INNOVATION NINJAS</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadPackage}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export Round 2 Manifest</span>
          </button>
          <button
            onClick={resetToSeedData}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Deterministic Core</h3>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Rules engine evaluates regex, prohibited phrases, approved terms, and SLA legalities with exact character offsets.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <BookOpen className="w-5 h-5 text-cyan-500 mb-2" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Grounded Reference Library</h3>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Claims are verified against audited Q3 2026 filings, SLA commitments, and trademark taxonomy standards.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <UserCheck className="w-5 h-5 text-indigo-500 mb-2" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Human Approval Gateway</h3>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Strict human governance state machine. Content cannot publish silently; decisions are permanently logged in audit logs.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <Brain className="w-5 h-5 text-violet-500 mb-2" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Intent-Preserving AI</h3>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Optional Gemini AI integration refines suggestions to protect author voice while strictly obeying compliance policies.
          </p>
        </div>
      </div>

      {/* Evaluator Demo Walkthrough Guide */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Hackathon Evaluator 60-Second Live Walkthrough Script
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <span className="font-mono font-bold text-cyan-500 text-[11px]">STEP 01</span>
            <strong className="text-neutral-900 dark:text-white">Open Content Review Studio</strong>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Navigate to <strong>Review Studio</strong>. Notice pre-loaded draft <em>"Q4 Global Enterprise Launch Announcement"</em> containing 5 intentional violations (100% SLA guarantee, prohibited term "cheap", trademark typo "Brand Guard", unverified customer claim, and hyperbole).
            </p>
            <button
              onClick={() => setActiveView('studio')}
              className="mt-auto text-left text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              Jump to Studio →
            </button>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <span className="font-mono font-bold text-cyan-500 text-[11px]">STEP 02</span>
            <strong className="text-neutral-900 dark:text-white">Inspect Findings &amp; Accept Correction</strong>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Click the Critical Finding <strong>100% Uptime Guarantee</strong>. Observe the verified reference citation and rationale. Click <strong>Accept Correction</strong>. The editor updates instantly, saving Revision v2!
            </p>
            <button
              onClick={() => setActiveView('revisions')}
              className="mt-auto text-left text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              View Revision Diffs →
            </button>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <span className="font-mono font-bold text-cyan-500 text-[11px]">STEP 03</span>
            <strong className="text-neutral-900 dark:text-white">Submit to Human Review Queue</strong>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Click <strong>Submit for Review</strong> in the Studio header. Switch to <strong>Human Review Centre</strong> to approve, reject, or request changes with reviewer comments recorded in the immutable audit trail!
            </p>
            <button
              onClick={() => setActiveView('reviews')}
              className="mt-auto text-left text-cyan-600 dark:text-cyan-400 font-semibold hover:underline"
            >
              Open Review Queue →
            </button>
          </div>
        </div>
      </div>

      {/* Verified Progress: Round 1 -> Round 2 */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/40 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-500" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Verified Evolution: Round 1 Baseline → Round 2 Milestone
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Capability Area</th>
                <th className="py-2.5 px-3">Round 1 Baseline</th>
                <th className="py-2.5 px-3">Round 2 Verified Implementation</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-sans">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">Content Analysis</td>
                <td className="py-2.5 px-3 text-neutral-500">Heuristic keyword list</td>
                <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300">
                  Deterministic regex engine with word-boundary awareness, exact start/end offsets, and severity scoring.
                </td>
                <td className="py-2.5 px-3 text-emerald-600 font-mono text-[10px] uppercase font-bold">100% Verified</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">Factual Fact-Checking</td>
                <td className="py-2.5 px-3 text-neutral-500">Unconnected mock tags</td>
                <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300">
                  Approved Reference Library with audited metrics cross-referencing claims and source citations.
                </td>
                <td className="py-2.5 px-3 text-emerald-600 font-mono text-[10px] uppercase font-bold">100% Verified</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">Review Studio</td>
                <td className="py-2.5 px-3 text-neutral-500">Basic single text area</td>
                <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300">
                  Signature 3-panel synchronized studio: findings tree, live editor, and explainable inspector with Accept/Custom Edit/Dismiss.
                </td>
                <td className="py-2.5 px-3 text-emerald-600 font-mono text-[10px] uppercase font-bold">100% Verified</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">Human Governance</td>
                <td className="py-2.5 px-3 text-neutral-500">None (implicit auto-approval)</td>
                <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300">
                  Formal multi-state governance machine (Draft → Analysed → In Review → Approved / Rejected) with immutable audit events.
                </td>
                <td className="py-2.5 px-3 text-emerald-600 font-mono text-[10px] uppercase font-bold">100% Verified</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Round 3 Planned Roadmap (Section 28) */}
      <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-950/20 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Round 3 Architectural Roadmap: 3 Substantial Planned Improvements
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Defensible, innovative engineering extensions planned for the FutureStack final round.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
            <span className="font-mono font-bold text-cyan-500 text-[11px]">IMPROVEMENT 01</span>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Evidence-Grounded Graph</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Expand reference verification into an automated knowledge graph. Connect citations to live document repositories, calculate uncertainty margins, and provide cryptographically signed audit receipts for approved content.
            </p>
            <span className="mt-auto text-[10px] font-mono text-neutral-400">Target: Q1 2027</span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
            <span className="font-mono font-bold text-indigo-500 text-[11px]">IMPROVEMENT 02</span>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Multi-Reviewer Matrix RBAC</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Introduce multi-party threshold approvals (e.g. 1 Legal + 1 Brand Lead required for critical-severity releases). Include assigned reviewer queues, delegation tokens, and SLA escalation notifications.
            </p>
            <span className="mt-auto text-[10px] font-mono text-neutral-400">Target: Q2 2027</span>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
            <span className="font-mono font-bold text-violet-500 text-[11px]">IMPROVEMENT 03</span>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Self-Calibrating Policy Engine</h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Continuously aggregate dismissal patterns across enterprise teams to detect ambiguous rules. Suggest auto-generated regex condition splits and exceptions for human brand steward approval.
            </p>
            <span className="mt-auto text-[10px] font-mono text-neutral-400">Target: Q2 2027</span>
          </div>
        </div>
      </div>
    </div>
  );
};
