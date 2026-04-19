from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class CompanyProfileBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    legal_form: str | None = Field(default=None, max_length=50)
    npwp: str | None = Field(default=None, max_length=30)
    nib: str | None = Field(default=None, max_length=30)
    address: str | None = None
    city: str | None = Field(default=None, max_length=100)
    province: str | None = Field(default=None, max_length=100)
    modal_dasar: float | None = Field(default=None, ge=0)
    modal_disetor: float | None = Field(default=None, ge=0)
    kbli_codes: list[str] = Field(default_factory=list)


class CompanyProfileUpsert(CompanyProfileBase):
    pass


class CompanyProfileRead(CompanyProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime

