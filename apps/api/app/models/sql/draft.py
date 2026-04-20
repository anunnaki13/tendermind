from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DraftRecord(Base):
    __tablename__ = "draft_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    document_type: Mapped[str] = mapped_column(String(120), nullable=False)
    tender_title: Mapped[str] = mapped_column(String(255), nullable=False)
    tender_agency: Mapped[str] = mapped_column(String(255), nullable=False)
    scope_of_work: Mapped[str] = mapped_column(Text, nullable=False)
    evaluation_focus: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    tone: Mapped[str] = mapped_column(String(60), nullable=False, default="formal-professional")
    model_name: Mapped[str] = mapped_column(String(120), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)
    total_tokens: Mapped[int | None] = mapped_column(Integer)
    supporting_documents: Mapped[str] = mapped_column(Text, default="")
    created_by_email: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
