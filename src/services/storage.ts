import {
  Workspace,
  BrandRule,
  ApprovedReference,
  Draft,
  DraftRevision,
  AnalysisRun,
  Finding,
  ReviewRecord,
  AuditEvent,
  AuditEventType,
} from '../types';

const STORAGE_KEYS = {
  WORKSPACES: 'brandguard_workspaces',
  ACTIVE_WORKSPACE_ID: 'brandguard_active_workspace_id',
  RULES: 'brandguard_rules',
  REFERENCES: 'brandguard_references',
  DRAFTS: 'brandguard_drafts',
  REVISIONS: 'brandguard_revisions',
  ANALYSES: 'brandguard_analyses',
  FINDINGS: 'brandguard_findings',
  REVIEWS: 'brandguard_reviews',
  AUDIT: 'brandguard_audit',
  THEME: 'brandguard_theme',
};

// Realistic Seed Data
const INITIAL_WORKSPACE_ID = 'ws-acme-cloud';

const SEED_WORKSPACES: Workspace[] = [
  {
    id: INITIAL_WORKSPACE_ID,
    name: 'Acme Cloud Platform',
    description: 'Enterprise cloud infrastructure, security, and developer productivity solutions.',
    brandIdentity: 'Authoritative, precise, enterprise-ready, transparent, and empathetic.',
    defaultLanguage: 'en-US',
    toneGuidelines: 'Professional and empowering. Avoid unverified hyperbole, colloquialisms, and condescending adverbs.',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'ws-fintech-secure',
    name: 'Apex Financial Services',
    description: 'Regulated banking APIs, international treasury settlement, and institutional compliance.',
    brandIdentity: 'Institutional, conservative, rigorous, compliant, security-first.',
    defaultLanguage: 'en-US',
    toneGuidelines: 'Strict adherence to financial disclosures. Zero speculative performance promises.',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-18T11:00:00.000Z',
  },
];

const SEED_RULES: BrandRule[] = [
  {
    id: 'rule-sla-guarantee',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: '100% Uptime Guarantee Prohibition',
    category: 'legal_policy',
    description: 'Prohibit claiming 100% or unconditional uptime. Official SLA is 99.99%.',
    severity: 'critical',
    matchPattern: '100%\\s*uptime|guarantee\\s*100%|zero\\s*downtime\\s*guaranteed',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Replace with approved SLA language (99.99% financially backed uptime SLA).',
    approvedWording: '99.99% financially backed availability SLA',
    rationale: 'Legal compliance: Absolute 100% claims violate enterprise service contracts and consumer protection laws.',
    isActive: true,
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'rule-prohibited-cheap',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: 'Prohibit "Cheap" Terminology',
    category: 'prohibited_terminology',
    description: 'Avoid using "cheap" when describing products or enterprise tiers.',
    severity: 'high',
    matchPattern: '\\bcheap\\b|\\bcheapest\\b',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Use "cost-effective", "economical", or "accessible pricing".',
    approvedWording: 'cost-effective',
    rationale: 'Brand perception: "Cheap" connotes substandard quality in enterprise B2B messaging.',
    isActive: true,
    createdAt: '2026-09-15T09:10:00.000Z',
    updatedAt: '2026-09-15T09:10:00.000Z',
  },
  {
    id: 'rule-brand-casing',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: 'Brand Name Casing & Spacing',
    category: 'product_naming',
    description: 'BrandGuard AI must always be written in camel-case with a space before AI.',
    severity: 'medium',
    matchPattern: '\\bbrandguard\\b|\\bBrand Guard\\b|\\bbrandguard\\.ai\\b|\\bBrandGuardai\\b',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Use canonical product name: BrandGuard AI.',
    approvedWording: 'BrandGuard AI',
    rationale: 'Product identity: Consistent trademark styling across all market-facing copy.',
    isActive: true,
    createdAt: '2026-09-16T11:00:00.000Z',
    updatedAt: '2026-09-16T11:00:00.000Z',
  },
  {
    id: 'rule-condescending-tone',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: 'Condescending Adverb Filter',
    category: 'tone_of_voice',
    description: 'Flag dismissive adverbs like "obviously", "clearly", or "as everyone knows".',
    severity: 'medium',
    matchPattern: '\\bobviously\\b|\\bclearly\\b|\\bas everyone knows\\b',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Remove condescending qualifiers to maintain empathetic, respectful tone.',
    approvedWording: '',
    rationale: 'Voice guideline: Alienates readers who are discovering technical concepts for the first time.',
    isActive: true,
    createdAt: '2026-09-16T11:30:00.000Z',
    updatedAt: '2026-09-16T11:30:00.000Z',
  },
  {
    id: 'rule-hyperbole-magic',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: 'Unsubstantiated Hyperbole ("Magic" / "Miracle")',
    category: 'promotional_language',
    description: 'Prohibit mystical or unscientific marketing words such as "magic", "miracle", or "game-changing miracle".',
    severity: 'low',
    matchPattern: '\\bmagic\\b|\\bmagical\\b|\\bmiracle\\b',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Describe specific technical mechanisms and architectural advantages.',
    approvedWording: 'automated intelligent verification',
    rationale: 'Engineering rigor: Technical enterprise buyers distrust exaggerated puffery.',
    isActive: true,
    createdAt: '2026-09-17T14:00:00.000Z',
    updatedAt: '2026-09-17T14:00:00.000Z',
  },
  {
    id: 'rule-customer-stat-check',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: 'Customer Metric Verification',
    category: 'factual_claims',
    description: 'Customer count claims must match verified reference numbers (25,000+ active enterprises).',
    severity: 'high',
    matchPattern: '(?:over|more than)\\s+(?:500,?000|1,?000,?000|1M)\\s+customers?',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Cite verified metric: "Over 25,000 enterprise organizations".',
    approvedWording: 'over 25,000 enterprise organizations',
    rationale: 'Factual accuracy: Unsupported statistics risk regulatory scrutiny under advertising guidelines.',
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'rule-punctuation-excess',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: 'Repeated Exclamation Punctuation',
    category: 'formatting_style',
    description: 'Prohibit consecutive exclamation marks (!! or !!!).',
    severity: 'informational',
    matchPattern: '!{2,}',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Use a single period or single exclamation mark.',
    approvedWording: '.',
    rationale: 'Style guide: Multiple exclamation marks appear unpolished in enterprise communication.',
    isActive: true,
    createdAt: '2026-09-20T12:00:00.000Z',
    updatedAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'rule-accessibility-readability',
    workspaceId: INITIAL_WORKSPACE_ID,
    name: 'Run-on Sentence Accessibility Check',
    category: 'accessibility',
    description: 'Sentences exceeding 45 words reduce cognitive accessibility and comprehension.',
    severity: 'low',
    matchPattern: '[^.!?]{260,}[.!?]',
    isRegex: true,
    isCaseSensitive: false,
    recommendedAction: 'Break complex compound clauses into shorter, direct sentences.',
    approvedWording: '',
    rationale: 'WCAG 3.1.5: Clear language improves accessibility for neurodiverse and non-native readers.',
    isActive: true,
    createdAt: '2026-09-21T09:00:00.000Z',
    updatedAt: '2026-09-21T09:00:00.000Z',
  },
];

