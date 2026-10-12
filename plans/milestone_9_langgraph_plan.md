# Milestone 9: Migration to LangGraph

## What is LangGraph and Why Do We Need It?

Right now, VIDYA's pipeline is a **straight line** — one function calls the next, in a fixed order. This works fine for simple Q&A. But the moment you want VIDYA to:
- Decide **whether to use RAG or general knowledge**
- **Retry** if the answer is bad
- Use **multiple tools** (web search, vision, calculator)
- **Evaluate** its own response before sending

...a straight line breaks down. You need a **graph** — a flow that can loop, branch, and make decisions.

That's exactly what **LangGraph** gives us.

---

## The Core Idea: State + Nodes + Edges

LangGraph has 3 building blocks:

| Concept | What it is | VIDYA Example |
|---------|-----------|---------------|
| **State** | A shared memory object that flows through the graph | `{ pdf_text, chunks, query, answer, style }` |
| **Node** | A function that reads State, does work, updates State | `retrieve_node`, `generate_answer_node` |
| **Edge** | A connection between two nodes. Can be **conditional** | After generate → if bad → retry, else → respond |

---

## How Current Code Maps to LangGraph Nodes

```
CURRENT (manual Python)          →    LANGGRAPH NODE
─────────────────────────────────────────────────────
load_pdf()                       →    load_pdf_node
split_text()                     →    split_text_node
create_embeddings()              →    embed_node
store_chunks()                   →    store_node
generate_suggestions()           →    suggest_node
search()                         →    retrieve_node
ask_vidya()                      →    generate_answer_node
```

**Nothing gets rewritten.** These existing functions just get **wrapped** inside node functions. The logic stays the same.

---

## What the State Looks Like

```python
class VIDYAState(TypedDict):
    pdf_path:       str           # input: path to the PDF
    pdf_text:       str           # after load_pdf_node
    chunks:         list[str]     # after split_text_node
    embeddings:     list          # after embed_node
    suggestions:    list[str]     # after suggest_node
    query:          str           # input: student's question
    default_style:  str           # input: Normal / Simple / Detailed
    context_chunks: list[str]     # after retrieve_node
    answer:         str           # after generate_answer_node
    retry_count:    int           # for conditional retry logic
```

All nodes read from this State and write back to it. No function passes values manually anymore — the graph handles the flow.

---

## Phase 1: Migration (Same Behavior, LangGraph Architecture)

The graph will look like this:

```
START
  │
  ▼
load_pdf_node
  │
  ▼
split_text_node
  │
  ▼
embed_node
  │
  ▼
store_node
  │
  ▼
suggest_node
  │
  ▼
retrieve_node
  │
  ▼
generate_answer_node
  │
  ▼
END
```

This is identical to what we have now. But now it is a proper LangGraph graph, ready to be extended.

---

## Phase 2: Adding Conditional Logic (The Real Power)

After Phase 1, we add a **router node** after `generate_answer_node`:

```
generate_answer_node
        │
        ▼
   evaluate_node        ← NEW: checks answer quality
        │
   ┌────┴────┐
   │         │
  GOOD      BAD
   │         │
   ▼         ▼
  END     retry_node   ← NEW: adjusts prompt and retries
               │
               ▼
       generate_answer_node
```

The `evaluate_node` could check:
- Is the answer shorter than 20 words? (probably bad)
- Does it say "I don't know"? (retry with more context)
- retry_count > 2? (stop and return best attempt)

---

## Files That Will Change

### [NEW] `app/graph_state.py`
Defines the `VIDYAState` TypedDict — the shared memory object.

### [NEW] `app/nodes.py`
Contains all node functions (`load_pdf_node`, `split_text_node`, etc.). Each function wraps the existing logic from `pdf_loader.py`, `text_splitter.py`, etc.

### [NEW] `app/graph.py`
Builds and compiles the LangGraph graph. Defines nodes and edges.

### [MODIFY] `app/main.py`
Instead of calling functions manually, it now just runs the compiled graph with an input state.

### [NO CHANGE] `app/pdf_loader.py`, `app/text_splitter.py`, `app/embeddings.py`, `app/vector_store.py`, `app/llm.py`
All existing logic remains untouched. Nodes simply import and call these functions.

---

## What Gets Installed

```bash
pip install langgraph langchain-core
```

---

## Open Questions

> My recommendation: **Phase 1 only first**, so you can see the graph working. Phase 2 in Milestone 9.1.
> In Phase 2, what should the "evaluate" logic be? Options:
> - Simple rule-based (check answer length, check for "I don't know")
> - LLM-based (ask the LLM to rate its own answer)

---

## Verification Plan

After implementation, running `python -m app.main` should produce **identical output** as before — same suggestions, same answers — because Phase 1 only changes the architecture, not the behavior.
