from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.core.config import LLMProvider, set_runtime_overrides

app = FastAPI(
    title="HAMILIA — Adversarial Evidence Engine",
    description="Dialectical RAG with structured debate",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def extract_api_keys(request: Request, call_next):
    """Extract API keys from request headers and set runtime overrides."""
    overrides: dict[str, str] = {}

    provider = request.headers.get("X-LLM-Provider", "")
    if provider:
        overrides["LLM_PROVIDER"] = provider

    gemini_key = request.headers.get("X-Gemini-Key", "")
    if gemini_key:
        overrides["GEMINI_API_KEY"] = gemini_key

    openrouter_key = request.headers.get("X-OpenRouter-Key", "")
    if openrouter_key:
        overrides["OPENROUTER_API_KEY"] = openrouter_key

    openai_key = request.headers.get("X-OpenAI-Key", "")
    if openai_key:
        overrides["OPENAI_API_KEY"] = openai_key

    if overrides:
        set_runtime_overrides(overrides)

    response = await call_next(request)

    # Clean up
    if overrides:
        set_runtime_overrides(None)

    return response


app.include_router(router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}


# Vercel handler
handler = app
