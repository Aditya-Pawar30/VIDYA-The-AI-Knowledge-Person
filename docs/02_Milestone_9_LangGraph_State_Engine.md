# Chapter 2: Milestone 9 — LangGraph State Engine Architecture

## 1. High-Level Architecture Overview
In V1, pipeline execution was scripted sequentially (`load -> split -> embed -> store`). As VIDYA expanded to support multi-capability tutoring, sequential scripting became rigid and unmaintainable.

Milestone 9 introduced **LangGraph**, transforming VIDYA into a stateful, event-driven graph engine where steps are **Nodes**, data is held in a central **State**, and flow control is managed by **Edges and Routers**.

```
                           +-------------------+
                           | Student Question  |
                           +-------------------+
                                     |
                                     v
                           +-------------------+
                           |   Router Node     |
                           | (Intent Classifier|
                           +-------------------+
                                     |
           +-------------------------+-------------------------+
           | (CALCULATOR)            | (WEB_SEARCH)            | (RAG)
           v                         v                         v
+--------------------+    +--------------------+    +--------------------+
|  Calculator Node   |    |  Web Search Node   |    |   Retrieve Node    |
| (AST Math Walker)  |    | (ddgs 9.16.0 API)  |    | (ChromaDB Search)  |
+--------------------+    +--------------------+    +--------------------+
           |                         |                         |
           +-------------------------+-------------------------+
                                     |
                                     v
                           +-------------------+
                           | Generate Answer   |
                           |    (LLM Node)     |
                           +-------------------+
                                     |
                                     v
                                  [ END ]
```

---

## 2. Core Concepts & Topics Used

### A. Graph State (`VIDYAState` - `TypedDict`)
- **What it is**: A central schema dictionary that acts as the single source of truth passed to every node.
- **Why `TypedDict`**: Provides full IDE autocomplete and static type safety without runtime overhead.
- **How State Flow Works**: When a node runs, it receives the current `VIDYAState` dictionary and returns *only the keys it updated*. LangGraph automatically merges these updates back into the state.

### B. Nodes (`load_pdf_node`, `router_node`, `calculator_node`, etc.)
- **What it is**: Pure Python wrapper functions that perform one specific task.
- **Design Principle**: Decoupling. Core logic remains in standalone functions (`load_pdf`, `calculator_tool`), while nodes simply map inputs from `state` and write results back to `state`.

### C. Conditional Routing Edges (`select_route`)
- **What it is**: Dynamic decision functions that inspect `state["route_choice"]` and return the name of the next target node.
- **Why Router vs Sequential `if/else`**:
  - **Sequential `if/else`**: Hardcodes paths inside single monolithic functions, making it hard to inspect, test, or re-route.
  - **LangGraph Routers**: Decouple routing rules from execution logic. You can visualize, intercept, and modify graph flows programmatically.

---

## 3. Line-by-Line Code Breakdown

### `app/graph_state.py`
```python
from typing import TypedDict, Optional

class VIDYAState(TypedDict):
    pdf_path:       str              # Input PDF path
    pdf_text:       Optional[str]    # Extracted text
    chunks:         Optional[list]   # Chunks list
    embeddings:     Optional[list]   # Embeddings list
    query:          Optional[str]    # User query
    context_chunks: Optional[list]   # Retrieved RAG context
    answer:         Optional[str]    # Final answer
    route_choice:   Optional[str]    # Router decision: RAG, CALCULATOR, WEB_SEARCH, GENERAL
    tool_used:      Optional[str]    # Name of executed tool
    tool_result:    Optional[str]    # Output of executed tool
```
* **`TypedDict`**: Ensures every node knows exactly what fields exist in the graph notebook.

### `app/nodes.py` (Router & Tool Nodes)
```python
def router_node(state: VIDYAState) -> dict:
    query = state.get("query", "")
    route = classify_intent(query)  # Line 72: Call LLM / keyword intent classifier
    return {"route_choice": route}  # Line 74: Return state update dictionary

def calculator_node(state: VIDYAState) -> dict:
    query = state.get("query", "")
    result = calculator_tool(query) # Line 82: Run safe math evaluator
    return {"tool_used": "calculator", "tool_result": result}
```

### `app/graph.py` (Graph Construction & Compilation)
```python
from langgraph.graph import StateGraph, END

def build_qa_graph():
    builder = StateGraph(VIDYAState)
    builder.add_node("router",          router_node)
    builder.add_node("calculator",      calculator_node)
    builder.add_node("web_search",       web_search_node)
    builder.add_node("retrieve",        retrieve_node)
    builder.add_node("generate_answer", generate_answer_node)

    builder.set_entry_point("router") # Entry node

    builder.add_conditional_edges(
        "router",
        select_route, # Inspects state["route_choice"]
        {
            "calculator":      "calculator",
            "web_search":       "web_search",
            "retrieve":        "retrieve",
            "generate_answer": "generate_answer",
        },
    )

    builder.add_edge("calculator",      "generate_answer")
    builder.add_edge("web_search",       "generate_answer")
    builder.add_edge("retrieve",        "generate_answer")
    builder.add_edge("generate_answer", END)

    return builder.compile()
```

---

## 4. Architectural Alternatives & Tradeoffs Summary

| Feature | Selected Choice | Alternative Option | Why Selected over Alternative? |
| :--- | :--- | :--- | :--- |
| **Pipeline Control** | LangGraph StateGraph | Sequential `if-else` script | Modular state management, dynamic conditional routing, clean tool additions. |
| **State Management**| `TypedDict` | Custom Class / Pydantic | Lightweight, fast dictionary performance, native Python compatibility. |
| **Tool Execution** | Graph Nodes | Monolithic LLM Callback | Explicit control flow, predictable debugging, clear node tracing. |
