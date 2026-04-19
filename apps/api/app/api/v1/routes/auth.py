from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_auth_service, get_current_user
from app.schemas.auth import ChangePasswordRequest, ChangePasswordResponse, CurrentUserRead, LoginRequest, TokenResponse
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


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUserRead = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
) -> ChangePasswordResponse:
    try:
        return await auth_service.change_password(
            current_user_email=current_user.email,
            current_password=payload.current_password,
            new_password=payload.new_password,
        )
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
