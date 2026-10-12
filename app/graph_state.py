from typing import TypedDict, Optional


class VIDYAState(TypedDict):
    """
    Shared state object that flows through every node in the VIDYA graph.

    Think of this as a shared "notebook" that every step reads and writes to.
    No function needs to pass values manually — the graph handles it all.
    """
    # ── Inputs ────────────────────────────────────────────────────────────────
    pdf_path:       str              # Path to the student's uploaded PDF

    # ── Set after load_pdf_node ───────────────────────────────────────────────
    pdf_text:       Optional[str]    # Raw extracted text from the PDF

    # ── Set after split_text_node ─────────────────────────────────────────────
    chunks:         Optional[list]   # Text split into smaller chunks

    # ── Set after embed_node ──────────────────────────────────────────────────
    embeddings:     Optional[list]   # Vector embeddings for each chunk

    # ── Set after suggest_node ────────────────────────────────────────────────
    suggestions:    Optional[list]   # LLM-generated suggested questions

    # ── Query inputs (set when student asks a question) ───────────────────────
    query:          Optional[str]    # Student's question
    default_style:  Optional[str]    # Teaching style: Simple / Normal / Detailed

    # ── Set after retrieve_node ───────────────────────────────────────────────
    context_chunks: Optional[list]   # Relevant PDF chunks from ChromaDB
    visual_pages:   Optional[list]   # Relevant visual PDF pages from ColPali


    # ── Set after generate_answer_node ────────────────────────────────────────
    answer:         Optional[str]    # VIDYA's final answer

    # ── V2 Tool Routing fields ────────────────────────────────────────────────
    route_choice:   Optional[str]    # Decision: "RAG", "CALCULATOR", "WEB_SEARCH", or "GENERAL"
    tool_used:      Optional[str]    # Name of tool executed (e.g., "calculator", "web_search")
    tool_result:    Optional[str]    # Raw output from tool execution
    search_results: Optional[str]    # Structured live web search results

    # ── For future retry logic ────────────────────────────────────────────────
    retry_count:    Optional[int]    # How many times we have retried so far


