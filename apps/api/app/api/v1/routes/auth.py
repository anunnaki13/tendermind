from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login(payload: LoginRequest) -> dict[str, str]:
    return {
        "access_token": "phase-1-placeholder-token",
        "token_type": "bearer",
        "user_email": payload.email,
    }

