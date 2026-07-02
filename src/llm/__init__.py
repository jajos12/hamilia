"""LLM provider abstraction layer.

Supports multiple providers (Ollama, OpenAI, OpenRouter, Gemini) via a unified
interface. Switch providers by changing LLM_PROVIDER in config — no code changes.
"""

from src.llm.base import LLMProvider, LLMResponse, get_llm_client
from src.llm.ollama_provider import OllamaProvider
from src.llm.openai_provider import OpenAIProvider
from src.llm.openrouter_provider import OpenRouterProvider
from src.llm.gemini_provider import GeminiProvider

__all__ = [
    "LLMProvider",
    "LLMResponse",
    "get_llm_client",
    "OllamaProvider",
    "OpenAIProvider",
    "OpenRouterProvider",
    "GeminiProvider",
]
