from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import get_settings
from app.core.database import init_db

settings = get_settings()

app = FastAPI(
    title="TenderMind API",
    version="0.1.0",
    description="Foundation API for internal tender management.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.app_cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": "TenderMind API", "status": "running"}
