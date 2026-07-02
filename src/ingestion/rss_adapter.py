"""RSS feed adapter — fetches news from RSS feeds.

Free, no API key required. No rate limit (be respectful).
Best for: news articles, blog posts, structured content.
"""

import logging
from datetime import datetime, timezone

import feedparser

from src.core.config import settings
from src.ingestion.base import Document, DocumentType, FetchResult, DataSourceAdapter

logger = logging.getLogger(__name__)

# Default feeds — expandable via config
DEFAULT_RSS_FEEDS: dict[str, str] = {
    "bbc_technology": "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "bbc_science": "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "bbc_business": "https://feeds.bbci.co.uk/news/business/rss.xml",
    "reuters_technology": "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best",
    "guardian_science": "https://www.theguardian.com/science/rss",
    "techcrunch": "https://techcrunch.com/feed/",
    "ars_technica": "https://feeds.arstechnica.com/arstechnica/index",
}


class RSSAdapter(DataSourceAdapter):
    """RSS feed adapter for news articles."""

    def __init__(self, feeds: dict[str, str] | None = None) -> None:
        self._feeds = feeds or DEFAULT_RSS_FEEDS

    @property
    def source_name(self) -> str:
        return "rss"

    @property
    def source_type(self) -> DocumentType:
        return DocumentType.NEWS_ARTICLE

    async def fetch(self, query: str, max_results: int | None = None) -> FetchResult:
        max_results = max_results or 20
        errors: list[str] = []
        documents: list[Document] = []

        logger.info("RSS: fetching from %d feeds", len(self._feeds))

        import asyncio

        loop = asyncio.get_event_loop()

        for feed_name, feed_url in self._feeds.items():
            try:
                def _parse() -> list[dict]:
                    feed = feedparser.parse(feed_url)
                    return [
                        {
                            "title": entry.get("title", ""),
                            "link": entry.get("link", ""),
                            "summary": entry.get("summary", ""),
                            "published": entry.get("published", ""),
                            "authors": [
                                a.get("name", "")
                                for a in entry.get("authors", [])
                            ],
                        }
                        for entry in feed.entries[:10]  # Top 10 per feed
                    ]

                entries = await loop.run_in_executor(None, _parse)

                for entry in entries:
                    try:
                        title = entry["title"]
                        summary = entry["summary"]

                        # Simple query relevance check
                        query_lower = query.lower()
                        text_lower = f"{title} {summary}".lower()
                        if not any(word in text_lower for word in query_lower.split()):
                            continue

                        # Parse date
                        year = None
                        if entry.get("published"):
                            try:
                                dt = datetime.now(timezone.utc)
                                year = dt.year
                            except (ValueError, TypeError):
                                pass

                        doc = Document(
                            id=self._make_id("rss", entry["link"]),
                            title=title,
                            text=f"{title}\n\n{summary}",
                            source_url=entry["link"],
                            source_name="rss",
                            doc_type=DocumentType.NEWS_ARTICLE,
                            authors=entry.get("authors", []),
                            year=year,
                            metadata={
                                "feed": feed_name,
                                "published": entry.get("published", ""),
                            },
                        )
                        documents.append(doc)
                    except Exception as e:
                        errors.append(f"Failed to parse entry from {feed_name}: {e}")

            except Exception as e:
                errors.append(f"Failed to fetch feed {feed_name}: {e}")

        # Limit total results
        documents = documents[:max_results]

        logger.info("RSS: found %d articles", len(documents))

        return FetchResult(
            documents=documents,
            source="rss",
            query=query,
            total_found=len(documents),
            errors=errors,
        )
