"""RSS feed adapter — fetches news from RSS feeds.

Free, no API key required. No rate limit (be respectful).
Best for: news articles, blog posts, structured content.
"""

import asyncio
import logging
from datetime import datetime, timezone

import feedparser

from src.core.config import settings
from src.ingestion.base import Document, DocumentType, FetchResult, DataSourceAdapter

logger = logging.getLogger(__name__)

# Curated feeds — smaller set, more reliable
DEFAULT_RSS_FEEDS: dict[str, str] = {
    "bbc_tech": "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "bbc_science": "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "bbc_business": "https://feeds.bbci.co.uk/news/business/rss.xml",
    "guardian_science": "https://www.theguardian.com/science/rss",
    "techcrunch": "https://techcrunch.com/feed/",
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

        for feed_name, feed_url in self._feeds.items():
            try:
                # Run feedparser with a timeout
                loop = asyncio.get_event_loop()
                entries = await asyncio.wait_for(
                    loop.run_in_executor(None, self._parse_feed, feed_url),
                    timeout=settings.RSS_FEED_TIMEOUT,
                )

                for entry in entries:
                    try:
                        title = entry.get("title", "")
                        summary = entry.get("summary", "")

                        # Simple query relevance check
                        query_lower = query.lower()
                        text_lower = f"{title} {summary}".lower()
                        if not any(word in text_lower for word in query_lower.split()):
                            continue

                        year = None
                        if entry.get("published"):
                            try:
                                year = datetime.now(timezone.utc).year
                            except (ValueError, TypeError):
                                pass

                        doc = Document(
                            id=self._make_id("rss", entry.get("link", "")),
                            title=title,
                            text=f"{title}\n\n{summary}",
                            source_url=entry.get("link", ""),
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

            except asyncio.TimeoutError:
                errors.append(f"Feed {feed_name} timed out after {settings.RSS_FEED_TIMEOUT}s")
                logger.warning("RSS: feed %s timed out", feed_name)
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

    @staticmethod
    def _parse_feed(feed_url: str) -> list[dict]:
        """Parse a feed URL (sync, run in executor)."""
        feed = feedparser.parse(feed_url)
        return [
            {
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "summary": entry.get("summary", ""),
                "published": entry.get("published", ""),
                "authors": [a.get("name", "") for a in entry.get("authors", [])],
            }
            for entry in feed.entries[:10]
        ]
