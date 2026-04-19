from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sql.user import User


class UserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return self.session.execute(statement).scalar_one_or_none()

    def create(self, payload: dict[str, object]) -> User:
        user = User(**payload)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
