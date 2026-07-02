# Adversarial Evidence Engine

A dialectical RAG system that finds both supporting and undermining evidence for any claim, structuring them into an intellectual confrontation.

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd agon
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

# 2. Configure (copy and edit)
cp .env.example .env

# 3. Start Ollama (free local LLM)
ollama pull mistral

# 4. Run the API
uvicorn src.main:app --reload

# 5. Test it
curl -X POST http://localhost:8000/api/v1/analyze-claim \
  -H "Content-Type: application/json" \
  -d '{"claim": "Large language models will cause mass unemployment within 10 years"}'
```

## Architecture

```
Claim → Decompose → Multi-Source Retrieval → Stance Tag → Synthesize → Verify
                  ↓
    ┌─────────────┼─────────────┬──────────────┐
    │             │             │              │
  arXiv    Semantic Scholar  DuckDuckGo    RSS Feeds
  (free)       (free)         (free)        (free)
```

## LLM Providers

Switch providers by changing `LLM_PROVIDER` in `.env`:

| Provider | Cost | Notes |
|----------|------|-------|
| `ollama` | Free | Local, requires Ollama running |
| `openai` | Paid | GPT-4, requires API key |
| `openrouter` | Free/Paid | 400+ models, some free |
| `gemini` | Free tier | 15 RPM, 1M tokens/day |

## Data Sources

All free, no API keys required:

| Source | Type | Best For |
|--------|------|----------|
| arXiv | Academic papers | CS, ML, AI, physics |
| Semantic Scholar | Academic papers | AI/ML, citation graphs |
| DuckDuckGo | Web search | General topics |
| RSS Feeds | News articles | Current events |
| Local files | PDFs, markdown | Curated corpus |

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run linting
ruff check src/
ruff format src/

# Run type checking
mypy src/

# Run tests
pytest
```

## Project Structure

```
agon/
├── docs/                 # Architecture, pipeline, tech stack
├── src/
│   ├── api/              # FastAPI endpoints
│   ├── core/             # Config, dependencies
│   ├── llm/              # LLM provider abstraction
│   ├── ingestion/        # Data source adapters
│   ├── rag/              # RAG pipeline components
│   ├── models/           # Data models
│   └── pipeline/         # Pipeline orchestration
└── tests/
```

## License

MIT
