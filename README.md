# BrandGuard AI
> **Smarter Content. Stronger Brands.**  
> **Team:** INNOVATION NINJAS | **Hackathon:** FutureStack — Round 2

BrandGuard AI is an intelligent brand governance and content compliance platform that helps marketing teams, content creators, reviewers, and compliance officers ensure published content strictly adheres to approved brand guidelines, factual metrics, SLA disclosures, and accessibility standards.

---

## 🌟 Key Features

1. **Deterministic Rules Analysis Engine**
   - Precise regex and word-boundary scanning for prohibited terms, mandatory phrasing, tone adverbs, and formatting rules.
   - Exact character start and end offset tracking.
   - Transparent confidence calibration (no decorative or unexplained AI scores).

2. **Approved Reference Library**
   - Central repository of verified corporate facts, customer volume statistics, and SLA specifications (e.g. SEC 10-Q filings, AICPA SOC 2 Type II audit reports).
   - Cross-references draft claims directly against verified evidence.

3. **Signature 3-Panel Content Review Studio**
   - **Left Panel:** Categorized findings tree with severity filters (Critical, High, Medium, Low, Informational).
   - **Center Panel:** Live text editor with word/char counters and rescan capabilities.
   - **Right Panel:** Explainable findings inspector with evidence citations, 1-click **Accept Correction**, **Custom Edit**, **Dismiss with Reason**, and **Flag for Review**.

4. **Human Review & Approval Gateway**
   - Enforces a strict state machine: `Draft` → `Analysed` → `In Review` → `Approved` / `Rejected` / `Changes Required`.
   - BrandGuard AI never silently alters or publishes copy without human sign-off.

5. **Revision History & Word-Level Diff Viewer**
   - Tracks every revision snapshot with visual word-level diffs (`+additions` / `-removals`).

6. **Governance Analytics & Self-Improving Guidelines**
   - Interactive Recharts visualizations: findings by severity, category distribution, and top rule triggers.
   - Self-improving guideline intelligence identifies confusing rules and proposes clarifications for human brand stewards.

7. **Immutable Audit Ledger**
   - Permanent chronological event log tracking workspace changes, rule updates, scans, correction approvals, and review decisions.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Vite
- **Full-Stack Runtime:** Express.js + Vite middleware running on port 3000
- **Backend Architecture:** Python 3.10, FastAPI, Pydantic, SQLAlchemy, SQLite/PostgreSQL
- **Testing:** Python `unittest` suite + TypeScript strict type-checking (`tsc --noEmit`)

---

## 🚀 Quick Start

### 1. Web Application & Full-Stack API (AI Studio / Local)
```bash
# Install dependencies
npm install

# Start full-stack server (Frontend + Live REST API)
npm run dev

# Run TypeScript verification
npm run lint

# Build production bundle
npm run build
```

### 2. Python Backend & Automated Tests
```bash
# Run backend test suite
PYTHONPATH=backend python3 -m unittest discover -s backend/tests
```

---

## 📁 Repository Structure

```text
BrandGuardAI/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point & REST endpoints
│   │   ├── core/config.py     # Environment configuration
│   │   ├── models/models.py   # SQLAlchemy database entities
│   │   ├── schemas/schemas.py # Pydantic request/response validation
│   │   ├── services/          # Analysis engine & business logic
│   │   └── database/          # SQLite / Postgres session manager
│   ├── tests/test_api.py      # Automated unit tests
│   ├── requirements.txt       # Python dependencies
│   └── .env.example
├── src/
│   ├── components/            # Top bar, sidebar, command palette, diff viewer
│   ├── context/               # React AppContext state & actions
│   ├── pages/                 # 12 platform views & product tour
│   ├── services/              # Analysis engine, storage, Gemini AI
│   └── types/                 # Strict TypeScript domain interfaces
├── docs/                      # Comprehensive hackathon documentation
├── server.ts                  # Full-stack Express REST API entry point
└── package.json
```

---

## 🏆 FutureStack Round 2 Checklist & Judging

- **Working Core Workflow:** Complete end-to-end flow verified (Create Workspace → Rule → Draft → Scan → Accept Correction → Save Revision → Submit Review → Record Decision).
- **Technical Depth:** Deterministic offset engine, real persistent data, immutable audit logging, and automated tests.
- **Progress from Round 1:** Real data structures replacing mock placeholders, grounded reference library, and human approval gateway.
- **Round 3 Roadmap:** Evidence-grounded graph, multi-reviewer matrix RBAC, and self-calibrating policy engine.
