"""
graph.py — Builds and compiles the VIDYA LangGraph pipeline.

Two graphs are defined:
  1. ingest_graph  — Processes the PDF (load → split → embed → store → suggest)
  2. qa_graph      — Answers a student question (retrieve → generate_answer)

Why two graphs?
  Ingest runs ONCE when the PDF is uploaded.
  QA runs every time the student asks a question.
  This mirrors what a real app would do.
"""

from langgraph.graph import StateGraph, END

from app.graph_state import VIDYAState
from app.nodes import (
    load_pdf_node,
    split_text_node,
    embed_node,
    store_node,
    visual_index_node,
    suggest_node,
    router_node,
    calculator_node,
    web_search_node,
    retrieve_node,
    generate_answer_node,
)


# ── Graph 1: Ingest Graph ─────────────────────────────────────────────────────
# Runs when the student uploads a PDF.
# Flow: load → split → embed → store → visual_index → suggest → END

def build_ingest_graph():
    builder = StateGraph(VIDYAState)

    # Add nodes
    builder.add_node("load_pdf",   load_pdf_node)
    builder.add_node("split_text", split_text_node)
    builder.add_node("embed",      embed_node)
    builder.add_node("store",      store_node)
    builder.add_node("visual_index", visual_index_node)
    builder.add_node("suggest",    suggest_node)

    # Set the entry point
    builder.set_entry_point("load_pdf")

    # Add edges (defines the order)
    builder.add_edge("load_pdf",   "split_text")
    builder.add_edge("split_text", "embed")
    builder.add_edge("embed",      "store")
    builder.add_edge("store",      "visual_index")
    builder.add_edge("visual_index", "suggest")
    builder.add_edge("suggest",    END)

    return builder.compile()


# ── Graph 2: QA Graph with Tool Routing (V2.2) ─────────────────────────────────
# Flow: router ──(conditional)──► [calculator / web_search / retrieve / generate_answer] ──► generate_answer ──► END

def select_route(state: VIDYAState) -> str:
    """Conditional routing function mapping state['route_choice'] to node name."""
    choice = state.get("route_choice", "RAG")
    if choice == "CALCULATOR":
        return "calculator"
    elif choice == "WEB_SEARCH":
        return "web_search"
    elif choice == "RAG":
        return "retrieve"
    else:
        return "generate_answer"


def build_qa_graph():
    builder = StateGraph(VIDYAState)

    # Add nodes
    builder.add_node("router",          router_node)
    builder.add_node("calculator",      calculator_node)
    builder.add_node("web_search",       web_search_node)
    builder.add_node("retrieve",        retrieve_node)
    builder.add_node("generate_answer", generate_answer_node)

    # Entry point is the Router Node
    builder.set_entry_point("router")

    # Add conditional edges from router
    builder.add_conditional_edges(
        "router",
        select_route,
        {
            "calculator":      "calculator",
            "web_search":       "web_search",
            "retrieve":        "retrieve",
            "generate_answer": "generate_answer",
        },
    )

    # Edges converging to answer generation
    builder.add_edge("calculator",      "generate_answer")
    builder.add_edge("web_search",       "generate_answer")
    builder.add_edge("retrieve",        "generate_answer")
    builder.add_edge("generate_answer", END)

    return builder.compile()


# ── Compile once (module-level singletons) ────────────────────────────────────
ingest_graph = build_ingest_graph()
qa_graph     = build_qa_graph()


