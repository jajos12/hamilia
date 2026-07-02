"""Google Gemini provider — generous free tier."""

import json
import logging

import google.generativeai as genai

from src.core.config import settings
from src.llm.base import BaseLLMClient, LLMResponse

logger = logging.getLogger(__name__)


class GeminiProvider(BaseLLMClient):
    """Google Gemini provider.

    Free tier: 15 RPM, 1M tokens/day for Gemini 2.0 Flash.
    Get API key: https://aistudio.google.com/apikey
    """

    def __init__(self) -> None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self._model = genai.GenerativeModel(settings.GEMINI_MODEL)

    @property
    def provider_name(self) -> str:
        return "gemini"

    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        response_format: dict | None = None,
    ) -> LLMResponse:
        model_name = settings.GEMINI_MODEL
        temperature = temperature or settings.LLM_TEMPERATURE

        contents = []
        if system_prompt:
            contents.append(system_prompt)
        contents.append(prompt)

        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens or settings.LLM_MAX_TOKENS,
        )

        if response_format and response_format.get("type") == "json_object":
            generation_config.response_mime_type = "application/json"

        logger.info("Gemini: generating with model=%s", model_name)

        import asyncio

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._model.generate_content(
                contents,
                generation_config=generation_config,
            ),
        )

        content = response.text or ""
        usage = {}
        if response.usage_metadata:
            usage = {
                "prompt_tokens": getattr(response.usage_metadata, "prompt_token_count", 0),
                "completion_tokens": getattr(
                    response.usage_metadata, "candidates_token_count", 0
                ),
                "total_tokens": getattr(response.usage_metadata, "total_token_count", 0),
            }

        logger.info("Gemini: generated %d chars", len(content))

        return LLMResponse(
            content=content,
            model=model_name,
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
            logger.warning("Gemini: failed to parse JSON, attempting extraction")
            text = response.content
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
