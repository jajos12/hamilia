"""Debate session schemas for multi-turn dialectical conversations."""

from __future__ import annotations

import uuid
import time
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class TurnPhase(str, Enum):
    """Phases of a structured debate."""

    OPENING = "opening"
    REBUTTAL_1 = "rebuttal_1"
    REBUTTAL_2 = "rebuttal_2"
    CROSS_EXAMINATION = "cross_examination"
    CRUX = "crux"


# Phase progression order
PHASE_ORDER: list[TurnPhase] = [
    TurnPhase.OPENING,
    TurnPhase.OPENING,
    TurnPhase.REBUTTAL_1,
    TurnPhase.REBUTTAL_1,
    TurnPhase.REBUTTAL_2,
    TurnPhase.REBUTTAL_2,
    TurnPhase.CROSS_EXAMINATION,
    TurnPhase.CROSS_EXAMINATION,
    TurnPhase.CRUX,
]


def next_phase(current_turns: int) -> TurnPhase | None:
    """Return the next phase based on how many turns have been completed."""
    if current_turns >= len(PHASE_ORDER):
        return None
    return PHASE_ORDER[current_turns]


def current_phase(turns_count: int) -> TurnPhase:
    """Return the current phase based on turn count."""
    idx = max(0, turns_count - 1)
    if idx < len(PHASE_ORDER):
        return PHASE_ORDER[idx]
    return TurnPhase.CRUX


class DebateTurn(BaseModel):
    """A single turn in the debate."""

    turn_id: int
    phase: TurnPhase
    speaker: Literal["for", "against", "judge"]
    content: str
    sources: list[dict] = Field(default_factory=list)
    timestamp: float = Field(default_factory=time.time)
    question: str | None = None  # For cross-examination: the question posed


class DebateSession(BaseModel):
    """Full debate session with all turns."""

    session_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12])
    original_claim: str
    turns: list[DebateTurn] = Field(default_factory=list)
    for_persona: str = ""
    against_persona: str = ""
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

    def current_phase(self) -> TurnPhase:
        return current_phase(len(self.turns))

    def next_phase(self) -> TurnPhase | None:
        return next_phase(len(self.turns))

    def get_for_turns(self) -> list[DebateTurn]:
        return [t for t in self.turns if t.speaker == "for"]

    def get_against_turns(self) -> list[DebateTurn]:
        return [t for t in self.turns if t.speaker == "against"]

    def get_judge_turns(self) -> list[DebateTurn]:
        return [t for t in self.turns if t.speaker == "judge"]

    def next_speaker(self) -> Literal["for", "against", "judge"]:
        """Determine who speaks next."""
        phase = self.next_phase()
        if phase is None:
            return "judge"
        if phase == TurnPhase.CRUX:
            return "judge"
        # Alternating: even turns = for, odd turns = against
        return "for" if len(self.turns) % 2 == 0 else "against"

    def add_turn(
        self,
        content: str,
        speaker: Literal["for", "against", "judge"],
        sources: list[dict] | None = None,
        question: str | None = None,
    ) -> DebateTurn:
        """Add a turn and advance state."""
        phase = self.next_phase() or TurnPhase.CRUX
        turn = DebateTurn(
            turn_id=len(self.turns) + 1,
            phase=phase,
            speaker=speaker,
            content=content,
            sources=sources or [],
            question=question,
        )
        self.turns.append(turn)
        self.updated_at = time.time()
        return turn

    def is_complete(self) -> bool:
        """Check if debate has reached the crux phase and finished."""
        return (
            len(self.turns) >= len(PHASE_ORDER)
            or self.next_phase() is None
        )

    def opponent_history(self, speaker: Literal["for", "against"]) -> str:
        """Get formatted history of opponent's arguments."""
        opponent = "against" if speaker == "for" else "for"
        turns = [t for t in self.turns if t.speaker == opponent]
        if not turns:
            return "No arguments from opponent yet."
        lines = []
        for t in turns:
            lines.append(f"[{t.phase.value}] {t.content}")
        return "\n\n".join(lines)

    def own_history(self, speaker: Literal["for", "against"]) -> str:
        """Get formatted history of own arguments."""
        turns = [t for t in self.turns if t.speaker == speaker]
        if not turns:
            return "You haven't argued yet."
        lines = []
        for t in turns:
            lines.append(f"[{t.phase.value}] {t.content}")
        return "\n\n".join(lines)


# ── API Request/Response Models ──────────────────────────────────────


class CreateDebateRequest(BaseModel):
    """Request to create a new debate session."""

    claim: str = Field(..., min_length=10, max_length=500)


class DebateTurnRequest(BaseModel):
    """Request to execute a single debate turn."""

    session_id: str
    phase: TurnPhase
    speaker: Literal["for", "against", "judge"]


class DebateTurnResponse(BaseModel):
    """Response after a turn completes."""

    turn_id: int
    phase: TurnPhase
    speaker: str
    content: str
    sources: list[dict]
    is_complete: bool
    next_phase: TurnPhase | None
    next_speaker: str | None


class DebateSessionResponse(BaseModel):
    """Full debate session state."""

    session_id: str
    original_claim: str
    turns: list[DebateTurn]
    current_phase: TurnPhase
    is_complete: bool
    for_persona: str
    against_persona: str
