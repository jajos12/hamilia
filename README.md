# Hamilia

A dialectical RAG system that finds both supporting and undermining evidence for any claim, structuring them into an intellectual confrontation.

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and start
git clone <repo-url>
cd hamilia
cp .env.example .env  # Edit with your API keys
docker-compose up --build

# Or use the script
./scripts/docker.sh
```

### Option 2: Local Development

```bash
# Clone
git clone <repo-url>
cd hamilia

# Backend
conda create -n hamilia python=3.11 -y
conda activate hamilia
pip install -e .

# Frontend
cd frontend && npm install && cd ..

# Start both
./scripts/dev.sh
```

### Option 3: Production

```bash
# Backend only (frontend on Vercel)
conda activate hamilia
./scripts/prod.sh
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js app |
| Backend | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI |

## Deployment

### Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

### Backend (Railway/Fly.io)

```bash
# Railway
railway login
railway init
railway up
```

## Architecture

```
hamilia/
├── frontend/          # Next.js 15 + Tailwind v4 + shadcn/ui
├── src/               # FastAPI backend
│   ├── api/           # API endpoints
│   ├── core/          # Config
│   ├── llm/           # LLM providers (Ollama, OpenAI, OpenRouter, Gemini)
│   ├── ingestion/     # Data source adapters (arXiv, Semantic Scholar, etc.)
│   ├── rag/           # RAG pipeline components
│   ├── models/        # Data models
│   └── pipeline/      # Pipeline orchestration
├── scripts/           # Start/stop scripts
├── docs/              # Architecture docs
└── docker-compose.yml
```

## LLM Providers

Switch by changing `LLM_PROVIDER` in `.env`:

| Provider | Cost | Notes |
|----------|------|-------|
| `ollama` | Free | Local, requires Ollama |
| `openai` | Paid | GPT-4 |
| `openrouter` | Free/Paid | 400+ models |
| `gemini` | Free tier | Key rotation supported |

## Data Sources

All free, no API keys required:

| Source | Type | Best For |
|--------|------|----------|
| arXiv | Academic papers | CS, ML, AI |
| Semantic Scholar | Academic papers | AI/ML, citations |
| DuckDuckGo | Web search | General topics |
| RSS Feeds | News articles | Current events |

## License

MIT
