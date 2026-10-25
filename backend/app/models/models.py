import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    brand_identity = Column(Text, nullable=True)
    default_language = Column(String(16), default="en-US")
    tone_guidelines = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    rules = relationship("BrandRule", back_populates="workspace", cascade="all, delete-orphan")
    references = relationship("ApprovedReference", back_populates="workspace", cascade="all, delete-orphan")
    drafts = relationship("Draft", back_populates="workspace", cascade="all, delete-orphan")


class BrandRule(Base):
    __tablename__ = "brand_rules"

    id = Column(String(64), primary_key=True, index=True)
    workspace_id = Column(String(64), ForeignKey("workspaces.id"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(32), nullable=False)  # critical, high, medium, low, informational
    match_pattern = Column(Text, nullable=False)
    is_regex = Column(Boolean, default=False)
    is_case_sensitive = Column(Boolean, default=False)
    recommended_action = Column(Text, nullable=True)
    approved_wording = Column(Text, nullable=True)
    rationale = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="rules")


class ApprovedReference(Base):
    __tablename__ = "approved_references"

    id = Column(String(64), primary_key=True, index=True)
    workspace_id = Column(String(64), ForeignKey("workspaces.id"), nullable=False)
    title = Column(String(255), nullable=False)
    reference_type = Column(String(64), nullable=False)
    content = Column(Text, nullable=False)
    source_url = Column(String(512), nullable=True)
    source_description = Column(Text, nullable=False)
    verification_status = Column(String(32), default="verified")
    last_verified_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="references")


class Draft(Base):
    __tablename__ = "drafts"

    id = Column(String(64), primary_key=True, index=True)
    workspace_id = Column(String(64), ForeignKey("workspaces.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, default="")
    content_type = Column(String(64), default="marketing_copy")
    language = Column(String(16), default="en-US")
    status = Column(String(32), default="draft")  # draft, analysed, in_review, approved, rejected, changes_required
    creator = Column(String(128), default="Author")
    latest_analysis_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    workspace = relationship("Workspace", back_populates="drafts")
    revisions = relationship("DraftRevision", back_populates="draft", cascade="all, delete-orphan")


class DraftRevision(Base):
    __tablename__ = "draft_revisions"

    id = Column(String(64), primary_key=True, index=True)
    draft_id = Column(String(64), ForeignKey("drafts.id"), nullable=False)
    revision_number = Column(Integer, nullable=False)
    content_snapshot = Column(Text, nullable=False)
    change_summary = Column(Text, nullable=False)
    author = Column(String(128), default="Author")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    draft = relationship("Draft", back_populates="revisions")


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String(64), primary_key=True, index=True)
    draft_id = Column(String(64), ForeignKey("drafts.id"), nullable=False)
    workspace_id = Column(String(64), ForeignKey("workspaces.id"), nullable=False)
    run_at = Column(DateTime, default=datetime.datetime.utcnow)
    rules_evaluated_count = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    informational_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(64), primary_key=True, index=True)
    analysis_run_id = Column(String(64), ForeignKey("analysis_runs.id"), nullable=False)
    draft_id = Column(String(64), ForeignKey("drafts.id"), nullable=False)
    rule_id = Column(String(64), nullable=True)
    category = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False)
    title = Column(String(255), nullable=False)
    excerpt = Column(Text, nullable=False)
    start_offset = Column(Integer, nullable=False)
    end_offset = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    suggested_correction = Column(Text, nullable=True)
    rationale = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    status = Column(String(32), default="open")  # open, accepted, modified, dismissed, review_flagged
    dismissal_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class ReviewRecord(Base):
    __tablename__ = "review_records"

    id = Column(String(64), primary_key=True, index=True)
    draft_id = Column(String(64), ForeignKey("drafts.id"), nullable=False)
    workspace_id = Column(String(64), ForeignKey("workspaces.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    submitted_by = Column(String(128), nullable=False)
    status = Column(String(32), default="pending")  # pending, approved, rejected, changes_requested
    decision_at = Column(DateTime, nullable=True)
    decision_by = Column(String(128), nullable=True)
    decision_notes = Column(Text, nullable=True)


class ReviewComment(Base):
    __tablename__ = "review_comments"

    id = Column(String(64), primary_key=True, index=True)
    review_id = Column(String(64), ForeignKey("review_records.id"), nullable=False)
    author = Column(String(128), nullable=False)
    role = Column(String(64), default="Reviewer")
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, index=True)
    workspace_id = Column(String(64), nullable=False)
    event_type = Column(String(64), nullable=False)
    resource_type = Column(String(32), nullable=False)
    resource_id = Column(String(64), nullable=False)
    resource_title = Column(String(255), nullable=False)
    actor = Column(String(128), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
