# Milestone 9: LangGraph Migration — Deep Dive & Line-by-Line Guide

Is document me **Milestone 9 (LangGraph Migration)** ka ek-ek concept, ek-ek file, aur **Line-to-Line Code Explanation** aasan Hindi/Hinglish me real-world examples aur reason ke sath diya gaya hai.

---

## 1. Pehle Kya Tha vs LangGraph Kyu Chahiye? (The Big Picture & Reason)

### Pehle Ka Flow (Manual Sequential Code):
Pehle hamara code ek Sidhi Rekha (Straight Line) me chalta tha:
`main.py` -> `load_pdf()` -> `split_text()` -> `create_embeddings()` -> `store_chunks()` -> `ask_vidya()`

**Problem (Why this breaks):**
Agar kal ko humein system me:
- **Decision making** dalni ho (jaise: Search PDF vs Search Web?)
- **Self-Correction / Retry** dalni ho (jaise: Agar AI ka answer bad ho, to dubara attempt karo)
- **Loops & Branching** karni ho

Toh ek sidha script har jagah `if-else` aur `while` loops se messy (spaghetti code) ho jata hai.

### LangGraph Ka Architecture (Graph + State):
LangGraph me 3 main cheezein hoti hain:

1. **State (Notebook):** Ek shared Memory dictionary jo har step (node) ke paas pass hoti hai.
2. **Nodes (Workers):** Dedicated functions jo state me se data padhte hain, kaam karte hain, aur naya data notebook me likh dete hain.
3. **Edges (Connections/Roads):** Nodes ke beech ke raste jo batate hain ki agla step konsa hoga (aur conditional edges se branching bhi ho sakti hai).

---

## 2. Real-World Analogy (Factory Assembly Line Example)

Socho ek **Book Factory** hai:
- **State = Ek Carrying Tray (Basket)** jisme book ka raw materials aur instructions rakhe hain.
- **Node 1 (PDF Reader Worker):** Tray me se PDF ka path leta hai, PDF khol kar sara text padhta hai, aur text ko Basket me rakh deta hai.
- **Node 2 (Text Splitter Worker):** Basket se text leta hai, uske chote-chote paragraphs (chunks) banata hai, aur chunks ko Basket me wapas rakh deta hai.
- **Node 3 (Embedding Worker):** Basket se chunks leta hai, unke math vectors (embeddings) banata hai, aur vectors ko Basket me rakh deta hai.
- **Node 4 (ChromaDB Worker):** Basket se chunks + vectors lekar Database me save kar deta hai.
- **Node 5 (Suggestor Worker):** Basket ke text se 3 sample questions banakar Basket me rakh deta hai.

Sabhi Workers ek hi Basket (State) me read/write karte hain!

---

## 3. File 1: `app/graph_state.py` (Line-to-Line Explanation)

```python
 1: from typing import TypedDict, Optional
 2: 
 3: 
 4: class VIDYAState(TypedDict):
 5:     """
 6:     Shared state object that flows through every node in the VIDYA graph.
 7:     """
 8:     # ── Inputs ────────────────────────────────────────────────────────────────
 9:     pdf_path:       str              # Path to the student's uploaded PDF
10: 
11:     # ── Set after load_pdf_node ───────────────────────────────────────────────
12:     pdf_text:       Optional[str]    # Raw extracted text from the PDF
13: 
14:     # ── Set after split_text_node ─────────────────────────────────────────────
15:     chunks:         Optional[list]   # Text split into smaller chunks
16: 
17:     # ── Set after embed_node ──────────────────────────────────────────────────
18:     embeddings:     Optional[list]   # Vector embeddings for each chunk
19: 
20:     # ── Set after suggest_node ────────────────────────────────────────────────
21:     suggestions:    Optional[list]   # LLM-generated suggested questions
22: 
23:     # ── Query inputs (set when student asks a question) ───────────────────────
24:     query:          Optional[str]    # Student's question
25:     default_style:  Optional[str]    # Teaching style: Simple / Normal / Detailed
26: 
27:     # ── Set after retrieve_node ───────────────────────────────────────────────
28:     context_chunks: Optional[list]   # Relevant PDF chunks from ChromaDB
29: 
30:     # ── Set after generate_answer_node ────────────────────────────────────────
31:     answer:         Optional[str]    # VIDYA's final answer
32: 
33:     # ── For future retry logic (Phase 2) ─────────────────────────────────────
34:     retry_count:    Optional[int]    # How many times we have retried so far
```

