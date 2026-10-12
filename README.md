# VIDYA — The AI Knowledge Person

An AI-powered PDF tutor that lets you chat with your study material directly from the terminal.

---

## What It Does

- You give it a PDF (notes, textbook, slides)
- It reads and understands the content
- You ask questions in the terminal
- It answers from the PDF — with text or by looking at the actual page images

---

## How It Works

| Layer | What it does |
|---|---|
| **LangGraph** | Manages the pipeline as a state graph |
| **ChromaDB** | Stores and retrieves relevant text chunks (RAG) |
| **Groq (LLaMA)** | Answers text-based questions fast |
| **Gemini Vision** | Reads PDF page images for visual/diagram questions |
| **PyMuPDF** | Converts PDF pages into images for vision |

---

## How to Run

```bash
# Install dependencies
pip install -r requirements.txt

# Run the tutor
python -m app.main
```

Then type your question in the terminal. Type `exit` to quit.

---

## Stack

- Python 3.10+
- LangGraph + LangChain
- Groq API (LLaMA 3)
- Google Gemini API (Vision)
- ChromaDB
- PyMuPDF (fitz)
- sentence-transformers
