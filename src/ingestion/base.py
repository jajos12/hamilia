"""Base adapter interface and unified document format."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum


class DocumentType(str, Enum):
    """Document type for source-aware chunking."""

    ACADEMIC_PAPER = "academic_paper"
    NEWS_ARTICLE = "news_article"
    WEB_PAGE = "web_page"
    LOCAL_FILE = "local_file"


@dataclass
class Document:
    """Unified document format from any source adapter."""

    id: str
    title: str
    text: str
    source_url: str
    source_name: str  # e.g., "arxiv", "semantic_scholar", "web"
    doc_type: DocumentType
    authors: list[str] = field(default_factory=list)
    year: int | None = None
    abstract: str | None = None
    doi: str | None = None
    journal: str | None = None
    metadata: dict = field(default_factory=dict)


@dataclass
class FetchResult:
    """Result from a source adapter fetch."""

    documents: list[Document]
    source: str
    query: str
    total_found: int
    errors: list[str] = field(default_factory=list)


class DataSourceAdapter(ABC):
    """Abstract base for all data source adapters."""

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Return the source identifier (e.g., 'arxiv', 'web')."""

    @property
    @abstractmethod
    def source_type(self) -> DocumentType:
        """Return the document type this adapter produces."""

    @abstractmethod
    async def fetch(self, query: str, max_results: int = 20) -> FetchResult:
        """Fetch documents matching the query.

        Args:
            query: Search query string.
            max_results: Maximum documents to return.

        Returns:
            FetchResult with documents and metadata.
        """

    def _make_id(self, source: str, identifier: str) -> str:
        """Generate a deterministic document ID."""
        import hashlib

        return hashlib.sha256(f"{source}:{identifier}".encode()).hexdigest()[:16]
