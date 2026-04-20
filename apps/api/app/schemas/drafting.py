from datetime import datetime

from pydantic import BaseModel, Field


class DraftGenerateRequest(BaseModel):
    document_type: str = Field(default="Executive Summary", min_length=3, max_length=120)
    tender_title: str = Field(..., min_length=5, max_length=255)
    tender_agency: str = Field(..., min_length=3, max_length=255)
    scope_of_work: str = Field(..., min_length=20, max_length=5000)
    evaluation_focus: str | None = Field(default=None, max_length=1000)
    notes: str | None = Field(default=None, max_length=3000)
    tone: str = Field(default="formal-professional", min_length=3, max_length=60)
    max_tokens: int = Field(default=1200, ge=300, le=3000)


class DraftGenerateResponse(BaseModel):
    draft_id: int
    model: str
    content: str
    supporting_documents: list[str]
    company_name: str | None = None
    created_at: datetime
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None


class DraftHistoryItem(BaseModel):
    id: int
    document_type: str
    tender_title: str
    tender_agency: str
    tone: str
    model_name: str
    supporting_documents: list[str]
    created_by_email: str
    created_at: datetime
    total_tokens: int | None = None
    content_preview: str


class DraftHistoryResponse(BaseModel):
    items: list[DraftHistoryItem]
