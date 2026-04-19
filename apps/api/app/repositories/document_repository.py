from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sql.document import CompanyDocument


class CompanyDocumentRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_all(self) -> list[CompanyDocument]:
        statement = select(CompanyDocument).order_by(CompanyDocument.created_at.desc(), CompanyDocument.id.desc())
        return list(self.session.execute(statement).scalars())

    def get_by_id(self, document_id: int) -> CompanyDocument | None:
        return self.session.get(CompanyDocument, document_id)

    def create(self, payload: dict[str, object]) -> CompanyDocument:
        document = CompanyDocument(**payload)
        self.session.add(document)
        self.session.commit()
        self.session.refresh(document)
        return document

    def delete(self, document: CompanyDocument) -> None:
        self.session.delete(document)
        self.session.commit()
