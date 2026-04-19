from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    pass


def _build_engine():
    connect_args = {"check_same_thread": False} if settings.effective_database_url.startswith("sqlite") else {}
    return create_engine(settings.effective_database_url, future=True, connect_args=connect_args)


engine = _build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def init_db() -> None:
    from app.models.sql.company import Company
    from app.models.sql.document import CompanyDocument
    from app.models.sql.user import User

    Base.metadata.create_all(bind=engine)
