"""OpenAI provider — requires API key."""

import json
import logging
from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from src.core.config import settings
from src.llm.base import BaseLLMClient, LLMResponse

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseLLMClient):
    """OpenAI API provider."""

    def __init__(self) -> None:
        from src.core.config import get_runtime_overrides
        overrides = get_runtime_overrides() or {}
        api_key = overrides.get("OPENAI_API_KEY", "") or settings.OPENAI_API_KEY
        self._client = AsyncOpenAI(api_key=api_key)

    @property
    def provider_name(self) -> str:
        return "openai"

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        response_format: dict | None = None,
    ) -> LLMResponse:
        model = settings.OPENAI_MODEL
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

        logger.info("OpenAI: generating with model=%s", model)
        response = await self._client.chat.completions.create(**kwargs)

        content = response.choices[0].message.content or ""
        usage = {}
        if response.usage:
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }

        logger.info("OpenAI: generated %d chars", len(content))

        return LLMResponse(
            content=content,
            model=model,
            provider=self.provider_name,
            usage=usage,
            raw=response,
        )

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AsyncIterator[str]:
        model = settings.OPENAI_MODEL
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        logger.info("OpenAI: streaming with model=%s", model)

        response = await self._client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature or settings.LLM_TEMPERATURE,
            max_tokens=max_tokens or settings.LLM_MAX_TOKENS,
            stream=True,
        )

        async for chunk in response:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content

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
            logger.warning("OpenAI: failed to parse JSON, attempting extraction")
            text = response.content
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
