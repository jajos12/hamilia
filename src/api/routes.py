from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from src.api.schemas import ClaimRequest, DebateResponse
from src.pipeline.orchestrator import run_pipeline
from src.models.debate import (
    CreateDebateRequest,
    DebateSessionResponse,
    DebateTurnRequest,
)
from src.rag.debater import create_session, get_session, stream_turn

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


# ── Debate Endpoints ─────────────────────────────────────────────────


@router.post("/debate/create", response_model=DebateSessionResponse)
async def create_debate(request: CreateDebateRequest) -> DebateSessionResponse:
    """Start a new debate session for a claim."""
    session = create_session(request.claim)
    return DebateSessionResponse(
        session_id=session.session_id,
        original_claim=session.original_claim,
        turns=session.turns,
        current_phase=session.current_phase(),
        is_complete=session.is_complete(),
        for_persona=session.for_persona,
        against_persona=session.against_persona,
    )


@router.get("/debate/{session_id}", response_model=DebateSessionResponse)
async def get_debate(session_id: str) -> DebateSessionResponse:
    """Get full debate state."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")
    return DebateSessionResponse(
        session_id=session.session_id,
        original_claim=session.original_claim,
        turns=session.turns,
        current_phase=session.current_phase(),
        is_complete=session.is_complete(),
        for_persona=session.for_persona,
        against_persona=session.against_persona,
    )


@router.post("/debate/{session_id}/turn")
async def debate_turn(session_id: str, request: DebateTurnRequest):
    """Execute a debate turn. Returns SSE stream."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Debate session not found")

    if session.is_complete():
        raise HTTPException(status_code=400, detail="Debate is already complete")

    return StreamingResponse(
        stream_turn(session, request.speaker),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    )
