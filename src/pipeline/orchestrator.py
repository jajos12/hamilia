import logging

from src.models.schemas import VerifiedDebateOutput
from src.rag.decomposer import decompose_claim
from src.rag.retriever import retrieve_adversarial
from src.rag.stance_tagger import tag_stance
from src.rag.synthesizer import synthesize_debate
from src.rag.verifier import verify_citations

logger = logging.getLogger(__name__)


async def run_pipeline(claim: str) -> VerifiedDebateOutput:
    """Execute the full adversarial evidence pipeline.

    Flow:
    1. Decompose claim into adversarial query pair
    2. Retrieve chunks for both PRO and CON queries (multi-source, parallel)
    3. Tag each chunk by stance (SUPPORT/CONTRADICT/NUANCE) via NLI
    4. Synthesize structured debate from tagged chunks
    5. Verify citation integrity
    """
    # Layer 1: Decompose claim → {pro_query, con_query}
    logger.info("Pipeline: decomposing claim")
    queries = await decompose_claim(claim)

    # Layer 2: Retrieve from all sources in parallel
    logger.info("Pipeline: retrieving evidence")
    retrieval_result = await retrieve_adversarial(
        pro_query=queries["pro_query"],
        con_query=queries["con_query"],
        claim=claim,
    )

    if not retrieval_result.chunks:
        logger.warning("Pipeline: no chunks retrieved, returning empty debate")
        from src.models.schemas import VerifiedDebateOutput, VerifiedArgument
        return VerifiedDebateOutput(
            for_arguments=[],
            against_arguments=[],
            crux="No evidence found for this claim.",
            original_claim=claim,
            sources_used=[],
            verification_score=0.0,
        )

    # Layer 3: Tag stance via NLI model
    logger.info("Pipeline: tagging stance for %d chunks", len(retrieval_result.chunks))
    stance_result = tag_stance(claim, retrieval_result.chunks)

    # Layer 4: Synthesize structured debate
    logger.info("Pipeline: synthesizing debate")
    debate = await synthesize_debate(claim, stance_result)

    # Layer 5: Verify citations
    logger.info("Pipeline: verifying citations")
    verified = await verify_citations(debate)

    return verified
