# Implementation Plan — Milestone V2.2: Web Search Tool Integration

This implementation plan outlines the integration of **Web Search** into VIDYA's LangGraph architecture.

---

## 🎯 Requirements & Goals

1. **Web Search Capability**: Enable VIDYA to retrieve current, recent, or external web information when requested or required.
2. **Intent Routing**:
   - `"WEB_SEARCH"`: Triggered by keywords like *latest*, *current*, *today*, *recent*, or explicit requests (*search online*, *search the web*).
   - `"RAG"`: Triggered by PDF study material questions or explicit requests (*from my PDF*, *only from my PDF*).
   - `"CALCULATOR"`: Remains intact for mathematical calculations.
   - `"GENERAL"`: Direct general knowledge answers.
3. **No Key Lock-in**: Use `duckduckgo-search` (`ddgs`) as the primary zero-key web search engine, with optional Tavily support if `TAVILY_API_KEY` is present in `.env`.
4. **Graceful Failure**: If search fails or yields no results, VIDYA reports the issue cleanly without hallucinating fake current facts.

---

## Architecture Diagram (V2.2 Router)

```
                       VIDYA (V2.2 Router)
                                │
                                ▼
                          User Question
                                │
                                ▼
                           router_node
                       (classify_intent)
                                │
         ┌──────────────┬───────┴───────┬──────────────┐
         ▼              ▼               ▼              ▼
    RAG Route     Web Search Route Calculator Route General Route
   (retrieve)    (web_search)     (calculator)     (direct LLM)
         │              │               │              │
         └──────────────┴───────┬───────┴──────────────┘
                                ▼
                       generate_answer_node
                                │
                                ▼
                              Answer
```

---

## Proposed Changes

### [Component 1] Dependencies & Tool Implementation

#### [MODIFY] [`requirements.txt`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/requirements.txt)
- Add `duckduckgo-search>=6.0.0`

#### [MODIFY] [`app/tools.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/tools.py)
- Create `web_search_tool(query: str, max_results: int = 4) -> str`:
  - Uses `duckduckgo-search` (`DDGS().text(...)`).
  - Handles network timeouts, empty results, and rate limits gracefully.
  - Returns formatted structured text containing `Title`, `URL`, and `Snippet`.

---

### [Component 2] State & Intent Classification

#### [MODIFY] [`app/graph_state.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/graph_state.py)
- Add `search_results: Optional[str]` to `VIDYAState`.

#### [MODIFY] [`app/llm.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/llm.py)
- Update `classify_intent(query: str)`:
  - Check for web search intent: *latest*, *current*, *today*, *recent*, *search online*, *search the web*, *news*, *version*.
  - Explicit PDF overrides (*only from my PDF*, *from my PDF*) take precedence to force `RAG`.
- Update `build_prompt` and `ask_vidya`:
  - Support `search_results` parameter to pass web snippets to LLM with instruction to cite web context.

---

### [Component 3] LangGraph Node & Router Assembly

#### [MODIFY] [`app/nodes.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/nodes.py)
- Add `web_search_node(state: VIDYAState) -> dict`:
  - Executes `web_search_tool(state["query"])`.
  - Sets `tool_used = "web_search"` and `tool_result = search_text`.

#### [MODIFY] [`app/graph.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/graph.py)
- Update `select_route` & `build_qa_graph()`:
  - Add `web_search` node to `qa_graph`.
  - Route `"WEB_SEARCH"` ➔ `web_search_node` ➔ `generate_answer_node`.

---

### [Component 4] Verification Suite

#### [MODIFY] [`app/main.py`](file:///c:/Users/91895/Documents/projects/VIDYA%20—%20The%20AI%20Knowledge%20Person/ai-tutor/app/main.py)
- Add test suite covering:
  1. **Current Info**: `"What is the latest Python version?"` (Expect: WEB_SEARCH)
  2. **Explicit Search**: `"Search the web for the latest developments in RAG."` (Expect: WEB_SEARCH)
  3. **Normal PDF Question**: `"Explain supervised learning from my PDF."` (Expect: RAG)
  4. **PDF-Only Question**: `"Explain supervised learning only from my PDF."` (Expect: RAG, No Web Search)
  5. **Calculator Verification**: `"Calculate 17.5% of 85,000"` (Expect: CALCULATOR, intact)

---

## Verification Plan

### Automated Tests
1. Install dependencies (`pip install duckduckgo-search`).
2. Run `python -m app.main` from `ai-tutor/`.
3. Verify that:
   - Web Search queries correctly route to `web_search_node` and fetch live snippets.
   - PDF questions remain on `retrieve_node` without triggering Web Search.
   - Calculator tool remains 100% operational.