### Line-by-Line Explanation:
- **Line 1:** `typing` se `TypedDict` aur `Optional` import kiya.
  - *Reason:* Python dict ko explicit structure aur types dene ke liye taaki IDE/autocomplete ko pata ho ki dict me konse keys hain.
- **Line 4:** `class VIDYAState(TypedDict):` - Hamara main Memory schema defining class.
- **Line 9:** `pdf_path: str` - Student ki uploaded PDF ka file path (e.g. `"data/sample.pdf"`).
- **Line 12-34:** Baaki saare fields (`pdf_text`, `chunks`, `embeddings`, `suggestions`, `query`, `default_style`, `context_chunks`, `answer`, `retry_count`) ko `Optional[...]` rakha hai.
  - *Reason:* Kyunki initial state me jab graph shuru hota hai, tab baki values missing/`None` hoti hain. Jaise-jaise nodes execute hote hain, ye fields bharte jaate hain.

---

## 4. File 2: `app/nodes.py` (Line-to-Line Explanation)

`nodes.py` hamare workers ka ghar hai. Inka kaam purane functions (`load_pdf`, `split_text`, etc.) ko LangGraph ke sath connect karna hai.

```python
 1: from app.graph_state import VIDYAState
 2: from app.pdf_loader import load_pdf
 3: from app.text_splitter import split_text
 4: from app.embeddings import create_embeddings
 5: from app.vector_store import store_chunks, search
 6: from app.llm import ask_vidya, generate_suggestions
```
- **Line 1-6:** Subhi existing functions aur `VIDYAState` type import kiya.
  - *Reason:* Clean architecture. Humne purana working code edit nahi kiya, bas use wrap (import) kiya hai.

```python
22: def load_pdf_node(state: VIDYAState) -> dict:
23:     """Read the PDF and extract raw text."""
24:     print(f"\n[Graph] load_pdf_node → {state['pdf_path']}")
25:     text = load_pdf(state["pdf_path"])
26:     print(f"         -> {len(text)} characters extracted")
27:     return {"pdf_text": text}
```
- **Line 22:** Function signature. LangGraph ke saare node functions argument me `state: VIDYAState` lete hain aur ek `dict` return karte hain.
- **Line 25:** `state["pdf_path"]` se PDF ka path nikaal kar `load_pdf()` ko diya.
- **Line 27:** `return {"pdf_text": text}`.
  - *Reason:* LangGraph me node jo dict return karta hai, LangGraph use automatically main `state` ke sath merge kar deta hai! Baaki fields ko untouched rakhta hai.

```python
31: def split_text_node(state: VIDYAState) -> dict:
32:     chunks = split_text(state["pdf_text"], chunk_size=100, overlap=20)
33:     return {"chunks": chunks}
```
- **Line 31-33:** `state["pdf_text"]` (jo pichle node ne set kiya tha) ko use karke text ko 100 words ke chunks me todega aur state me `chunks` update karega.

```python
40: def embed_node(state: VIDYAState) -> dict:
41:     embeddings = create_embeddings(state["chunks"])
42:     return {"embeddings": embeddings}
```
- **Line 40-42:** `state["chunks"]` ke vector embeddings generate karke state me `embeddings` return karega.

```python
49: def store_node(state: VIDYAState) -> dict:
50:     store_chunks(state["chunks"], state["embeddings"])
51:     return {}
```
- **Line 49-51:** State me se chunks aur embeddings lekar ChromaDB me save karega. Note: `return {}` kyunki yahan koi naya state field create nahi ho raha (side-effect node).

```python
58: def suggest_node(state: VIDYAState) -> dict:
59:     suggestions = generate_suggestions(state["pdf_text"])
60:     return {"suggestions": suggestions}
```
- **Line 58-60:** PDF text se LLM dwara 3 recommended questions generate karke state me `suggestions` daal dega.

