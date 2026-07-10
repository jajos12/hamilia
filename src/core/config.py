from contextvars import ContextVar
from enum import Enum
from typing import Any, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class LLMProvider(str, Enum):
    """Supported LLM providers."""

    OLLAMA = "ollama"
    OPENAI = "openai"
    OPENROUTER = "openrouter"
    GEMINI = "gemini"


# ── Runtime overrides (per-request API keys from frontend) ──────────────
_runtime_overrides: ContextVar[dict[str, str] | None] = ContextVar(
    "runtime_overrides", default=None
)


def set_runtime_overrides(overrides: dict[str, str] | None) -> None:
    _runtime_overrides.set(overrides)


def get_runtime_overrides() -> dict[str, str] | None:
    return _runtime_overrides.get()


class Settings(BaseSettings):
    """Application settings. All values can be overridden via environment variables."""

    # ──────────────────────────────────────────────────────────────────────
    # LLM Provider Configuration
    # ──────────────────────────────────────────────────────────────────────
    LLM_PROVIDER: LLMProvider = Field(
        default=LLMProvider.OLLAMA,
        description="Active LLM provider. Switch by changing this single value.",
    )

    # Ollama (local, free)
    OLLAMA_BASE_URL: str = Field(
        default="http://localhost:11434",
        description="Ollama server URL.",
    )
    OLLAMA_MODEL: str = Field(
        default="mistral",
        description="Ollama model name (e.g., mistral, llama3, qwen2.5).",
    )

    # OpenAI
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key.")
    OPENAI_MODEL: str = Field(default="gpt-4", description="OpenAI model name.")

    # OpenRouter (access to 400+ models)
    OPENROUTER_API_KEY: str = Field(default="", description="OpenRouter API key.")
    OPENROUTER_MODEL: str = Field(
        default="meta-llama/llama-3.1-8b-instruct:free",
        description="OpenRouter model name.",
    )
    OPENROUTER_SITE_URL: str = Field(
        default="https://github.com/your-username/hamilia",
        description="OpenRouter HTTP-Referer header.",
    )
    OPENROUTER_APP_NAME: str = Field(
        default="Adversarial Evidence Engine",
        description="OpenRouter X-Title header.",
    )

    # Google Gemini (generous free tier, supports key rotation)
    GEMINI_API_KEYS: str = Field(
        default="",
        description="Comma-separated Gemini API keys for rotation on rate limits.",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-2.0-flash",
        description="Gemini model name.",
    )
    GEMINI_KEYS_INDEX: int = Field(
        default=0,
        description="Current key index (managed internally, rotates on rate limit).",
    )

    def effective(self, key: str) -> Any:
        """Get a setting value, checking runtime overrides first."""
        overrides = get_runtime_overrides()
        if overrides and key in overrides:
            return overrides[key]
        return getattr(self, key)

    # Shared LLM config
    LLM_TEMPERATURE: float = Field(default=0.3, description="LLM temperature.")
    LLM_MAX_TOKENS: int = Field(default=4096, description="LLM max output tokens.")

    # ──────────────────────────────────────────────────────────────────────
    # Vector Store
    # ──────────────────────────────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = Field(default="./data/chroma_db")
    CHROMA_COLLECTION: str = Field(default="adversarial_evidence")

    # ──────────────────────────────────────────────────────────────────────
    # Pipeline
    # ──────────────────────────────────────────────────────────────────────
    NLI_MODEL: str = Field(default="cross-encoder/nli-deberta-v3-base")
    TOP_K_RETRIEVAL: int = Field(default=10, description="Chunks per source query.")
    TOP_K_SUPPORT: int = Field(default=4, description="Top SUPPORT chunks to use.")
    TOP_K_CONTRADICT: int = Field(default=4, description="Top CONTRADICT chunks to use.")
    TOP_K_NUANCE: int = Field(default=2, description="Top NUANCE chunks for crux analysis.")

    # ──────────────────────────────────────────────────────────────────────
    # Data Ingestion
    # ──────────────────────────────────────────────────────────────────────
    ARXIV_MAX_RESULTS: int = Field(default=20, description="Max papers per arXiv query.")
    SEMANTIC_SCHOLAR_LIMIT: int = Field(default=20, description="Max papers per S2 query.")
    WEB_SEARCH_MAX_RESULTS: int = Field(default=10, description="Max web search results.")
    RSS_FEED_TIMEOUT: int = Field(default=10, description="RSS feed fetch timeout (seconds).")

    # ──────────────────────────────────────────────────────────────────────
    # API
    # ──────────────────────────────────────────────────────────────────────
    API_HOST: str = Field(default="0.0.0.0")
    API_PORT: int = Field(default=8000)
    RATE_LIMIT_PER_MINUTE: int = Field(default=20)
    LOG_LEVEL: str = Field(default="INFO")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