const SEED_REFERENCES: ApprovedReference[] = [
  {
    id: 'ref-customer-metrics-2026',
    workspaceId: INITIAL_WORKSPACE_ID,
    title: 'Verified Enterprise Customer Count (Q3 2026)',
    referenceType: 'verified_stat',
    content: 'Acme Cloud Platform serves 25,480 active enterprise organizations across North America, Europe, and Asia-Pacific as of September 30, 2026.',
    sourceUrl: 'https://investor.acmecloud.internal/q3-2026-metrics',
    sourceDescription: 'Audited Financial & Operational Report Q3 2026, Section 4.2',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-10-05T00:00:00.000Z',
    createdAt: '2026-09-18T09:00:00.000Z',
    updatedAt: '2026-10-05T12:00:00.000Z',
  },
  {
    id: 'ref-sla-availability',
    workspaceId: INITIAL_WORKSPACE_ID,
    title: 'Enterprise Availability SLA Specifications',
    referenceType: 'product_claim',
    content: 'The official service level agreement promises 99.99% monthly availability for core API and data ingestion endpoints. Uptime calculations exclude scheduled maintenance windows announced 48 hours in advance.',
    sourceUrl: 'https://trust.acmecloud.internal/sla-terms',
    sourceDescription: 'Master Services Agreement, Exhibit C (Availability SLA)',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-09-15T08:30:00.000Z',
    updatedAt: '2026-09-15T08:30:00.000Z',
  },
  {
    id: 'ref-soc2-compliance',
    workspaceId: INITIAL_WORKSPACE_ID,
    title: 'SOC 2 Type II Independent Audit Report',
    referenceType: 'official_fact',
    content: 'Acme Cloud Platform is certified SOC 2 Type II compliant under AICPA Trust Services Criteria for Security, Confidentiality, and Availability. Audit period covers October 1, 2025 to September 30, 2026.',
    sourceUrl: 'https://security.acmecloud.internal/soc2-type-2',
    sourceDescription: 'Ernst & Partners Independent Assurance Report, September 2026',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-10-02T00:00:00.000Z',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
  },
  {
    id: 'ref-naming-taxonomy',
    workspaceId: INITIAL_WORKSPACE_ID,
    title: 'Official Brand Trademark & Naming Standard',
    referenceType: 'policy_excerpt',
    content: 'The official flagship product name is BrandGuard AI. Both words must be written with capital B and capital G, followed by a space and capital AI. Never write "Brandguard", "brandguard", or "Brand Guard".',
    sourceUrl: 'https://brand.acmecloud.internal/guidelines/naming',
    sourceDescription: 'Corporate Brand Book v4.2, Page 14',
    verificationStatus: 'verified',
    lastVerifiedDate: '2026-08-15T00:00:00.000Z',
    createdAt: '2026-09-16T10:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

const SEED_DRAFTS: Draft[] = [
  {
    id: 'draft-q4-announcement',
    workspaceId: INITIAL_WORKSPACE_ID,
    title: 'Q4 Global Enterprise Launch Announcement',
    content: `We are thrilled to unveil Brand Guard to our global community!! Today, we are changing how companies secure brand integrity.

Unlike legacy software, our platform offers a cheap solution that anyone can configure in minutes. With over 1,000,000 customers relying on our engine every day, we provide zero downtime guaranteed across all multi-region clusters. 

Obviously, legacy approaches cannot compete with this kind of performance. Our revolutionary magic works across every marketing document, press release, and campaign to keep your team aligned. Start your trial today!!`,
    contentType: 'marketing_copy',
    language: 'en-US',
    status: 'draft',
    creator: 'Alex Mercer (Lead Product Marketing)',
    createdAt: '2026-10-21T14:20:00.000Z',
    updatedAt: '2026-10-22T08:15:00.000Z',
  },
  {
    id: 'draft-security-whitepaper',
    workspaceId: INITIAL_WORKSPACE_ID,
    title: 'Enterprise Trust & Cloud Compliance Brief',
    content: `Security is the core pillar of our platform architecture. All customer data in transit and at rest is protected with AES-256 encryption and validated under our annual SOC 2 Type II audit. Our availability commitment delivers 99.99% financially backed availability SLA across all tier-one availability zones.`,
    contentType: 'product_description',
    language: 'en-US',
    status: 'approved',
    creator: 'Samantha Vance (Director of Security & Compliance)',
    createdAt: '2026-10-18T10:00:00.000Z',
    updatedAt: '2026-10-20T16:00:00.000Z',
  },
];

const SEED_REVISIONS: DraftRevision[] = [
  {
    id: 'rev-q4-1',
    draftId: 'draft-q4-announcement',
    revisionNumber: 1,
    contentSnapshot: `We are thrilled to unveil Brand Guard to our global community!! Today, we are changing how companies secure brand integrity.

Unlike legacy software, our platform offers a cheap solution that anyone can configure in minutes. With over 1,000,000 customers relying on our engine every day, we provide zero downtime guaranteed across all multi-region clusters. 

Obviously, legacy approaches cannot compete with this kind of performance. Our revolutionary magic works across every marketing document, press release, and campaign to keep your team aligned. Start your trial today!!`,
    changeSummary: 'Initial draft created by product marketing.',
    createdAt: '2026-10-21T14:20:00.000Z',
    author: 'Alex Mercer',
  },
];

const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'audit-001',
    workspaceId: INITIAL_WORKSPACE_ID,
    eventType: 'workspace_created',
    resourceType: 'workspace',
    resourceId: INITIAL_WORKSPACE_ID,
    resourceTitle: 'Acme Cloud Platform',
    actor: 'System Administrator',
    details: 'Workspace provisioned with default enterprise governance profiles.',
    timestamp: '2026-09-15T08:00:00.000Z',
  },
  {
    id: 'audit-002',
    workspaceId: INITIAL_WORKSPACE_ID,
    eventType: 'rule_created',
    resourceType: 'rule',
    resourceId: 'rule-sla-guarantee',
    resourceTitle: '100% Uptime Guarantee Prohibition',
    actor: 'Legal & Risk Counsel',
    details: 'Enforced critical severity prohibition on unconditional uptime claims.',
    timestamp: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'audit-003',
    workspaceId: INITIAL_WORKSPACE_ID,
    eventType: 'reference_created',
    resourceType: 'reference',
    resourceId: 'ref-customer-metrics-2026',
    resourceTitle: 'Verified Enterprise Customer Count (Q3 2026)',
    actor: 'Investor Relations',
    details: 'Added audited quarterly customer volume reference (25,480 organizations).',
    timestamp: '2026-09-18T09:00:00.000Z',
  },
  {
    id: 'audit-004',
    workspaceId: INITIAL_WORKSPACE_ID,
    eventType: 'draft_created',
    resourceType: 'draft',
    resourceId: 'draft-q4-announcement',
    resourceTitle: 'Q4 Global Enterprise Launch Announcement',
    actor: 'Alex Mercer',
    details: 'Created marketing draft for upcoming Q4 release campaign.',
    timestamp: '2026-10-21T14:20:00.000Z',
  },
];

