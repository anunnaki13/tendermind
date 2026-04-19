from fastapi import APIRouter, Depends

from app.core.dependencies import get_company_service
from app.schemas.company import CompanyProfileRead, CompanyProfileUpsert
from app.services.company_service import CompanyService

router = APIRouter()


@router.get("/profile", response_model=CompanyProfileRead)
async def get_company_profile(service: CompanyService = Depends(get_company_service)) -> CompanyProfileRead:
    return await service.get_profile()


@router.put("/profile", response_model=CompanyProfileRead)
async def update_company_profile(
    payload: CompanyProfileUpsert,
    service: CompanyService = Depends(get_company_service),
) -> CompanyProfileRead:
    return await service.upsert_profile(payload)
