# BrandGuard AI — System Architecture Document
**Team:** INNOVATION NINJAS | **Hackathon:** FutureStack — Round 2

## 1. Architectural Philosophy
BrandGuard AI operates on three core principles:
1. **Explainability over Black Boxes:** Violations must provide exact text offsets, underlying rules, and cited references.
2. **Deterministic-First:** Hard compliance requirements (legal SLA promises, trademark casing, prohibited terminology) are verified via deterministic rules rather than variable LLM prompts.
3. **Accountable Human Governance:** Content cannot be silently approved or published. Decisions are explicitly signed off and logged in an immutable audit ledger.

---

## 2. Component Architecture Diagram

```
                                  +-------------------------------------+
                                  |     BrandGuard AI Client (React)    |
                                  +-------------------------------------+
                                         |                       |
                                  State & Context          Command & REST
                                         |                       |
                  +--------------------------------+             |
                  |       Review Studio (3-Panel)  |             |
                  |  - Findings Nav (Left)         |             |
                  |  - Live Editor (Center)        |             |
                  |  - Explainable Inspector (R)   |             |
                  +--------------------------------+             |
                                         |                       |
                                         v                       v
      +--------------------------------------------------------------------------+
      |               BrandGuard AI Full-Stack REST API (server.ts)              |
      |                                                                          |
      |   /api/v1/workspaces   /api/v1/rules    /api/v1/references   /api/v1/drafts|
      |   /api/v1/analysis     /api/v1/reviews  /api/v1/audit        /api/v1/health|
      +--------------------------------------------------------------------------+
                                  |                       |
                     Deterministic Engine           Storage Layer
                                  |                       |
                                  v                       v
                  +-----------------------+     +--------------------+
                  | Analysis & Offset Calc|     | Persistent DB /    |
                  |   - Exact Regex       |     | Audit Event Ledger |
                  |   - Claim Fact Check  |     +--------------------+
                  +-----------------------+
```

---

## 3. Data Models & Entity Relationships

1. **Workspace:** Defines tenant perimeter, brand voice, and default language.
2. **BrandRule:** Stores category, severity, match pattern (regex/phrase), approved replacement wording, and governance rationale.
3. **ApprovedReference:** Trusted facts, customer counts, and SLA metrics used for claim verification.
4. **Draft:** Content asset with status machine (`draft`, `analysed`, `in_review`, `approved`, `rejected`, `changes_required`).
5. **DraftRevision:** Immutable snapshot preserving text before and after corrections, change summaries, and authors.
6. **AnalysisRun & Finding:** Structured findings linked to rules, references, and exact start/end character offsets.
7. **ReviewRecord & Comment:** Formal approval queue with review decisions and auditable feedback.
8. **AuditEvent:** Tamper-evident log of all system mutations.
