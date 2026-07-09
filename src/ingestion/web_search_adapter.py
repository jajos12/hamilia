"""Web search adapter — fetches results via DuckDuckGo.

Free, no API key required. Rate limit: soft limit, backoff recommended.
Best for: general web search, news, opinion pieces.
"""

import asyncio
import logging

from src.core.config import settings
from src.ingestion.base import Document, DocumentType, FetchResult, DataSourceAdapter

logger = logging.getLogger(__name__)


class WebSearchAdapter(DataSourceAdapter):
    """DuckDuckGo web search adapter."""

    @property
    def source_name(self) -> str:
        return "web"

    @property
    def source_type(self) -> DocumentType:
        return DocumentType.WEB_PAGE

    async def fetch(self, query: str, max_results: int | None = None) -> FetchResult:
        max_results = max_results or settings.WEB_SEARCH_MAX_RESULTS
        errors: list[str] = []

        logger.info("DuckDuckGo: searching '%s' (max=%d)", query, max_results)

        try:
            loop = asyncio.get_event_loop()

            def _search() -> list[dict]:
                try:
                    from ddgs import DDGS
                except ImportError:
                    from duckduckgo_search import DDGS

                with DDGS() as ddgs:
                    return list(ddgs.text(query, max_results=max_results))

            results = await asyncio.wait_for(
                loop.run_in_executor(None, _search),
                timeout=15,
            )

            documents: list[Document] = []
            for i, result in enumerate(results):
                try:
                    url = result.get("href", "")
                    title = result.get("title", "")
                    snippet = result.get("body", "")

                    doc = Document(
                        id=self._make_id("web", url),
                        title=title,
                        text=f"{title}\n\n{snippet}",
                        source_url=url,
                        source_name="web",
                        doc_type=DocumentType.WEB_PAGE,
                        metadata={
                            "snippet": snippet,
                            "position": i + 1,
                        },
                    )
                    documents.append(doc)
                except Exception as e:
                    errors.append(f"Failed to parse result: {e}")

            logger.info("DuckDuckGo: found %d results", len(documents))

            return FetchResult(
                documents=documents,
                source="web",
                query=query,
                total_found=len(documents),
                errors=errors,
            )

        except asyncio.TimeoutError:
            logger.warning("DuckDuckGo: search timed out")
            return FetchResult(
                documents=[],
                source="web",
                query=query,
                total_found=0,
                errors=["Search timed out"],
            )
        except ImportError:
            logger.error("DuckDuckGo: ddgs/duckduckgo-search not installed")
            return FetchResult(
                documents=[],
                source="web",
                query=query,
                total_found=0,
                errors=["Search package not installed"],
            )
        except Exception as e:
            logger.error("DuckDuckGo: fetch failed: %s", e)
            return FetchResult(
                documents=[],
                source="web",
                query=query,
                total_found=0,
                errors=[str(e)],
            )
