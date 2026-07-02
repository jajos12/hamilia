"""Semantic Scholar adapter — fetches papers with citation data.

Free, no API key required. Rate limit: 100 requests per 5 minutes.
Best for: AI/ML papers, citation graphs, influence metrics.
"""

import logging

import httpx

from src.core.config import settings
from src.ingestion.base import Document, DocumentType, FetchResult, DataSourceAdapter

logger = logging.getLogger(__name__)

S2_API_BASE = "https://api.semanticscholar.org/graph/v1"


class SemanticScholarAdapter(DataSourceAdapter):
    """Semantic Scholar API adapter."""

    @property
    def source_name(self) -> str:
        return "semantic_scholar"

    @property
    def source_type(self) -> DocumentType:
        return DocumentType.ACADEMIC_PAPER

    async def fetch(self, query: str, max_results: int | None = None) -> FetchResult:
        max_results = max_results or settings.SEMANTIC_SCHOLAR_LIMIT
        errors: list[str] = []

        logger.info("Semantic Scholar: searching '%s' (max=%d)", query, max_results)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{S2_API_BASE}/paper/search",
                    params={
                        "query": query,
                        "limit": max_results,
                        "fields": "title,abstract,authors,year,citationCount,"
                        "externalIds,url,openAccessPdf,venue,publicationTypes",
                    },
                )
                response.raise_for_status()
                data = response.json()

            documents: list[Document] = []
            for paper in data.get("data", []):
                try:
                    authors = [a.get("name", "") for a in paper.get("authors", [])]
                    ext_ids = paper.get("externalIds", {}) or {}
                    pdf_info = paper.get("openAccessPdf") or {}

                    doc = Document(
                        id=self._make_id("s2", paper.get("paperId", "")),
                        title=paper.get("title", ""),
                        text=self._build_text(paper),
                        source_url=paper.get("url", ""),
                        source_name="semantic_scholar",
                        doc_type=DocumentType.ACADEMIC_PAPER,
                        authors=authors,
                        year=paper.get("year"),
                        abstract=paper.get("abstract"),
                        doi=ext_ids.get("DOI"),
                        journal=paper.get("venue"),
                        metadata={
                            "citation_count": paper.get("citationCount", 0),
                            "pdf_url": pdf_info.get("url"),
                            "corpus_id": ext_ids.get("CorpusId"),
                        },
                    )
                    documents.append(doc)
                except Exception as e:
                    errors.append(f"Failed to parse paper: {e}")

            logger.info("Semantic Scholar: found %d papers", len(documents))

            return FetchResult(
                documents=documents,
                source="semantic_scholar",
                query=query,
                total_found=data.get("total", len(documents)),
                errors=errors,
            )

        except Exception as e:
            logger.error("Semantic Scholar: fetch failed: %s", e)
            return FetchResult(
                documents=[],
                source="semantic_scholar",
                query=query,
                total_found=0,
                errors=[str(e)],
            )

    def _build_text(self, paper: dict) -> str:
        """Build text content from paper metadata."""
        parts = []
        if paper.get("title"):
            parts.append(f"Title: {paper['title']}")
        if paper.get("abstract"):
            parts.append(f"Abstract: {paper['abstract']}")
        if paper.get("venue"):
            parts.append(f"Venue: {paper['venue']}")
        return "\n\n".join(parts)
