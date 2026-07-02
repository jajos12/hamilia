"""OpenRouter provider — 400+ models via unified API."""

import json
import logging

from openai import AsyncOpenAI

from src.core.config import settings
from src.llm.base import BaseLLMClient, LLMResponse

logger = logging.getLogger(__name__)


class OpenRouterProvider(BaseLLMClient):
    """OpenRouter provider.

    Uses OpenAI-compatible API with OpenRouter base URL.
    Supports 400+ models from various providers.
    Free models available (e.g., meta-llama/llama-3.1-8b-instruct:free).
    """

    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": settings.OPENROUTER_SITE_URL,
                "X-Title": settings.OPENROUTER_APP_NAME,
            },
        )

    @property
    def provider_name(self) -> str:
        return "openrouter"

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        response_format: dict | None = None,
    ) -> LLMResponse:
        model = settings.OPENROUTER_MODEL
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        kwargs: dict = {
            "model": model,
            "messages": messages,
            "temperature": temperature or settings.LLM_TEMPERATURE,
            "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
        }
        if response_format:
            kwargs["response_format"] = response_format

        logger.info("OpenRouter: generating with model=%s", model)
        response = await self._client.chat.completions.create(**kwargs)

        content = response.choices[0].message.content or ""
        usage = {}
        if response.usage:
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }

        logger.info("OpenRouter: generated %d chars", len(content))

        return LLMResponse(
            content=content,
            model=model,
            provider=self.provider_name,
            usage=usage,
            raw=response,
        )

    async def generate_json(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
    ) -> dict:
        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        try:
            return json.loads(response.content)
        except json.JSONDecodeError:
            logger.warning("OpenRouter: failed to parse JSON, attempting extraction")
            text = response.content
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