```python
67: def retrieve_node(state: VIDYAState) -> dict:
68:     results = search(state["query"], n_results=3)
69:     context_chunks = results["documents"][0]
70:     return {"context_chunks": context_chunks}
```
- **Line 67-70:** User query (`state["query"]`) ke base par ChromaDB se Top-3 relevant chunks retrieve karke `context_chunks` state me store karega.

```python
77: def generate_answer_node(state: VIDYAState) -> dict:
78:     style = state.get("default_style") or "Normal"
79:     answer = ask_vidya(
80:         question=state["query"],
81:         context_chunks=state["context_chunks"],
82:         default_style=style,
83:     )
84:     return {
85:         "answer": answer,
86:         "retry_count": (state.get("retry_count") or 0),
87:     }
```
- **Line 77-87:** Query + Context Chunks + Style lekar Groq LLM API ko bhejta hai aur final `answer` state me save kar deta hai.

---

## 5. File 3: `app/graph.py` (Line-to-Line Explanation)

Is file me hum do alag Graphs construct karte hain:
1. `ingest_graph` (PDF parsing & database setup)
2. `qa_graph` (User Question Answer Pipeline)

*Reason for 2 Graphs:* Ingestion sirf ek baar hoti hai jab PDF upload hoti hai, jabki Question-Answering har baar hoti hai jab user sawal poochta hai.

```python
14: from langgraph.graph import StateGraph, END
15: from app.graph_state import VIDYAState
16: from app.nodes import ...
```
- **Line 14:** `StateGraph` aur `END` import kiya. `StateGraph` blueprint container hai aur `END` workflow ka termination point marker hai.

### Graph 1: Ingest Graph
```python
32: def build_ingest_graph():
33:     builder = StateGraph(VIDYAState)
34: 
35:     # Add nodes
36:     builder.add_node("load_pdf",   load_pdf_node)
37:     builder.add_node("split_text", split_text_node)
38:     builder.add_node("embed",      embed_node)
39:     builder.add_node("store",      store_node)
40:     builder.add_node("suggest",    suggest_node)
41: 
42:     # Set entry point
43:     builder.set_entry_point("load_pdf")
44: 
45:     # Add edges
46:     builder.add_edge("load_pdf",   "split_text")
47:     builder.add_edge("split_text", "embed")
48:     builder.add_edge("embed",      "store")
49:     builder.add_edge("store",      "suggest")
50:     builder.add_edge("suggest",    END)
51: 
52:     return builder.compile()
```
- **Line 33:** `StateGraph(VIDYAState)` se graph instance banaya jo batata hai ki memory structure `VIDYAState` jaisi honi chahiye.
- **Line 36-40:** Nodes add kiye (`add_node("name", function)`).
- **Line 43:** `set_entry_point("load_pdf")` batata hai ki graph kahan se execute hona shuru hoga.
- **Line 46-50:** Edges add kiye:
  - `load_pdf` -> `split_text` -> `embed` -> `store` -> `suggest` -> `END`.
- **Line 52:** `builder.compile()` graph ko executable Object me convert karta hai.

### Graph 2: QA Graph
```python
59: def build_qa_graph():
60:     builder = StateGraph(VIDYAState)
61: 
62:     builder.add_node("retrieve",        retrieve_node)
63:     builder.add_node("generate_answer", generate_answer_node)
64: 
65:     builder.set_entry_point("retrieve")
66: 
67:     builder.add_edge("retrieve",        "generate_answer")
68:     builder.add_edge("generate_answer", END)
69: 
70:     return builder.compile()
```
- **Line 60-73:** QA pipeline banayi:
  - Entry point: `retrieve`
  - Flow: `retrieve` -> `generate_answer` -> `END`.

```python
77: ingest_graph = build_ingest_graph()
78: qa_graph     = build_qa_graph()
```
- **Line 77-78:** Singletons compile karke export kar diye.

---

## 6. File 4: `app/main.py` (Line-to-Line Explanation)

```python
 4: from app.graph import ingest_graph, qa_graph
```
- Prepared compiled graphs ko import kiya.

