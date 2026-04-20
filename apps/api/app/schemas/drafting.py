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
    model: str
    content: str
    supporting_documents: list[str]
    company_name: str | None = None
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None
