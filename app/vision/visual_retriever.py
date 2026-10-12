"""
=============================================================================
VIDYA V3 — Visual Retriever (Lightweight VLM Approach)
=============================================================================

ARCHITECTURE DECISION:
    We evaluated ColPali and ColSmol for visual page retrieval but abandoned
    them due to two hard blockers:
      1. Local disk storage: PaliGemma 3B backbone requires ~5-8 GB download.
      2. Vector store: ChromaDB does not support ColPali's multi-vector
         late-interaction (MaxSim) scoring natively.

    CHOSEN APPROACH: Lightweight VLM at generation time.
      - Retrieval:  UNCHANGED — existing text-based ChromaDB from V1/V2.
      - Generation: Relevant PDF page is rendered to a PNG image and passed
                    to Gemini 1.5 Flash Vision API alongside the text context.
      - Benefits:   Zero local model download. Zero ChromaDB schema changes.
                    Zero GPU required. Swappable to any VLM API.

FUTURE UPGRADE PATH:
    When GPU/storage is available, implement ColPaliRetriever below and
    swap it into retrieve_visual_context(). The abstract class ensures
    VIDYA's graph nodes never need to change.
=============================================================================
"""

from abc import ABC, abstractmethod
import os
from dotenv import load_dotenv
try:
    from google import genai  # type: ignore
    from google.genai import types  # type: ignore
except ImportError:
    import google.genai as genai  # type: ignore
    from google.genai import types  # type: ignore

from app.vision.pdf_renderer import render_pdf_to_images

load_dotenv()

# ---------------------------------------------------------------------------
# Abstract Base — ensures any retriever (ColPali, API, future model) is
# swappable without changing any graph node code.
# ---------------------------------------------------------------------------
class VisualRetriever(ABC):
    @abstractmethod
    def index_pdf(self, pdf_path: str, document_id: str) -> None:
        """Index the PDF visually (build whichever index is needed)."""
        pass

    @abstractmethod
    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        """Return top_k relevant pages for a text query."""
        pass


# ---------------------------------------------------------------------------
# ColPaliRetriever — DISABLED (storage + ChromaDB incompatibility)
# Kept here so it can be re-enabled when GPU + Vespa/Qdrant are available.
# ---------------------------------------------------------------------------
class ColPaliRetriever(VisualRetriever):
    """
    DISABLED: Requires ~5-8 GB disk + GPU + non-ChromaDB vector store.
    See experiments/visual_retrieval/colpali_demo.py for full experiment notes.
    """
    def __init__(self, index_name: str = "default_visual_index"):
        raise NotImplementedError(
            "ColPaliRetriever is disabled due to storage constraints. "
            "Use GeminiVisualRetriever instead. "
            "See experiments/visual_retrieval/colpali_demo.py for context."
        )

    def index_pdf(self, pdf_path: str, document_id: str) -> None:
        pass

    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        pass


