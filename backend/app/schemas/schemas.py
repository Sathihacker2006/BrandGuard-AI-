from pydantic import BaseModel, Field
from typing import Optional, List
import datetime

class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    brand_identity: Optional[str] = None
    default_language: str = "en-US"
    tone_guidelines: Optional[str] = None

class WorkspaceCreate(WorkspaceBase):
    id: Optional[str] = None

class WorkspaceResponse(WorkspaceBase):
    id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class BrandRuleBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: str
    description: str
    severity: str
    match_pattern: str
    is_regex: bool = False
    is_case_sensitive: bool = False
    recommended_action: Optional[str] = None
    approved_wording: Optional[str] = None
    rationale: str
    is_active: bool = True

class BrandRuleCreate(BrandRuleBase):
    id: Optional[str] = None
    workspace_id: str

class BrandRuleResponse(BrandRuleBase):
    id: str
    workspace_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class RuleTestRequest(BaseModel):
    match_pattern: str
    is_regex: bool = False
    is_case_sensitive: bool = False
    sample_text: str

class RuleTestResponse(BaseModel):
    matched: bool
    matches_count: int
    matches: List[dict]


class ApprovedReferenceBase(BaseModel):
    title: str
    reference_type: str
    content: str
    source_url: Optional[str] = None
    source_description: str
    verification_status: str = "verified"
    last_verified_date: Optional[datetime.datetime] = None

class ApprovedReferenceCreate(ApprovedReferenceBase):
    id: Optional[str] = None
    workspace_id: str

class ApprovedReferenceResponse(ApprovedReferenceBase):
    id: str
    workspace_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class DraftBase(BaseModel):
    title: str
    content: str = ""
    content_type: str = "marketing_copy"
    language: str = "en-US"

class DraftCreate(DraftBase):
    id: Optional[str] = None
    workspace_id: str
    creator: Optional[str] = "Author"

class DraftResponse(DraftBase):
    id: str
    workspace_id: str
    status: str
    creator: str
    latest_analysis_id: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class AnalysisRunRequest(BaseModel):
    draft_id: str
    workspace_id: str

class FindingResponse(BaseModel):
    id: str
    analysis_run_id: str
    draft_id: str
    rule_id: Optional[str] = None
    category: str
    severity: str
    title: str
    excerpt: str
    start_offset: int
    end_offset: int
    explanation: str
    suggested_correction: Optional[str] = None
    rationale: str
    confidence: float
    status: str

    class Config:
        from_attributes = True


class AnalysisRunResponse(BaseModel):
    id: str
    draft_id: str
    workspace_id: str
    run_at: datetime.datetime
    rules_evaluated_count: int
    findings_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    findings: List[FindingResponse] = []


class ReviewSubmitRequest(BaseModel):
    draft_id: str
    workspace_id: str
    submitted_by: str

class ReviewDecisionRequest(BaseModel):
    decision: str  # approved, rejected, changes_requested
    decision_by: str
    decision_notes: Optional[str] = None
