"""
=============================================================================
VIDYA V3 — Visual Retrieval Experiment: ColPali (ARCHIVED)
=============================================================================

STATUS: ARCHIVED — Not runnable. Kept as an engineering learning record.

WHAT WE TRIED:
    We attempted to use ColPali (vidore/colpali-v1.2) via the `byaldi` library
    to perform visual document retrieval — treating entire PDF pages as images
    and searching them using multi-vector late-interaction (ColBERT-style scoring).

WHY WE STOPPED:
    1. STORAGE: PaliGemma 3B (the backbone of ColPali) requires ~5-8 GB of disk
       space to download. Our local machine hit OSError 112 (disk full) before
       the download completed.
    2. STORAGE (VECTORS): ColPali generates 1030 vectors PER PAGE. A 100-page
       PDF produces 103,000 vectors. ChromaDB does not natively support the
       multi-vector late-interaction (MaxSim) scoring required by ColPali.
    3. COMPUTE: Efficient indexing requires a GPU. CPU-only inference is
       possible but prohibitively slow for a real student product.

WHAT WE LEARNED:
    ColPali is the right long-term direction — it eliminates OCR entirely and
    understands visual layouts natively. But it is a GPU + storage heavy solution.

WHAT WE CHOSE INSTEAD:
    Lightweight VLM approach (see app/vision/visual_retriever.py):
      - Retrieval: Keep existing text-based ChromaDB (unchanged from V1/V2)
      - Generation: Render the relevant PDF page to an image, pass it to a
        Vision-Language Model (Gemini 1.5 Flash via API) alongside the text
        context and the student's question.
      - Result: VIDYA can now "see" diagrams and charts at answer-generation
        time, with zero local model download, zero ChromaDB schema changes,
        and zero GPU requirement.

FUTURE NOTE:
    When storage and GPU are available, ColPali or ColSmol can be plugged back
    in by implementing the ColPaliRetriever class in visual_retriever.py.
    The VisualRetriever abstract class was designed exactly for this swap.

DEPENDENCIES (not installed — kept for reference only):
    pip install byaldi pdf2image
=============================================================================
"""

# --- ARCHIVED CODE BELOW — DO NOT RUN ---

# import os
# from byaldi import RAGMultiModalModel
#
# def run_visual_retrieval_lab():
#     sample_pdf = "data/sample.pdf"
#     RAG = RAGMultiModalModel.from_pretrained("vidore/colpali-v1.2", verbose=1)
#     RAG.index(
#         input_path=sample_pdf,
#         index_name="sample_pdf_index",
#         store_collection_with_index=False,
#         overwrite=True
#     )
#     query = "What is supervised learning?"
#     results = RAG.search(query, k=3)
#     for rank, result in enumerate(results, start=1):
#         print(f"Rank {rank}: Page {result.page_num} -> score {result.score:.4f}")
#
# if __name__ == "__main__":
#     run_visual_retrieval_lab()
