"""ChromaDB indexer — pushes chunks into the vector store."""

import logging

import chromadb
from chromadb.config import Settings as ChromaSettings

from src.core.config import settings
from src.ingestion.chunker import Chunk

logger = logging.getLogger(__name__)


def get_chroma_client() -> chromadb.ClientAPI:
    """Get or create ChromaDB client."""
    return chromadb.PersistentClient(
        path=settings.CHROMA_PERSIST_DIR,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def get_collection() -> chromadb.Collection:
    """Get or create the main collection."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=settings.CHROMA_COLLECTION,
        metadata={"hnsw:space": "cosine"},
    )


def index_chunks(chunks: list[Chunk], batch_size: int = 100) -> int:
    """Index chunks into ChromaDB.

    Args:
        chunks: List of Chunk objects to index.
        batch_size: Number of chunks per batch insert.

    Returns:
        Number of chunks successfully indexed.
    """
    collection = get_collection()
    indexed = 0

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]

        ids = [c.id for c in batch]
        documents = [c.text for c in batch]
        metadatas = [
            {
                "source_id": c.source_id,
                "source_name": c.source_name,
                "doc_type": c.doc_type,
                "section": c.section,
                "title": c.title,
                "authors": ", ".join(c.authors) if c.authors else "",
                "year": c.year or 0,
                "url": c.url,
                "doi": c.doi or "",
                "journal": c.journal or "",
            }
            for c in batch
        ]

        try:
            collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas,
            )
            indexed += len(batch)
            logger.info("Indexed batch %d-%d (%d total)", i, i + len(batch), indexed)
        except Exception as e:
            logger.error("Failed to index batch %d-%d: %s", i, i + len(batch), e)

    logger.info("Indexing complete: %d/%d chunks indexed", indexed, len(chunks))
    return indexed


def get_stats() -> dict:
    """Get collection statistics."""
    collection = get_collection()
    count = collection.count()
    return {
        "collection": settings.CHROMA_COLLECTION,
        "total_chunks": count,
        "persist_dir": settings.CHROMA_PERSIST_DIR,
    }


def clear_collection() -> None:
    """Delete and recreate the collection."""
    client = get_chroma_client()
    try:
        client.delete_collection(settings.CHROMA_COLLECTION)
        logger.info("Deleted collection: %s", settings.CHROMA_COLLECTION)
    except ValueError:
        pass

    get_collection()
    logger.info("Created fresh collection: %s", settings.CHROMA_COLLECTION)
