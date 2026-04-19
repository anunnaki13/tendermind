from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=True, alias="APP_DEBUG")
    app_secret_key: str = Field(default="change_me", alias="APP_SECRET_KEY")
    app_cors_origins: str = Field(default="http://localhost:3000", alias="APP_CORS_ORIGINS")
    database_url: str | None = Field(default=None, alias="DATABASE_URL")

    postgres_host: str = Field(default="postgres", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_user: str = Field(default="tendermind", alias="POSTGRES_USER")
    postgres_password: str = Field(default="change_me", alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(default="tendermind", alias="POSTGRES_DB")

    mongo_uri: str = Field(default="mongodb://mongo:27017", alias="MONGO_URI")
    mongo_db: str = Field(default="tendermind", alias="MONGO_DB")

    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")

    @property
    def postgres_dsn(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def effective_database_url(self) -> str:
        return self.database_url or "sqlite:///./tendermind.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()
