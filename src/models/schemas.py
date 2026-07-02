from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Source:
    title: str
    authors: list[str]
    year: int
    url: str
    doi: Optional[str] = None
    journal: Optional[str] = None


@dataclass
class Chunk:
    id: str
    text: str
    source: Source
    section: str  # abstract, results, discussion, methods


@dataclass
class TaggedChunk:
    chunk: Chunk
    stance: str  # SUPPORT, CONTRADICT, NUANCE
    confidence: float


@dataclass
class AdversarialQueryPair:
    pro_query: str
    con_query: str


@dataclass
class RetrievalResult:
    pro_chunks: list[Chunk]
    con_chunks: list[Chunk]


@dataclass
class StanceResult:
    support: list[TaggedChunk] = field(default_factory=list)
    contradict: list[TaggedChunk] = field(default_factory=list)
    nuance: list[TaggedChunk] = field(default_factory=list)


@dataclass
class Argument:
    claim: str
    sources: list[str]
    stance: str  # FOR or AGAINST
    strength: str  # strong, moderate, weak


@dataclass
class DebateOutput:
    for_arguments: list[Argument]
    against_arguments: list[Argument]
    crux: str
    original_claim: str


@dataclass
class VerifiedArgument:
    claim: str
    sources: list[str]
    stance: str
    strength: str
    verification_status: str  # VALID, PARTIAL, INVALID


@dataclass
class VerifiedDebateOutput:
    for_arguments: list[VerifiedArgument]
    against_arguments: list[VerifiedArgument]
    crux: str
    original_claim: str
    sources_used: list[Source]
    verification_score: float
