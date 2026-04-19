from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class CompanyDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    notes: str | None = None
    original_filename: str
    mime_type: str | None = None
    size_bytes: int
    expires_at: date | None = None
    created_at: datetime
    updated_at: datetime
    status: str
    days_until_expiry: int | None = None


class CompanyDocumentSummary(BaseModel):
    total_documents: int
    expiring_soon: int
    expired: int


class CompanyDocumentListResponse(BaseModel):
    summary: CompanyDocumentSummary
    items: list[CompanyDocumentRead]


class CompanyDocumentDeleteResponse(BaseModel):
    success: bool = True
