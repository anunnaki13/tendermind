from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = Field(default="development", alias="APP_ENV")
    app_debug: bool = Field(default=True, alias="APP_DEBUG")
    app_secret_key: str = Field(default="change_me", alias="APP_SECRET_KEY")
    app_cors_origins: str = Field(default="http://localhost:3010", alias="APP_CORS_ORIGINS")
    database_url: str | None = Field(default=None, alias="DATABASE_URL")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8011, alias="APP_PORT")
    documents_storage_dir: str = Field(default="./storage/documents", alias="DOCUMENTS_STORAGE_DIR")

    postgres_host: str = Field(default="postgres", alias="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, alias="POSTGRES_PORT")
    postgres_user: str = Field(default="tendermind", alias="POSTGRES_USER")
    postgres_password: str = Field(default="change_me", alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(default="tendermind", alias="POSTGRES_DB")

    mongo_uri: str = Field(default="mongodb://mongo:27017", alias="MONGO_URI")
    mongo_db: str = Field(default="tendermind", alias="MONGO_DB")

    redis_url: str = Field(default="redis://redis:6379/0", alias="REDIS_URL")
    openrouter_api_key: str | None = Field(default=None, alias="OPENROUTER_API_KEY")
    openrouter_base_url: str = Field(default="https://openrouter.ai/api/v1", alias="OPENROUTER_BASE_URL")
    openrouter_app_name: str = Field(default="TenderMind", alias="OPENROUTER_APP_NAME")
    openrouter_site_url: str | None = Field(default=None, alias="OPENROUTER_SITE_URL")
    openrouter_parser_model: str = Field(default="openai/gpt-4.1-mini", alias="OPENROUTER_PARSER_MODEL")
    openrouter_drafter_model: str = Field(default="anthropic/claude-3.7-sonnet", alias="OPENROUTER_DRAFTER_MODEL")
    openrouter_summary_model: str = Field(default="openai/gpt-4.1-mini", alias="OPENROUTER_SUMMARY_MODEL")
    llm_monthly_budget_usd: int = Field(default=50, alias="LLM_MONTHLY_BUDGET_USD")

    @property
    def postgres_dsn(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def effective_database_url(self) -> str:
        return self.database_url or "sqlite:///./tendermind.db"

    @property
    def openrouter_chat_completions_url(self) -> str:
        return f"{self.openrouter_base_url.rstrip('/')}/chat/completions"


@lru_cache
def get_settings() -> Settings:
    return Settings()
