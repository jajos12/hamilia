from fastapi import APIRouter

from src.api.schemas import ClaimRequest, DebateResponse
from src.pipeline.orchestrator import run_pipeline

router = APIRouter()


@router.post("/analyze-claim", response_model=DebateResponse)
async def analyze_claim(request: ClaimRequest) -> DebateResponse:
    """
    Analyze a claim by retrieving supporting and contradicting evidence,
    then synthesizing a structured debate.
    """
    result = await run_pipeline(request.claim)
    return DebateResponse(
        original_claim=result.original_claim,
        for_arguments=[
            {
                "claim": arg.claim,
                "sources": arg.sources,
                "stance": arg.stance,
                "strength": arg.strength,
                "verification_status": arg.verification_status,
            }
            for arg in result.for_arguments
        ],
        against_arguments=[
            {
                "claim": arg.claim,
                "sources": arg.sources,
                "stance": arg.stance,
                "strength": arg.strength,
                "verification_status": arg.verification_status,
            }
            for arg in result.against_arguments
        ],
        crux=result.crux,
        sources_used=[
            {
                "title": s.title,
                "authors": s.authors,
                "year": s.year,
                "url": s.url,
                "doi": s.doi,
                "journal": s.journal,
            }
            for s in result.sources_used
        ],
        verification_score=result.verification_score,
    )
