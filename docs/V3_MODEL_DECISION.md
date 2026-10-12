# V3 Model Decision: Visual Document Retrieval

## Candidate 1: ColPali (vidore/colpali-v1.2 or v1.3)
**What it does:** Uses a Vision-Language Model (PaliGemma) combined with a late-interaction mechanism (ColBERT style) to encode entire PDF page images into multi-vector representations. It allows text queries to be matched directly against page images without any OCR or text extraction.
**Strengths:** 
- Extremely high retrieval performance on visually rich documents (tables, charts, complex layouts).
- Eliminates the error-prone OCR pipeline entirely.
- Strong community support and easy integration via the `byaldi` wrapper library.
**Limitations:**
- Requires significant memory (multi-vector representations are large).
- Best on English; multilingual capability is limited by the underlying PaliGemma model.
**Resource requirements:** Needs ~5-8GB VRAM for efficient indexing/retrieval, though it can run on CPU (slowly).

## Candidate 2: ColQwen2 (vidore/colqwen2-v1.0)
**What it does:** Similar to ColPali, but uses the Qwen2-VL architecture instead of PaliGemma.
**Strengths:** 
- Superior multilingual support compared to ColPali.
- Sometimes edges out ColPali on complex reasoning tasks over document images due to the strong Qwen2 backbone.
**Limitations:**
- Slightly larger/heavier than ColPali.
- Newer, so the tooling ecosystem is slightly less mature (though `byaldi` supports it).
**Resource requirements:** Similar or slightly higher VRAM requirements than ColPali.

## Selected Model for V3 Experiment: ColPali (via `byaldi`)
**Why we selected it for the current experiment:**
ColPali is the current standard and pioneer for this specific task (Late-Interaction Vision Document Retrieval). The `byaldi` library abstracts away the extreme complexity of managing multi-vector ColBERT scores over vision patches, making it perfect for our isolated experiment. It provides the exact capability VIDYA needs: querying a visual page directly.

**What would make us replace it:**
- If the multi-vector storage requirements become too large for our local database.
- If we need strong non-English support (in which case we'd swap to ColQwen2).
- If a newer, smaller model achieves the same accuracy with single-vector embeddings.
