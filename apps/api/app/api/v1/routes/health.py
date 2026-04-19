from fastapi import APIRouter

from app.config import get_settings

router = APIRouter()


@router.get("/health")
async def healthcheck() -> dict[str, object]:
    settings = get_settings()
    return {
        "status": "ok",
        "environment": settings.app_env,
        "services": {
            "database": settings.effective_database_url,
            "postgres": settings.postgres_dsn,
            "mongo": settings.mongo_uri,
            "redis": settings.redis_url,
        },
    }
