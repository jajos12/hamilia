"""Base LLM provider interface."""

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass, field

from src.core.config import LLMProvider, settings, get_runtime_overrides


@dataclass
class LLMResponse:
    """Unified response from any LLM provider."""

    content: str
    model: str
    provider: str
    usage: dict[str, int] = field(default_factory=dict)
    raw: object | None = None


class BaseLLMClient(ABC):
    """Abstract base for all LLM providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider identifier."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        response_format: dict | None = None,
    ) -> LLMResponse:
        """Generate a completion.

        Args:
            prompt: User prompt text.
            system_prompt: Optional system prompt.
            temperature: Override default temperature.
            max_tokens: Override default max tokens.
            response_format: Optional JSON response format.

        Returns:
            LLMResponse with generated content.
        """

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AsyncIterator[str]:
        """Generate a completion, yielding text tokens as they arrive.

        Args:
            prompt: User prompt text.
            system_prompt: Optional system prompt.
            temperature: Override default temperature.
            max_tokens: Override default max tokens.

        Yields:
            Text chunks as they arrive from the LLM.
        """
        # Default implementation: fall back to non-streaming
        response = await self.generate(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        yield response.content

    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float | None = None,
    ) -> dict:
        """Generate a JSON response. Convenience wrapper around generate()."""


def get_llm_client() -> BaseLLMClient:
    """Factory: return the configured LLM provider client.

    Checks runtime overrides (from request headers) first, then falls back
    to .env settings. Change LLM_PROVIDER in .env to switch providers
    locally, or send X-LLM-Provider + X-API-Key headers from the frontend.
    """
    overrides = get_runtime_overrides() or {}
    provider = overrides.get("LLM_PROVIDER", settings.LLM_PROVIDER)

    if provider == LLMProvider.OLLAMA:
        from src.llm.ollama_provider import OllamaProvider
        return OllamaProvider()
    elif provider == LLMProvider.OPENAI:
        from src.llm.openai_provider import OpenAIProvider
        return OpenAIProvider()
    elif provider == LLMProvider.OPENROUTER:
        from src.llm.openrouter_provider import OpenRouterProvider
        return OpenRouterProvider()
    elif provider == LLMProvider.GEMINI:
        from src.llm.gemini_provider import GeminiProvider
        return GeminiProvider()
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")
