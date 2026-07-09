"""Multi-source retriever.

Retrieves evidence from:
1. Local ChromaDB (pre-indexed corpus)
2. Runtime sources (arXiv, Semantic Scholar, DuckDuckGo, RSS)
"""

import asyncio
import logging
from dataclasses import dataclass, field

from src.core.config import settings
from src.ingestion.base import Document, DocumentType, FetchResult
from src.ingestion.arxiv_adapter import ArxivAdapter
from src.ingestion.semantic_scholar_adapter import SemanticScholarAdapter
from src.ingestion.web_search_adapter import WebSearchAdapter
from src.ingestion.rss_adapter import RSSAdapter
from src.ingestion.chunker import Chunk, chunk_documents
from src.ingestion.indexer import get_collection

logger = logging.getLogger(__name__)


@dataclass
class RetrievalResult:
    """Combined retrieval from all sources."""

    chunks: list[Chunk]
    sources_queried: list[str]
    total_chunks: int
    errors: list[str] = field(default_factory=list)


async def _with_timeout(coro, timeout: float, default=None):
    """Run a coroutine with a timeout, returning default on failure."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except (asyncio.TimeoutError, Exception) as e:
        logger.warning("Source timed out or failed: %s", e)
        return default


async def retrieve_adversarial(
    pro_query: str, con_query: str, claim: str
) -> RetrievalResult:
    """Retrieve evidence from multiple sources for both PRO and CON queries.

    Sources queried in parallel with per-source timeouts:
    - ChromaDB (pre-indexed corpus)
    - arXiv (academic papers)
    - Semantic Scholar (academic papers)
    - DuckDuckGo (web search)
    - RSS feeds (news)
    """
    logger.info("Retrieving evidence for PRO='%s', CON='%s'", pro_query, con_query)

    # Each source gets its own timeout so one slow source can't block everything
    tasks = [
        _with_timeout(_retrieve_from_chromadb(pro_query, settings.TOP_K_RETRIEVAL), 10),
        _with_timeout(_retrieve_from_chromadb(con_query, settings.TOP_K_RETRIEVAL), 10),
        _with_timeout(_retrieve_from_arxiv(pro_query, 5), 15),
        _with_timeout(_retrieve_from_arxiv(con_query, 5), 15),
        _with_timeout(_retrieve_from_semantic_scholar(pro_query, 5), 15),
        _with_timeout(_retrieve_from_semantic_scholar(con_query, 5), 15),
        _with_timeout(_retrieve_from_web(pro_query, 5), 15),
        _with_timeout(_retrieve_from_web(con_query, 5), 15),
        _with_timeout(_retrieve_from_rss(claim, 10), 20),
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Merge all chunks
    all_chunks: list[Chunk] = []
    sources_queried: list[str] = []
    errors: list[str] = []

    for result in results:
        if isinstance(result, Exception):
            errors.append(str(result))
            continue
        if result is not None:
            chunks, source = result
            all_chunks.extend(chunks)
            if source not in sources_queried:
                sources_queried.append(source)

    # Deduplicate by chunk ID
    seen_ids: set[str] = set()
    unique_chunks: list[Chunk] = []
    for chunk in all_chunks:
        if chunk.id not in seen_ids:
            seen_ids.add(chunk.id)
            unique_chunks.append(chunk)

    logger.info(
        "Retrieved %d unique chunks from %d sources",
        len(unique_chunks),
        len(sources_queried),
    )

    return RetrievalResult(
        chunks=unique_chunks,
        sources_queried=sources_queried,
        total_chunks=len(unique_chunks),
        errors=errors,
    )


async def _retrieve_from_chromadb(
    query: str, k: int
) -> tuple[list[Chunk], str]:
    """Retrieve from local ChromaDB."""
    try:
        collection = get_collection()
        results = collection.query(
            query_texts=[query],
            n_results=k,
            include=["documents", "metadatas", "distances"],
        )

        chunks: list[Chunk] = []
        for i, doc in enumerate(results["documents"][0]):
            meta = results["metadatas"][0][i]
            chunks.append(
                Chunk(
                    id=results["ids"][0][i],
                    text=doc,
                    source_id=meta.get("source_id", ""),
                    source_name=meta.get("source_name", "chromadb"),
                    doc_type=meta.get("doc_type", "unknown"),
                    section=meta.get("section", "unknown"),
                    title=meta.get("title", ""),
                    authors=meta.get("authors", "").split(", ") if meta.get("authors") else [],
                    year=meta.get("year"),
                    url=meta.get("url", ""),
                    doi=meta.get("doi") or None,
                    journal=meta.get("journal") or None,
                )
            )
        return chunks, "chromadb"
    except Exception as e:
        logger.warning("ChromaDB retrieval failed: %s", e)
        return [], "chromadb"


async def _retrieve_from_arxiv(query: str, max_results: int) -> tuple[list[Chunk], str]:
    """Retrieve from arXiv."""
    adapter = ArxivAdapter()
    result = await adapter.fetch(query, max_results)
    chunks = chunk_documents(result.documents)
    return chunks, "arxiv"


async def _retrieve_from_semantic_scholar(
    query: str, max_results: int
) -> tuple[list[Chunk], str]:
    """Retrieve from Semantic Scholar."""
    adapter = SemanticScholarAdapter()
    result = await adapter.fetch(query, max_results)
    chunks = chunk_documents(result.documents)
    return chunks, "semantic_scholar"


async def _retrieve_from_web(query: str, max_results: int) -> tuple[list[Chunk], str]:
    """Retrieve from DuckDuckGo web search."""
    adapter = WebSearchAdapter()
    result = await adapter.fetch(query, max_results)
    chunks = chunk_documents(result.documents)
    return chunks, "web"


async def _retrieve_from_rss(query: str, max_results: int) -> tuple[list[Chunk], str]:
    """Retrieve from RSS news feeds."""
    adapter = RSSAdapter()
    result = await adapter.fetch(query, max_results)
    chunks = chunk_documents(result.documents)
    return chunks, "rss"
