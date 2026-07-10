"""Google Gemini provider — generous free tier with key rotation."""

import asyncio
import json
import logging
import time
from collections.abc import AsyncIterator

from src.core.config import settings
from src.llm.base import BaseLLMClient, LLMResponse

logger = logging.getLogger(__name__)

# Module-level state for key rotation
_current_key_index: int = 0


class GeminiProvider(BaseLLMClient):
    """Google Gemini provider with automatic key rotation and retry.

    Free tier: 15 RPM, 1M tokens/day for Gemini 2.0 Flash.
    Supports multiple API keys that rotate when rate limited.
    Retries with exponential backoff when all keys are exhausted.
    """

    def __init__(self) -> None:
        self._keys = [k.strip() for k in settings.GEMINI_API_KEYS.split(",") if k.strip()]
        self._model = settings.GEMINI_MODEL
        self._current_index = settings.GEMINI_KEYS_INDEX

        if not self._keys:
            raise ValueError("No Gemini API keys configured. Set GEMINI_API_KEYS in .env")

        logger.info("Gemini: initialized with %d API keys, model=%s", len(self._keys), self._model)

    def _get_client(self):
        """Get a client with the current API key."""
        from google import genai

        key = self._keys[self._current_index % len(self._keys)]
        return genai.Client(api_key=key)

    def _rotate_key(self) -> str:
        """Rotate to the next API key."""
        global _current_key_index
        self._current_index = (self._current_index + 1) % len(self._keys)
        _current_key_index = self._current_index
        key = self._keys[self._current_index]
        logger.info("Gemini: rotated to key index %d", self._current_index)
        return key

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
        from google import genai

        model_name = self._model
        temperature = temperature or settings.LLM_TEMPERATURE
        max_attempts = len(self._keys) * 2  # 2 full rotations with backoff

        last_error = None
        for attempt in range(max_attempts):
            try:
                client = self._get_client()
                config = genai.types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens or settings.LLM_MAX_TOKENS,
                )

                if system_prompt:
                    config.system_instruction = system_prompt

                if response_format and response_format.get("type") == "json_object":
                    config.response_mime_type = "application/json"

                logger.info(
                    "Gemini: generating with model=%s (key=%d/%d, attempt=%d/%d)",
                    model_name,
                    self._current_index + 1,
                    len(self._keys),
                    attempt + 1,
                    max_attempts,
                )

                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    ),
                )

                content = response.text or ""
                usage = {}
                if response.usage_metadata:
                    usage = {
                        "prompt_tokens": getattr(
                            response.usage_metadata, "prompt_token_count", 0
                        ),
                        "completion_tokens": getattr(
                            response.usage_metadata, "candidates_token_count", 0
                        ),
                        "total_tokens": getattr(
                            response.usage_metadata, "total_token_count", 0
                        ),
                    }

                logger.info("Gemini: generated %d chars", len(content))

                return LLMResponse(
                    content=content,
                    model=model_name,
                    provider=self.provider_name,
                    usage=usage,
                    raw=response,
                )

            except Exception as e:
                last_error = e
                error_msg = str(e).lower()
                if "429" in error_msg or "rate" in error_msg or "quota" in error_msg or "resource_exhausted" in error_msg:
                    # Parse retry delay from error
                    delay = 30  # default
                    try:
                        if hasattr(e, 'args') and e.args:
                            err_str = str(e.args[0])
                            if "retryDelay" in err_str:
                                import re
                                match = re.search(r"'retryDelay':\s*'(\d+)s'", err_str)
                                if match:
                                    delay = int(match.group(1))
                    except Exception:
                        pass

                    # If all keys tried once, add extra backoff
                    if attempt >= len(self._keys):
                        delay = max(delay, 60)
                        logger.warning(
                            "Gemini: all keys exhausted, waiting %ds before retry...",
                            delay,
                        )

                    logger.warning(
                        "Gemini: rate limited on key %d/%d, retrying in %ds... (%s)",
                        self._current_index + 1,
                        len(self._keys),
                        delay,
                        str(e)[:200],
                    )
                    self._rotate_key()
                    await asyncio.sleep(delay)
                    continue
                # Non-rate-limit error, re-raise
                raise

        # All attempts exhausted
        raise RuntimeError(
            f"Gemini: all {len(self._keys)} API keys exhausted after {max_attempts} attempts. "
            f"Last error: {last_error}"
        )

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AsyncIterator[str]:
        from google import genai

        model_name = self._model
        temperature = temperature or settings.LLM_TEMPERATURE
        max_attempts = len(self._keys) * 2

        last_error = None
        for attempt in range(max_attempts):
            try:
                client = self._get_client()
                config = genai.types.GenerateContentConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens or settings.LLM_MAX_TOKENS,
                )

                if system_prompt:
                    config.system_instruction = system_prompt

                logger.info(
                    "Gemini: streaming with model=%s (key=%d/%d, attempt=%d/%d)",
                    model_name,
                    self._current_index + 1,
                    len(self._keys),
                    attempt + 1,
                    max_attempts,
                )

                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda: client.models.generate_content_stream(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    ),
                )

                for chunk in response:
                    if chunk.text:
                        # Split by word boundaries for smoother streaming
                        text = chunk.text
                        words = text.split(" ")
                        for i, word in enumerate(words):
                            if i < len(words) - 1:
                                yield word + " "
                            else:
                                yield word
                return

            except Exception as e:
                last_error = e
                error_msg = str(e).lower()
                if "429" in error_msg or "rate" in error_msg or "quota" in error_msg or "resource_exhausted" in error_msg:
                    delay = 30
                    try:
                        if hasattr(e, 'args') and e.args:
                            err_str = str(e.args[0])
                            if "retryDelay" in err_str:
                                import re
                                match = re.search(r"'retryDelay':\s*'(\d+)s'", err_str)
                                if match:
                                    delay = int(match.group(1))
                    except Exception:
                        pass

                    if attempt >= len(self._keys):
                        delay = max(delay, 60)

                    logger.warning(
                        "Gemini: rate limited on key %d/%d, retrying in %ds...",
                        self._current_index + 1,
                        len(self._keys),
                        delay,
                    )
                    self._rotate_key()
                    await asyncio.sleep(delay)
                    continue
                raise

        raise RuntimeError(
            f"Gemini: all {len(self._keys)} API keys exhausted after {max_attempts} attempts. "
            f"Last error: {last_error}"
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
