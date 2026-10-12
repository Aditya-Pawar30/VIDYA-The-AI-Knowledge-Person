# Chapter 1: V1 — RAG Core Architecture & Vector Retrieval

## 1. High-Level Architecture Overview
VIDYA V1 is built on the **Retrieval-Augmented Generation (RAG)** architecture. RAG bridges the gap between static LLM knowledge and specific custom documents (like a student's uploaded PDF textbook).

```
+----------------+      +-------------------+      +-----------------------+
| Student PDF    | ---> | Text Extraction   | ---> | Recursive Splitter    |
| (Raw Document) |      | (pypdf / PdfReader|      | (100 words, 20 overlap|
+----------------+      +-------------------+      +-----------------------+
                                                               |
                                                               v
+------------------+      +---------------------+      +-----------------------+
| Cosine Distance  | <--- | ChromaDB Vector     | <--- | SentenceTransformer   |
| Query Retrieval  |      | Persistent Storage  |      | (384-dim Embeddings)  |
+------------------+      +---------------------+      +-----------------------+
```

---

## 2. Core Concepts & Topics Used

### A. PDF Loaders (`pypdf`)
- **What it does**: Reads raw binary PDF files and extracts raw text string page-by-page.
- **Why we used `pypdf`**: Lightweight, zero native C-dependency overhead, pure Python, fast string extraction.
- **Alternatives**:
  - `pdfplumber` / `PyMuPDF (fitz)`: Slower, heavier C-bindings. Useful for tables/images, but overkill for pure text textbooks.
  - Raw string reads (`open("file.pdf")`): Impossible because PDFs store text encoded inside stream objects and compressed binary structures.

### B. Text Chunking (`split_text`)
- **What it does**: Splits a long document into smaller overlapping text segments (e.g., 100 words with 20 words overlap).
- **Why Chunking is Required**:
  1. **LLM Context Limit & Noise**: Sending an entire 500-page textbook to an LLM dilutes attention and costs high token fees.
  2. **Semantic Granularity**: Vector search works best on concise, focused passages (ideas), not entire books.
- **Why Overlap is Crucial**: If a sentence like *"Supervised learning requires labeled data"* gets cut exactly between *"Supervised learning"* (Chunk 1) and *"requires labeled data"* (Chunk 2), the context is broken. Overlap ensures adjacent chunks share edge context.
- **Alternatives**:
  - **No Chunking**: Fails due to LLM context overflow or loss of accuracy (needle in a haystack problem).
  - **Character Splitting**: Cuts words in half (e.g., "Supervi" and "sed"). Word-based or token-based sliding windows are far superior.

### C. Dense Vector Embeddings (`sentence-transformers` - `all-MiniLM-L6-v2`)
- **What it does**: Converts text chunks into 384-dimensional floating-point vectors representing semantic meaning.
- **Why `all-MiniLM-L6-v2`**:
  - Runs locally on CPU in milliseconds (no API cost).
  - High accuracy for semantic similarity tasks.
- **Why Embeddings vs Keyword Search (TF-IDF / BM25)**:
  - Keyword search fails when different words share the same meaning (e.g., "automobile" vs "car", "classification" vs "categorization").
  - Vector embeddings place semantically similar concepts close together in 384-dimensional vector space regardless of exact word matches.

### D. Vector Database (`ChromaDB`)
- **What it does**: Stores vector embeddings along with text chunks on disk (`./chroma_db`) and builds an HNSW (Hierarchical Navigable Small World) index for ultra-fast similarity searches.
- **Why ChromaDB**:
  - Embedded, persistent on local disk, zero external server setup required.
  - Native Python integration.
- **Alternatives**:
  - **In-Memory Python List**: Simple, but scanning `O(N)` vectors manually on every user question is extremely slow and lost when the process exits.
  - **Pinecone / Weaviate**: Require cloud API keys, network latency, and monthly costs.

---

## 3. Line-by-Line Code Breakdown

### `app/pdf_loader.py`
```python
from pypdf import PdfReader

def load_pdf(file_path):
    reader = PdfReader(file_path)  # Line 5: Initialize PDF reader object
    text = ""                      # Line 7: Accumulator string
    for page in reader.pages:       # Line 9: Loop over each page
        text += page.extract_text() or "" # Line 10: Extract page text safely
    return text
```
* **Line 5**: `PdfReader(file_path)` parses the PDF cross-reference table.
* **Line 10**: `extract_text() or ""` handles empty pages (like images) without returning `None` errors.

### `app/text_splitter.py`
```python
def split_text(text, chunk_size=100, overlap=20):
    words = text.split()            # Line 2: Convert string to list of words
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end]) # Line 11: Join slice into chunk string
        chunks.append(chunk)
        start += chunk_size - overlap       # Line 14: Advance start pointer by (chunk_size - overlap)
    return chunks
```
* **Line 14**: `start += chunk_size - overlap` implements the sliding window! Step size is $100 - 20 = 80$ words forward per step.

### `app/embeddings.py`
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("all-MiniLM-L6-v2") # Line 4: Load model into memory

def create_embeddings(chunks):
    embeddings = model.encode(chunks) # Line 8: Vectorize all chunks in parallel batch
    return embeddings
```
* **Line 8**: `model.encode(chunks)` returns a NumPy 2D array of shape `(N, 384)`.

### `app/vector_store.py`
```python
import chromadb
client = chromadb.PersistentClient(path="./chroma_db") # Line 4: Connect to disk storage
collection = client.get_or_create_collection(name="vidya_documents") # Line 6: Get/create collection

def store_chunks(chunks, embeddings):
    ids = [f"chunk_{i}" for i in range(len(chunks))] # Line 12: Unique string IDs
    embeddings_list = embeddings.tolist() if hasattr(embeddings, "tolist") else embeddings # Line 14: Convert NumPy array to list
    collection.add(ids=ids, documents=chunks, embeddings=embeddings_list) # Line 16: Index in ChromaDB
```
* **Line 4**: `PersistentClient` persists data to disk so index survives restarts.
* **Line 16**: `.add()` automatically constructs the spatial indexing tree.

---

## 4. Architectural Alternatives & Tradeoffs Summary

| Feature | Selected Choice | Alternative Option | Why Selected over Alternative? |
| :--- | :--- | :--- | :--- |
| **PDF Extraction** | `pypdf` | `pdfplumber` | Pure Python, fast, lightweight. |
| **Text Chunking** | Sliding Word Window | Character Cutoff | Preserves full words and semantic boundaries. |
| **Embeddings** | `all-MiniLM-L6-v2` | OpenAI `text-embedding-3-small` | Local CPU execution, 0 cost, 0 network latency. |
| **Vector Storage** | ChromaDB Persistent | Python In-Memory List | Disk persistence, HNSW fast indexed similarity search vs $O(N)$ scan. |
