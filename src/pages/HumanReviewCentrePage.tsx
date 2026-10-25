import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReviewRecord, Draft } from '../types';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Send,
  AlertCircle,
  FileText,
  ScanSearch,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const HumanReviewCentrePage: React.FC = () => {
  const {
    reviews,
    drafts,
    activeDraftFindings,
    recordReviewDecision,
    addReviewComment,
    setActiveDraft,
    setActiveView,
    activeWorkspace,
    showToast,
  } = useApp();

  const [selectedReviewId, setSelectedReviewId] = useState<string>(
    reviews[0]?.id || ''
  );
  const [commentInput, setCommentInput] = useState('');
  const [decisionNotesInput, setDecisionNotesInput] = useState('');
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [targetDecision, setTargetDecision] = useState<'approved' | 'rejected' | 'changes_requested'>('approved');

  const selectedReview = reviews.find((r) => r.id === selectedReviewId) || reviews[0];
  const draftForReview = drafts.find((d) => d.id === selectedReview?.draftId);

  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const pastReviews = reviews.filter((r) => r.status !== 'pending');

  const handleDecisionSubmit = () => {
    if (!selectedReview) return;
    recordReviewDecision(selectedReview.id, targetDecision, decisionNotesInput);
    setDecisionModalOpen(false);
    setDecisionNotesInput('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !commentInput.trim()) return;
    addReviewComment(selectedReview.id, 'Compliance Auditor', commentInput.trim());
    setCommentInput('');
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
            Human Review &amp; Approval Centre
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Human governance gateway. No AI analysis silently approves content without human sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500">
            <strong>{pendingReviews.length}</strong> Draft(s) in Queue
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="py-20 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
          <UserCheck className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            No Review Requests in Queue
          </h3>
          <p className="max-w-md mx-auto mt-1 text-neutral-500">
            When authors finish refining content in the Review Studio, they submit drafts here for compliance sign-off.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Review Requests List (Left Column) */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Review Queue
            </h2>

            <div className="flex flex-col gap-2">
              {reviews.map((rev) => {
                const draft = drafts.find((d) => d.id === rev.draftId);
                const isSelected = rev.id === selectedReview?.id;

                let statusBadge = (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
                    <Clock className="w-3 h-3" /> PENDING
                  </span>
                );
                if (rev.status === 'approved') {
                  statusBadge = (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                      <CheckCircle2 className="w-3 h-3" /> APPROVED
                    </span>
                  );
                } else if (rev.status === 'rejected') {
                  statusBadge = (
                    <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-semibold font-mono">
                      <XCircle className="w-3 h-3" /> REJECTED
                    </span>
                  );
                } else if (rev.status === 'changes_requested') {
                  statusBadge = (
                    <span className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 font-semibold font-mono">
                      <AlertCircle className="w-3 h-3" /> CHANGES
                    </span>
                  );
                }

                return (
                  <button
                    key={rev.id}
                    onClick={() => setSelectedReviewId(rev.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-cyan-500 bg-white dark:bg-slate-900 shadow-sm'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-slate-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(rev.submittedAt).toLocaleDateString()}
                      </span>
                      {statusBadge}
                    </div>

                    <div className="font-bold text-neutral-900 dark:text-white truncate">
                      {draft?.title || 'Unknown Draft'}
                    </div>

                    <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                      <span>By: {rev.submittedBy}</span>
                      <span className="font-mono text-[10px]">{rev.comments.length} comment(s)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Details & Decisions (Right 2 Columns) */}
          {selectedReview && draftForReview ? (
            <div className="lg:col-span-2 flex flex-col gap-4 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    Draft Under Review
                  </span>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">
                    {draftForReview.title}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span>Submitted by: <strong>{selectedReview.submittedBy}</strong></span>
                    <span>·</span>
                    <span>Status: <strong className="capitalize">{draftForReview.status.replace(/_/g, ' ')}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveDraft(draftForReview);
                    setActiveView('studio');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors shrink-0"
                >
                  <ScanSearch className="w-3.5 h-3.5" />
                  <span>Inspect in Studio</span>
                </button>
              </div>

              {/* Draft Content Snapshot Preview */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Content Excerpt
                </span>
                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-slate-950 border border-neutral-200 dark:border-neutral-800 font-sans text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {draftForReview.content}
                </div>
              </div>

              {/* Review Decision Buttons */}
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Human Review Decision
                  </span>
                  {selectedReview.decisionAt && (
                    <span className="text-[11px] font-mono text-neutral-400">
                      Decided by {selectedReview.decisionBy} on {new Date(selectedReview.decisionAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {selectedReview.decisionNotes && (
                  <div className="p-2.5 rounded bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 font-sans">
                    <strong>Audit Record Note:</strong> {selectedReview.decisionNotes}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setTargetDecision('approved');
                      setDecisionNotesInput('Verified compliant with all brand guidelines, SLA disclosures, and legal requirements.');
                      setDecisionModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Draft</span>
                  </button>

                  <button
                    onClick={() => {
                      setTargetDecision('changes_requested');
                      setDecisionNotesInput('Please address high-severity claim issues in Section 2 before resubmitting.');
                      setDecisionModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-md border border-amber-300 dark:border-amber-800 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => {
                      setTargetDecision('rejected');
                      setDecisionNotesInput('Violates company policy on unauthorized external representations.');
                      setDecisionModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-md border border-rose-300 dark:border-rose-800 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Publication</span>
                  </button>
                </div>
              </div>

              {/* Review Audit Comments Stream */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Review Comments &amp; Discussion</span>
                </span>

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {selectedReview.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <strong className="text-neutral-900 dark:text-white">{c.author} ({c.role})</strong>
                        <span className="font-mono">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="mt-1 text-neutral-700 dark:text-neutral-300">{c.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Add an internal reviewer note or directive..."
                    className="flex-1 p-2 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 text-xs font-semibold text-white bg-slate-900 dark:bg-cyan-600 rounded-md hover:bg-slate-800"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center p-12 text-xs text-neutral-400">
              Select a review from the queue to view details and record decisions.
            </div>
          )}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {decisionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col gap-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Confirm Decision: {targetDecision.replace(/_/g, ' ')}
              </h3>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                This action is permanently recorded in the immutable brand compliance audit ledger.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Decision Notes &amp; Rationale *
              </label>
              <textarea
                value={decisionNotesInput}
                onChange={(e) => setDecisionNotesInput(e.target.value)}
                placeholder="Document the exact basis for this decision..."
                className="w-full p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none text-xs"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setDecisionModalOpen(false)}
                className="px-3.5 py-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDecisionSubmit}
                className="px-4 py-1.5 font-semibold text-white bg-slate-900 dark:bg-cyan-500 dark:text-slate-950 rounded-md hover:bg-slate-800"
              >
                Confirm &amp; Record Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
