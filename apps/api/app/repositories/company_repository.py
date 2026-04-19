from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sql.company import Company


class CompanyRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_singleton(self) -> Company | None:
        statement = select(Company).order_by(Company.id.asc()).limit(1)
        return self.session.execute(statement).scalar_one_or_none()

    def create(self, payload: dict[str, object]) -> Company:
        company = Company(**payload)
        self.session.add(company)
        self.session.commit()
        self.session.refresh(company)
        return company

    def update(self, company: Company, payload: dict[str, object]) -> Company:
        for field, value in payload.items():
            setattr(company, field, value)
        self.session.add(company)
        self.session.commit()
        self.session.refresh(company)
        return company

