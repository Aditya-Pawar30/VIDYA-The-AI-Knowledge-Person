import sys
sys.stdout.reconfigure(encoding='utf-8')

from app.graph import ingest_graph, qa_graph

# ── Step 1: Ingest the PDF via LangGraph ─────────────────────────────────────
print("=" * 60)
print("VIDYA — LangGraph Pipeline Starting (Phase 1)")
print("=" * 60)

import os
pdf_candidate = "data/Unit 5.1.pptx.pdf"
if not os.path.exists(pdf_candidate) and os.path.exists("ai-tutor/" + pdf_candidate):
    pdf_candidate = "ai-tutor/" + pdf_candidate

print(f"\n[Ingest Graph] Running PDF ingestion pipeline on: '{pdf_candidate}'...")

ingest_state = ingest_graph.invoke({
    "pdf_path":      pdf_candidate,
    "pdf_text":      None,
    "chunks":        None,
    "embeddings":    None,
    "suggestions":   None,
    "query":         None,
    "default_style": None,
    "context_chunks": None,
    "answer":        None,
    "retry_count":   0,
})

# ── Show suggested questions ──────────────────────────────────────────────────
suggestions = ingest_state.get("suggestions", [])
print("\n" + "┌" + "─" * 58 + "┐")
print("│ Your PDF is ready! What would you like to learn?       │")
print("├" + "─" * 58 + "┤")
print("│ 💡 Suggested questions                                 │")
for q in suggestions:
    print(f"│ • {q:<54} │")
print("└" + "─" * 58 + "┘")


# ── Interactive Terminal Chat Loop ───────────────────────────────────────────
print("\n" + "=" * 65)
print("  Interactive Mode Ready! Type your question below.")
print("  (Type 'exit', 'quit', or 'q' to stop)")
print("=" * 65)

while True:
    try:
        user_query = input("\nYou > ").strip()
    except (KeyboardInterrupt, EOFError):
        print("\n\nGoodbye! Happy learning with VIDYA.")
        break

    if not user_query:
        continue

    if user_query.lower() in ["exit", "quit", "q"]:
        print("\nGoodbye! Happy learning with VIDYA. 👋\n")
        break

    print("\n" + "-" * 65)
    print(f"  Thinking about: '{user_query}'...")
    print("-" * 65)

    result = qa_graph.invoke({
        **ingest_state,
        "query":         user_query,
        "default_style": "Normal",
        "context_chunks": None,
        "answer":        None,
        "route_choice":  None,
        "tool_used":     None,
        "tool_result":   None,
        "retry_count":   0,
    })

    print(f"  [Router Decision]: {result.get('route_choice')}")
    if result.get("tool_used"):
        print(f"  [Tool Executed]: {result.get('tool_used')} -> Output: {result.get('tool_result')}")

    print(f"\nVIDYA says:\n\n{result.get('answer')}\n")
    print("-" * 65)
