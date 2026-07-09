import logging
from typing import Any

from src.core.config import settings
from src.models.schemas import Chunk, StanceResult, TaggedChunk

logger = logging.getLogger(__name__)

# Lazy-loaded NLI model
_nli_model: Any = None


def _get_nli_model():
    """Lazy load the NLI model on first use."""
    global _nli_model
    if _nli_model is None:
        logger.info("Loading NLI model: %s", settings.NLI_MODEL)
        from sentence_transformers import CrossEncoder

        _nli_model = CrossEncoder(settings.NLI_MODEL)
        logger.info("NLI model loaded successfully")
    return _nli_model


def tag_stance(claim: str, chunks: list[Chunk]) -> StanceResult:
    """Classify each chunk by stance toward the original claim."""
    result = StanceResult()
    nli_model = _get_nli_model()

    pairs = [(claim, chunk.text) for chunk in chunks]
    scores = nli_model.predict(pairs)

    for chunk, score in zip(chunks, scores):
        # CrossEncoder returns [contradiction, neutral, entailment]
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
            stance = "SUPPORT" if score > 0.5 else "CONTRADICT"
            confidence = float(score)

        if confidence < 0.7:
            stance = "NUANCE"

        tagged = TaggedChunk(chunk=chunk, stance=stance, confidence=confidence)

        if stance == "SUPPORT":
            result.support.append(tagged)
        elif stance == "CONTRADICT":
            result.contradict.append(tagged)
        else:
            result.nuance.append(tagged)

    result.support.sort(key=lambda x: x.confidence, reverse=True)
    result.contradict.sort(key=lambda x: x.confidence, reverse=True)
    result.nuance.sort(key=lambda x: x.confidence, reverse=True)

    return result
