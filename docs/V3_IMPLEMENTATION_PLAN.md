# VIDYA V3 Implementation Plan

## Current Architecture
VIDYA currently implements a modular, LangGraph-orchestrated Retrieval-Augmented Generation (RAG) system with tool access (Calculator, Web Search).

*   **Ingestion:** Reads PDFs via `pypdf`, splits text, creates embeddings using `SentenceTransformer('all-MiniLM-L6-v2')`, and stores them in a local `ChromaDB` instance.
*   **Routing:** `router_node` determines the intent of user queries (RAG, CALCULATOR, WEB_SEARCH, GENERAL).
*   **Generation:** A Groq LLM uses retrieved context or tool results to formulate a response based on a specified teaching style.

## Files to be Reused
*   `app/llm.py` (Core LLM interaction)
*   `app/graph_state.py` (Will need extension, but core remains)
*   `app/nodes.py` (Base nodes remain)
*   `app/graph.py` (Routing structure remains, but new routes will be added)
*   `app/main.py` (Entry point and UI simulation)

## Files that Need Modification
*   `app/graph_state.py`: Add fields for visual context and visual retrieval results.
*   `app/nodes.py`: Incorporate new visual retrieval and multimodal fusion nodes.
*   `app/graph.py`: Add visual retrieval paths to the `qa_graph`.
*   `app/llm.py`: Update prompts and LLM calls to handle visual context if a Vision-Language Model (VLM) is integrated.
*   `requirements.txt`: Add visual processing and retrieval dependencies.

## New Files Required
*   `app/vision/pdf_renderer.py`: Handles converting PDF pages to images.
*   `app/vision/visual_retriever.py`: Abstract interface and specific implementations (e.g., ColPali) for visual document retrieval.
*   `experiments/visual_retrieval/colpali_demo.py`: Isolated lab for testing visual retrieval models before integration.

## Dependencies Required
*   `PyMuPDF` (already installed): For PDF rendering.
*   `pdf2image`: For PDF rendering (alternative to PyMuPDF).
*   `colpali-engine` or `byaldi`: For modern visual document retrieval (ColPali).
*   `torch`: Backend for ColPali.
*   `transformers`: Backend for ColPali.

## Risks
*   **Resource Constraints:** Visual retrieval models like ColPali can be memory-intensive and may require a GPU for acceptable performance. Running them locally on a CPU-only machine might be too slow.
*   **Model Compatibility:** Integrating complex visual models might introduce dependency conflicts with the existing stack.
*   **Storage Overhead:** Visual embeddings typically require significantly more storage space than text embeddings.
*   **Complexity:** Managing two parallel retrieval pipelines (text and visual) and deciding when to use which or how to fuse them increases system complexity.

## Testing Strategy
1.  **Isolated Component Testing:** Test `pdf_renderer.py` and the `VisualRetriever` independently before integration. Use `experiments/visual_retrieval/colpali_demo.py` for this.
2.  **Integration Testing:** Verify that new LangGraph nodes for visual retrieval function correctly within the overall graph without breaking existing text RAG routes.
3.  **End-to-End Evaluation:** Create a small evaluation dataset of visual questions (e.g., asking about specific diagrams) and ensure VIDYA retrieves the correct page and (eventually) answers correctly. Document results in `docs/V3_EVALUATION.md`.
