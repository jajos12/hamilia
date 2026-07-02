# Pipeline Deep Dive

## Layer 1: Claim Decomposition

**Purpose**: Transform a single claim into an adversarial query pair.

### Input/Output
```python
Input:  "Large language models will cause mass unemployment within 10 years"
Output: AdversarialQueryPair(
    pro_query="evidence large language models cause unemployment job displacement",
    con_query="evidence large language models create jobs economic growth employment"
)
```

### Implementation
Uses an LLM with a structured prompt to decompose the claim:

```
You are a research analyst. Given a claim, generate two search queries:
1. PRO query: finds evidence SUPPORTING the claim
2. CON query: finds evidence CONTRADICTING or limiting the claim

Rules:
- Each query should be 5-15 words
- Use academic/research terminology
- Focus on empirical evidence, not opinions
- The CON query should seek genuine counter-evidence, not just absence of support

Claim: {claim}
```

### Fallback Strategy
If LLM decomposition fails, use template-based negation:
- PRO: original claim keywords
- CON: "{keywords} null results OR contradicting OR against OR limitations"

---

## Layer 2: Parallel Retrieval

**Purpose**: Execute both queries against the vector store simultaneously.

### Chunking Strategy
For academic papers (primary corpus type):
- **Abstract**: Stored as a separate chunk (high-signal, self-contained)
- **Results section**: Chunked by subsection (contains empirical claims)
- **Discussion**: Chunked by paragraph (contains interpretation)
- **Metadata**: DOI, authors, year, journal, section type

```python
@dataclass
class Chunk:
    id: str
    text: str
    source: Source  # title, authors, year, url, doi
    section: str    # abstract, results, discussion, methods
    embedding: Optional[List[float]] = None
```

### Retrieval Configuration
- **Top-K**: 10 chunks per query (PRO and CON)
- **Similarity threshold**: 0.3 minimum cosine similarity
- **Metadata filtering**: Optional (e.g., "last 5 years only", "peer-reviewed only")
- **Deduplication**: Remove chunks appearing in both result sets

### Parallel Execution
```python
async def retrieve_adversarial(queries: AdversarialQueryPair) -> RetrievalResult:
    pro_task = vector_store.search(queries.pro_query, k=10)
    con_task = vector_store.search(queries.con_query, k=10)
    pro_chunks, con_chunks = await asyncio.gather(pro_task, con_task)
    return merge_and_deduplicate(pro_chunks, con_chunks)
```

---

## Layer 3: Stance Tagging

**Purpose**: Classify each retrieved chunk by its stance toward the original claim.

### Model
`cross-encoder/nli-deberta-v3-base` from sentence-transformers
- Input: (claim_premise, evidence_hypothesis)
- Output: {entailment, contradiction, neutral}
- Mapping: entailment → SUPPORT, contradiction → CONTRADICT, neutral → NUANCE

### Stance Classification Logic
```python
def classify_stance(claim: str, chunk: Chunk) -> TaggedChunk:
    # Pair claim with chunk text
    nli_result = nli_model.predict([(claim, chunk.text)])
    
    # Map NLI labels to stance
    stance_map = {
        "entailment": "SUPPORT",
        "contradiction": "CONTRADICT",
        "neutral": "NUANCE"
    }
    
    stance = stance_map[nli_result.label]
    confidence = nli_result.score
    
    # Low confidence → NUANCE (hedging)
    if confidence < 0.7:
        stance = "NUANCE"
    
    return TaggedChunk(chunk=chunk, stance=stance, confidence=confidence)
```

### Re-ranking Within Stance Groups
After classification, rank chunks within each stance by:
1. **Confidence score** (primary sort)
2. **Section type** (abstract > results > discussion)
3. **Recency** (newer papers weighted higher)

### Output
```python
@dataclass
class StanceResult:
    support: List[TaggedChunk]    # Top 4 SUPPORT chunks
    contradict: List[TaggedChunk] # Top 4 CONTRADICT chunks
    nuance: List[TaggedChunk]     # Top 2 NUANCE chunks (for crux analysis)
```

