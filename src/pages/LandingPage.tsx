import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  ScanSearch,
  BookOpenCheck,
  Library,
  UserCheck,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Cpu,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, createNewDraft } = useApp();

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto selection:bg-cyan-500 selection:text-black">
      {/* 1. Hero Section */}
      <section className="relative px-6 py-20 md:py-28 max-w-6xl mx-auto flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FutureStack Hackathon Round 2 · Team INNOVATION NINJAS</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Protect Your Brand. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400">
            Improve Every Piece of Content.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
          BrandGuard AI helps teams check content against approved guidelines, understand compliance issues, improve drafts, and maintain accountable human review.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <button
            onClick={() => setActiveView('studio')}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>Launch Review Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            Explore Dashboard
          </button>
        </div>

        {/* Interactive Studio Preview Mockup */}
        <div className="w-full max-w-4xl mt-10 rounded-xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden text-left p-4 md:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] ml-2 text-slate-300">BrandGuard AI Review Studio (Live Interactive Demo)</span>
            </div>
            <span className="text-cyan-400 font-mono text-[11px]">3 Issues Flagged</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Critical Policy Violation</span>
              <p className="font-mono text-rose-300">"zero downtime guaranteed"</p>
              <span className="text-slate-400 text-[11px]">Violates SLA Exhibit C. Maximum backed SLA is 99.99%.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Prohibited Term</span>
              <p className="font-mono text-amber-300">"cheap solution"</p>
              <span className="text-slate-400 text-[11px]">Recommendation: Replace with "cost-effective".</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Factual Claim Discrepancy</span>
              <p className="font-mono text-cyan-300">"over 1,000,000 customers"</p>
              <span className="text-slate-400 text-[11px]">Audited Q3 count is 25,480 active enterprises.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 & 3. Problem and Solution */}
      <section className="px-6 py-16 border-t border-slate-900 bg-slate-900/40">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <span className="text-rose-400 text-xs font-mono uppercase tracking-wider">The Core Problem</span>
            <h2 className="text-2xl font-bold tracking-tight">
              Enterprise content decays into costly compliance risks.
            </h2>
            <ul className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">✕</span>
                <span>Unverified statistics and outdated product claims slip into press releases.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">✕</span>
                <span>Legal contracts breached by marketing statements promising 100% unconditional uptime.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">✕</span>
                <span>Inconsistent tone of voice, condescending adverbs, and unapproved product misspellings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 mt-0.5">✕</span>
                <span>Lack of accountable human sign-off ledgers when content is audited by regulators.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">The Solution</span>
            <h2 className="text-2xl font-bold tracking-tight">
              Explainable, human-centered brand governance.
            </h2>
            <ul className="flex flex-col gap-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Deterministic rules engine evaluating exact character offsets with transparent confidence.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Approved Reference Library linking factual numbers to audited reports and citations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Signature 3-panel Review Studio with 1-click accept, custom edit, and word diffs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Mandatory Human Review Centre ensuring no AI silently publishes user copy.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 & 5. Analysis & Review Workflow */}
      <section className="px-6 py-16 max-w-5xl mx-auto flex flex-col gap-10">
        <div className="text-center flex flex-col items-center gap-2">
          <span className="text-indigo-400 text-xs font-mono uppercase tracking-wider">End-to-End Governance</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            How BrandGuard AI Enforces Compliance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-cyan-400 font-mono text-sm font-bold">01</span>
            <h3 className="font-bold text-sm text-white">Configure Guidelines</h3>
            <p className="text-slate-400 leading-relaxed">
              Define approved terminology, prohibited words, SLA claims, and tone benchmarks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-cyan-400 font-mono text-sm font-bold">02</span>
            <h3 className="font-bold text-sm text-white">Deterministic Scan</h3>
            <p className="text-slate-400 leading-relaxed">
              Engine identifies infractions with exact start and end offsets and cites verified library evidence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-cyan-400 font-mono text-sm font-bold">03</span>
            <h3 className="font-bold text-sm text-white">Review &amp; Refine</h3>
            <p className="text-slate-400 leading-relaxed">
              Accept suggestions, customize edits, or refine phrasing using optional intent-preserving Gemini AI.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <span className="text-cyan-400 font-mono text-sm font-bold">04</span>
            <h3 className="font-bold text-sm text-white">Human Approval</h3>
            <p className="text-slate-400 leading-relaxed">
              Submit to Human Review Centre for formal compliance sign-off with recorded audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Security & Privacy Principles */}
      <section className="px-6 py-16 border-t border-slate-900 bg-slate-900/60">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
          <Lock className="w-8 h-8 text-cyan-400" />
          <h2 className="text-2xl font-bold tracking-tight">Security &amp; Privacy by Design</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <strong className="text-white text-sm">Deterministic Local Core</strong>
              <p className="text-slate-400 leading-relaxed">
                Rules analysis runs entirely within deterministic logic without transmitting confidential copy to external third parties.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <strong className="text-white text-sm">No Silent Actions</strong>
              <p className="text-slate-400 leading-relaxed">
                BrandGuard AI never silently alters or publishes copy. Every revision and approval requires an explicit human action.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
              <strong className="text-white text-sm">Immutable Audit Log</strong>
              <p className="text-slate-400 leading-relaxed">
                Every rule modification, finding resolution, and reviewer comment is permanently recorded in the governance ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11 & 12. Getting Started CTA & Footer */}
      <footer className="px-6 py-12 max-w-5xl mx-auto border-t border-slate-900 flex flex-col items-center text-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-xl font-bold">Ready to govern your brand content?</h3>
          <p className="text-xs text-slate-400">
            Launch the live workspace to test deterministic analysis, fact verification, and human reviews.
          </p>
        </div>

        <button
          onClick={() => setActiveView('studio')}
          className="px-6 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>Open Content Review Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="text-[11px] text-slate-500 pt-6 border-t border-slate-900 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BrandGuard AI · Team INNOVATION NINJAS</span>
          <span>FutureStack Hackathon — Round 2</span>
        </div>
      </footer>
    </div>
  );
};
