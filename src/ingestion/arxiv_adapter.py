"""arXiv adapter — fetches academic papers from arXiv API.

Free, no API key required. Rate limit: 1 request per 3 seconds.
Best for: CS, ML, AI, physics, mathematics preprints.
"""

import logging

import arxiv

from src.core.config import settings
from src.ingestion.base import Document, DocumentType, FetchResult, DataSourceAdapter

logger = logging.getLogger(__name__)


class ArxivAdapter(DataSourceAdapter):
    """arXiv API adapter for academic papers."""

    @property
    def source_name(self) -> str:
        return "arxiv"

    @property
    def source_type(self) -> DocumentType:
        return DocumentType.ACADEMIC_PAPER

    async def fetch(self, query: str, max_results: int | None = None) -> FetchResult:
        max_results = max_results or settings.ARXIV_MAX_RESULTS
        errors: list[str] = []

        logger.info("arXiv: searching '%s' (max=%d)", query, max_results)

        try:
            client = arxiv.Client()
            search = arxiv.Search(
                query=query,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.Relevance,
            )

            documents: list[Document] = []
            for result in client.results(search):
                try:
                    doc = Document(
                        id=self._make_id("arxiv", result.entry_id),
                        title=result.title.replace("\n", " "),
                        text=self._extract_full_text(result),
                        source_url=result.entry_id,
                        source_name="arxiv",
                        doc_type=DocumentType.ACADEMIC_PAPER,
                        authors=[a.name for a in result.authors],
                        year=result.published.year if result.published else None,
                        abstract=result.summary.replace("\n", " "),
                        doi=result.doi,
                        metadata={
                            "categories": result.categories,
                            "primary_category": result.primary_category,
                            "pdf_url": result.pdf_url,
                        },
                    )
                    documents.append(doc)
                except Exception as e:
                    errors.append(f"Failed to parse paper: {e}")

            logger.info("arXiv: found %d papers", len(documents))

            return FetchResult(
                documents=documents,
                source="arxiv",
                query=query,
                total_found=len(documents),
                errors=errors,
            )

        except Exception as e:
            logger.error("arXiv: fetch failed: %s", e)
            return FetchResult(
                documents=[],
                source="arxiv",
                query=query,
                total_found=0,
                errors=[str(e)],
            )

    def _extract_full_text(self, result: arxiv.Result) -> str:
        """Extract text from arXiv result. Uses abstract as fallback."""
        # Full PDF extraction is expensive; use abstract + metadata
        # For production, consider arxiv2text or PDF parsers
        parts = []
        if result.summary:
            parts.append(f"Abstract: {result.summary}")
        if result.title:
            parts.append(f"Title: {result.title}")
        return "\n\n".join(parts)
