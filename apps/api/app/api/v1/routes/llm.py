from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_llm_gateway
from app.schemas.llm import LLMProviderStatus, LLMTestRequest, LLMTestResponse
from app.services.llm_gateway import LLMGateway, LLMGatewayError

router = APIRouter()


@router.get("/status", response_model=LLMProviderStatus)
async def get_llm_status(gateway: LLMGateway = Depends(get_llm_gateway)) -> LLMProviderStatus:
    return gateway.get_status()


@router.post("/test", response_model=LLMTestResponse)
async def test_llm_prompt(
    payload: LLMTestRequest,
    gateway: LLMGateway = Depends(get_llm_gateway),
) -> LLMTestResponse:
    try:
        return await gateway.send_test_prompt(payload)
    except LLMGatewayError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