# ---------------------------------------------------------------------------
# GeminiVisualRetriever — The V3 Implementation (ACTIVE via google-genai)
# ---------------------------------------------------------------------------
class GeminiVisualRetriever(VisualRetriever):
    """
    Lightweight VLM visual retrieval + answer generation using modern Gemini API.

    HOW IT WORKS:
      1. index_pdf(): Renders every PDF page to a PNG image using PyMuPDF.
                      Stores a map of {page_number: image_path}.
      2. retrieve():  Returns page metadata (no heavy vector scoring needed —
                      the existing text RAG already found the right chunk,
                      we just need the page image to go with it).
      3. describe_page(): Sends a page image to Gemini Vision and gets a
                          description of any visual elements (diagrams, charts).
      4. answer_with_vision(): Sends text context + page image + question to
                               Gemini Vision and returns a full teaching answer.
    """

    def __init__(self):
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY not found in .env file. "
                "Add it to use V3 visual features."
            )
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-3.8-flash"
        self._page_index: dict[int, str] = {}  # {page_number: image_path}

    # ── Index: render PDF pages to images ─────────────────────────────────
    def index_pdf(self, pdf_path: str, document_id: str) -> None:
        """Render all PDF pages to PNG files. No heavy model download needed."""
        print(f"[V3 Vision] Rendering PDF pages: {pdf_path}")
        pages = render_pdf_to_images(pdf_path, output_dir="data/rendered_pages")
        self._page_index = {p["page_number"]: p["image_path"] for p in pages}
        print(f"[V3 Vision] {len(self._page_index)} page(s) rendered and indexed.")

    # ── Retrieve: return page metadata for a query ─────────────────────────
    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        """
        Returns available page metadata.
        Note: Actual relevance ranking is handled by the existing text RAG.
        This retriever supplements it with visual context at generation time.
        """
        results = []
        for page_num, image_path in list(self._page_index.items())[:top_k]:
            results.append({
                "page_number": page_num,
                "image_path":  image_path,
                "score":       1.0,
            })
        return results

    # ── Describe: ask Gemini what's on a page ─────────────────────────────
    def describe_page(self, page_number: int) -> str:
        """Ask Gemini Vision to describe visual elements on a specific page."""
        if page_number not in self._page_index:
            return "(Page image not available)"

        image_path = self._page_index[page_number]
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        prompt = (
            "You are analyzing a page from a student's study material. "
            "Describe any diagrams, flowcharts, tables, or figures you see. "
            "If the page is mostly text with no visuals, say so briefly."
        )

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
            ]
        )
        return response.text

    # ── Answer with vision: full visual Q&A ───────────────────────────────
    def answer_with_vision(
        self,
        question: str,
        text_context: str,
        page_number: int,
        default_style: str = "Normal"
    ) -> str:
        """
        Send text context + page image + question to Gemini Vision.
        Returns VIDYA's teaching answer that incorporates visual understanding.
        """
        if page_number not in self._page_index:
            return None  # Fall back to text-only answer

        image_path = self._page_index[page_number]
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        style_instructions = {
            "Simple":   "Explain in very simple words, like the student is a complete beginner.",
            "Normal":   "Explain at a standard student level.",
            "Detailed": "Explain with technical depth and detail.",
        }
        style_note = style_instructions.get(default_style, style_instructions["Normal"])

        prompt = f"""You are VIDYA, an AI tutor. You have access to both a text excerpt and the actual PDF page image.

TEACHING STYLE: {style_note}

TEXT CONTEXT FROM PDF:
{text_context}

STUDENT QUESTION:
{question}

Instructions:
- Use the page image to understand any diagrams, charts, or figures that support the answer.
- Ground your answer in the PDF content first, then use your general knowledge to enrich it.
- If there is a relevant diagram or figure on the page, reference it explicitly in your explanation.
- Do NOT mention "image", "page image", or implementation details to the student.
"""

        import time
        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[
                        prompt,
                        types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                    ]
                )
                return response.text
            except Exception as e:
                err_str = str(e)
                if ("429" in err_str or "quota" in err_str.lower()) and attempt < max_retries:
                    print(f"         -> [Gemini Rate Limit] 429 hit. Waiting 12 seconds before retry {attempt + 1}/{max_retries}...")
                    time.sleep(12)
                else:
                    raise e
        return None


# ---------------------------------------------------------------------------
# Public API — used by LangGraph nodes (model-agnostic)
# ---------------------------------------------------------------------------
_retriever_instance: GeminiVisualRetriever | None = None

def get_visual_retriever() -> GeminiVisualRetriever:
    """Returns a singleton GeminiVisualRetriever instance."""
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = GeminiVisualRetriever()
    return _retriever_instance


def index_visual_document(pdf_path: str, document_id: str) -> None:
    """Index a PDF visually (render pages). Called during ingestion."""
    get_visual_retriever().index_pdf(pdf_path, document_id)


def retrieve_visual_context(query: str, document_id: str = "default", top_k: int = 3) -> list[dict]:
    """Retrieve visual pages for a query."""
    return get_visual_retriever().retrieve(query, top_k=top_k)


def answer_with_vision(
    question: str,
    text_context: str,
    page_number: int = 1,
    default_style: str = "Normal"
) -> str | None:
    """
    Generate an answer using both text context and a PDF page image.
    Returns None if visual answer is not available (fallback to text).
    """
    return get_visual_retriever().answer_with_vision(
        question=question,
        text_context=text_context,
        page_number=page_number,
        default_style=default_style,
    )
