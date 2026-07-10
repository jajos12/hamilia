# Hamilia

A dialectical RAG system that finds both supporting and undermining evidence for any claim, structuring them into an intellectual confrontation.

<table>
  <tr>
    <td colspan="2">
      <img width="1747" height="1015" alt="Screenshot From 2026-07-10 13-10-14" src="https://github.com/user-attachments/assets/d9fb2c34-9467-4800-be14-4fbf20e03dac" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img width="1747" height="1015" alt="Screenshot From 2026-07-10 13-10-23" src="https://github.com/user-attachments/assets/b6d4c7e7-015f-493c-a666-8061050c0edb" />
    </td>
    <td width="50%">
      <img width="1747" height="1015" alt="Screenshot From 2026-07-10 13-10-34" src="https://github.com/user-attachments/assets/d55a93ee-d63d-4441-91bf-c5d8e521e595" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img width="1731" height="951" alt="Screenshot From 2026-07-10 13-10-55" src="https://github.com/user-attachments/assets/78629432-82a4-4ae6-a28d-5cc13d283bc4" />
    </td>
    <td width="50%">
      <img width="1747" height="1015" alt="Screenshot From 2026-07-10 13-10-39" src="https://github.com/user-attachments/assets/87638fd2-c088-4ba3-a8e0-c38b7b073c0f" />
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img width="1750" height="1010" alt="Screenshot From 2026-07-10 13-13-50" src="https://github.com/user-attachments/assets/7014bd79-ea97-43ac-9a85-d060db960ec5" />
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img width="1724" height="965" alt="Screenshot From 2026-07-10 13-09-43" src="https://github.com/user-attachments/assets/b7fa5e3d-847c-4fc6-a94e-0b494eab73c8" />
    </td>
  </tr>
</table>

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
