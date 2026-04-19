from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.repositories.company_repository import CompanyRepository
from app.repositories.document_repository import CompanyDocumentRepository
from app.services.company_service import CompanyService
from app.services.document_service import CompanyDocumentService
from app.services.document_storage import DocumentStorageService
from app.services.llm_gateway import LLMGateway, build_llm_gateway


def get_company_service(session: Session = Depends(get_db_session)) -> CompanyService:
    repository = CompanyRepository(session)
    return CompanyService(repository)


def get_document_service(session: Session = Depends(get_db_session)) -> CompanyDocumentService:
    repository = CompanyDocumentRepository(session)
    storage = DocumentStorageService()
    return CompanyDocumentService(repository, storage)


def get_llm_gateway() -> LLMGateway:
    return build_llm_gateway()
