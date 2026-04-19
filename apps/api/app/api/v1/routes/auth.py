from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_auth_service, get_current_user
from app.schemas.auth import CurrentUserRead, LoginRequest, TokenResponse
from app.services.auth_service import AuthError, AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    try:
        return await auth_service.login(payload)
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.get("/me", response_model=CurrentUserRead)
async def get_me(current_user: CurrentUserRead = Depends(get_current_user)) -> CurrentUserRead:
    return current_user
