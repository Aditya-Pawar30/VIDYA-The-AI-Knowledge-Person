# Implementation Plan — Milestone V2.1: Calculator Tool & LangGraph Router

This implementation plan outlines the architecture for **V2 — Give VIDYA Tools**, starting with **V2.1: Calculator Tool + LangGraph Tool Routing**.

---

## 💡 Suggestions & Recommendations (Addressing Requirements)

Before writing the code, here are key architectural suggestions to fulfill all your requirements cleanly and safely:

1. **Safe Calculator Execution (No `eval()` risk)**:
   - *Risk*: Using Python's built-in `eval()` on raw strings can execute dangerous system code (e.g., `eval("__import__('os').system(...)")`).
   - *Solution*: Use an **AST (Abstract Syntax Tree) safe math evaluator** or Python `math` parser. It will only parse numbers and valid arithmetic operators (`+`, `-`, `*`, `/`, `^`, `%`, `sqrt`, `abs`).

2. **LangGraph Router Architecture (Explicit vs Automatic)**:
   - *Option A*: Direct LLM Function Calling (Groq model chooses when to call a tool).
   - *Option B (Recommended)*: **Explicit Intent Router Node in LangGraph**.
     - A dedicated `router_node` asks a fast LLM prompt or rule classifier to categorize the request into `RAG`, `CALCULATOR`, or `GENERAL`.
     - Then, a LangGraph **Conditional Edge** (`add_conditional_edges`) routes the flow to `retrieve_node`, `calculator_node`, or `generate_answer_node`.
     - *Why Option B?* It gives **100% transparency** in `VIDYAState` showing *which* tool was chosen and *why*, making debugging and multi-tool chaining (V2.3) seamless.

3. **Web Search Library Choice (Preparing for V2.2)**:
   - *Recommendation*: Use `duckduckgo-search` (`ddgs`) which requires **zero API keys** and provides free real-time search results out of the box, or Tavily if an API key is available.

---

## Proposed Changes — Milestone V2.1

```
                    VIDYA (V2.1 Router)
                             │
                             ▼
                       User Question
                             │
                             ▼
                        router_node
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         RAG Route    Calculator Route  General Route
        (retrieve)      (calculator)     (direct LLM)
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    generate_answer_node
                             │
                             ▼
                           Answer
```

---

### [Component 1] Tool Definitions

#### [NEW] [`app/tools.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/tools.py)
- Create `calculator_tool(expression: str) -> str`:
  - Parses percentages (`17.5% of 85000` ➔ `85000 * 0.175`).
  - Evaluates mathematical expressions using a safe AST evaluator.
  - Returns formatted numeric results (e.g. `"14875"`).

---

### [Component 2] State Evolution

#### [MODIFY] [`app/graph_state.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/graph_state.py)
- Add new fields to `VIDYAState`:
  - `route_choice`: `Optional[str]` (e.g. `"RAG"`, `"CALCULATOR"`, `"GENERAL"`)
  - `tool_used`: `Optional[str]` (e.g. `"calculator"`)
  - `tool_result`: `Optional[str]` (e.g. `"14,875"`)

---

### [Component 3] LangGraph Nodes & Router

#### [MODIFY] [`app/nodes.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/nodes.py)
- Add `router_node(state: VIDYAState) -> dict`:
  - Analyzes `state["query"]` using Groq LLM / pattern rules to determine intent (`"RAG"`, `"CALCULATOR"`, `"GENERAL"`).
- Add `calculator_node(state: VIDYAState) -> dict`:
  - Extracts mathematical expression from `state["query"]` and calls `calculator_tool`.
  - Sets `tool_used = "calculator"` and `tool_result = result`.
- Update `generate_answer_node(state: VIDYAState) -> dict`:
  - If `tool_result` exists (from Calculator), passes the result to LLM to produce a clear explanation for the student.

---

### [Component 4] Graph Pipeline Assembly

#### [MODIFY] [`app/graph.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/graph.py)
- Update `build_qa_graph()`:
  - Add nodes: `router`, `retrieve`, `calculator`, `generate_answer`.
  - Add entry point: `router`.
  - Add conditional edges from `router`:
    - If `RAG` ➔ `retrieve` ➔ `generate_answer`
    - If `CALCULATOR` ➔ `calculator` ➔ `generate_answer`
    - If `GENERAL` ➔ `generate_answer`

---

### [Component 5] Verification Suite

#### [MODIFY] [`app/main.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/main.py)
- Add V2.1 test cases:
  1. **Calculator Test 1**: `"Calculate 17.5% of 85,000"` (Expect: Route = CALCULATOR, Tool Result = 14875, LLM Explanation).
  2. **Calculator Test 2**: `"What is 25 * 48 + 120?"` (Expect: Route = CALCULATOR, Tool Result = 1320).
  3. **RAG Test**: `"What is classification?"` (Expect: Route = RAG, ChromaDB retrieval).
  4. **General Knowledge Test**: `"Who was Albert Einstein?"` (Expect: Route = GENERAL, direct LLM response).

---

## Verification Plan

### Automated Tests
- Run `python -m app.main` from the `ai-tutor` directory.
- Verify that:
  - Routing decision is correctly logged in console (`[Graph] router_node → Route: CALCULATOR`).
  - Calculator executes deterministically without calling LLM for math.
  - LLM receives `tool_result` and formats a polite, clear answer for the student.
