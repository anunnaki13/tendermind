from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sql.draft import DraftRecord


class DraftRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, payload: dict[str, object]) -> DraftRecord:
        item = DraftRecord(**payload)
        self.session.add(item)
        self.session.commit()
        self.session.refresh(item)
        return item

    def list_recent(self, limit: int = 12) -> list[DraftRecord]:
        statement = select(DraftRecord).order_by(DraftRecord.created_at.desc(), DraftRecord.id.desc()).limit(limit)
        return list(self.session.execute(statement).scalars())

    def get_by_id(self, draft_id: int) -> DraftRecord | None:
        return self.session.get(DraftRecord, draft_id)
