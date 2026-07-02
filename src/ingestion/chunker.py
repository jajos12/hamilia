"""Source-aware document chunker.

Chunks documents differently based on their type:
- Academic papers: abstract as one chunk, results/discussion by subsection
- News articles: paragraph-based with headline metadata
- Web pages: paragraph-based, shorter chunks
- Local files: by section headers or paragraph breaks
"""

import re
from dataclasses import dataclass

from src.ingestion.base import Document, DocumentType


@dataclass
class Chunk:
    """A chunk of text ready for embedding and indexing."""

    id: str
    text: str
    source_id: str  # Parent document ID
    source_name: str
    doc_type: str
    section: str
    title: str
    authors: list[str]
    year: int | None
    url: str
    doi: str | None = None
    journal: str | None = None
    metadata: dict | None = None


def chunk_document(doc: Document) -> list[Chunk]:
    """Chunk a single document based on its type."""
    chunkers = {
        DocumentType.ACADEMIC_PAPER: _chunk_academic_paper,
        DocumentType.NEWS_ARTICLE: _chunk_news_article,
        DocumentType.WEB_PAGE: _chunk_web_page,
        DocumentType.LOCAL_FILE: _chunk_local_file,
    }

    chunker = chunkers.get(doc.doc_type, _chunk_by_paragraph)
    return chunker(doc)


def chunk_documents(docs: list[Document]) -> list[Chunk]:
    """Chunk multiple documents."""
    all_chunks: list[Chunk] = []
    for doc in docs:
        all_chunks.extend(chunk_document(doc))
    return all_chunks


def _chunk_academic_paper(doc: Document) -> list[Chunk]:
    """Chunk academic paper: abstract + section-based."""
    chunks: list[Chunk] = []
    text = doc.text

    # Abstract is its own chunk (high-signal)
    if doc.abstract:
        chunks.append(
            Chunk(
                id=f"{doc.id}_abstract",
                text=f"Title: {doc.title}\n\nAbstract: {doc.abstract}",
                source_id=doc.id,
                source_name=doc.source_name,
                doc_type=doc.doc_type.value,
                section="abstract",
                title=doc.title,
                authors=doc.authors,
                year=doc.year,
                url=doc.source_url,
                doi=doc.doi,
                journal=doc.journal,
                metadata=doc.metadata,
            )
        )

    # Try to split by section headers
    section_patterns = [
        r"(?:^|\n)(?:Introduction|Background|Related Work)\s*\n",
        r"(?:^|\n)(?:Methods?|Methodology|Approach|Materials and Methods)\s*\n",
        r"(?:^|\n)(?:Results?|Experiments?|Evaluation|Findings)\s*\n",
        r"(?:^|\n)(?:Discussion|Analysis)\s*\n",
        r"(?:^|\n)(?:Conclusion|Conclusions|Summary)\s*\n",
    ]

    # If we can detect sections, chunk by them
    sections = _split_by_sections(text)

    if len(sections) > 1:
        for section_name, section_text in sections:
            if len(section_text.strip()) < 50:
                continue
            for i, paragraph in enumerate(_split_into_paragraphs(section_text)):
                if len(paragraph.strip()) < 50:
                    continue
                chunks.append(
                    Chunk(
                        id=f"{doc.id}_{section_name}_{i}",
                        text=paragraph,
                        source_id=doc.id,
                        source_name=doc.source_name,
                        doc_type=doc.doc_type.value,
                        section=section_name,
                        title=doc.title,
                        authors=doc.authors,
                        year=doc.year,
                        url=doc.source_url,
                        doi=doc.doi,
                        journal=doc.journal,
                        metadata=doc.metadata,
                    )
                )
    else:
        # Fallback: paragraph-based chunking
        chunks.extend(_chunk_by_paragraph(doc))

    return chunks


def _chunk_news_article(doc: Document) -> list[Chunk]:
    """Chunk news article: headline + paragraph-based."""
    return _chunk_by_paragraph(doc, max_chunk_size=1000)


