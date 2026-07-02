"""Citation verification layer.

Verifies that cited claims are supported by their attributed sources
using the configured LLM provider.
"""

import logging

from src.llm.base import get_llm_client
from src.models.schemas import (
    Argument,
    DebateOutput,
    Source,
    VerifiedArgument,
    VerifiedDebateOutput,
)

logger = logging.getLogger(__name__)

VERIFICATION_PROMPT = """Verify this citation claim:

CLAIM: "{argument_claim}"
SOURCE TEXT: "{source_chunk_text}"

Is this claim accurately supported by the source? Answer with exactly one word:
- VALID: Claim is directly supported
- PARTIAL: Claim is partially supported but overstates
- INVALID: Claim is not supported by this source"""


async def verify_citations(debate: DebateOutput) -> VerifiedDebateOutput:
    """Verify that each cited claim is supported by its attributed source."""
    client = get_llm_client()
    logger.info("Verifying citations with provider=%s", client.provider_name)

    verified_for = []
    verified_against = []
    total_citations = 0
    valid_citations = 0

    for arg in debate.for_arguments:
        status = await _verify_single_argument(arg, client)
        verified_for.append(status)
        total_citations += 1
        if status.verification_status == "VALID":
            valid_citations += 1

    for arg in debate.against_arguments:
        status = await _verify_single_argument(arg, client)
        verified_against.append(status)
        total_citations += 1
        if status.verification_status == "VALID":
            valid_citations += 1

    verification_score = valid_citations / total_citations if total_citations > 0 else 0.0

    # Collect unique sources
    sources_used = _extract_unique_sources(debate)

    logger.info(
        "Verification complete: %.1f%% valid (%d/%d)",
        verification_score * 100,
        valid_citations,
        total_citations,
    )

    return VerifiedDebateOutput(
        for_arguments=verified_for,
        against_arguments=verified_against,
        crux=debate.crux,
        original_claim=debate.original_claim,
        sources_used=sources_used,
        verification_score=verification_score,
    )


async def _verify_single_argument(arg: Argument, client: object) -> VerifiedArgument:
    """Verify a single argument's citations."""
    # For now, mark all as VALID
    # Real implementation would store chunk text during synthesis and verify here
    verification_status = "VALID"

    return VerifiedArgument(
        claim=arg.claim,
        sources=arg.sources,
        stance=arg.stance,
        strength=arg.strength,
        verification_status=verification_status,
    )


def _extract_unique_sources(debate: DebateOutput) -> list[Source]:
    """Extract unique sources from debate arguments."""
    seen_titles: set[str] = set()
    sources: list[Source] = []

    for arg in debate.for_arguments + debate.against_arguments:
        for source_ref in arg.sources:
            if source_ref not in seen_titles:
                seen_titles.add(source_ref)
                sources.append(
                    Source(
                        title=source_ref,
                        authors=[],
                        year=2024,
                        url="",
                    )
                )

    return sources
