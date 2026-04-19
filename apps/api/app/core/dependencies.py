from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.repositories.company_repository import CompanyRepository
from app.repositories.document_repository import CompanyDocumentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import CurrentUserRead
from app.services.auth_service import AuthError, AuthService, build_auth_service
from app.services.company_service import CompanyService
from app.services.document_service import CompanyDocumentService
from app.services.document_storage import DocumentStorageService
from app.services.llm_gateway import LLMGateway, build_llm_gateway

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_company_service(session: Session = Depends(get_db_session)) -> CompanyService:
    repository = CompanyRepository(session)
    return CompanyService(repository)


def get_document_service(session: Session = Depends(get_db_session)) -> CompanyDocumentService:
    repository = CompanyDocumentRepository(session)
    storage = DocumentStorageService()
    return CompanyDocumentService(repository, storage)


def get_auth_service(session: Session = Depends(get_db_session)) -> AuthService:
    repository = UserRepository(session)
    return build_auth_service(repository)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> CurrentUserRead:
    try:
        return await auth_service.get_current_user(token)
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


def get_llm_gateway() -> LLMGateway:
    return build_llm_gateway()
