from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user, get_drafting_service
from app.schemas.auth import CurrentUserRead
from app.schemas.drafting import DraftGenerateRequest, DraftGenerateResponse, DraftHistoryResponse
from app.services.drafting_service import DraftingService
from app.services.llm_gateway import LLMGatewayError

router = APIRouter()


@router.post("/generate", response_model=DraftGenerateResponse)
async def generate_draft(
    payload: DraftGenerateRequest,
    current_user: CurrentUserRead = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service),
) -> DraftGenerateResponse:
    try:
        return await service.generate_draft(payload, current_user.email)
    except LLMGatewayError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/history", response_model=DraftHistoryResponse)
async def get_draft_history(
    _: CurrentUserRead = Depends(get_current_user),
    service: DraftingService = Depends(get_drafting_service),
) -> DraftHistoryResponse:
    return await service.list_history()
