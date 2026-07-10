"""Debate engine — multi-turn dialectical argument system.

Manages structured debates between FOR and AGAINST debaters,
streaming each turn via SSE.
"""

import json
import logging
from collections.abc import AsyncIterator
from typing import Literal

from src.llm.base import get_llm_client
from src.models.debate import (
    DebateSession,
    DebateTurn,
    TurnPhase,
)

logger = logging.getLogger(__name__)


# ── Phase Prompts (trimmed for shorter context, longer outputs) ──────

OPENING_FOR = """Debate topic: {claim}
Your position: FOR
Write your opening statement. Be persuasive, cite evidence, make a strong case.
Write 2-4 paragraphs."""


OPENING_AGAINST = """Debate topic: {claim}
Your position: AGAINST
Write your opening statement. Be critical, expose weaknesses, present counter-evidence.
Write 2-4 paragraphs."""


REBUTTAL_FOR = """Debate topic: {claim}
Your position: FOR
Round {round_number} rebuttal.

Opponent just said:
{opponent_last}

Your previous arguments:
{own_history}

Directly counter their strongest point with evidence. Stay firm. 2-3 paragraphs."""


REBUTTAL_AGAINST = """Debate topic: {claim}
Your position: AGAINST
Round {round_number} rebuttal.

Opponent just said:
{opponent_last}

Your previous arguments:
{own_history}

Directly counter their strongest point with evidence. Stay firm. 2-3 paragraphs."""


CROSS_EXAM_FOR = """Debate topic: {claim}
Your position: FOR
Cross-examination round.

Opponent's full argument:
{opponent_history}

Your full argument:
{own_history}

Deliver one devastating question or counter-point that exposes their weakest claim. Be surgical. 1-2 paragraphs."""


CROSS_EXAM_AGAINST = """Debate topic: {claim}
Your position: AGAINST
Cross-examination round.

Opponent's full argument:
{opponent_history}

Your full argument:
{own_history}

Deliver one devastating question or counter-point that exposes their weakest claim. Be surgical. 1-2 paragraphs."""


CRUX_JUDGE = """Debate topic: {claim}

FOR side argued:
{for_history}

AGAINST side argued:
{against_history}

You are the judge. Analyze both sides and deliver your verdict:
1. What is the real point of disagreement?
2. Which side presented stronger evidence?
3. Your final judgment.

Write 3-5 paragraphs."""


# ── Prompt Selection ──────────────────────────────────────────────────

def _get_prompt(
    phase: TurnPhase,
    speaker: Literal["for", "against", "judge"],
    session: DebateSession,
    round_number: int = 1,
) -> str:
    """Select the appropriate prompt for this turn."""
    claim = session.original_claim

    if phase == TurnPhase.OPENING:
        if speaker == "for":
            return OPENING_FOR.format(claim=claim)
        else:
            return OPENING_AGAINST.format(claim=claim)

    elif phase in (TurnPhase.REBUTTAL_1, TurnPhase.REBUTTAL_2):
        opponent_last = session.opponent_history(speaker).split("\n\n")[-1]
        own_hist = session.own_history(speaker)
        if speaker == "for":
            return REBUTTAL_FOR.format(
                claim=claim,
                round_number=round_number,
                opponent_last=opponent_last,
                own_history=own_hist,
            )
        else:
            return REBUTTAL_AGAINST.format(
                claim=claim,
                round_number=round_number,
                opponent_last=opponent_last,
                own_history=own_hist,
            )

    elif phase == TurnPhase.CROSS_EXAMINATION:
        opponent_hist = session.opponent_history(speaker)
        own_hist = session.own_history(speaker)
        if speaker == "for":
            return CROSS_EXAM_FOR.format(
                claim=claim,
                opponent_history=opponent_hist,
                own_history=own_hist,
            )
        else:
            return CROSS_EXAM_AGAINST.format(
                claim=claim,
                opponent_history=opponent_hist,
                own_history=own_hist,
            )

    elif phase == TurnPhase.CRUX:
        return CRUX_JUDGE.format(
            claim=claim,
            for_history="\n\n".join(
                t.content for t in session.get_for_turns()
            ),
            against_history="\n\n".join(
                t.content for t in session.get_against_turns()
            ),
        )

    raise ValueError(f"Unknown phase: {phase}")


# ── Debate Engine ─────────────────────────────────────────────────────

# In-memory session store (production: use Redis/DB)
_sessions: dict[str, DebateSession] = {}


def create_session(claim: str) -> DebateSession:
    """Create a new debate session."""
    session = DebateSession(original_claim=claim)
    _sessions[session.session_id] = session
    logger.info("Created debate session %s for claim: %s", session.session_id, claim[:80])
    return session


def get_session(session_id: str) -> DebateSession | None:
    """Retrieve a debate session by ID."""
    return _sessions.get(session_id)


async def stream_turn(
    session: DebateSession,
    speaker: Literal["for", "against", "judge"],
) -> AsyncIterator[str]:
    """Execute a debate turn, streaming tokens via SSE."""
    phase = session.next_phase()
    if phase is None:
        yield _sse_event("error", {"message": "Debate is complete"})
        return

    # Determine round number
    round_number = 1
    if phase in (TurnPhase.REBUTTAL_1, TurnPhase.CROSS_EXAMINATION):
        round_number = 1
    elif phase in (TurnPhase.REBUTTAL_2,):
        round_number = 2

    # Emit phase start
    yield _sse_event("phase_start", {
        "phase": phase.value,
        "speaker": speaker,
        "round_number": round_number,
    })

    # Get the prompt
    prompt = _get_prompt(phase, speaker, session, round_number)
    logger.info("Debate prompt length: %d chars", len(prompt))

    # Stream tokens from LLM
    client = get_llm_client()
    collected_text = ""

    try:
        async for token in client.generate_stream(
            prompt=prompt,
            system_prompt=None,  # Keep prompts lean — no system prompt overhead
            temperature=0.8,
            max_tokens=2048,
        ):
            collected_text += token
            yield _sse_event("token", {"text": token})

    except Exception as e:
        logger.error("Debate turn failed: %s", e)
        yield _sse_event("error", {"message": str(e)})
        return

    logger.info(
        "Debate turn complete: phase=%s speaker=%s length=%d",
        phase.value, speaker, len(collected_text),
    )

    # Guard: if response is suspiciously short, warn
    if len(collected_text) < 50:
        logger.warning("Very short response (%d chars), may indicate API issue", len(collected_text))

    # Record the turn
    turn = session.add_turn(
        content=collected_text,
        speaker=speaker,
        sources=[],
    )

    # Emit turn complete
    next_p = session.next_phase()
    yield _sse_event("argument_complete", {
        "turn_id": turn.turn_id,
        "phase": phase.value,
        "speaker": speaker,
        "content_length": len(collected_text),
    })

    yield _sse_event("phase_complete", {
        "phase": phase.value,
        "next_phase": next_p.value if next_p else None,
        "is_complete": session.is_complete(),
    })

    if session.is_complete():
        yield _sse_event("debate_complete", {
            "session_id": session.session_id,
            "total_turns": len(session.turns),
        })


def _sse_event(event_type: str, data: dict) -> str:
    """Format data as an SSE event string."""
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
