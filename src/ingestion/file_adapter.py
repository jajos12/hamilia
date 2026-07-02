"""File adapter — loads local PDFs, markdown, and text files."""

import logging
from pathlib import Path

from src.ingestion.base import Document, DocumentType, FetchResult, DataSourceAdapter

logger = logging.getLogger(__name__)


class FileAdapter(DataSourceAdapter):
    """Local file adapter for PDFs, markdown, and text files."""

    def __init__(self, file_path: str | Path) -> None:
        self._path = Path(file_path)

    @property
    def source_name(self) -> str:
        return "file"

    @property
    def source_type(self) -> DocumentType:
        return DocumentType.LOCAL_FILE

    async def fetch(self, query: str, max_results: int | None = None) -> FetchResult:
        errors: list[str] = []

        if not self._path.exists():
            return FetchResult(
                documents=[],
                source="file",
                query=query,
                total_found=0,
                errors=[f"File not found: {self._path}"],
            )

        logger.info("File: loading %s", self._path)

        try:
            text = self._read_file()
            doc = Document(
                id=self._make_id("file", str(self._path)),
                title=self._path.stem,
                text=text,
                source_url=str(self._path.absolute()),
                source_name="file",
                doc_type=DocumentType.LOCAL_FILE,
                metadata={
                    "filename": self._path.name,
                    "extension": self._path.suffix,
                    "size_bytes": self._path.stat().st_size,
                },
            )

            return FetchResult(
                documents=[doc],
                source="file",
                query=query,
                total_found=1,
                errors=errors,
            )

        except Exception as e:
            logger.error("File: failed to read %s: %s", self._path, e)
            return FetchResult(
                documents=[],
                source="file",
                query=query,
                total_found=0,
                errors=[str(e)],
            )

    def _read_file(self) -> str:
        """Read file content based on extension."""
        suffix = self._path.suffix.lower()

        if suffix == ".pdf":
            return self._read_pdf()
        elif suffix in (".md", ".markdown"):
            return self._path.read_text(encoding="utf-8")
        elif suffix in (".txt", ".text"):
            return self._path.read_text(encoding="utf-8")
        else:
            # Try reading as text
            return self._path.read_text(encoding="utf-8")

    def _read_pdf(self) -> str:
        """Extract text from PDF."""
        try:
            import subprocess

            result = subprocess.run(
                ["pdftotext", "-layout", str(self._path), "-"],
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode == 0:
                return result.stdout
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

        # Fallback: try PyPDF2
        try:
            from PyPDF2 import PdfReader

            reader = PdfReader(str(self._path))
            text_parts = []
            for page in reader.pages:
                text_parts.append(page.extract_text() or "")
            return "\n\n".join(text_parts)
        except ImportError:
            logger.warning("File: no PDF reader available. Install pdftotext or PyPDF2.")
            return f"[PDF file: {self._path.name} - unable to extract text]"


def load_directory(directory: str | Path, recursive: bool = True) -> list[FileAdapter]:
    """Create FileAdapters for all supported files in a directory."""
    dir_path = Path(directory)
    if not dir_path.is_dir():
        raise ValueError(f"Not a directory: {dir_path}")

    supported = {".pdf", ".md", ".markdown", ".txt", ".text"}
    adapters: list[FileAdapter] = []

    pattern = "**/*" if recursive else "*"
    for file_path in dir_path.glob(pattern):
        if file_path.is_file() and file_path.suffix.lower() in supported:
            adapters.append(FileAdapter(file_path))

    logger.info("Directory: found %d supported files in %s", len(adapters), dir_path)
    return adapters
