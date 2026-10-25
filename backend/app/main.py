from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import uuid

from app.core.config import settings
from app.database.session import engine, Base, get_db
from app.models.models import (
    Workspace,
    BrandRule,
    ApprovedReference,
    Draft,
    DraftRevision,
    AnalysisRun,
    Finding,
    ReviewRecord,
    ReviewComment,
    AuditEvent,
)
from app.schemas.schemas import (
    WorkspaceCreate,
    WorkspaceResponse,
    BrandRuleCreate,
    BrandRuleResponse,
    RuleTestRequest,
    RuleTestResponse,
    ApprovedReferenceCreate,
    ApprovedReferenceResponse,
    DraftCreate,
    DraftResponse,
    AnalysisRunRequest,
    ReviewSubmitRequest,
    ReviewDecisionRequest,
)
from app.services.analysis_engine import PythonAnalysisEngine

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Brand Governance, Content Compliance & Intelligent Review Platform",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "team": "INNOVATION NINJAS",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database": "connected",
        "engine": "deterministic_rules_active",
    }


# Workspaces
@app.get("/api/v1/workspaces", response_model=List[WorkspaceResponse], tags=["Workspaces"])
def list_workspaces(db: Session = Depends(get_db)):
    return db.query(Workspace).all()


@app.post("/api/v1/workspaces", response_model=WorkspaceResponse, status_code=201, tags=["Workspaces"])
def create_workspace(ws: WorkspaceCreate, db: Session = Depends(get_db)):
    db_ws = Workspace(
        id=ws.id or f"ws-{uuid.uuid4().hex[:8]}",
        name=ws.name,
        description=ws.description,
        brand_identity=ws.brand_identity,
        default_language=ws.default_language,
        tone_guidelines=ws.tone_guidelines,
    )
    db.add(db_ws)
    db.commit()
    db.refresh(db_ws)
    return db_ws


