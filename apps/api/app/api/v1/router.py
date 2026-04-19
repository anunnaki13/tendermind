from fastapi import APIRouter

from app.api.v1.routes import auth, company, documents, health, llm

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(company.router, prefix="/company", tags=["company"])
api_router.include_router(documents.router, prefix="/company/documents", tags=["documents"])
api_router.include_router(llm.router, prefix="/llm", tags=["llm"])
