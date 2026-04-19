from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import get_settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.app_secret_key, algorithm="HS256")


def decode_access_token(token: str) -> str:
    settings = get_settings()
    payload = jwt.decode(token, settings.app_secret_key, algorithms=["HS256"])
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise JWTError("Invalid token subject.")
    return subject
