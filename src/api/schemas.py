from pydantic import BaseModel, Field


class ClaimRequest(BaseModel):
    claim: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="The claim to analyze (e.g., 'Large language models will cause mass unemployment within 10 years')",
        examples=["Large language models will cause mass unemployment within 10 years"],
    )


class SourceResponse(BaseModel):
    title: str
    authors: list[str]
    year: int
    url: str
    doi: str | None = None
    journal: str | None = None


class ArgumentResponse(BaseModel):
    claim: str
    sources: list[str]
    stance: str
    strength: str
    verification_status: str


class DebateResponse(BaseModel):
    original_claim: str
    for_arguments: list[ArgumentResponse]
    against_arguments: list[ArgumentResponse]
    crux: str
    sources_used: list[SourceResponse]
    verification_score: float
