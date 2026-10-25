import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory backend data store for the full-stack REST API
const initialWorkspace = {
  id: 'ws-acme-cloud',
  name: 'Acme Cloud Platform',
  description: 'Enterprise cloud infrastructure, security, and developer productivity solutions.',
  brandIdentity: 'Authoritative, precise, enterprise-ready, transparent, and empathetic.',
  defaultLanguage: 'en-US',
  toneGuidelines: 'Professional and empowering. Avoid unverified hyperbole, colloquialisms, and condescending adverbs.',
  createdAt: '2026-09-15T08:00:00.000Z',
  updatedAt: '2026-10-20T14:30:00.000Z',
};

let db = {
  workspaces: [
    initialWorkspace,
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
  ],
  rules: [
    {
      id: 'rule-sla-guarantee',
      workspaceId: 'ws-acme-cloud',
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
      workspaceId: 'ws-acme-cloud',
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
      workspaceId: 'ws-acme-cloud',
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
      id: 'rule-customer-stat-check',
      workspaceId: 'ws-acme-cloud',
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
  ],
  references: [
    {
      id: 'ref-customer-metrics-2026',
      workspaceId: 'ws-acme-cloud',
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
      workspaceId: 'ws-acme-cloud',
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
  ],
  drafts: [
    {
      id: 'draft-q4-announcement',
      workspaceId: 'ws-acme-cloud',
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
  ],
  revisions: [
    {
      id: 'rev-q4-1',
      draftId: 'draft-q4-announcement',
      revisionNumber: 1,
      contentSnapshot: `We are thrilled to unveil Brand Guard to our global community!!`,
      changeSummary: 'Initial draft created by product marketing.',
      createdAt: '2026-10-21T14:20:00.000Z',
      author: 'Alex Mercer',
    },
  ],
  analyses: [] as any[],
  findings: [] as any[],
  reviews: [] as any[],
  auditEvents: [
    {
      id: 'audit-001',
      workspaceId: 'ws-acme-cloud',
      eventType: 'workspace_created',
      resourceType: 'workspace',
      resourceId: 'ws-acme-cloud',
      resourceTitle: 'Acme Cloud Platform',
      actor: 'System Administrator',
      details: 'Workspace provisioned with default enterprise governance profiles.',
      timestamp: '2026-09-15T08:00:00.000Z',
    },
  ],
};

function recordAudit(evt: {
  workspaceId: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  resourceTitle: string;
  actor: string;
  details: string;
}) {
  const newEvt = {
    ...evt,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  db.auditEvents.unshift(newEvt);
  return newEvt;
}

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // CORS Headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // REST API: Health Check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      platform: 'BrandGuard AI',
      version: '2.0.0-futurestack',
      team: 'INNOVATION NINJAS',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      services: {
        analysisEngine: 'active',
        storage: 'sqlite_inmemory_ready',
        governanceAudit: 'immutable_active',
      },
    });
  });

  // REST API: Workspaces
  app.get('/api/v1/workspaces', (req: Request, res: Response) => {
    res.json(db.workspaces);
  });

  app.post('/api/v1/workspaces', (req: Request, res: Response) => {
    const ws = {
      ...req.body,
      id: req.body.id || `ws-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.workspaces.push(ws);
    recordAudit({
      workspaceId: ws.id,
      eventType: 'workspace_created',
      resourceType: 'workspace',
      resourceId: ws.id,
      resourceTitle: ws.name,
      actor: 'API Client',
      details: `Created workspace "${ws.name}".`,
    });
    res.status(201).json(ws);
  });

  // REST API: Brand Rules
  app.get('/api/v1/rules', (req: Request, res: Response) => {
    const { workspaceId } = req.query;
    const rules = workspaceId
      ? db.rules.filter((r) => r.workspaceId === workspaceId)
      : db.rules;
    res.json(rules);
  });

  app.post('/api/v1/rules', (req: Request, res: Response) => {
    const rule = {
      ...req.body,
      id: req.body.id || `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.rules.push(rule);
    recordAudit({
      workspaceId: rule.workspaceId,
      eventType: 'rule_created',
      resourceType: 'rule',
      resourceId: rule.id,
      resourceTitle: rule.name,
      actor: 'Brand Steward',
      details: `Configured new rule "${rule.name}" (${rule.severity}).`,
    });
    res.status(201).json(rule);
  });

  app.post('/api/v1/rules/test', (req: Request, res: Response) => {
    const { rule, sampleText } = req.body;
    if (!rule || !sampleText) {
      res.status(400).json({ error: 'rule and sampleText are required' });
      return;
    }
    const flags = rule.isCaseSensitive ? 'g' : 'gi';
    const regex = rule.isRegex
      ? new RegExp(rule.matchPattern, flags)
      : new RegExp(`\\b${rule.matchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, flags);

    const matches: any[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(sampleText)) !== null) {
      matches.push({
        matchedText: match[0],
        index: match.index,
        suggestedCorrection: rule.approvedWording || '[Remove]',
      });
      if (regex.lastIndex === match.index) regex.lastIndex++;
    }
    res.json({ matches, count: matches.length });
  });

  // REST API: Approved References
  app.get('/api/v1/references', (req: Request, res: Response) => {
    const { workspaceId } = req.query;
    const refs = workspaceId
      ? db.references.filter((r) => r.workspaceId === workspaceId)
      : db.references;
    res.json(refs);
  });

  app.post('/api/v1/references', (req: Request, res: Response) => {
    const ref = {
      ...req.body,
      id: req.body.id || `ref-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.references.push(ref);
    res.status(201).json(ref);
  });

  // REST API: Drafts
  app.get('/api/v1/drafts', (req: Request, res: Response) => {
    const { workspaceId } = req.query;
    const drafts = workspaceId
      ? db.drafts.filter((d) => d.workspaceId === workspaceId)
      : db.drafts;
    res.json(drafts);
  });

  app.post('/api/v1/drafts', (req: Request, res: Response) => {
    const draft = {
      ...req.body,
      id: req.body.id || `draft-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.drafts.push(draft);
    res.status(201).json(draft);
  });

  // REST API: Run Deterministic Analysis
  app.post('/api/v1/analysis/run', (req: Request, res: Response) => {
    const { draftId, workspaceId } = req.body;
    const draft = db.drafts.find((d) => d.id === draftId);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }

    const rules = db.rules.filter((r) => r.workspaceId === (workspaceId || draft.workspaceId) && r.isActive);
    const content = draft.content || '';
    const runId = `run-${draftId}-${Date.now()}`;
    const findings: any[] = [];

    for (const rule of rules) {
      try {
        const flags = rule.isCaseSensitive ? 'g' : 'gi';
        const regex = rule.isRegex
          ? new RegExp(rule.matchPattern, flags)
          : new RegExp(`\\b${rule.matchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, flags);

        let match: RegExpExecArray | null;
        while ((match = regex.exec(content)) !== null) {
          const start = match.index;
          const end = start + match[0].length;
          findings.push({
            id: `find-${rule.id}-${start}-${Date.now()}`,
            analysisRunId: runId,
            draftId,
            ruleId: rule.id,
            category: rule.category,
            severity: rule.severity,
            title: `${rule.name}: "${match[0]}"`,
            excerpt: content.substring(Math.max(0, start - 25), Math.min(content.length, end + 25)),
            startOffset: start,
            endOffset: end,
            explanation: rule.description,
            suggestedCorrection: rule.approvedWording || '',
            rationale: rule.rationale,
            confidence: 1.0,
            confidenceLabel: 'Deterministic Match',
            status: 'open',
            createdAt: new Date().toISOString(),
          });
          if (regex.lastIndex === match.index) regex.lastIndex++;
        }
      } catch (e) {
        console.warn(`Rule evaluation error: ${rule.name}`, e);
      }
    }

    const run = {
      id: runId,
      draftId,
      workspaceId: draft.workspaceId,
      runAt: new Date().toISOString(),
      rulesEvaluatedCount: rules.length,
      findingsCount: findings.length,
      criticalCount: findings.filter((f) => f.severity === 'critical').length,
      highCount: findings.filter((f) => f.severity === 'high').length,
      mediumCount: findings.filter((f) => f.severity === 'medium').length,
      lowCount: findings.filter((f) => f.severity === 'low').length,
      informationalCount: findings.filter((f) => f.severity === 'informational').length,
    };

    db.analyses.unshift(run);
    db.findings = [...findings, ...db.findings.filter((f) => f.draftId !== draftId)];

    recordAudit({
      workspaceId: draft.workspaceId,
      eventType: 'analysis_run',
      resourceType: 'draft',
      resourceId: draft.id,
      resourceTitle: draft.title,
      actor: 'Analysis Engine',
      details: `Evaluated ${rules.length} rules, detected ${findings.length} findings.`,
    });

    res.json({ run, findings });
  });

  // REST API: Audit Events
  app.get('/api/v1/audit/events', (req: Request, res: Response) => {
    res.json(db.auditEvents);
  });

  // REST API: Governance Analytics Summary
  app.get('/api/v1/analytics/dashboard', (req: Request, res: Response) => {
    res.json({
      totalDrafts: db.drafts.length,
      totalRules: db.rules.length,
      totalAnalyses: db.analyses.length,
      totalFindings: db.findings.length,
      openFindings: db.findings.filter((f) => f.status === 'open').length,
      reviewsCount: db.reviews.length,
      auditEventsCount: db.auditEvents.length,
    });
  });

  // Mount Vite development middlewares in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`BrandGuard AI Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