# Brand Rules
@app.get("/api/v1/rules", response_model=List[BrandRuleResponse], tags=["Brand Rules"])
def list_rules(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(BrandRule)
    if workspace_id:
        query = query.filter(BrandRule.workspace_id == workspace_id)
    return query.all()


@app.post("/api/v1/rules", response_model=BrandRuleResponse, status_code=201, tags=["Brand Rules"])
def create_rule(rule: BrandRuleCreate, db: Session = Depends(get_db)):
    db_rule = BrandRule(
        id=rule.id or f"rule-{uuid.uuid4().hex[:8]}",
        workspace_id=rule.workspace_id,
        name=rule.name,
        category=rule.category,
        description=rule.description,
        severity=rule.severity,
        match_pattern=rule.match_pattern,
        is_regex=rule.is_regex,
        is_case_sensitive=rule.is_case_sensitive,
        recommended_action=rule.recommended_action,
        approved_wording=rule.approved_wording,
        rationale=rule.rationale,
        is_active=rule.is_active,
    )
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@app.post("/api/v1/rules/test", response_model=RuleTestResponse, tags=["Brand Rules"])
def test_rule(req: RuleTestRequest):
    class MockRule:
        id = "mock"
        name = "Test Rule"
        category = "test"
        severity = "high"
        match_pattern = req.match_pattern
        is_regex = req.is_regex
        is_case_sensitive = req.is_case_sensitive
        description = "Test description"
        approved_wording = "[Replace]"
        rationale = "Test rationale"

    matches = PythonAnalysisEngine.evaluate_rule(MockRule, req.sample_text, "test-draft", "test-run")
    return {
        "matched": len(matches) > 0,
        "matches_count": len(matches),
        "matches": matches,
    }


# Approved References
@app.get("/api/v1/references", response_model=List[ApprovedReferenceResponse], tags=["References"])
def list_references(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ApprovedReference)
    if workspace_id:
        query = query.filter(ApprovedReference.workspace_id == workspace_id)
    return query.all()


@app.post("/api/v1/references", response_model=ApprovedReferenceResponse, status_code=201, tags=["References"])
def create_reference(ref: ApprovedReferenceCreate, db: Session = Depends(get_db)):
    db_ref = ApprovedReference(
        id=ref.id or f"ref-{uuid.uuid4().hex[:8]}",
        workspace_id=ref.workspace_id,
        title=ref.title,
        reference_type=ref.reference_type,
        content=ref.content,
        source_url=ref.source_url,
        source_description=ref.source_description,
        verification_status=ref.verification_status,
        last_verified_date=ref.last_verified_date or datetime.datetime.utcnow(),
    )
    db.add(db_ref)
    db.commit()
    db.refresh(db_ref)
    return db_ref


# Drafts
@app.get("/api/v1/drafts", response_model=List[DraftResponse], tags=["Drafts"])
def list_drafts(workspace_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Draft)
    if workspace_id:
        query = query.filter(Draft.workspace_id == workspace_id)
    return query.all()


@app.post("/api/v1/drafts", response_model=DraftResponse, status_code=201, tags=["Drafts"])
def create_draft(draft: DraftCreate, db: Session = Depends(get_db)):
    db_draft = Draft(
        id=draft.id or f"draft-{uuid.uuid4().hex[:8]}",
        workspace_id=draft.workspace_id,
        title=draft.title,
        content=draft.content,
        content_type=draft.content_type,
        language=draft.language,
        creator=draft.creator or "Author",
        status="draft",
    )
    db.add(db_draft)
    db.commit()
    db.refresh(db_draft)
    return db_draft


# Analysis
@app.post("/api/v1/analysis/run", tags=["Analysis"])
def run_analysis(req: AnalysisRunRequest, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == req.draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    rules = db.query(BrandRule).filter(
        BrandRule.workspace_id == req.workspace_id,
        BrandRule.is_active == True
    ).all()

    run_id = f"run-{uuid.uuid4().hex[:8]}"
    findings = []
    for rule in rules:
        findings.extend(PythonAnalysisEngine.evaluate_rule(rule, draft.content, draft.id, run_id))

    run = AnalysisRun(
        id=run_id,
        draft_id=draft.id,
        workspace_id=req.workspace_id,
        rules_evaluated_count=len(rules),
        findings_count=len(findings),
        critical_count=sum(1 for f in findings if f["severity"] == "critical"),
        high_count=sum(1 for f in findings if f["severity"] == "high"),
        medium_count=sum(1 for f in findings if f["severity"] == "medium"),
        low_count=sum(1 for f in findings if f["severity"] == "low"),
        summary=f"Analysis complete with {len(findings)} findings.",
    )
    db.add(run)

    for f_data in findings:
        finding = Finding(
            id=f_data["id"],
            analysis_run_id=run_id,
            draft_id=draft.id,
            rule_id=f_data["rule_id"],
            category=f_data["category"],
            severity=f_data["severity"],
            title=f_data["title"],
            excerpt=f_data["excerpt"],
            start_offset=f_data["start_offset"],
            end_offset=f_data["end_offset"],
            explanation=f_data["explanation"],
            suggested_correction=f_data["suggested_correction"],
            rationale=f_data["rationale"],
            confidence=f_data["confidence"],
            status=f_data["status"],
        )
        db.add(finding)

    draft.status = "analysed" if findings else "ready_for_review"
    draft.latest_analysis_id = run_id
    db.commit()

    return {
        "run_id": run_id,
        "rules_evaluated": len(rules),
        "findings_count": len(findings),
        "findings": findings,
    }


# Reviews
@app.post("/api/v1/reviews/submit", tags=["Reviews"])
def submit_review(req: ReviewSubmitRequest, db: Session = Depends(get_db)):
    draft = db.query(Draft).filter(Draft.id == req.draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    rev = ReviewRecord(
        id=f"rev-{uuid.uuid4().hex[:8]}",
        draft_id=draft.id,
        workspace_id=req.workspace_id,
        submitted_by=req.submitted_by,
        status="pending",
    )
    draft.status = "in_review"
    db.add(rev)
    db.commit()
    db.refresh(rev)
    return rev


@app.post("/api/v1/reviews/{review_id}/decision", tags=["Reviews"])
def record_decision(review_id: str, req: ReviewDecisionRequest, db: Session = Depends(get_db)):
    review = db.query(ReviewRecord).filter(ReviewRecord.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review record not found")

    review.status = req.decision
    review.decision_by = req.decision_by
    review.decision_notes = req.decision_notes
    review.decision_at = datetime.datetime.utcnow()

    draft = db.query(Draft).filter(Draft.id == review.draft_id).first()
    if draft:
        if req.decision == "approved":
            draft.status = "approved"
        elif req.decision == "rejected":
            draft.status = "rejected"
        elif req.decision == "changes_requested":
            draft.status = "changes_required"

    db.commit()
    return review
