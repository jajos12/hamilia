# Tech Stack

## Core Dependencies

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Web Framework** | FastAPI | Async-native, auto-docs, Pydantic validation, modern Python |
| **Vector Store** | ChromaDB | Embedded mode, zero-config, metadata filtering, persistent |
| **NLI Model** | cross-encoder/nli-deberta-v3-base | Pre-trained, zero-shot stance detection, runs locally |
| **LLM Provider** | OpenAI GPT-4 (primary) | Best reasoning for debate synthesis |
| **Embeddings** | sentence-transformers/all-MiniLM-L6-v2 | Fast, accurate, pairs well with Chroma |

## Python Version
**3.11+** — Required for:
- `asyncio.TaskGroup` (structured concurrency)
- Improved error messages
- Performance gains over 3.10

## Full Requirements

```txt
# Core
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.5.0

# Vector Store
chromadb>=0.4.18

# ML/NLI
sentence-transformers>=2.2.2
transformers>=4.36.0
torch>=2.1.0

# LLM Providers
openai>=1.6.0
anthropic>=0.8.0  # Optional: fallback provider

# Utilities
python-dotenv>=1.0.0
aiofiles>=23.2.0
httpx>=0.25.0

# Dev/Test
pytest>=7.4.0
pytest-asyncio>=0.23.0
ruff>=0.1.0
mypy>=1.7.0
```

## Environment Variables

```bash
# LLM Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional fallback
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.3

# Vector Store
CHROMA_PERSIST_DIR=./data/chroma_db
CHROMA_COLLECTION=adversarial_evidence

# Pipeline Config
NLI_MODEL=cross-encoder/nli-deberta-v3-base
TOP_K_RETRIEVAL=10
TOP_K_SUPPORT=4
TOP_K_CONTRADICT=4
TOP_K_NUANCE=2

# API
API_HOST=0.0.0.0
API_PORT=8000
RATE_LIMIT_PER_MINUTE=20
```

## Project Structure

```
agon/
├── docs/
│   ├── ARCHITECTURE.md      # System overview
│   ├── PIPELINE.md          # Component deep dive
│   └── TECH_STACK.md        # This file
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py        # API endpoints
│   │   └── schemas.py       # Pydantic models
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings management
│   │   └── dependencies.py  # FastAPI dependencies
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── decomposer.py    # Claim decomposition
│   │   ├── retriever.py     # ChromaDB retrieval
│   │   ├── stance_tagger.py # NLI classification
│   │   ├── synthesizer.py   # Debate generation
│   │   └── verifier.py      # Citation verification
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Data models (Chunk, Argument, etc.)
│   ├── pipeline/
│   │   ├── __init__.py
│   │   └── orchestrator.py  # Pipeline orchestration
│   └── data/
│       ├── __init__.py
│       └── corpus/          # Indexed documents
│           └── sample/
├── tests/
│   ├── __init__.py
│   ├── test_decomposer.py
│   ├── test_retriever.py
│   ├── test_stance_tagger.py
│   ├── test_synthesizer.py
│   ├── test_verifier.py
│   └── test_pipeline.py
├── pyproject.toml
├── .env.example
└── README.md
```

## Development Tools

| Tool | Purpose |
|------|---------|
| **ruff** | Linting + formatting (replaces black, isort, flake8) |
| **mypy** | Static type checking |
| **pytest** | Testing framework |
| **pytest-asyncio** | Async test support |
| **pre-commit** | Git hooks for quality checks |

## Pre-commit Configuration

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.0
    hooks:
      - id: mypy
```

## Deployment Options

### Local Development
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker (Future)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud (Future Options)
- **Railway**: Simple Python deployment
- **Fly.io**: Edge deployment with GPU support
- **AWS Lambda**: Serverless with container image
