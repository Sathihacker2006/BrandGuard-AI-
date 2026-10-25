export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

export type RuleCategory =
  | 'tone_of_voice'
  | 'approved_terminology'
  | 'prohibited_terminology'
  | 'product_naming'
  | 'messaging_requirements'
  | 'factual_claims'
  | 'formatting_style'
  | 'accessibility'
  | 'promotional_language'
  | 'legal_policy';

export type DraftStatus =
  | 'draft'
  | 'analysed'
  | 'changes_required'
  | 'ready_for_review'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export type ContentType =
  | 'marketing_copy'
  | 'social_post'
  | 'website_content'
  | 'email_campaign'
  | 'advertisement'
  | 'press_release'
  | 'product_description'
  | 'internal_comm'
  | 'presentation_text';

export type FindingStatus = 'open' | 'accepted' | 'modified' | 'dismissed' | 'review_flagged';

export type ReferenceType =
  | 'product_claim'
  | 'verified_stat'
  | 'official_fact'
  | 'policy_excerpt'
  | 'source_url'
  | 'reference_note';

export type VerificationStatus = 'verified' | 'pending_review' | 'archived';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  brandIdentity: string;
  defaultLanguage: string;
  toneGuidelines: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandRule {
  id: string;
  workspaceId: string;
  name: string;
  category: RuleCategory;
  description: string;
  severity: Severity;
  matchPattern: string; // word, regex, or phrase
  isRegex: boolean;
  isCaseSensitive: boolean;
  recommendedAction: string;
  approvedWording?: string;
  rationale: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovedReference {
  id: string;
  workspaceId: string;
  title: string;
  referenceType: ReferenceType;
  content: string;
  sourceUrl?: string;
  sourceDescription: string;
  verificationStatus: VerificationStatus;
  lastVerifiedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DraftRevision {
  id: string;
  draftId: string;
  revisionNumber: number;
  contentSnapshot: string;
  changeSummary: string;
  createdAt: string;
  author: string;
  associatedFindingId?: string;
}

export interface Draft {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  contentType: ContentType;
  language: string;
  status: DraftStatus;
  creator: string;
  createdAt: string;
  updatedAt: string;
  latestAnalysisId?: string;
}

export interface Finding {
  id: string;
  analysisRunId: string;
  draftId: string;
  ruleId?: string;
  category: RuleCategory;
  severity: Severity;
  title: string;
  excerpt: string;
  startOffset: number;
  endOffset: number;
  explanation: string;
  evidenceReferenceIds?: string[];
  suggestedCorrection?: string;
  rationale: string;
  confidence: number; // 0.0 to 1.0 calibrated
  confidenceLabel: 'Deterministic Match' | 'High Confidence' | 'Needs Verification' | 'Potential Issue';
  status: FindingStatus;
  dismissalReason?: string;
  userModifiedText?: string;
  createdAt: string;
}

export interface AnalysisRun {
  id: string;
  draftId: string;
  workspaceId: string;
  runAt: string;
  rulesEvaluatedCount: number;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  informationalCount: number;
  summary: string;
  aiEnhanced?: boolean;
}

export interface ReviewComment {
  id: string;
  author: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  draftId: string;
  workspaceId: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  decisionAt?: string;
  decisionBy?: string;
  decisionNotes?: string;
  comments: ReviewComment[];
}

export type AuditEventType =
  | 'workspace_created'
  | 'workspace_updated'
  | 'rule_created'
  | 'rule_updated'
  | 'rule_deleted'
  | 'reference_created'
  | 'reference_updated'
  | 'reference_deleted'
  | 'draft_created'
  | 'draft_updated'
  | 'draft_deleted'
  | 'analysis_run'
  | 'finding_accepted'
  | 'finding_edited'
  | 'finding_dismissed'
  | 'finding_flagged'
  | 'revision_saved'
  | 'review_submitted'
  | 'review_approved'
  | 'review_rejected'
  | 'review_changes_requested';

export interface AuditEvent {
  id: string;
  workspaceId: string;
  eventType: AuditEventType;
  resourceType: 'workspace' | 'rule' | 'reference' | 'draft' | 'finding' | 'review';
  resourceId: string;
  resourceTitle: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface GuidelineInsight {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  triggerCount: number;
  dismissalCount: number;
  dismissalRate: number;
  issueDescription: string;
  suggestedClarification: string;
}

export interface ComplianceViolationItem {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  excerpt: string;
  suggestedCorrection?: string | null;
}

export interface ComplianceViolationSummary {
  draftId: string;
  draftTitle: string;
  rulesEvaluatedCount: number;
  totalViolations: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  informationalCount: number;
  categories: { name: string; count: number }[];
  topViolations: ComplianceViolationItem[];
  executiveSummary: string;
  timestamp: string;
}
