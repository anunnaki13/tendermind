from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.repositories.company_repository import CompanyRepository
from app.services.company_service import CompanyService
from app.services.llm_gateway import LLMGateway, build_llm_gateway


def get_company_service(session: Session = Depends(get_db_session)) -> CompanyService:
    repository = CompanyRepository(session)
    return CompanyService(repository)


def get_llm_gateway() -> LLMGateway:
    return build_llm_gateway()