```python
13: ingest_state = ingest_graph.invoke({
14:     "pdf_path":      "data/sample.pdf",
15:     "pdf_text":      None,
16:     "chunks":        None,
17:     "embeddings":    None,
18:     "suggestions":   None,
19:     "query":         None,
20:     "default_style": None,
21:     "context_chunks": None,
22:     "answer":        None,
23:     "retry_count":   0,
24: })
```
- **Line 13-24:** `ingest_graph.invoke(...)` call kiya initial input state ke sath (`pdf_path="data/sample.pdf"`).
- Graph pure 5 nodes (`load_pdf` -> `split_text` -> `embed` -> `store` -> `suggest`) ko sequence me chalakar updated final dictionary (`ingest_state`) return kar deta hai.

```python
46:     result = qa_graph.invoke({
47:         **ingest_state,          # carry forward pdf_text, chunks, etc.
48:         "query":         question,
49:         "default_style": default_style,
50:         "context_chunks": None,
51:         "answer":        None,
52:         "retry_count":   0,
53:     })
```
- **Line 46-53:** User sawal ke liye `qa_graph.invoke(...)` call kiya. `**ingest_state` se pichli saari memory Carry Forward ho jati hai.
- `qa_graph` retrieve aur answer generation node execute karta hai aur `result['answer']` me output deta hai.

---

## 7. Actual Execution Flow & Terminal Output

Jab aap `python -m app.main` chalaate ho, terminal me ye steps execute hote hain:

```text
============================================================
VIDYA — LangGraph Pipeline Starting (Phase 1)
============================================================

[Ingest Graph] Running PDF ingestion pipeline...

[Graph] load_pdf_node → data/sample.pdf
         -> 853 characters extracted
[Graph] split_text_node
         -> 4 chunks created
[Graph] embed_node
         -> 4 vectors of size 384
[Graph] store_node
         -> Stored in ChromaDB
[Graph] suggest_node
         -> 3 suggestions generated

┌──────────────────────────────────────────────────────────┐
│ Your PDF is ready! What would you like to learn?       │
├──────────────────────────────────────────────────────────┤
│ 💡 Suggested questions                                 │
│ • What is the main topic of this PDF?                   │
│ • Can you explain supervised learning with an example? │
│ • What is the difference between classification & regression? │
└──────────────────────────────────────────────────────────┘

============================================================
  TEST 1 — Answer exists in PDF
============================================================
  Default Style: Normal
  Q: What is classification?
------------------------------------------------------------
[Graph] retrieve_node → query: 'What is classification?'
         -> 2 chunk(s) retrieved
[Graph] generate_answer_node
         -> Answer generated

  VIDYA says:

In the PDF, supervised learning is described as a category of machine learning that uses labeled datasets. Two common tasks are:

- **Classification** – predicting a category (e.g., “spam” or “not spam”).
- **Regression** – predicting a number (e.g., the price of a house).

So, supervised learning is simply training a model with examples that already have the right answers...

============================================================
All tests complete! LangGraph Phase 1 working.
============================================================
```

### Output Kaise Aaya (Behind the Scenes Mechanism):
1. **`load_pdf_node`** ne PDF se text nikala (853 chars).
2. **`split_text_node`** ne uske 4 overlapping chunks banaye.
3. **`embed_node`** ne MiniLM model se 384-dimension vector banaye.
4. **`store_node`** ne ChromaDB SQLite database me chunks + vectors indexing kar di.
5. **`suggest_node`** ne Groq LLM API se PDF overview par base karke 3 questions mangwaaye.
6. **`retrieve_node`** ne query *"What is classification?"* ka embedding banakar ChromaDB se Cosine Similarity se top 2 matching chunks retrieve kiye.
7. **`generate_answer_node`** ne prompt context ke sath Groq `llama-3.3-70b-versatile` ko bhej kar formal, accurate answer print karwaya.

---

## Summary of Why Milestone 9 was a Huge Milestone

- **Zero Rewrite:** Humne pichla vector store, embeddings, loader, splitter ka code **bilkul destroy nahi kiya**, sirf wrapper node functions se connect kiya.
- **Scalable Architecture:** Ab Milestone 9 Phase 2 me self-correction router node (`evaluate_node`) aur retries insert karna bohot aasan hai.
