"""Ollama provider — local LLM, zero cost."""

import json
import logging

import ollama as ollama_sync

from src.core.config import settings
from src.llm.base import BaseLLMClient, LLMResponse

logger = logging.getLogger(__name__)


class OllamaProvider(BaseLLMClient):
    """Ollama provider for local LLM inference.

    Requires Ollama running locally: https://ollama.com/download
    """

    @property
    def provider_name(self) -> str:
        return "ollama"

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        response_format: dict | None = None,
    ) -> LLMResponse:
        model = settings.OLLAMA_MODEL
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        options = {}
        if temperature is not None:
            options["temperature"] = temperature
        else:
            options["temperature"] = settings.LLM_TEMPERATURE

        if max_tokens is not None:
            options["num_predict"] = max_tokens

        logger.info("Ollama: generating with model=%s", model)

        # Ollama Python client is sync; run in thread pool
        import asyncio

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: ollama_sync.chat(
                model=model,
                messages=messages,
                options=options,
                format="json" if response_format else None,
            ),
        )

        content = response["message"]["content"]
        logger.info("Ollama: generated %d chars", len(content))

        return LLMResponse(
            content=content,
            model=model,
            provider=self.provider_name,
            usage={},
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
            logger.warning("Ollama: failed to parse JSON, attempting extraction")
            # Try to extract JSON from markdown code blocks
            text = response.content
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
