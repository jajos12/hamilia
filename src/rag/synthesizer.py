"""Argument synthesis layer.

Synthesizes a structured debate from stance-tagged chunks
using the configured LLM provider.
"""

import logging

from src.llm.base import get_llm_client
from src.models.schemas import Argument, DebateOutput, StanceResult

logger = logging.getLogger(__name__)

SYNTHESIS_PROMPT = """You are an intellectual debate synthesizer. Given evidence tagged by stance,
produce a structured analysis.

ORIGINAL CLAIM: {claim}

SUPPORTING EVIDENCE (tagged SUPPORT):
{for_chunks}

CONTRADICTING EVIDENCE (tagged CONTRADICT):
{against_chunks}

NUANCED EVIDENCE (tagged NUANCE):
{nuance_chunks}

Generate a structured JSON response with:
1. for_arguments: List of 3-4 strongest arguments supporting the claim, each with:
   - claim: The argument text
   - sources: List of source citations [Source: DOI/title]
   - strength: "strong", "moderate", or "weak"
2. against_arguments: List of 3-4 strongest arguments against the claim, same format
3. crux: What is the real point of disagreement? Where do the sides actually talk past each other?

Rules:
- Preserve source citations
- Do not synthesize across sources (keep arguments discrete)
- If evidence is weak, say so
- The CRUX should identify the deepest structural disagreement

Respond in JSON format."""


def format_chunks(chunks: list) -> str:
    """Format tagged chunks for the prompt."""
    if not chunks:
        return "No evidence available."
    lines = []
    for i, tagged in enumerate(chunks, 1):
        source_ref = (
            f"{tagged.chunk.title} ({tagged.chunk.year})"
            if tagged.chunk.title
            else f"Source {i}"
        )
        lines.append(f"[{i}] {tagged.chunk.text}\n    Source: {source_ref}")
    return "\n\n".join(lines)


async def synthesize_debate(claim: str, stance_result: StanceResult) -> DebateOutput:
    """Synthesize a structured debate from stance-tagged chunks."""
    from src.core.config import settings

    client = get_llm_client()
    logger.info("Synthesizing debate with provider=%s", client.provider_name)

    result = await client.generate_json(
        prompt=SYNTHESIS_PROMPT.format(
            claim=claim,
            for_chunks=format_chunks(stance_result.support[: settings.TOP_K_SUPPORT]),
            against_chunks=format_chunks(
                stance_result.contradict[: settings.TOP_K_CONTRADICT]
            ),
            nuance_chunks=format_chunks(stance_result.nuance[: settings.TOP_K_NUANCE]),
        ),
        system_prompt="You are an intellectual debate synthesizer that outputs JSON.",
        temperature=0.3,
    )

    for_args = [
        Argument(
            claim=arg.get("claim", ""),
            sources=arg.get("sources", []),
            stance="FOR",
            strength=arg.get("strength", "moderate"),
        )
        for arg in result.get("for_arguments", [])
    ]

    against_args = [
        Argument(
            claim=arg.get("claim", ""),
            sources=arg.get("sources", []),
            stance="AGAINST",
            strength=arg.get("strength", "moderate"),
        )
        for arg in result.get("against_arguments", [])
    ]

    logger.info(
        "Synthesized %d FOR and %d AGAINST arguments",
        len(for_args),
        len(against_args),
    )

    return DebateOutput(
        for_arguments=for_args,
        against_arguments=against_args,
        crux=result.get("crux", ""),
        original_claim=claim,
    )
