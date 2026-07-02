from sentence_transformers import CrossEncoder

from src.core.config import settings
from src.models.schemas import Chunk, StanceResult, TaggedChunk

# Load NLI model once at module level
nli_model = CrossEncoder(settings.NLI_MODEL)


def tag_stance(claim: str, chunks: list[Chunk]) -> StanceResult:
    """Classify each chunk by stance toward the original claim."""
    result = StanceResult()

    pairs = [(claim, chunk.text) for chunk in chunks]
    scores = nli_model.predict(pairs)

    for chunk, score in zip(chunks, scores):
        # CrossEncoder returns [contradiction, neutral, entailment]
        # score is a 3-element array
        if hasattr(score, "__len__") and len(score) == 3:
            contradiction, neutral, entailment = score
            if entailment > contradiction and entailment > neutral:
                stance = "SUPPORT"
                confidence = float(entailment)
            elif contradiction > entailment and contradiction > neutral:
                stance = "CONTRADICT"
                confidence = float(contradiction)
            else:
                stance = "NUANCE"
                confidence = float(neutral)
        else:
            # Fallback: treat as a single relevance score
            stance = "SUPPORT" if score > 0.5 else "CONTRADICT"
            confidence = float(score)

        # Low confidence → NUANCE
        if confidence < 0.7:
            stance = "NUANCE"

        tagged = TaggedChunk(chunk=chunk, stance=stance, confidence=confidence)

        if stance == "SUPPORT":
            result.support.append(tagged)
        elif stance == "CONTRADICT":
            result.contradict.append(tagged)
        else:
            result.nuance.append(tagged)

    # Sort by confidence within each group
    result.support.sort(key=lambda x: x.confidence, reverse=True)
    result.contradict.sort(key=lambda x: x.confidence, reverse=True)
    result.nuance.sort(key=lambda x: x.confidence, reverse=True)

    return result
