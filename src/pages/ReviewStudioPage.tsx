import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Finding, Severity, RuleCategory } from '../types';
import { geminiService } from '../services/geminiService';
import { storage } from '../services/storage';
import {
  ScanSearch,
  Sparkles,
  Check,
  CheckCheck,
  Edit3,
  XCircle,
  Flag,
  Save,
  Send,
  Layers,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Zap,
} from 'lucide-react';

export const ReviewStudioPage: React.FC = () => {
  const {
    activeDraft,
    activeDraftFindings,
    activeDraftRevisions,
    rules,
    references,
    runAnalysis,
    acceptFinding,
    editFindingSuggestion,
    dismissFinding,
    flagFindingForReview,
    saveDraftContent,
    submitDraftForReview,
    showToast,
    setActiveView,
    targetFindingId,
    setTargetFindingId,
  } = useApp();

  const [editorText, setEditorText] = useState(activeDraft?.content || '');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'accepted' | 'dismissed'>('all');
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customSuggestionText, setCustomSuggestionText] = useState('');
  const [dismissReasonModalOpen, setDismissReasonModalOpen] = useState(false);
  const [dismissReasonText, setDismissReasonText] = useState('');
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'nav' | 'editor' | 'inspector'>('editor');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  const quickActionsRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Close Quick Actions menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Sync editor text when active draft changes
  useEffect(() => {
    if (activeDraft) {
      setEditorText(activeDraft.content);
    }
  }, [activeDraft?.id, activeDraft?.content]);

  // Handle external quick-jump target finding (e.g. from CommandPalette)
  useEffect(() => {
    if (targetFindingId) {
      setSelectedFindingId(targetFindingId);
      const target = activeDraftFindings.find((f) => f.id === targetFindingId);
      if (target) {
        setCustomSuggestionText(target.suggestedCorrection || '');
      }
      setMobileTab('inspector');
      setTargetFindingId(null);
    }
  }, [targetFindingId, activeDraftFindings, setTargetFindingId]);

  // Default select first open finding if none selected
  useEffect(() => {
    if (!selectedFindingId && activeDraftFindings.length > 0) {
      const firstOpen = activeDraftFindings.find((f) => f.status === 'open') || activeDraftFindings[0];
      setSelectedFindingId(firstOpen.id);
      setCustomSuggestionText(firstOpen.suggestedCorrection || '');
    }
  }, [activeDraftFindings, selectedFindingId]);

  if (!activeDraft) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-full h-full">
        <ScanSearch className="w-12 h-12 text-neutral-400 mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">No Active Draft Selected</h2>
        <p className="text-xs text-neutral-500 max-w-sm mt-1">
          Select or create a content draft from the Drafts tab to begin the review and compliance analysis.
        </p>
        <button
          onClick={() => setActiveView('drafts')}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500"
        >
          View Drafts Library
        </button>
      </div>
    );
  }

  const selectedFinding = activeDraftFindings.find((f) => f.id === selectedFindingId);
  const ruleForSelected = rules.find((r) => r.id === selectedFinding?.ruleId);
  const evidenceRefs = references.filter((r) => selectedFinding?.evidenceReferenceIds?.includes(r.id));

  // Word & Char counts
  const wordCount = editorText.trim() ? editorText.trim().split(/\s+/).length : 0;
  const charCount = editorText.length;
  const isDirty = editorText !== activeDraft.content;

  // Filtered findings
  const filteredFindings = activeDraftFindings.filter((f) => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    return true;
  });

  const openFindingsCount = activeDraftFindings.filter((f) => f.status === 'open').length;

  const openNonCriticalCount = activeDraftFindings.filter(
    (f) => f.severity !== 'critical' && f.status === 'open' && f.suggestedCorrection !== null
  ).length;

  const openFactualClaimsCount = activeDraftFindings.filter(
    (f) => f.category === 'factual_claims' && f.status === 'open'
  ).length;

  const openLowInfoCount = activeDraftFindings.filter(
    (f) =>
      (f.severity === 'low' || f.severity === 'informational') &&
      f.status === 'open' &&
      f.suggestedCorrection !== null
  ).length;

  // Trigger manual rescan
  const handleRescan = () => {
    if (isDirty) {
      saveDraftContent(activeDraft.id, editorText, 'Auto-saved before rescan');
    }
    const run = runAnalysis(activeDraft.id);
    if (run) {
      const freshFindings = activeDraftFindings;
      if (freshFindings.length > 0) {
        setSelectedFindingId(freshFindings[0].id);
      }
    }
  };

  // Bulk Operation: Approve All Non-Critical
  const handleApproveAllNonCritical = () => {
    const nonCritical = activeDraftFindings.filter(
      (f) => f.severity !== 'critical' && f.status === 'open' && f.suggestedCorrection !== null
    );
    if (nonCritical.length === 0) {
      showToast('No Non-Critical Findings', 'There are no open non-critical findings to approve.', 'info');
      setQuickActionsOpen(false);
      return;
    }

    // Sort descending by startOffset so string manipulation preserves earlier offsets
    const sorted = [...nonCritical].sort((a, b) => (b.startOffset ?? 0) - (a.startOffset ?? 0));
    let updatedText = editorText;
    for (const finding of sorted) {
      if (
        finding.startOffset >= 0 &&
        finding.endOffset <= updatedText.length &&
        finding.endOffset > finding.startOffset
      ) {
        updatedText =
          updatedText.substring(0, finding.startOffset) +
          (finding.suggestedCorrection ?? '') +
          updatedText.substring(finding.endOffset);
      } else {
        const target = finding.title.split(': "')[1]?.replace(/"$/, '') || '';
        if (target && updatedText.includes(target)) {
          updatedText = updatedText.replace(target, finding.suggestedCorrection ?? '');
        }
      }
      finding.status = 'accepted';
      storage.updateFinding(finding);
    }

    setEditorText(updatedText);
    saveDraftContent(activeDraft.id, updatedText, `Bulk approved ${sorted.length} non-critical findings`);
    runAnalysis(activeDraft.id);
    setQuickActionsOpen(false);
    showToast('Bulk Approved', `Applied ${sorted.length} non-critical corrections & saved revision snapshot.`, 'success');
  };

  // Bulk Operation: Ignore All Factual Claims
  const handleIgnoreAllFactualClaims = () => {
    const claims = activeDraftFindings.filter(
      (f) => f.category === 'factual_claims' && f.status === 'open'
    );
    if (claims.length === 0) {
      showToast('No Factual Claims', 'There are no open factual claims to ignore.', 'info');
      setQuickActionsOpen(false);
      return;
    }
    claims.forEach((f) => {
      dismissFinding(f.id, 'Bulk exempted during fast-track reviewer triage');
    });
    setQuickActionsOpen(false);
    showToast('Factual Claims Exempted', `Dismissed ${claims.length} factual claims with audit justification.`, 'info');
  };

  // Bulk Operation: Approve Low & Informational
  const handleApproveLowAndInfo = () => {
    const lowInfo = activeDraftFindings.filter(
      (f) =>
        (f.severity === 'low' || f.severity === 'informational') &&
        f.status === 'open' &&
        f.suggestedCorrection !== null
    );
    if (lowInfo.length === 0) {
      showToast('No Minor Findings', 'No open low or informational findings to approve.', 'info');
      setQuickActionsOpen(false);
      return;
    }
    const sorted = [...lowInfo].sort((a, b) => (b.startOffset ?? 0) - (a.startOffset ?? 0));
    let updatedText = editorText;
    for (const finding of sorted) {
      if (
        finding.startOffset >= 0 &&
        finding.endOffset <= updatedText.length &&
        finding.endOffset > finding.startOffset
      ) {
        updatedText =
          updatedText.substring(0, finding.startOffset) +
          (finding.suggestedCorrection ?? '') +
          updatedText.substring(finding.endOffset);
      } else {
        const target = finding.title.split(': "')[1]?.replace(/"$/, '') || '';
        if (target && updatedText.includes(target)) {
          updatedText = updatedText.replace(target, finding.suggestedCorrection ?? '');
        }
      }
      finding.status = 'accepted';
      storage.updateFinding(finding);
    }
    setEditorText(updatedText);
    saveDraftContent(activeDraft.id, updatedText, `Bulk approved ${sorted.length} minor findings`);
    runAnalysis(activeDraft.id);
    setQuickActionsOpen(false);
    showToast('Applied Minor Improvements', `Updated ${sorted.length} accessibility & phrasing items.`, 'success');
  };

  // Reset all findings to open
  const handleResetFindings = () => {
    activeDraftFindings.forEach((f) => {
      f.status = 'open';
      f.dismissalReason = undefined;
      f.userModifiedText = undefined;
      storage.updateFinding(f);
    });
    runAnalysis(activeDraft.id);
    setQuickActionsOpen(false);
    showToast('Findings Reset', 'All findings reset to open for fresh review.', 'info');
  };

  // Starter Template Loader
  const handleLoadSampleText = (templateKey: 'enterprise-launch' | 'sla-compliance' | 'social-announcement') => {
    let sampleContent = '';
    if (templateKey === 'enterprise-launch') {
      sampleContent = `We are thrilled to unveil Brand Guard to our global community!! Today, we are changing how companies secure brand integrity.

Unlike legacy software, our platform offers a cheap solution that anyone can configure in minutes. With over 1,000,000 customers relying on our engine every day, we provide zero downtime guaranteed across all multi-region clusters.

Obviously, legacy approaches cannot compete with this kind of performance. Our revolutionary magic works across every marketing document, press release, and campaign to keep your team aligned. Start your trial today!!`;
    } else if (templateKey === 'sla-compliance') {
      sampleContent = `Security and reliability form the foundation of our engineering architecture. All customer data in transit and at rest is secured using AES-256 encryption under our annual SOC 2 Type II audit. Our availability commitment delivers 99.99% financially backed availability SLA across all tier-one availability zones.`;
    } else {
      sampleContent = `Excited to announce BrandGuard AI is now live! Our cost-effective brand governance engine helps modern marketing teams eliminate compliance headaches before publication.

Backed by verified factual citations and automated brand rule checks, ensure your messaging stays consistent everywhere. #BrandGovernance #ContentCompliance #BrandGuardAI`;
    }
    setEditorText(sampleContent);
    saveDraftContent(activeDraft.id, sampleContent, 'Loaded starter scenario');
    runAnalysis(activeDraft.id);
    showToast('Scenario Loaded', 'Pre-loaded realistic copy and ran compliance scan.', 'success');
  };

  // AI intent-preserving refinement
  const handleAiRefine = async () => {
    if (!selectedFinding || !ruleForSelected) return;
    setIsAiRefining(true);
    setAiNote(null);
    try {
      const result = await geminiService.refineCorrection(
        selectedFinding.excerpt,
        selectedFinding.title.split(': "')[1]?.replace(/"$/, '') || selectedFinding.excerpt,
        ruleForSelected,
        selectedFinding.suggestedCorrection || ''
      );
      setCustomSuggestionText(result.refinedSuggestion);
      setIsEditingCustom(true);
      setAiNote(result.authorIntentPreservationNote);
      showToast('AI Refinement Ready', 'Author intent preserved with compliant phrasing.', 'info');
    } finally {
      setIsAiRefining(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-neutral-100 dark:bg-slate-950">
      {/* Studio Header Toolbar */}
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/80 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
            {activeDraft.title}
          </span>
          <span className="text-[10px] text-neutral-400 capitalize px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono">
            {activeDraft.contentType.replace(/_/g, ' ')}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
              activeDraft.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : activeDraft.status === 'in_review'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {activeDraft.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Actions Menu */}
          <div className="relative" ref={quickActionsRef}>
            <button
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 rounded border border-cyan-300/80 dark:border-cyan-800 transition-colors shadow-2xs cursor-pointer"
              aria-label="Reviewer Quick Actions"
              aria-expanded={quickActionsOpen}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/20" />
              <span>Quick Actions</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${quickActionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {quickActionsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl py-2 z-50 text-xs flex flex-col gap-1">
                <div className="px-3 py-1 border-b border-neutral-100 dark:border-neutral-800/80">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                    <span>Bulk Operations</span>
                    <span className="text-[10px] text-cyan-500 font-mono">Fast-Track</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Execute one-click editorial triage operations.
                  </p>
                </div>

                {/* Approve All Non-Critical */}
                <button
                  onClick={handleApproveAllNonCritical}
                  disabled={openNonCriticalCount === 0}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors ${
                    openNonCriticalCount > 0
                      ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <CheckCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Approve All Non-Critical
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        {openNonCriticalCount}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                      Accepts High, Medium, Low suggestions &amp; saves revision snapshot.
                    </p>
                  </div>
                </button>

                {/* Ignore All Factual Claims */}
                <button
                  onClick={handleIgnoreAllFactualClaims}
                  disabled={openFactualClaimsCount === 0}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors ${
                    openFactualClaimsCount > 0
                      ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Ignore All Factual Claims
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                        {openFactualClaimsCount}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight mt-0.5">
                      Dismisses unverified factual claims with audit justification.
                    </p>
                  </div>
                </button>

                <div className="border-t border-neutral-100 dark:border-neutral-800 my-0.5" />

                {/* Approve Low & Info */}
                <button
                  onClick={handleApproveLowAndInfo}
                  disabled={openLowInfoCount === 0}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition-colors ${
                    openLowInfoCount > 0
                      ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed text-neutral-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Accept Low &amp; Informational</span>
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    ({openLowInfoCount})
                  </span>
                </button>

                {/* Reset All Findings */}
                <button
                  onClick={handleResetFindings}
                  className="w-full text-left px-3 py-1.5 flex items-center justify-between text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Findings to Open</span>
                  </span>
                </button>
              </div>
            )}
          </div>

          {isDirty && (
            <button
              onClick={() => saveDraftContent(activeDraft.id, editorText)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded border border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-neutral-400" />
              <span>Save Changes</span>
            </button>
          )}

          <button
            onClick={handleRescan}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-cyan-400 rounded transition-colors shadow-2xs cursor-pointer"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            <span>Rescan Content</span>
          </button>

          <button
            onClick={() => submitDraftForReview(activeDraft.id, activeDraft.creator)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 text-xs font-medium">
        <button
          onClick={() => setMobileTab('nav')}
          className={`flex-1 py-2 text-center border-b-2 ${
            mobileTab === 'nav'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
              : 'border-transparent text-neutral-500'
          }`}
        >
          Findings ({openFindingsCount})
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-center border-b-2 ${
            mobileTab === 'editor'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
              : 'border-transparent text-neutral-500'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab('inspector')}
          className={`flex-1 py-2 text-center border-b-2 ${
            mobileTab === 'inspector'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
              : 'border-transparent text-neutral-500'
          }`}
        >
          Explanation
        </button>
      </div>

      {/* Coordinated 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* PANEL 1: Left Navigation & Findings Filter (280px) */}
        <div
          className={`w-full md:w-72 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/50 flex flex-col shrink-0 min-h-0 ${
            mobileTab === 'nav' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header & Filter Bar */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
                <span>Findings ({filteredFindings.length})</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {openFindingsCount} open
              </span>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px] overflow-x-auto py-1">
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition-colors ${
                    severityFilter === sev
                      ? 'bg-neutral-900 text-white dark:bg-neutral-700 dark:text-white font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Findings Tree List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 min-h-0">
            {filteredFindings.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400 px-4 flex flex-col items-center gap-2">
                <ScanSearch className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {editorText.trim() ? 'No Policy Violations Found' : 'No Draft Content Yet'}
                </span>
                <p className="text-[11px] text-neutral-500">
                  {editorText.trim()
                    ? 'All active brand guidelines and factual claims passed inspection.'
                    : 'Write content or load a starter scenario to test compliance rules.'}
                </p>
                {!editorText.trim() && (
                  <button
                    onClick={() => handleLoadSampleText('enterprise-launch')}
                    className="mt-1 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 cursor-pointer shadow-2xs"
                  >
                    Load Sample Copy
                  </button>
                )}
              </div>
            ) : (
              filteredFindings.map((finding) => {
                const isSelected = finding.id === selectedFindingId;
                let sevColor = 'text-amber-500 border-amber-500/30';
                if (finding.severity === 'critical') sevColor = 'text-rose-500 border-rose-500/40';
                else if (finding.severity === 'high') sevColor = 'text-orange-500 border-orange-500/30';
                else if (finding.severity === 'low') sevColor = 'text-cyan-500 border-cyan-500/30';

                return (
                  <button
                    key={finding.id}
                    onClick={() => {
                      setSelectedFindingId(finding.id);
                      setCustomSuggestionText(finding.suggestedCorrection || '');
                      setIsEditingCustom(false);
                      setAiNote(null);
                      setMobileTab('inspector');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-slate-900/30 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase font-mono tracking-wider ${sevColor}`}>
                        {finding.severity}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          finding.status === 'open'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : finding.status === 'accepted'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {finding.status}
                      </span>
                    </div>

                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {finding.title}
                    </div>

                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {finding.explanation}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: Center Content Editor */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden min-h-0 ${
            mobileTab === 'editor' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Editor Header Info */}
          <div className="px-5 md:px-6 py-2 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 shrink-0">
            <div className="flex items-center gap-4">
              <span>Characters: <strong className="font-mono text-neutral-800 dark:text-neutral-200">{charCount}</strong></span>
              <span>Words: <strong className="font-mono text-neutral-800 dark:text-neutral-200">{wordCount}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              {isDirty ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">Unsaved edits</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Synced</span>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col min-h-0">
            {!editorText.trim() && (
              <div className="mb-4 p-4 rounded-xl border border-cyan-500/30 bg-cyan-50/50 dark:bg-cyan-950/20 flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <span>Draft Starter Scenarios — Quick Testing</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  This draft has no text yet. Choose a realistic scenario below to immediately test brand guidelines, unverified claims, and bulk quick actions, or start typing directly in the editor.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleText('enterprise-launch')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-cyan-500 text-neutral-800 dark:text-neutral-200 text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Enterprise Launch Campaign</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleText('sla-compliance')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-cyan-500 text-neutral-800 dark:text-neutral-200 text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🛡️ Trust &amp; SLA Compliance Brief</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleText('social-announcement')}
                    className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-cyan-500 text-neutral-800 dark:text-neutral-200 text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📣 Social Media Promo</span>
                  </button>
                </div>
              </div>
            )}
            <textarea
              ref={editorRef}
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              placeholder="Paste or write content draft here..."
              className="w-full flex-1 bg-transparent resize-none focus:outline-none text-neutral-900 dark:text-neutral-100 font-sans text-sm leading-relaxed tracking-normal min-h-[220px]"
              spellCheck={false}
            />
          </div>

          {/* Active Context Banner if Finding is Selected */}
          {selectedFinding && (
            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-slate-900/60 text-xs flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-neutral-400 shrink-0">Selected Issue:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 truncate font-medium">
                  {selectedFinding.excerpt}
                </span>
              </div>
              <button
                onClick={() => setMobileTab('inspector')}
                className="md:hidden text-cyan-600 dark:text-cyan-400 font-semibold"
              >
                Inspect →
              </button>
            </div>
          )}
        </div>

        {/* PANEL 3: Right Explainable Findings Inspector (380px) */}
        <div
          className={`w-full md:w-96 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-slate-900/40 flex flex-col shrink-0 overflow-y-auto min-h-0 ${
            mobileTab === 'inspector' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedFinding ? (
            <div className="p-4 flex flex-col gap-4">
              {/* Finding Title & Severity Badge */}
              <div className="flex flex-col gap-1.5 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono uppercase ${
                      selectedFinding.severity === 'critical'
                        ? 'text-rose-500'
                        : selectedFinding.severity === 'high'
                        ? 'text-orange-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {selectedFinding.severity} Risk
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {selectedFinding.confidenceLabel} ({(selectedFinding.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                  {selectedFinding.title}
                </h3>
              </div>

              {/* Affected Excerpt */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Flagged Passage
                </span>
                <div className="p-2.5 rounded-md bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs font-mono text-rose-800 dark:text-rose-200 whitespace-pre-wrap">
                  {selectedFinding.excerpt}
                </div>
              </div>

              {/* Explanation & Rationale */}
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Why This Matters
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mt-1">
                    {selectedFinding.explanation}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Brand Rationale
                  </span>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1">
                    {selectedFinding.rationale}
                  </p>
                </div>
              </div>

              {/* Evidence & References */}
              {evidenceRefs.length > 0 && (
                <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Verified Reference Citation</span>
                  </span>
                  {evidenceRefs.map((ref) => (
                    <div key={ref.id} className="text-xs text-neutral-600 dark:text-neutral-300">
                      <strong className="text-neutral-900 dark:text-white block">{ref.title}</strong>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{ref.content}</p>
                      {ref.sourceDescription && (
                        <span className="text-[10px] text-neutral-400 block mt-1 font-mono">
                          Source: {ref.sourceDescription}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actionable Suggested Correction */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Suggested Correction
                  </span>
                  <button
                    onClick={handleAiRefine}
                    disabled={isAiRefining}
                    className="flex items-center gap-1 text-[11px] font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAiRefining ? 'Refining...' : 'AI Voice Refine'}</span>
                  </button>
                </div>

                {isEditingCustom ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={customSuggestionText}
                      onChange={(e) => setCustomSuggestionText(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
                      rows={3}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          editFindingSuggestion(selectedFinding.id, customSuggestionText);
                          setIsEditingCustom(false);
                        }}
                        className="flex-1 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
                      >
                        Apply Custom Text
                      </button>
                      <button
                        onClick={() => setIsEditingCustom(false)}
                        className="py-1.5 px-3 text-xs text-neutral-500 hover:text-neutral-700 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 font-mono leading-relaxed">
                    {selectedFinding.suggestedCorrection ? (
                      selectedFinding.suggestedCorrection
                    ) : (
                      <em className="text-neutral-400">Remove flagged phrase entirely</em>
                    )}
                  </div>
                )}

                {aiNote && (
                  <div className="text-[11px] text-cyan-700 dark:text-cyan-300 bg-cyan-50/60 dark:bg-cyan-950/30 p-2 rounded border border-cyan-200 dark:border-cyan-900/40">
                    💡 <strong>Author Intent Note:</strong> {aiNote}
                  </div>
                )}

                {/* Accept / Edit / Dismiss Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => acceptFinding(selectedFinding.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Correction</span>
                  </button>

                  <button
                    onClick={() => setIsEditingCustom(!isEditingCustom)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Custom Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => {
                      setDismissReasonText('');
                      setDismissReasonModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Dismiss with Reason</span>
                  </button>

                  <button
                    onClick={() => flagFindingForReview(selectedFinding.id)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 rounded border border-amber-500/20 hover:bg-amber-500/5 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Flag for Review</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-neutral-400 gap-2">
              <HelpCircle className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Explainability Inspector
              </span>
              <p className="text-[11px] text-neutral-500 max-w-xs leading-relaxed">
                {activeDraftFindings.length > 0
                  ? 'Select any finding from the left panel to inspect why it was flagged, view approved wording, citations, and author intent options.'
                  : 'Write or paste copy and click Rescan Content to evaluate against corporate brand rules.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dismissal Reason Modal */}
      {dismissReasonModalOpen && selectedFinding && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Dismiss Finding: {selectedFinding.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Provide an audit justification for exempting this guideline violation.
              </p>
            </div>

            <textarea
              value={dismissReasonText}
              onChange={(e) => setDismissReasonText(e.target.value)}
              placeholder="e.g., Authorized quote by external speaker; exemption approved under Marketing Policy 4.1."
              className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
              rows={3}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDismissReasonModalOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dismissFinding(selectedFinding.id, dismissReasonText);
                  setDismissReasonModalOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 rounded-md hover:bg-slate-800"
              >
                Confirm Exemption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
