"""
nodes.py — All LangGraph node functions for VIDYA.

Each node:
  1. Receives the full VIDYAState
  2. Calls the existing app functions (unchanged)
  3. Returns a dict with the updated fields

The existing functions (load_pdf, split_text, etc.) are NOT modified.
Nodes are simply thin wrappers that connect them to the graph.
"""

from app.graph_state import VIDYAState
from app.pdf_loader import load_pdf
from app.text_splitter import split_text
from app.embeddings import create_embeddings
from app.vector_store import store_chunks, search
from app.llm import ask_vidya, generate_suggestions, classify_intent
from app.tools import calculator_tool, web_search_tool


# ── Node 1: Load PDF ─────────────────────────────────────────────────────────
def load_pdf_node(state: VIDYAState) -> dict:
    """Read the PDF and extract raw text."""
    print(f"\n[Graph] load_pdf_node -> {state['pdf_path']}")
    text = load_pdf(state["pdf_path"])
    print(f"         -> {len(text)} characters extracted")
    return {"pdf_text": text}


# ── Node 2: Split text into chunks ───────────────────────────────────────────
def split_text_node(state: VIDYAState) -> dict:
    """Split the raw text into overlapping chunks."""
    print("[Graph] split_text_node")
    chunks = split_text(state["pdf_text"], chunk_size=100, overlap=20)
    print(f"         -> {len(chunks)} chunks created")
    return {"chunks": chunks}


# ── Node 3: Generate embeddings ───────────────────────────────────────────────
def embed_node(state: VIDYAState) -> dict:
    """Generate vector embeddings for each chunk."""
    print("[Graph] embed_node")
    embeddings = create_embeddings(state["chunks"])
    print(f"         -> {len(embeddings)} vectors of size {len(embeddings[0])}")
    return {"embeddings": embeddings}


# ── Node 4: Store in ChromaDB ─────────────────────────────────────────────────
def store_node(state: VIDYAState) -> dict:
    """Store chunks + embeddings in ChromaDB."""
    print("[Graph] store_node")
    store_chunks(state["chunks"], state["embeddings"])
    print("         -> Stored in ChromaDB")
    return {}  # No new state fields, just a side effect


# ── Node 5: Generate suggested questions ─────────────────────────────────────
def suggest_node(state: VIDYAState) -> dict:
    """Analyze the document and generate suggested questions for the student."""
    print("[Graph] suggest_node")
    suggestions = generate_suggestions(state["pdf_text"])
    print(f"         -> {len(suggestions)} suggestions generated")
    return {"suggestions": suggestions}


# ── Node 6: Intent Router Node (V2.2) ────────────────────────────────────────
def router_node(state: VIDYAState) -> dict:
    """Analyze query intent and decide route: RAG, CALCULATOR, WEB_SEARCH, or GENERAL."""
    query = state.get("query", "")
    print(f"\n[Graph] router_node -> query: '{query}'")
    route = classify_intent(query)
    print(f"         -> Route selected: {route}")
    return {"route_choice": route}


# ── Node 7: Calculator Tool Node (V2.1) ──────────────────────────────────────
def calculator_node(state: VIDYAState) -> dict:
    """Execute the calculator tool on the student's mathematical expression."""
    query = state.get("query", "")
    print(f"[Graph] calculator_node -> evaluating math for: '{query}'")
    result = calculator_tool(query)
    print(f"         -> Calculator result: {result}")
    return {
        "tool_used": "calculator",
        "tool_result": result,
    }


# ── Node 8: Web Search Tool Node (V2.2) ──────────────────────────────────────
def web_search_node(state: VIDYAState) -> dict:
    """Execute live web search for current/external info."""
    query = state.get("query", "")
    print(f"[Graph] web_search_node → searching web for: '{query}'")
    results = web_search_tool(query)
    print("         -> Search results retrieved")
    return {
        "tool_used": "web_search",
        "tool_result": results,
        "search_results": results,
    }


from app.vision.visual_retriever import index_visual_document, retrieve_visual_context

# ── Node 9: Retrieve relevant chunks from ChromaDB ───────────────────────────
def retrieve_node(state: VIDYAState) -> dict:
    """Search ChromaDB for chunks relevant to the student's query, and augment with visual pages."""
    query = state["query"]
    print(f"[Graph] retrieve_node -> query: '{query}'")
    
    # Text Retrieval
    results = search(query, n_results=3)
    context_chunks = results["documents"][0] if results and results.get("documents") else []
    print(f"         -> {len(context_chunks)} text chunk(s) retrieved")
    
    # Visual Retrieval (Phase 8: Smart Retrieval)
    print(f"         -> Attempting visual retrieval...")
    doc_id = "sample_pdf_index"  # Hardcoded for V3 prototype
    try:
        visual_pages = retrieve_visual_context(query, document_id=doc_id, top_k=2)
        print(f"         -> {len(visual_pages)} visual page(s) retrieved")
    except Exception as e:
        print(f"         -> Visual retrieval failed: {e}")
        visual_pages = []
        
    return {"context_chunks": context_chunks, "visual_pages": visual_pages}

# ── Node 9.5: Visual Indexing Node ───────────────────────────────────────────
def visual_index_node(state: VIDYAState) -> dict:
    """Phase 4: Create a visual index of the PDF for later retrieval."""
    print("[Graph] visual_index_node")
    pdf_path = state.get("pdf_path")
    if pdf_path:
        doc_id = "sample_pdf_index"  # Hardcoded for V3 prototype
        index_visual_document(pdf_path, doc_id)
    return {}



# ── Node 10: Generate the answer ──────────────────────────────────────────────
def generate_answer_node(state: VIDYAState) -> dict:
    """Call the LLM with retrieved context or tool results and generate VIDYA's answer."""
    print("[Graph] generate_answer_node")
    style = state.get("default_style") or "Normal"
    tool_result = state.get("tool_result")
    tool_used = state.get("tool_used")
    visual_pages = state.get("visual_pages")
    
    answer = None

    # Phase 10 / V3 Vision Generation Path
    # Trigger vision only if visual context exists AND the question implies visual elements
    query_lower = (state.get("query") or "").lower()
    is_visual_query = any(k in query_lower for k in [
        "diagram", "flowchart", "chart", "figure", "graph", "table", 
        "draw", "picture", "image", "visual", "look at", "see", "shown"
    ])

    if visual_pages and not tool_used and is_visual_query:
        print(f"         -> [V3 Vision] Visual intent detected. Generating answer using page {visual_pages[0]['page_number']}")
        from app.vision.visual_retriever import answer_with_vision
        page_num = visual_pages[0]["page_number"]
        context_text = "\n\n".join(state.get("context_chunks") or [])
        
        try:
            answer = answer_with_vision(
                question=state["query"],
                text_context=context_text,
                page_number=page_num,
                default_style=style
            )
        except Exception as e:
            print(f"         -> [V3 Error] Vision failed: {e}. Falling back to text LLM.")
    elif visual_pages and not is_visual_query:
        print("         -> [Fast RAG] Text query; answering via Groq without exhausting vision quota.")
    
    # Fallback to text-only LLM
    if not answer:
        answer = ask_vidya(
            question=state["query"],
            context_chunks=state.get("context_chunks"),
            visual_pages=visual_pages,
            default_style=style,
            tool_result=tool_result,
            tool_used=tool_used,
        )

    print("         -> Answer generated")
    return {
        "answer": answer,
        "retry_count": (state.get("retry_count") or 0),
    }