---

## Layer 4: Argument Synthesis

**Purpose**: Generate a structured debate from stance-tagged chunks.

### Prompt Structure
```
You are an intellectual debate synthesizer. Given evidence tagged by stance,
produce a structured analysis.

ORIGINAL CLAIM: {claim}

SUPPORTING EVIDENCE (tagged SUPPORT):
{for_chunks with citations}

CONTRADICTING EVIDENCE (tagged CONTRADICT):
{against_chunks with citations}

NUANCED EVIDENCE (tagged NUANCE):
{nuance_chunks with citations}

Generate a structured response with:
1. FOR: Strongest 3-4 arguments supporting the claim, each citing a specific source
2. AGAINST: Strongest 3-4 arguments against the claim, each citing a specific source
3. CRUX: What is the real point of disagreement? Where do the sides actually talk past each other?

Rules:
- Preserve source citations [Source: DOI/title]
- Do not synthesize across sources (keep arguments discrete)
- If evidence is weak, say so
- The CRUX should identify the deepest structural disagreement
```

### Output Format
```python
@dataclass
class Argument:
    claim: str           # The argument text
    sources: List[str]   # Source citations
    stance: str          # "FOR" or "AGAINST"
    strength: str        # "strong", "moderate", "weak"

@dataclass
class DebateOutput:
    for_arguments: List[Argument]
    against_arguments: List[Argument]
    crux: str
    original_claim: str
```

---

## Layer 5: Citation Verification

**Purpose**: Ensure every cited claim actually appears in its attributed source.

### Verification Pass
For each argument in the output:
1. Extract the claim text
2. Extract the cited source
3. Verify the claim is substantiated by the source chunk
4. Flag mismatches for removal or correction

### Prompt for Verification
```
Verify this citation claim:
CLAIM: "{argument_claim}"
SOURCE TEXT: "{source_chunk_text}"

Is this claim accurately supported by the source? Answer:
- VALID: Claim is directly supported
- PARTIAL: Claim is partially supported but overstates
- INVALID: Claim is not supported by this source
```

### Post-Verification Cleanup
- Remove INVALID citations entirely
- Rewrite PARTIAL citations to be more accurate
- If no valid citations remain for an argument, remove the argument

### Final Output
```python
@dataclass
class VerifiedDebateOutput:
    for_arguments: List[VerifiedArgument]
    against_arguments: List[VerifiedArgument]
    crux: str
    original_claim: str
    sources_used: List[SourceMetadata]  # Deduplicated list of all sources
    verification_score: float           # % of citations that passed verification
```

---

## Pipeline Orchestration

The full pipeline is orchestrated as an async chain:

```python
async def run_pipeline(claim: str) -> VerifiedDebateOutput:
    # Layer 1: Decompose
    queries = await decompose_claim(claim)
    
    # Layer 2: Retrieve
    chunks = await retrieve_adversarial(queries)
    
    # Layer 3: Tag stance
    tagged = tag_stance(claim, chunks)
    
    # Layer 4: Synthesize
    debate = await synthesize_debate(claim, tagged)
    
    # Layer 5: Verify
    verified = await verify_citations(debate)
    
    return verified
```

### Streaming Option
For better UX, results can be streamed:
1. Stream FOR arguments as they're generated
2. Stream AGAINST arguments
3. Stream CRUX analysis
4. Stream verification status

## Testing Strategy

| Layer | Test Type | What to Test |
|-------|-----------|--------------|
| Decomposition | Unit | Generates valid PRO/CON pair |
| Retrieval | Integration | Returns relevant chunks for both queries |
| Stance Tagging | Unit | Correct stance classification on known pairs |
| Synthesis | E2E | Output contains both FOR and AGAINST |
| Citation | Unit | Catches invalid citations |
| Full Pipeline | E2E | End-to-end claim → verified debate |
