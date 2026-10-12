# Chapter 4: V2.2 — Web Search Capability & `ddgs` 9.16.0 Integration

## 1. High-Level Architecture Overview
RAG is limited to the uploaded PDF. When a student asks about current events or external developments (*"What is the latest Python version?"*), RAG cannot answer.

V2.2 adds **Web Search Capability** using DuckDuckGo Search via the modern `ddgs` 9.16.0 API.

```
Student Query: "Search the web for latest Python version"
               │
               ▼
[Router Node] ---> Intent detected: "WEB_SEARCH"
               │
               ▼
[Web Search Node]
   ├── Clean query: "latest Python version"
   ├── Call `ddgs.text(clean_query, max_results=4)`
   └── Format structured results: Title, URL, Snippet
               │
               ▼
Structured Web Context passed to [Generate Answer Node] ---> LLM answers with real-time web facts!
```

---

## 2. Core Concepts & Package Namespace Resolution (`ddgs` vs `duckduckgo_search`)

### Why `from ddgs import DDGS` is the Correct Choice
- In older releases (v5-v7), DuckDuckGo Search was distributed under the PyPI package `duckduckgo_search`.
- In modern v9.x releases (such as installed version `9.16.0`), the official PyPI package was renamed to **`ddgs`**.
- Importing `from duckduckgo_search import DDGS` in v9.x outputs internal `RuntimeWarning: This package (duckduckgo_search) has been renamed to ddgs!`.
- Importing directly via `from ddgs import DDGS` uses the clean, modern namespace without deprecation warnings.

---

## 3. Line-by-Line Code Breakdown

### `app/tools.py` (`web_search_tool`)
```python
from ddgs import DDGS  # Line 11: Direct clean import from ddgs package

def web_search_tool(query: str, max_results: int = 4) -> str:
    clean_query = query
    for prefix in ["search the web for", "search online for", "search the web", "search online", "search for"]:
        if clean_query.lower().startswith(prefix):
            clean_query = clean_query[len(prefix):].strip(" :")

    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(clean_query, max_results=max_results))
        
        if not results:
            return f"No web search results found for query '{clean_query}'."
        
        formatted = []
        for i, item in enumerate(results, 1):
            title = item.get("title", "No Title")
            url = item.get("href", item.get("link", "#"))
            snippet = item.get("body", item.get("snippet", "No Snippet"))
            formatted.append(f"[{i}] {title}\nURL: {url}\nSnippet: {snippet}")
        
        return "\n\n".join(formatted)
    except Exception as e:
        return f"[Web Search Note]: Search failed ({str(e)}). Unable to verify live web data."
```
* **Line 102**: `with DDGS() as ddgs:` opens a clean HTTP session context manager.
* **Line 103**: `ddgs.text(clean_query, max_results=4)` fetches live search results.
* **Line 118-121**: Converts raw JSON response dictionaries into human-readable formatted context blocks for the LLM.

---

## 4. Architectural Alternatives & Tradeoffs Summary

| Feature | Selected Choice | Alternative Option | Why Selected over Alternative? |
| :--- | :--- | :--- | :--- |
| **Search Engine API** | `ddgs` 9.16.0 | Google Custom Search API / Tavily | Free, open-source, no API keys required, zero billing cost. |
| **Import Namespace** | `from ddgs import DDGS` | `from duckduckgo_search import DDGS` | Clean, warning-free, uses standard v9.16.0 package namespace. |