class StorageService {
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    this.init();
  }

  private getItem<T>(key: string, defaultValue: T): T {
    if (!this.isBrowser) return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key ${key}:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving localStorage key ${key}:`, e);
    }
  }

  public init(forceReset = false): void {
    if (!this.isBrowser) return;
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.WORKSPACES)) {
      this.setItem(STORAGE_KEYS.WORKSPACES, SEED_WORKSPACES);
      this.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, INITIAL_WORKSPACE_ID);
      this.setItem(STORAGE_KEYS.RULES, SEED_RULES);
      this.setItem(STORAGE_KEYS.REFERENCES, SEED_REFERENCES);
      this.setItem(STORAGE_KEYS.DRAFTS, SEED_DRAFTS);
      this.setItem(STORAGE_KEYS.REVISIONS, SEED_REVISIONS);
      this.setItem(STORAGE_KEYS.REVIEWS, [
        {
          id: 'rev-rec-001',
          draftId: 'draft-security-whitepaper',
          workspaceId: INITIAL_WORKSPACE_ID,
          submittedAt: '2026-10-19T09:00:00.000Z',
          submittedBy: 'Samantha Vance',
          status: 'approved',
          decisionAt: '2026-10-20T16:00:00.000Z',
          decisionBy: 'Marcus Brody (VP Governance)',
          decisionNotes: 'Verified compliant with SOC 2 disclosure standards and enterprise SLA commitments.',
          comments: [
            {
              id: 'cmt-1',
              author: 'Samantha Vance',
              role: 'Author',
              content: 'Ready for legal compliance sign-off.',
              createdAt: '2026-10-19T09:00:00.000Z',
            },
            {
              id: 'cmt-2',
              author: 'Marcus Brody',
              role: 'Reviewer',
              content: 'Confirmed audited SLA metrics. Approved for public enterprise distribution.',
              createdAt: '2026-10-20T16:00:00.000Z',
            },
          ],
        },
      ]);
      this.setItem(STORAGE_KEYS.AUDIT, SEED_AUDIT_EVENTS);
      this.setItem(STORAGE_KEYS.THEME, 'dark');

      // Pre-compute initial findings for draft-q4-announcement
      const initialRunId = `run-seed-${Date.now()}`;
      const seedFindings: Finding[] = [
        {
          id: 'find-sla-guarantee',
          analysisRunId: initialRunId,
          draftId: 'draft-q4-announcement',
          ruleId: 'rule-sla-guarantee',
          category: 'legal_policy',
          severity: 'critical',
          title: '100% Uptime Guarantee Prohibition: "zero downtime guaranteed"',
          excerpt: '...every day, we provide zero downtime guaranteed across all multi-region clu...',
          startOffset: 254,
          endOffset: 278,
          explanation: 'Prohibit claiming 100% or unconditional uptime. Official SLA is 99.99%.',
          evidenceReferenceIds: ['ref-sla-availability'],
          suggestedCorrection: '99.99% financially backed availability SLA',
          rationale: 'Legal compliance: Absolute 100% claims violate enterprise service contracts and consumer protection laws.',
          confidence: 1.0,
          confidenceLabel: 'Deterministic Match',
          status: 'open',
          createdAt: '2026-10-21T14:25:00.000Z',
        },
        {
          id: 'find-prohibited-cheap',
          analysisRunId: initialRunId,
          draftId: 'draft-q4-announcement',
          ruleId: 'rule-prohibited-cheap',
          category: 'prohibited_terminology',
          severity: 'high',
          title: 'Prohibit "Cheap" Terminology: "cheap"',
          excerpt: '...platform offers a cheap solution that anyone can c...',
          startOffset: 161,
          endOffset: 166,
          explanation: 'Avoid using "cheap" when describing products or enterprise tiers.',
          evidenceReferenceIds: [],
          suggestedCorrection: 'cost-effective',
          rationale: 'Brand perception: "Cheap" connotes substandard quality in enterprise B2B messaging.',
          confidence: 1.0,
          confidenceLabel: 'Deterministic Match',
          status: 'open',
          createdAt: '2026-10-21T14:25:00.000Z',
        },
        {
          id: 'find-brand-casing',
          analysisRunId: initialRunId,
          draftId: 'draft-q4-announcement',
          ruleId: 'rule-brand-casing',
          category: 'product_naming',
          severity: 'medium',
          title: 'Brand Name Casing & Spacing: "Brand Guard"',
          excerpt: '...thrilled to unveil Brand Guard to our global community!...',
          startOffset: 22,
          endOffset: 33,
          explanation: 'BrandGuard AI must always be written in camel-case with a space before AI.',
          evidenceReferenceIds: ['ref-naming-taxonomy'],
          suggestedCorrection: 'BrandGuard AI',
          rationale: 'Product identity: Consistent trademark styling across all market-facing copy.',
          confidence: 1.0,
          confidenceLabel: 'Deterministic Match',
          status: 'open',
          createdAt: '2026-10-21T14:25:00.000Z',
        },
        {
          id: 'find-customer-stat',
          analysisRunId: initialRunId,
          draftId: 'draft-q4-announcement',
          ruleId: 'rule-customer-stat-check',
          category: 'factual_claims',
          severity: 'high',
          title: 'Customer Metric Verification: "over 1,000,000 customers"',
          excerpt: '...minutes. With over 1,000,000 customers relying on our engine every...',
          startOffset: 198,
          endOffset: 226,
          explanation: 'Customer count claims must match verified reference numbers (25,000+ active enterprises).',
          evidenceReferenceIds: ['ref-customer-metrics-2026'],
          suggestedCorrection: 'over 25,000 enterprise organizations',
          rationale: 'Factual accuracy: Unsupported statistics risk regulatory scrutiny under advertising guidelines.',
          confidence: 0.95,
          confidenceLabel: 'Needs Verification',
          status: 'open',
          createdAt: '2026-10-21T14:25:00.000Z',
        },
        {
          id: 'find-hyperbole-magic',
          analysisRunId: initialRunId,
          draftId: 'draft-q4-announcement',
          ruleId: 'rule-hyperbole-magic',
          category: 'promotional_language',
          severity: 'low',
          title: 'Unsubstantiated Hyperbole ("Magic" / "Miracle"): "magic"',
          excerpt: '...performance. Our revolutionary magic works across every marketi...',
          startOffset: 367,
          endOffset: 372,
          explanation: 'Prohibit mystical or unscientific marketing words such as "magic" or "miracle".',
          evidenceReferenceIds: [],
          suggestedCorrection: 'automated intelligent verification',
          rationale: 'Engineering rigor: Technical enterprise buyers distrust exaggerated puffery.',
          confidence: 1.0,
          confidenceLabel: 'Deterministic Match',
          status: 'open',
          createdAt: '2026-10-21T14:25:00.000Z',
        },
      ];

      const initialRun: AnalysisRun = {
        id: initialRunId,
        draftId: 'draft-q4-announcement',
        workspaceId: INITIAL_WORKSPACE_ID,
        runAt: '2026-10-21T14:25:00.000Z',
        rulesEvaluatedCount: SEED_RULES.length,
        findingsCount: seedFindings.length,
        criticalCount: 1,
        highCount: 2,
        mediumCount: 1,
        lowCount: 1,
        informationalCount: 0,
        summary: 'Critical brand risk detected: absolute 100% SLA guarantee and unverified customer metric require resolution.',
      };

      this.setItem(STORAGE_KEYS.ANALYSES, [initialRun]);
      this.setItem(STORAGE_KEYS.FINDINGS, seedFindings);
    }
  }

  // Workspaces
  public getWorkspaces(): Workspace[] {
    return this.getItem<Workspace[]>(STORAGE_KEYS.WORKSPACES, SEED_WORKSPACES);
  }

  public getWorkspace(id: string): Workspace | undefined {
    return this.getWorkspaces().find((w) => w.id === id);
  }

  public getActiveWorkspaceId(): string {
    return this.getItem<string>(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, INITIAL_WORKSPACE_ID);
  }

  public setActiveWorkspaceId(id: string): void {
    this.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, id);
  }

  public saveWorkspace(workspace: Workspace): void {
    const list = this.getWorkspaces();
    const index = list.findIndex((w) => w.id === workspace.id);
    if (index >= 0) {
      list[index] = { ...workspace, updatedAt: new Date().toISOString() };
      this.recordAudit({
        workspaceId: workspace.id,
        eventType: 'workspace_updated',
        resourceType: 'workspace',
        resourceId: workspace.id,
        resourceTitle: workspace.name,
        actor: 'Current User',
        details: `Updated workspace profile for ${workspace.name}.`,
      });
    } else {
      list.push(workspace);
      this.recordAudit({
        workspaceId: workspace.id,
        eventType: 'workspace_created',
        resourceType: 'workspace',
        resourceId: workspace.id,
        resourceTitle: workspace.name,
        actor: 'Current User',
        details: `Created new brand workspace: ${workspace.name}.`,
      });
    }
    this.setItem(STORAGE_KEYS.WORKSPACES, list);
  }

  // Rules
  public getRules(workspaceId?: string): BrandRule[] {
    const all = this.getItem<BrandRule[]>(STORAGE_KEYS.RULES, SEED_RULES);
    return workspaceId ? all.filter((r) => r.workspaceId === workspaceId) : all;
  }

  public saveRule(rule: BrandRule): void {
    const all = this.getItem<BrandRule[]>(STORAGE_KEYS.RULES, SEED_RULES);
    const index = all.findIndex((r) => r.id === rule.id);
    if (index >= 0) {
      all[index] = { ...rule, updatedAt: new Date().toISOString() };
      this.recordAudit({
        workspaceId: rule.workspaceId,
        eventType: 'rule_updated',
        resourceType: 'rule',
        resourceId: rule.id,
        resourceTitle: rule.name,
        actor: 'Brand Steward',
        details: `Updated rule parameters and guidance for "${rule.name}".`,
      });
    } else {
      all.push(rule);
      this.recordAudit({
        workspaceId: rule.workspaceId,
        eventType: 'rule_created',
        resourceType: 'rule',
        resourceId: rule.id,
        resourceTitle: rule.name,
        actor: 'Brand Steward',
        details: `Configured new brand compliance rule: "${rule.name}" (${rule.severity}).`,
      });
    }
    this.setItem(STORAGE_KEYS.RULES, all);
  }

  public deleteRule(id: string): void {
    const all = this.getItem<BrandRule[]>(STORAGE_KEYS.RULES, SEED_RULES);
    const target = all.find((r) => r.id === id);
    if (target) {
      const filtered = all.filter((r) => r.id !== id);
      this.setItem(STORAGE_KEYS.RULES, filtered);
      this.recordAudit({
        workspaceId: target.workspaceId,
        eventType: 'rule_deleted',
        resourceType: 'rule',
        resourceId: target.id,
        resourceTitle: target.name,
        actor: 'Brand Steward',
        details: `Removed rule "${target.name}" from active governance policy.`,
      });
    }
  }

  // References
  public getReferences(workspaceId?: string): ApprovedReference[] {
    const all = this.getItem<ApprovedReference[]>(STORAGE_KEYS.REFERENCES, SEED_REFERENCES);
    return workspaceId ? all.filter((r) => r.workspaceId === workspaceId) : all;
  }

  public saveReference(ref: ApprovedReference): void {
    const all = this.getItem<ApprovedReference[]>(STORAGE_KEYS.REFERENCES, SEED_REFERENCES);
    const index = all.findIndex((r) => r.id === ref.id);
    if (index >= 0) {
      all[index] = { ...ref, updatedAt: new Date().toISOString() };
      this.recordAudit({
        workspaceId: ref.workspaceId,
        eventType: 'reference_updated',
        resourceType: 'reference',
        resourceId: ref.id,
        resourceTitle: ref.title,
        actor: 'Knowledge Custodian',
        details: `Updated verified reference data for "${ref.title}".`,
      });
    } else {
      all.push(ref);
      this.recordAudit({
        workspaceId: ref.workspaceId,
        eventType: 'reference_created',
        resourceType: 'reference',
        resourceId: ref.id,
        resourceTitle: ref.title,
        actor: 'Knowledge Custodian',
        details: `Deposited verified reference "${ref.title}" into library.`,
      });
    }
    this.setItem(STORAGE_KEYS.REFERENCES, all);
  }

  public deleteReference(id: string): void {
    const all = this.getItem<ApprovedReference[]>(STORAGE_KEYS.REFERENCES, SEED_REFERENCES);
    const target = all.find((r) => r.id === id);
    if (target) {
      const filtered = all.filter((r) => r.id !== id);
      this.setItem(STORAGE_KEYS.REFERENCES, filtered);
      this.recordAudit({
        workspaceId: target.workspaceId,
        eventType: 'reference_deleted',
        resourceType: 'reference',
        resourceId: target.id,
        resourceTitle: target.title,
        actor: 'Knowledge Custodian',
        details: `Removed reference entry "${target.title}".`,
      });
    }
  }

  // Drafts
  public getDrafts(workspaceId?: string): Draft[] {
    const all = this.getItem<Draft[]>(STORAGE_KEYS.DRAFTS, SEED_DRAFTS);
    return workspaceId ? all.filter((d) => d.workspaceId === workspaceId) : all;
  }

  public getDraft(id: string): Draft | undefined {
    return this.getDrafts().find((d) => d.id === id);
  }

  public saveDraft(draft: Draft, recordSnapshot = false, changeReason = 'Content updated'): void {
    const all = this.getItem<Draft[]>(STORAGE_KEYS.DRAFTS, SEED_DRAFTS);
    const index = all.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      all[index] = { ...draft, updatedAt: new Date().toISOString() };
      this.recordAudit({
        workspaceId: draft.workspaceId,
        eventType: 'draft_updated',
        resourceType: 'draft',
        resourceId: draft.id,
        resourceTitle: draft.title,
        actor: draft.creator || 'Content Creator',
        details: `Updated content draft "${draft.title}". Status: ${draft.status}.`,
      });
    } else {
      all.push(draft);
      this.recordAudit({
        workspaceId: draft.workspaceId,
        eventType: 'draft_created',
        resourceType: 'draft',
        resourceId: draft.id,
        resourceTitle: draft.title,
        actor: draft.creator || 'Content Creator',
        details: `Created new draft "${draft.title}".`,
      });
    }
    this.setItem(STORAGE_KEYS.DRAFTS, all);

    if (recordSnapshot) {
      this.createRevision(draft.id, draft.content, changeReason, draft.creator);
    }
  }

  public deleteDraft(id: string): void {
    const all = this.getItem<Draft[]>(STORAGE_KEYS.DRAFTS, SEED_DRAFTS);
    const target = all.find((d) => d.id === id);
    if (target) {
      const filtered = all.filter((d) => d.id !== id);
      this.setItem(STORAGE_KEYS.DRAFTS, filtered);
      this.recordAudit({
        workspaceId: target.workspaceId,
        eventType: 'draft_deleted',
        resourceType: 'draft',
        resourceId: target.id,
        resourceTitle: target.title,
        actor: 'Content Creator',
        details: `Deleted draft "${target.title}".`,
      });
    }
  }

  // Revisions
  public getRevisions(draftId: string): DraftRevision[] {
    const all = this.getItem<DraftRevision[]>(STORAGE_KEYS.REVISIONS, SEED_REVISIONS);
    return all.filter((r) => r.draftId === draftId).sort((a, b) => b.revisionNumber - a.revisionNumber);
  }

  public createRevision(draftId: string, contentSnapshot: string, changeSummary: string, author = 'Reviewer', associatedFindingId?: string): DraftRevision {
    const existing = this.getRevisions(draftId);
    const revisionNumber = existing.length > 0 ? Math.max(...existing.map((r) => r.revisionNumber)) + 1 : 1;
    const rev: DraftRevision = {
      id: `rev-${draftId}-${revisionNumber}-${Date.now()}`,
      draftId,
      revisionNumber,
      contentSnapshot,
      changeSummary,
      createdAt: new Date().toISOString(),
      author,
      associatedFindingId,
    };
    const all = this.getItem<DraftRevision[]>(STORAGE_KEYS.REVISIONS, SEED_REVISIONS);
    all.push(rev);
    this.setItem(STORAGE_KEYS.REVISIONS, all);

    const draft = this.getDraft(draftId);
    if (draft) {
      this.recordAudit({
        workspaceId: draft.workspaceId,
        eventType: 'revision_saved',
        resourceType: 'draft',
        resourceId: draftId,
        resourceTitle: draft.title,
        actor: author,
        details: `Saved revision v${revisionNumber}: ${changeSummary}`,
      });
    }
    return rev;
  }

  // Analyses & Findings
  public getAnalyses(draftId?: string): AnalysisRun[] {
    const all = this.getItem<AnalysisRun[]>(STORAGE_KEYS.ANALYSES, []);
    return draftId ? all.filter((a) => a.draftId === draftId) : all;
  }

  public saveAnalysis(analysis: AnalysisRun, findings: Finding[]): void {
    const analyses = this.getItem<AnalysisRun[]>(STORAGE_KEYS.ANALYSES, []);
    analyses.unshift(analysis);
    this.setItem(STORAGE_KEYS.ANALYSES, analyses);

    // Save findings
    const existingFindings = this.getItem<Finding[]>(STORAGE_KEYS.FINDINGS, []).filter(
      (f) => f.draftId !== analysis.draftId
    );
    this.setItem(STORAGE_KEYS.FINDINGS, [...findings, ...existingFindings]);

    // Update draft's latest analysis ID and status
    const draft = this.getDraft(analysis.draftId);
    if (draft) {
      draft.latestAnalysisId = analysis.id;
      draft.status = findings.length > 0 ? 'analysed' : 'ready_for_review';
      this.saveDraft(draft, false);

      this.recordAudit({
        workspaceId: analysis.workspaceId,
        eventType: 'analysis_run',
        resourceType: 'draft',
        resourceId: draft.id,
        resourceTitle: draft.title,
        actor: 'Analysis Engine',
        details: `Evaluated ${analysis.rulesEvaluatedCount} brand rules. Detected ${analysis.findingsCount} findings (${analysis.criticalCount} critical, ${analysis.highCount} high).`,
      });
    }
  }

  public getFindings(draftId?: string): Finding[] {
    const all = this.getItem<Finding[]>(STORAGE_KEYS.FINDINGS, []);
    return draftId ? all.filter((f) => f.draftId === draftId) : all;
  }

  public updateFinding(finding: Finding): void {
    const all = this.getItem<Finding[]>(STORAGE_KEYS.FINDINGS, []);
    const index = all.findIndex((f) => f.id === finding.id);
    if (index >= 0) {
      all[index] = finding;
      this.setItem(STORAGE_KEYS.FINDINGS, all);

      const draft = this.getDraft(finding.draftId);
      if (draft) {
        let eventType: AuditEventType = 'finding_accepted';
        if (finding.status === 'dismissed') eventType = 'finding_dismissed';
        if (finding.status === 'modified') eventType = 'finding_edited';
        if (finding.status === 'review_flagged') eventType = 'finding_flagged';

        this.recordAudit({
          workspaceId: draft.workspaceId,
          eventType,
          resourceType: 'finding',
          resourceId: finding.id,
          resourceTitle: finding.title,
          actor: 'Reviewer',
          details: `Finding "${finding.title}" marked as ${finding.status}${finding.dismissalReason ? ` (Reason: ${finding.dismissalReason})` : ''}.`,
        });
      }
    }
  }

  // Reviews
  public getReviews(workspaceId?: string): ReviewRecord[] {
    const all = this.getItem<ReviewRecord[]>(STORAGE_KEYS.REVIEWS, []);
    return workspaceId ? all.filter((r) => r.workspaceId === workspaceId) : all;
  }

  public saveReview(review: ReviewRecord): void {
    const all = this.getItem<ReviewRecord[]>(STORAGE_KEYS.REVIEWS, []);
    const index = all.findIndex((r) => r.id === review.id);
    if (index >= 0) {
      all[index] = review;
    } else {
      all.unshift(review);
    }
    this.setItem(STORAGE_KEYS.REVIEWS, all);

    const draft = this.getDraft(review.draftId);
    if (draft) {
      if (review.status === 'pending') {
        draft.status = 'in_review';
        this.saveDraft(draft, false);
        this.recordAudit({
          workspaceId: review.workspaceId,
          eventType: 'review_submitted',
          resourceType: 'review',
          resourceId: review.id,
          resourceTitle: draft.title,
          actor: review.submittedBy,
          details: `Submitted draft "${draft.title}" to human compliance queue.`,
        });
      } else if (review.status === 'approved') {
        draft.status = 'approved';
        this.saveDraft(draft, true, 'Approved by Human Reviewer');
        this.recordAudit({
          workspaceId: review.workspaceId,
          eventType: 'review_approved',
          resourceType: 'review',
          resourceId: review.id,
          resourceTitle: draft.title,
          actor: review.decisionBy || 'Review Officer',
          details: `Approved draft for publication. Notes: ${review.decisionNotes || 'Compliant with all guidelines.'}`,
        });
      } else if (review.status === 'rejected') {
        draft.status = 'rejected';
        this.saveDraft(draft, false);
        this.recordAudit({
          workspaceId: review.workspaceId,
          eventType: 'review_rejected',
          resourceType: 'review',
          resourceId: review.id,
          resourceTitle: draft.title,
          actor: review.decisionBy || 'Review Officer',
          details: `Rejected draft publication. Reason: ${review.decisionNotes || 'Unresolved compliance issues.'}`,
        });
      } else if (review.status === 'changes_requested') {
        draft.status = 'changes_required';
        this.saveDraft(draft, false);
        this.recordAudit({
          workspaceId: review.workspaceId,
          eventType: 'review_changes_requested',
          resourceType: 'review',
          resourceId: review.id,
          resourceTitle: draft.title,
          actor: review.decisionBy || 'Review Officer',
          details: `Requested revisions from author. Guidance: ${review.decisionNotes || 'Address flagged findings.'}`,
        });
      }
    }
  }

  // Audit Events
  public getAuditEvents(workspaceId?: string): AuditEvent[] {
    const all = this.getItem<AuditEvent[]>(STORAGE_KEYS.AUDIT, SEED_AUDIT_EVENTS);
    return (workspaceId ? all.filter((a) => a.workspaceId === workspaceId) : all).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public recordAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const newEvent: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const all = this.getItem<AuditEvent[]>(STORAGE_KEYS.AUDIT, SEED_AUDIT_EVENTS);
    all.unshift(newEvent);
    // Cap at 500 audit events to avoid storage overflow
    if (all.length > 500) all.length = 500;
    this.setItem(STORAGE_KEYS.AUDIT, all);
    return newEvent;
  }

  // Theme
  public getTheme(): 'dark' | 'light' | 'system' {
    return this.getItem<'dark' | 'light' | 'system'>(STORAGE_KEYS.THEME, 'dark');
  }

  public setTheme(theme: 'dark' | 'light' | 'system'): void {
    this.setItem(STORAGE_KEYS.THEME, theme);
  }

  // Export / Import
  public exportData(): string {
    const data = {
      workspaces: this.getWorkspaces(),
      rules: this.getRules(),
      references: this.getReferences(),
      drafts: this.getDrafts(),
      revisions: this.getItem<DraftRevision[]>(STORAGE_KEYS.REVISIONS, []),
      analyses: this.getItem<AnalysisRun[]>(STORAGE_KEYS.ANALYSES, []),
      findings: this.getItem<Finding[]>(STORAGE_KEYS.FINDINGS, []),
      reviews: this.getItem<ReviewRecord[]>(STORAGE_KEYS.REVIEWS, []),
      audit: this.getAuditEvents(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.workspaces && data.rules && data.drafts) {
        if (data.workspaces) this.setItem(STORAGE_KEYS.WORKSPACES, data.workspaces);
        if (data.rules) this.setItem(STORAGE_KEYS.RULES, data.rules);
        if (data.references) this.setItem(STORAGE_KEYS.REFERENCES, data.references);
        if (data.drafts) this.setItem(STORAGE_KEYS.DRAFTS, data.drafts);
        if (data.revisions) this.setItem(STORAGE_KEYS.REVISIONS, data.revisions);
        if (data.analyses) this.setItem(STORAGE_KEYS.ANALYSES, data.analyses);
        if (data.findings) this.setItem(STORAGE_KEYS.FINDINGS, data.findings);
        if (data.reviews) this.setItem(STORAGE_KEYS.REVIEWS, data.reviews);
        if (data.audit) this.setItem(STORAGE_KEYS.AUDIT, data.audit);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }
}

export const storage = new StorageService();
