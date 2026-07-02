# Adversarial Evidence Engine — Architecture

## Overview

The Adversarial Evidence Engine is a Retrieval-Augmented Generation (RAG) system that breaks the standard RAG paradigm. Instead of retrieving only supporting context, it simultaneously retrieves **supporting and undermining evidence** for a given claim, structuring them into an intellectual confrontation.

## Core Design Philosophy

**Standard RAG**: Query → Retrieve Supporting Context → Synthesize Answer
**Adversarial RAG**: Claim → Decompose into Adversarial Pair → Retrieve PRO/CON → Stance Tag → Structured Debate Synthesis

This shift from agreement-seeking to dialectical retrieval is what makes the system intellectually interesting.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API LAYER (FastAPI)                               │
│                    POST /api/v1/analyze-claim                               │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CLAIM DECOMPOSITION LAYER                                │
│          LLM call to generate adversarial query pair                        │
│    "Intermittent fasting improves cognition"                                │
│         → Query_PRO: "evidence fasting cognitive benefits"                  │
│         → Query_CON: "evidence fasting null results cognitive"              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PARALLEL RETRIEVAL LAYER                                 │
│                  ChromaDB Vector Store                                      │
│            Both queries executed against corpus simultaneously              │
│                     Returns: Chunks with metadata                           │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STANCE TAGGING LAYER                                     │
│           NLI Model (cross-encoder/nli-deberta-v3-base)                    │
│         Classifies each chunk: SUPPORT / CONTRADICT / NUANCE                │
│              Re-ranks by stance confidence                                  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARGUMENT SYNTHESIS LAYER                                 │
│               LLM generates structured debate output                        │
│       FOR arguments ← evidence tagged SUPPORT                              │
│       AGAINST arguments ← evidence tagged CONTRADICT                       │
│       CRUX analysis ← evidence tagged NUANCE                               │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CITATION VERIFICATION LAYER                              │
│           Second LLM pass to verify claim-source alignment                 │
│                   Ensures no hallucinated citations                         │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API RESPONSE                                      │
│     { "for": [...], "against": [...], "crux": "...", "sources": [...] }    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Modular Pipeline Design
Each layer is a replaceable component. Swapping the NLI model or LLM provider requires changing only that module. This is critical for:
- A/B testing different stance classifiers
- Swapping LLM providers (OpenAI → Anthropic → local models)
- Changing vector stores without touching retrieval logic

### 2. ChromaDB as Vector Store
**Why Chroma:**
- Zero-config, embedded mode for portfolio demos
- Metadata filtering enables pre-retrieval stance filtering
- Persistence out of the box
- Can swap to Pinecone/Qdrant for production

**Tradeoff**: Not as fast as FAISS for massive corpora, but perfect for curated corpus of 1k-100k documents.

### 3. Pre-trained NLI Model (not fine-tuned)
Using `cross-encoder/nli-deberta-v3-base` from sentence-transformers:
- Zero-shot stance detection without corpus-specific training
- Runs locally (no API cost for classification)
- ~90% accuracy on entailment/contradiction tasks
- Fast inference for real-time pipeline

### 4. LLM Provider Abstraction
The system supports multiple LLM providers via a unified interface:
- Primary: OpenAI GPT-4 (best reasoning for debate synthesis)
- Fallback: Anthropic Claude
- Local: Ollama with Mistral/Llama (for offline demos)

## Data Flow

```
Input Claim (string)
    ↓
Decomposed Queries [PRO_QUERY, CON_QUERY] (2x strings)
    ↓
Retrieved Chunks [Chunk1, Chunk2, ..., ChunkN] (list of chunk objects)
    ↓
Tagged Chunks [TaggedChunk1, ..., TaggedChunkN] (chunks + stance label + score)
    ↓
Sorted Chunks { SUPPORT: [...], CONTRADICT: [...], NUANCE: [...] }
    ↓
Structured Debate { for: [...], against: [...], crux: "..." }
    ↓
Verified Output { for: [...], against: [...], crux: "...", sources: [...] }
```

## Error Handling Strategy

| Layer | Failure Mode | Recovery |
|-------|--------------|----------|
| Decomposition | LLM fails to generate CON query | Fallback to keyword negation ("no evidence for", "against") |
| Retrieval | No chunks returned for one stance | Lower similarity threshold, retry with expanded query |
| NLI Tagging | Model returns low confidence | Tag as NUANCE, don't force binary classification |
| Synthesis | LLM collapses to one side | Re-inject explicit opposing chunks with forced structure |
| Citation | Claim doesn't match source | Remove citation, mark as "synthesized from multiple sources" |

## Performance Characteristics

- **Latency**: ~3-6 seconds per claim (decomposition: 0.5s, retrieval: 0.2s, NLI: 1-2s, synthesis: 1-2s, verification: 0.5s)
- **Throughput**: ~10-20 claims/minute (single GPU), ~2-5 claims/minute (CPU)
- **Accuracy**: Stance classification ~85-90%, citation integrity ~95% post-verification

## Security Considerations

- LLM prompts are constructed server-side (no user-injected prompts)
- Corpus is read-only (no write operations from API)
- Rate limiting on API endpoints
- Source URLs validated before returning to client
