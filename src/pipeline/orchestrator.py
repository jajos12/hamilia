from src.models.schemas import VerifiedDebateOutput
from src.rag.decomposer import decompose_claim
from src.rag.retriever import retrieve_adversarial
from src.rag.stance_tagger import tag_stance
from src.rag.synthesizer import synthesize_debate
from src.rag.verifier import verify_citations


async def run_pipeline(claim: str) -> VerifiedDebateOutput:
    """
    Execute the full adversarial evidence pipeline.

    Flow:
    1. Decompose claim into adversarial query pair
    2. Retrieve chunks for both PRO and CON queries
    3. Tag each chunk by stance (SUPPORT/CONTRADICT/NUANCE)
    4. Synthesize structured debate from tagged chunks
    5. Verify citation integrity
    """
    # Layer 1: Decompose
    queries = await decompose_claim(claim)

    # Layer 2: Retrieve
    retrieval_result = await retrieve_adversarial(
        pro_query=queries.pro_query,
        con_query=queries.con_query,
        claim=claim,
    )

    # Merge all chunks for stance tagging
    all_chunks = retrieval_result.pro_chunks + retrieval_result.con_chunks

    # Layer 3: Tag stance
    stance_result = tag_stance(claim, all_chunks)

    # Layer 4: Synthesize debate
    debate = await synthesize_debate(claim, stance_result)

    # Layer 5: Verify citations
    verified = await verify_citations(debate)

    return verified
