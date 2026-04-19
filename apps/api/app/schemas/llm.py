from pydantic import BaseModel, Field


class LLMProviderStatus(BaseModel):
    provider: str
    configured: bool
    base_url: str
    parser_model: str
    drafter_model: str
    summary_model: str


class LLMTestRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=4000)
    system_prompt: str = Field(default="You are a helpful assistant.")
    model: str | None = None
    temperature: float = Field(default=0.2, ge=0, le=2)
    max_tokens: int = Field(default=300, ge=1, le=4000)


class LLMTestResponse(BaseModel):
    model: str
    content: str
    prompt_tokens: int | None = None
    completion_tokens: int | None = None
    total_tokens: int | None = None
