"""Data ingestion pipeline.

Source adapters fetch documents from various free APIs (arXiv, Semantic Scholar,
DuckDuckGo, RSS feeds, local files). All adapters output a unified Document format
that gets chunked and indexed into ChromaDB.
"""

from src.ingestion.base import DataSourceAdapter, Document, FetchResult
from src.ingestion.arxiv_adapter import ArxivAdapter
from src.ingestion.semantic_scholar_adapter import SemanticScholarAdapter
from src.ingestion.web_search_adapter import WebSearchAdapter
from src.ingestion.rss_adapter import RSSAdapter
from src.ingestion.file_adapter import FileAdapter
from src.ingestion.chunker import chunk_document, chunk_documents
from src.ingestion.indexer import index_documents

__all__ = [
    "DataSourceAdapter",
    "Document",
    "FetchResult",
    "ArxivAdapter",
    "SemanticScholarAdapter",
    "WebSearchAdapter",
    "RSSAdapter",
    "FileAdapter",
    "chunk_document",
    "chunk_documents",
    "index_documents",
]
