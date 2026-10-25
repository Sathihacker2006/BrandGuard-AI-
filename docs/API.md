# BrandGuard AI — REST API Reference
Prefix: `/api/v1`

## Health & Diagnostics
### `GET /api/v1/health`
Returns system status, active database state, and platform version.
- **Response 200 OK:**
```json
{
  "status": "healthy",
  "platform": "BrandGuard AI",
  "version": "2.0.0-futurestack",
  "team": "INNOVATION NINJAS",
  "timestamp": "2026-10-22T09:30:00.000Z"
}
```

---

## Workspaces
- `GET /api/v1/workspaces`: List all workspaces.
- `POST /api/v1/workspaces`: Create a new workspace profile.

---

## Brand Rules
- `GET /api/v1/rules?workspaceId={id}`: List all rules configured for a workspace.
- `POST /api/v1/rules`: Create a new brand compliance rule.
- `POST /api/v1/rules/test`: Interactive rule simulator. Evaluates a rule against arbitrary test text without persisting findings.

---

## Approved References
- `GET /api/v1/references?workspaceId={id}`: Retrieve verified facts and SLA specifications.
- `POST /api/v1/references`: Deposit an audited reference into the knowledge library.

---

## Content Drafts & Analysis
- `GET /api/v1/drafts?workspaceId={id}`: List all drafts.
- `POST /api/v1/drafts`: Create a new content draft.
- `POST /api/v1/analysis/run`: Run deterministic rule scan over a draft. Returns exact start/end offsets, cited references, and suggested corrections.

---

## Human Governance & Reviews
- `POST /api/v1/reviews/submit`: Submit a draft for human compliance review.
- `POST /api/v1/reviews/{id}/decision`: Record formal sign-off (`approved`, `rejected`, `changes_requested`) with required notes.

---

## Audit & Analytics
- `GET /api/v1/audit/events`: Retrieve the chronological governance audit ledger.
- `GET /api/v1/analytics/dashboard`: Fetch computed metrics based on stored application records.
