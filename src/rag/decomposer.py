"""Claim decomposition layer.

Decomposes a claim into an adversarial query pair (PRO + CON)
using the configured LLM provider.
"""

import logging

from src.llm.base import get_llm_client

logger = logging.getLogger(__name__)

DECOMPOSITION_PROMPT = """You are a research analyst. Given a claim, generate two search queries:
1. PRO query: finds evidence SUPPORTING the claim
2. CON query: finds evidence CONTRADICTING or limiting the claim

Rules:
- Each query should be 5-15 words
- Use academic/research terminology
- Focus on empirical evidence, not opinions
- The CON query should seek genuine counter-evidence, not just absence of support

Respond in JSON format:
{{
    "pro_query": "...",
    "con_query": "..."
}}

Claim: {claim}"""


async def decompose_claim(claim: str) -> dict:
    """Decompose a claim into an adversarial query pair.

    Returns:
        Dict with 'pro_query' and 'con_query' keys.
    """
    client = get_llm_client()
    logger.info("Decomposing claim with provider=%s", client.provider_name)

    result = await client.generate_json(
        prompt=DECOMPOSITION_PROMPT.format(claim=claim),
        system_prompt="You are a research analyst that outputs JSON.",
        temperature=0.3,
    )

    pro_query = result.get("pro_query", claim)
    con_query = result.get("con_query", f"evidence against {claim}")

    logger.info("Decomposed: PRO='%s', CON='%s'", pro_query, con_query)

    return {"pro_query": pro_query, "con_query": con_query}