def _chunk_web_page(doc: Document) -> list[Chunk]:
    """Chunk web page: shorter paragraph-based chunks."""
    return _chunk_by_paragraph(doc, max_chunk_size=800)


def _chunk_local_file(doc: Document) -> list[Chunk]:
    """Chunk local file: by section headers or paragraphs."""
    sections = _split_by_sections(doc.text)
    if len(sections) > 1:
        chunks: list[Chunk] = []
        for i, (section_name, section_text) in enumerate(sections):
            if len(section_text.strip()) < 50:
                continue
            chunks.append(
                Chunk(
                    id=f"{doc.id}_section_{i}",
                    text=section_text,
                    source_id=doc.id,
                    source_name=doc.source_name,
                    doc_type=doc.doc_type.value,
                    section=section_name,
                    title=doc.title,
                    authors=doc.authors,
                    year=doc.year,
                    url=doc.source_url,
                    metadata=doc.metadata,
                )
            )
        return chunks
    return _chunk_by_paragraph(doc)


def _chunk_by_paragraph(
    doc: Document, max_chunk_size: int = 1200
) -> list[Chunk]:
    """Generic paragraph-based chunking."""
    chunks: list[Chunk] = []
    paragraphs = _split_into_paragraphs(doc.text)

    for i, paragraph in enumerate(paragraphs):
        if len(paragraph.strip()) < 50:
            continue

        # Split long paragraphs
        if len(paragraph) > max_chunk_size:
            sub_chunks = _split_long_text(paragraph, max_chunk_size)
            for j, sub_chunk in enumerate(sub_chunks):
                chunks.append(
                    Chunk(
                        id=f"{doc.id}_p{i}_s{j}",
                        text=sub_chunk,
                        source_id=doc.id,
                        source_name=doc.source_name,
                        doc_type=doc.doc_type.value,
                        section=f"paragraph_{i}",
                        title=doc.title,
                        authors=doc.authors,
                        year=doc.year,
                        url=doc.source_url,
                        doi=doc.doi,
                        journal=doc.journal,
                        metadata=doc.metadata,
                    )
                )
        else:
            chunks.append(
                Chunk(
                    id=f"{doc.id}_p{i}",
                    text=paragraph,
                    source_id=doc.id,
                    source_name=doc.source_name,
                    doc_type=doc.doc_type.value,
                    section=f"paragraph_{i}",
                    title=doc.title,
                    authors=doc.authors,
                    year=doc.year,
                    url=doc.source_url,
                    doi=doc.doi,
                    journal=doc.journal,
                    metadata=doc.metadata,
                )
            )

    return chunks


def _split_into_paragraphs(text: str) -> list[str]:
    """Split text into paragraphs."""
    # Split on double newlines or single newlines with indentation
    paragraphs = re.split(r"\n\s*\n|\n(?=\s{2,})", text)
    return [p.strip() for p in paragraphs if p.strip()]


def _split_by_sections(text: str) -> list[tuple[str, str]]:
    """Split text by section headers."""
    # Common section header patterns
    header_pattern = r"^(#{1,3}\s+.+|[A-Z][A-Za-z\s]+:?\s*$)"
    lines = text.split("\n")
    sections: list[tuple[str, str]] = []
    current_section = "content"
    current_lines: list[str] = []

    for line in lines:
        if re.match(header_pattern, line, re.MULTILINE):
            if current_lines:
                sections.append((current_section, "\n".join(current_lines)))
            current_section = line.strip().lstrip("#").strip().lower()
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        sections.append((current_section, "\n".join(current_lines)))

    return sections


def _split_long_text(text: str, max_size: int) -> list[str]:
    """Split long text into smaller chunks at sentence boundaries."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks: list[str] = []
    current_chunk: list[str] = []
    current_size = 0

    for sentence in sentences:
        sentence_size = len(sentence)
        if current_size + sentence_size > max_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_size = 0
        current_chunk.append(sentence)
        current_size += sentence_size

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
