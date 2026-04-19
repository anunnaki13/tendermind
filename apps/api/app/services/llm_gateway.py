from __future__ import annotations

from typing import Any

import httpx

from app.config import Settings, get_settings
from app.schemas.llm import LLMProviderStatus, LLMTestRequest, LLMTestResponse


class LLMGatewayError(RuntimeError):
    pass


class LLMGateway:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def get_status(self) -> LLMProviderStatus:
        return LLMProviderStatus(
            provider="openrouter",
            configured=bool(self.settings.openrouter_api_key),
            base_url=self.settings.openrouter_base_url,
            parser_model=self.settings.openrouter_parser_model,
            drafter_model=self.settings.openrouter_drafter_model,
            summary_model=self.settings.openrouter_summary_model,
        )

    async def send_test_prompt(self, payload: LLMTestRequest) -> LLMTestResponse:
        if not self.settings.openrouter_api_key:
            raise LLMGatewayError("OPENROUTER_API_KEY is not configured.")

        request_payload = {
            "model": payload.model or self.settings.openrouter_summary_model,
            "messages": [
                {"role": "system", "content": payload.system_prompt},
                {"role": "user", "content": payload.prompt},
            ],
            "temperature": payload.temperature,
            "max_tokens": payload.max_tokens,
        }

        headers = {
            "Authorization": f"Bearer {self.settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "X-Title": self.settings.openrouter_app_name,
        }
        if self.settings.openrouter_site_url:
            headers["HTTP-Referer"] = self.settings.openrouter_site_url

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                self.settings.openrouter_chat_completions_url,
                json=request_payload,
                headers=headers,
            )

        if response.status_code >= 400:
            raise LLMGatewayError(f"OpenRouter request failed with status {response.status_code}: {response.text}")

        body = response.json()
        message = self._extract_message_content(body)
        usage = body.get("usage") or {}

        return LLMTestResponse(
            model=body.get("model") or request_payload["model"],
            content=message,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
            total_tokens=usage.get("total_tokens"),
        )

    def _extract_message_content(self, body: dict[str, Any]) -> str:
        choices = body.get("choices") or []
        if not choices:
            raise LLMGatewayError("OpenRouter returned no choices.")

        message = choices[0].get("message") or {}
        content = message.get("content")

        if isinstance(content, str):
            return content

        if isinstance(content, list):
            parts: list[str] = []
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    parts.append(str(item.get("text", "")))
            return "\n".join(part for part in parts if part).strip()

        raise LLMGatewayError("OpenRouter returned an unsupported message content format.")


def build_llm_gateway() -> LLMGateway:
    return LLMGateway(get_settings())
