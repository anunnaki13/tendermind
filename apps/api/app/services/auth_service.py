from __future__ import annotations

from jose import JWTError

from app.config import Settings, get_settings
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.sql.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import ChangePasswordResponse, CurrentUserRead, LoginRequest, TokenResponse


class AuthError(RuntimeError):
    pass


class AuthService:
    def __init__(self, repository: UserRepository, settings: Settings) -> None:
        self.repository = repository
        self.settings = settings

    def seed_admin(self) -> None:
        if self.repository.get_by_email(self.settings.admin_email):
            return

        self.repository.create(
            {
                "email": self.settings.admin_email,
                "full_name": "TenderMind Admin",
                "password_hash": hash_password(self.settings.admin_password),
                "role": "admin",
                "is_active": True,
            }
        )

    async def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.repository.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise AuthError("Email atau password salah.")
        if not user.is_active:
            raise AuthError("Akun tidak aktif.")

        token = create_access_token(user.email)
        return TokenResponse(
            access_token=token,
            user_email=user.email,
            full_name=user.full_name,
            role=user.role,
        )

    async def get_current_user(self, token: str) -> CurrentUserRead:
        try:
            email = decode_access_token(token)
        except JWTError as exc:
            raise AuthError("Token tidak valid.") from exc

        user = self.repository.get_by_email(email)
        if user is None or not user.is_active:
            raise AuthError("User tidak ditemukan atau tidak aktif.")

        return CurrentUserRead.model_validate(user)

    async def change_password(
        self,
        *,
        current_user_email: str,
        current_password: str,
        new_password: str,
    ) -> ChangePasswordResponse:
        user = self.repository.get_by_email(current_user_email)
        if user is None or not user.is_active:
            raise AuthError("User tidak ditemukan atau tidak aktif.")

        if not verify_password(current_password, user.password_hash):
            raise AuthError("Password saat ini salah.")

        if len(new_password) < 3:
            raise AuthError("Password baru minimal 3 karakter.")

        self.repository.update(user, {"password_hash": hash_password(new_password)})
        return ChangePasswordResponse()


def build_auth_service(repository: UserRepository) -> AuthService:
    return AuthService(repository, get_settings())
