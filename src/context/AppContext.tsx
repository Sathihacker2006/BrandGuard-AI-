import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Workspace,
  BrandRule,
  ApprovedReference,
  Draft,
  DraftRevision,
  Finding,
  ReviewRecord,
  AuditEvent,
  AnalysisRun,
  ComplianceViolationSummary,
  ComplianceViolationItem,
} from '../types';
import { storage } from '../services/storage';
import { analysisEngine } from '../services/analysisEngine';
import { api } from '../services/api';

export type AppView =
  | 'dashboard'
  | 'workspaces'
  | 'guidelines'
  | 'references'
  | 'drafts'
  | 'studio'
  | 'findings'
  | 'reviews'
  | 'revisions'
  | 'analytics'
  | 'audit'
  | 'settings'
  | 'landing';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  complianceSummary?: ComplianceViolationSummary;
  action?: ToastAction;
}

interface AppContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspaceId: (id: string) => void;
  rules: BrandRule[];
  references: ApprovedReference[];
  drafts: Draft[];
  activeDraft: Draft | null;
  setActiveDraft: (draft: Draft | null) => void;
  activeDraftFindings: Finding[];
  activeDraftRevisions: DraftRevision[];
  allFindings: Finding[];
  targetFindingId: string | null;
  setTargetFindingId: (id: string | null) => void;
  reviews: ReviewRecord[];
  auditEvents: AuditEvent[];
  analyses: AnalysisRun[];
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  newDraftModalOpen: boolean;
  setNewDraftModalOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (
    title: string,
    message: string,
    type?: Toast['type'],
    options?: {
      duration?: number;
      complianceSummary?: ComplianceViolationSummary;
      action?: ToastAction;
    }
  ) => void;
  dismissToast: (id: string) => void;

  // Domain Actions
  runAnalysis: (draftId: string) => AnalysisRun | null;
  acceptFinding: (findingId: string) => void;
  editFindingSuggestion: (findingId: string, customText: string) => void;
  dismissFinding: (findingId: string, reason: string) => void;
  flagFindingForReview: (findingId: string) => void;
  saveDraftContent: (draftId: string, newContent: string, reason?: string) => void;
  createNewDraft: (title: string, contentType: Draft['contentType'], initialContent?: string) => Draft;
  submitDraftForReview: (draftId: string, submittedBy: string) => void;
  recordReviewDecision: (
    reviewId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    notes: string,
    reviewerName?: string
  ) => void;
  addReviewComment: (reviewId: string, author: string, content: string) => void;
  saveBrandRule: (rule: BrandRule) => void;
  deleteBrandRule: (ruleId: string) => void;
  saveReference: (reference: ApprovedReference) => void;
  deleteReference: (refId: string) => void;
  saveWorkspace: (ws: Workspace) => void;
  resetToSeedData: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>('dark');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [newDraftModalOpen, setNewDraftModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // State caches
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>('');
  const [rules, setRules] = useState<BrandRule[]>([]);
  const [references, setReferences] = useState<ApprovedReference[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraft, setActiveDraftState] = useState<Draft | null>(null);
  const [activeDraftFindings, setActiveDraftFindings] = useState<Finding[]>([]);
  const [activeDraftRevisions, setActiveDraftRevisions] = useState<DraftRevision[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisRun[]>([]);
  const [targetFindingId, setTargetFindingId] = useState<string | null>(null);
  const [allFindings, setAllFindings] = useState<Finding[]>([]);

  const showToast = useCallback(
    (
      title: string,
      message: string,
      type: Toast['type'] = 'info',
      options?: {
        duration?: number;
        complianceSummary?: ComplianceViolationSummary;
        action?: ToastAction;
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duration = options?.duration ?? (options?.complianceSummary ? 9000 : 4500);
      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          message,
          type,
          duration,
          complianceSummary: options?.complianceSummary,
          action: options?.action,
        },
      ]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(() => {
    const wsList = storage.getWorkspaces();
    setWorkspaces(wsList);
    const activeWsId = storage.getActiveWorkspaceId() || wsList[0]?.id || '';
    setActiveWorkspaceIdState(activeWsId);

    const wsRules = storage.getRules(activeWsId);
    setRules(wsRules);

    const wsRefs = storage.getReferences(activeWsId);
    setReferences(wsRefs);

    const wsDrafts = storage.getDrafts(activeWsId);
    setDrafts(wsDrafts);

    const wsReviews = storage.getReviews(activeWsId);
    setReviews(wsReviews);

    const wsAudit = storage.getAuditEvents(activeWsId);
    setAuditEvents(wsAudit);

    const allAnalyses = storage.getAnalyses();
    setAnalyses(allAnalyses);

    const allStoreFindings = storage.getFindings();
    setAllFindings(allStoreFindings);

    // Update active draft
    if (activeDraft) {
      const refreshedDraft = storage.getDraft(activeDraft.id);
      if (refreshedDraft) {
        setActiveDraftState(refreshedDraft);
        setActiveDraftFindings(storage.getFindings(refreshedDraft.id));
        setActiveDraftRevisions(storage.getRevisions(refreshedDraft.id));
      } else if (wsDrafts.length > 0) {
        setActiveDraftState(wsDrafts[0]);
        setActiveDraftFindings(storage.getFindings(wsDrafts[0].id));
        setActiveDraftRevisions(storage.getRevisions(wsDrafts[0].id));
      } else {
        setActiveDraftState(null);
        setActiveDraftFindings([]);
        setActiveDraftRevisions([]);
      }
    } else if (wsDrafts.length > 0) {
      setActiveDraftState(wsDrafts[0]);
      setActiveDraftFindings(storage.getFindings(wsDrafts[0].id));
      setActiveDraftRevisions(storage.getRevisions(wsDrafts[0].id));
    }
  }, [activeDraft]);

  // Initial load
  useEffect(() => {
    const savedTheme = storage.getTheme();
    setThemeState(savedTheme);
    refreshData();
  }, []);

  // Theme effect on HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
    storage.setTheme(newTheme);
  };

  const setActiveWorkspaceId = (id: string) => {
    storage.setActiveWorkspaceId(id);
    setActiveWorkspaceIdState(id);
    // Reload active workspace scoped items
    const wsRules = storage.getRules(id);
    setRules(wsRules);
    const wsRefs = storage.getReferences(id);
    setReferences(wsRefs);
    const wsDrafts = storage.getDrafts(id);
    setDrafts(wsDrafts);
    const wsReviews = storage.getReviews(id);
    setReviews(wsReviews);
    const wsAudit = storage.getAuditEvents(id);
    setAuditEvents(wsAudit);

    if (wsDrafts.length > 0) {
      setActiveDraftState(wsDrafts[0]);
      setActiveDraftFindings(storage.getFindings(wsDrafts[0].id));
      setActiveDraftRevisions(storage.getRevisions(wsDrafts[0].id));
    } else {
      setActiveDraftState(null);
      setActiveDraftFindings([]);
      setActiveDraftRevisions([]);
    }
    showToast('Workspace Switched', `Active workspace updated.`, 'info');
  };

  const setActiveDraft = (draft: Draft | null) => {
    setActiveDraftState(draft);
    if (draft) {
      setActiveDraftFindings(storage.getFindings(draft.id));
      setActiveDraftRevisions(storage.getRevisions(draft.id));
    } else {
      setActiveDraftFindings([]);
      setActiveDraftRevisions([]);
    }
  };

  // Run explainable analysis
  const runAnalysis = useCallback(
    (draftId: string): AnalysisRun | null => {
      const draft = storage.getDraft(draftId);
      if (!draft) return null;

      const wsRules = storage.getRules(draft.workspaceId);
      const wsRefs = storage.getReferences(draft.workspaceId);

      const result = analysisEngine.analyze(draft, wsRules, wsRefs);
      storage.saveAnalysis(result.run, result.findings);

      // Async sync with /api/v1 backend endpoint
      api.runAnalysis(draft.id, draft.workspaceId).catch((err) => {
        console.debug('Backend /api/v1 sync notice:', err);
      });

      refreshData();

      // Aggregate category breakdown
      const categoryMap: Record<string, number> = {};
      result.findings.forEach((f) => {
        categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
      });
      const categories = Object.entries(categoryMap).map(([cat, count]) => ({
        name: cat.replace(/_/g, ' '),
        count,
      }));

      // Extract top representative violations (up to 3 distinct items)
      const topViolations: ComplianceViolationItem[] = result.findings.slice(0, 3).map((f) => ({
        id: f.id,
        title: f.title,
        category: f.category.replace(/_/g, ' '),
        severity: f.severity,
        excerpt: f.excerpt,
        suggestedCorrection: f.suggestedCorrection,
      }));

      const complianceSummary: ComplianceViolationSummary = {
        draftId: draft.id,
        draftTitle: draft.title,
        rulesEvaluatedCount: result.run.rulesEvaluatedCount,
        totalViolations: result.run.findingsCount,
        criticalCount: result.run.criticalCount,
        highCount: result.run.highCount,
        mediumCount: result.run.mediumCount,
        lowCount: result.run.lowCount,
        informationalCount: result.run.informationalCount,
        categories,
        topViolations,
        executiveSummary: result.run.summary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const hasViolations = result.run.findingsCount > 0;
      const isCritical = result.run.criticalCount > 0;
      const toastType: Toast['type'] = isCritical ? 'error' : hasViolations ? 'warning' : 'success';
      const toastTitle = hasViolations
        ? `${result.run.findingsCount} Brand Violation${result.run.findingsCount > 1 ? 's' : ''} Identified`
        : '100% Brand Compliant';

      showToast(
        toastTitle,
        result.run.summary,
        toastType,
        {
          duration: 9000,
          complianceSummary,
          action: {
            label: hasViolations ? 'Open Review Studio' : 'View in Studio',
            onClick: () => {
              setActiveDraftState(draft);
              setActiveDraftFindings(result.findings);
              setActiveDraftRevisions(storage.getRevisions(draft.id));
              setActiveView('studio');
            },
          },
        }
      );
      return result.run;
    },
    [refreshData, showToast]
  );

  // Accept a suggested correction: applies correction to draft, records revision snapshot, updates finding status
  const acceptFinding = useCallback(
    (findingId: string) => {
      const finding = storage.getFindings().find((f) => f.id === findingId);
      if (!finding) return;

      const draft = storage.getDraft(finding.draftId);
      if (!draft) return;

      const correction = finding.suggestedCorrection ?? '';
      const originalText = draft.content;

      // Safe substring replacement
      let newContent = originalText;
      if (
        finding.startOffset >= 0 &&
        finding.endOffset <= originalText.length &&
        finding.endOffset > finding.startOffset
      ) {
        newContent =
          originalText.substring(0, finding.startOffset) +
          correction +
          originalText.substring(finding.endOffset);
      } else {
        // Fallback: replace first occurrence of excerpt or target phrase
        const targetPhrase = finding.title.split(': "')[1]?.replace(/"$/, '') || '';
        if (targetPhrase && originalText.includes(targetPhrase)) {
          newContent = originalText.replace(targetPhrase, correction);
        }
      }

      // Update finding status
      finding.status = 'accepted';
      storage.updateFinding(finding);

      // Save draft with a revision snapshot
      draft.content = newContent;
      draft.status = 'draft';
      storage.saveDraft(
        draft,
        true,
        `Accepted correction for "${finding.title}" -> "${correction || '[Removed]'}"`
      );

      // Re-run analysis automatically so offsets and remaining findings refresh
      analysisEngine.analyze(draft, rules, references);
      const updatedFindings = storage.getFindings(draft.id);
      // Mark current finding as accepted in the fresh set
      const freshCurrent = updatedFindings.find((f) => f.title === finding.title);
      if (freshCurrent) {
        freshCurrent.status = 'accepted';
        storage.updateFinding(freshCurrent);
      }

      refreshData();
      showToast('Correction Applied', `Updated text and saved revision snapshot.`, 'success');
    },
    [rules, references, refreshData, showToast]
  );

  // User edits suggestion before applying
  const editFindingSuggestion = useCallback(
    (findingId: string, customText: string) => {
      const finding = storage.getFindings().find((f) => f.id === findingId);
      if (!finding) return;

      const draft = storage.getDraft(finding.draftId);
      if (!draft) return;

      const originalText = draft.content;
      let newContent = originalText;
      if (
        finding.startOffset >= 0 &&
        finding.endOffset <= originalText.length &&
        finding.endOffset > finding.startOffset
      ) {
        newContent =
          originalText.substring(0, finding.startOffset) +
          customText +
          originalText.substring(finding.endOffset);
      } else {
        const targetPhrase = finding.title.split(': "')[1]?.replace(/"$/, '') || '';
        if (targetPhrase && originalText.includes(targetPhrase)) {
          newContent = originalText.replace(targetPhrase, customText);
        }
      }

      finding.status = 'modified';
      finding.userModifiedText = customText;
      storage.updateFinding(finding);

      draft.content = newContent;
      draft.status = 'draft';
      storage.saveDraft(draft, true, `Applied custom edit for "${finding.title}": "${customText}"`);

      refreshData();
      showToast('Custom Edit Applied', `Draft updated with custom wording.`, 'success');
    },
    [refreshData, showToast]
  );

  // Dismiss finding with a documented reason
  const dismissFinding = useCallback(
    (findingId: string, reason: string) => {
      const finding = storage.getFindings().find((f) => f.id === findingId);
      if (!finding) return;

      finding.status = 'dismissed';
      finding.dismissalReason = reason || 'Reviewed and exempted by author.';
      storage.updateFinding(finding);

      refreshData();
      showToast('Finding Dismissed', `Exemption recorded in audit trail.`, 'info');
    },
    [refreshData, showToast]
  );

  // Flag finding for human compliance review
  const flagFindingForReview = useCallback(
    (findingId: string) => {
      const finding = storage.getFindings().find((f) => f.id === findingId);
      if (!finding) return;

      finding.status = 'review_flagged';
      storage.updateFinding(finding);

      refreshData();
      showToast('Flagged for Review', `Assigned for human reviewer verification.`, 'warning');
    },
    [refreshData, showToast]
  );

  // Manual save draft content
  const saveDraftContent = useCallback(
    (draftId: string, newContent: string, reason = 'Direct editor modification') => {
      const draft = storage.getDraft(draftId);
      if (!draft) return;

      draft.content = newContent;
      draft.status = 'draft';
      storage.saveDraft(draft, true, reason);
      refreshData();
      showToast('Draft Saved', `Saved and revision snapshot created.`, 'success');
    },
    [refreshData, showToast]
  );

  // Create new draft
  const createNewDraft = useCallback(
    (title: string, contentType: Draft['contentType'], initialContent = ''): Draft => {
      const newDraft: Draft = {
        id: `draft-${Date.now()}`,
        workspaceId: activeWorkspaceId,
        title: title.trim() || 'Untitled Content Draft',
        content: initialContent,
        contentType,
        language: 'en-US',
        status: 'draft',
        creator: 'Content Author',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      storage.saveDraft(newDraft, true, 'Initial draft creation');
      refreshData();
      setActiveDraft(newDraft);
      showToast('Draft Created', `"${newDraft.title}" is ready for editing.`, 'success');
      return newDraft;
    },
    [activeWorkspaceId, refreshData, showToast]
  );

  // Submit draft to human review queue
  const submitDraftForReview = useCallback(
    (draftId: string, submittedBy: string) => {
      const draft = storage.getDraft(draftId);
      if (!draft) return;

      const review: ReviewRecord = {
        id: `rev-rec-${draft.id}-${Date.now()}`,
        draftId: draft.id,
        workspaceId: draft.workspaceId,
        submittedAt: new Date().toISOString(),
        submittedBy: submittedBy || 'Content Creator',
        status: 'pending',
        comments: [
          {
            id: `cmt-${Date.now()}`,
            author: submittedBy || 'Content Creator',
            role: 'Author',
            content: 'Ready for formal brand and compliance review.',
            createdAt: new Date().toISOString(),
          },
        ],
      };

      storage.saveReview(review);
      api.submitReview(draft.id, draft.workspaceId, submittedBy || 'Content Creator').catch(() => {});
      refreshData();
      showToast('Submitted for Review', `Draft queued in Human Review Centre.`, 'success');
    },
    [refreshData, showToast]
  );

  // Record human review decision (approve, reject, changes requested)
  const recordReviewDecision = useCallback(
    (
      reviewId: string,
      decision: 'approved' | 'rejected' | 'changes_requested',
      notes: string,
      reviewerName = 'Compliance Director'
    ) => {
      const review = storage.getReviews().find((r) => r.id === reviewId);
      if (!review) return;

      api.recordReviewDecision(reviewId, decision, reviewerName, notes).catch(() => {});

      review.status = decision;
      review.decisionAt = new Date().toISOString();
      review.decisionBy = reviewerName;
      review.decisionNotes = notes;

      review.comments.push({
        id: `cmt-${Date.now()}`,
        author: reviewerName,
        role: 'Reviewer',
        content: `Decision: ${decision.toUpperCase()}. Notes: ${notes}`,
        createdAt: new Date().toISOString(),
      });

      storage.saveReview(review);
      refreshData();

      const label =
        decision === 'approved'
          ? 'Approved'
          : decision === 'rejected'
          ? 'Rejected'
          : 'Changes Requested';
      showToast(`Review Decision: ${label}`, `Logged in governance audit record.`, decision === 'approved' ? 'success' : 'warning');
    },
    [refreshData, showToast]
  );

  // Add comment to review
  const addReviewComment = useCallback(
    (reviewId: string, author: string, content: string) => {
      const review = storage.getReviews().find((r) => r.id === reviewId);
      if (!review) return;

      review.comments.push({
        id: `cmt-${Date.now()}`,
        author: author || 'Reviewer',
        role: 'Team Member',
        content,
        createdAt: new Date().toISOString(),
      });

      storage.saveReview(review);
      refreshData();
      showToast('Comment Added', 'Audit conversation updated.', 'info');
    },
    [refreshData, showToast]
  );

  const saveBrandRule = useCallback(
    (rule: BrandRule) => {
      storage.saveRule(rule);
      refreshData();
      showToast('Brand Rule Saved', `Rule "${rule.name}" is now active in governance checks.`, 'success');
    },
    [refreshData, showToast]
  );

  const deleteBrandRule = useCallback(
    (ruleId: string) => {
      storage.deleteRule(ruleId);
      refreshData();
      showToast('Rule Deleted', 'Rule removed from policy configuration.', 'info');
    },
    [refreshData, showToast]
  );

  const saveReference = useCallback(
    (reference: ApprovedReference) => {
      storage.saveReference(reference);
      refreshData();
      showToast('Reference Saved', `Reference entry "${reference.title}" updated.`, 'success');
    },
    [refreshData, showToast]
  );

  const deleteReference = useCallback(
    (refId: string) => {
      storage.deleteReference(refId);
      refreshData();
      showToast('Reference Deleted', 'Entry removed from library.', 'info');
    },
    [refreshData, showToast]
  );

  const saveWorkspace = useCallback(
    (ws: Workspace) => {
      storage.saveWorkspace(ws);
      refreshData();
      showToast('Workspace Saved', `Workspace profile updated.`, 'success');
    },
    [refreshData, showToast]
  );

  const resetToSeedData = useCallback(() => {
    storage.init(true);
    refreshData();
    showToast('Reset Complete', 'Default enterprise seed data restored.', 'info');
  }, [refreshData, showToast]);

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ||
    workspaces[0] || {
      id: 'ws-default',
      name: 'Default Workspace',
      description: 'Default organization workspace',
      brandIdentity: 'Standard brand voice',
      defaultLanguage: 'en-US',
      toneGuidelines: 'Clear and consistent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        workspaces,
        activeWorkspace,
        setActiveWorkspaceId,
        rules,
        references,
        drafts,
        activeDraft,
        setActiveDraft,
        activeDraftFindings,
        activeDraftRevisions,
        allFindings,
        targetFindingId,
        setTargetFindingId,
        reviews,
        auditEvents,
        analyses,
        theme,
        setTheme,
        commandPaletteOpen,
        setCommandPaletteOpen,
        newDraftModalOpen,
        setNewDraftModalOpen,
        toasts,
        showToast,
        dismissToast,
        runAnalysis,
        acceptFinding,
        editFindingSuggestion,
        dismissFinding,
        flagFindingForReview,
        saveDraftContent,
        createNewDraft,
        submitDraftForReview,
        recordReviewDecision,
        addReviewComment,
        saveBrandRule,
        deleteBrandRule,
        saveReference,
        deleteReference,
        saveWorkspace,
        resetToSeedData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
