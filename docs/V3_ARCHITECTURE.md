# VIDYA V3 — Visual Understanding: Complete Engineering Record

> **Status**: ✅ IMPLEMENTED (Lightweight VLM Approach)
> **Last Updated**: 2026-10-03
> **Decision**: Gemini 1.5 Flash Vision API (not ColPali)

---

## What V3 Adds to VIDYA

V3 gives VIDYA the ability to **see** — to understand diagrams, flowcharts, charts, and tables inside student PDFs, not just extracted text.

**Before V3:**
```
Student Question → Text Retrieval (ChromaDB) → Text-only LLM → Answer
```

**After V3:**
```
Student Question → Text Retrieval (ChromaDB) → Render PDF Page → Gemini Vision → Answer
                                                     ↑
                                           (sees diagrams + text together)
```

---

## What We Tried First: ColPali (Abandoned)

| Issue | Detail |
|---|---|
| **Storage** | PaliGemma 3B backbone = ~5-8 GB download. Hit OSError 112 (disk full). |
| **Vectors** | 1030 vectors per page. ChromaDB does not support MaxSim late-interaction. |
| **Compute** | GPU required for practical indexing speed. CPU-only = too slow. |

Full experiment code preserved (commented out) in:
`experiments/visual_retrieval/colpali_demo.py`

**Learning from ColPali experiment:**
ColPali is the right long-term architecture — it eliminates OCR entirely and understands page layouts natively. But it requires GPU + a vector store that supports multi-vector late-interaction (like Vespa or Qdrant). For VIDYA's current stage, it is premature.

---

## What ColSmol Is (and Why We Skipped It Too)

ColSmol uses SmolVLM (0.5B or 2B) instead of PaliGemma — lighter but **same architecture problems**:
- Still late-interaction retrieval → ChromaDB still incompatible
- Still needs multi-vector storage (just fewer vectors than ColPali)
- Still no native ChromaDB MaxSim support

ColSmol is a better future option than ColPali for our hardware, but the ChromaDB constraint makes both unusable without switching vector stores.

---

## Chosen Approach: Lightweight VLM at Generation Time

**Core insight:** We separated the two problems:

```
RETRIEVAL  → Keep text-based ChromaDB. Nothing changes. (V1/V2 untouched)
GENERATION → Add vision at the answer step using a VLM API.
```

### Flow:

```
PDF Upload
    │
    ├── Text Pipeline (V1/V2 — UNCHANGED)
    │     └── Chunks → Embeddings → ChromaDB
    │
    └── Vision Pipeline (V3 — NEW)
          └── PyMuPDF renders each page → PNG images saved to disk
                                    (data/rendered_pages/)

Student Question
    │
    ├── Text Retrieval (ChromaDB — UNCHANGED)
    │     └── Top 3 relevant text chunks
    │
    └── Visual Context (V3 — NEW)
          └── Page 1 image (or relevant page) → Gemini 1.5 Flash Vision
                └── Returns: answer grounded in text + visual content
```

---

## V3 Implementation: Files

| File | Role |
|---|---|
| `app/vision/pdf_renderer.py` | PyMuPDF renders PDF pages to PNG images |
| `app/vision/visual_retriever.py` | `GeminiVisualRetriever` — sends page image + text to Gemini Vision |
| `experiments/visual_retrieval/colpali_demo.py` | Archived ColPali experiment with full learning notes |

---

## V3 Model: Why Gemini 1.5 Flash

| Model | Why Considered | Decision |
|---|---|---|
| **moondream2 (1.8B)** | Runs on CPU, zero API | Quality insufficient for complex diagrams |
| **SmolVLM (2B)** | Lightweight | Same ColPali architecture problem when used for retrieval |
| **Qwen2-VL-2B** | Best quality at 2B | Local run too slow on CPU |
| **Gemini 1.5 Flash** | API-based, free tier, multimodal | ✅ Best quality, zero local GPU, easy integration |
| **ColPali** | No OCR, native layout understanding | ❌ GPU + ChromaDB incompatibility |

---

## V3 Concepts Learned (V3.1 → V3.14)

| Topic | Key Learning |
|---|---|
| **V3.1 Image Fundamentals** | Pixels = smallest unit. RGB = 3 channels. Image = 3D tensor (H×W×C). |
| **V3.2 CNN Fundamentals** | Filters slide over image. Convolution = weighted sum. Feature maps = filter responses. Hierarchical: edges → shapes → objects. |
| **V3.3 OCR Fundamentals** | Text detection (where) vs recognition (what). OCR fails on complex layouts, handwriting, math equations. |
| **V3.4 CNN Complete** | Stride = filter step size. Padding = border handling. Pooling = downsample (Max/Avg). Transfer learning = reuse ImageNet weights. CNNs weak at global context. |
| **V3.5 CNN Architectures** | LeNet (1998, digits) → AlexNet (2012, deep CNNs proven) → VGG (depth matters, 3×3 filters) → Inception (parallel branches, multiple filter sizes) → ResNet (skip connections, solved vanishing gradients) → DenseNet (every layer connects to every other) → EfficientNet (compound scaling: width + depth + resolution). |
| **V3.6 OCR Complete** | Full pipeline: detection → recognition → correction. CRNN for sequence recognition. Attention-based modern OCR. Tables and math formulas are hardest cases. |
| **V3.7 Object Detection** | Classification = what. Detection = what + where (bounding box). YOLO = fast, single-shot. Faster R-CNN = accurate, region proposals. DETR = transformer-based detection. |
| **V3.8 Image Segmentation** | Semantic = pixel-level class. Instance = individual object. Panoptic = both. SAM = open-world segment anything. |
| **V3.9 Vision Transformers** | Images split into patches (16×16). Each patch = token. Self-attention captures global relationships. ViT needs more data than CNN but scales better. |
| **V3.10 Vision-Language Models** | Image encoder (CNN or ViT) + Language model + alignment layer. CLIP aligns image and text in shared space. LLaVA, GPT-4o Vision, Gemini Vision = full VLMs. Visual QA = VLM's core skill. |
| **V3.11 Document AI** | Document = text + position + layout. LayoutLM = text + bounding boxes. Donut = end-to-end doc understanding without OCR. Pix2Struct = screenshot/chart understanding. |
| **V3.12 Multimodal Embeddings** | Text embeddings exist in one vector space. Image embeddings in another. CLIP/SigLIP train both to live in the SAME space. Enables text query → image retrieval. |
| **V3.13 Multimodal RAG** | Text retrieval (V1) + Image retrieval together. Combine text chunks + visual page context into one VLM prompt. Reranking merges both scores. |
| **V3.14 Visual Document Retrieval** | ColPali = full page images → PaliGemma → 1030 patch vectors → MaxSim scoring. Eliminates OCR. GPU + special vector store required. ColSmol = lighter version, same approach. API VLM = practical alternative for no-GPU environments. |

---

## V3.15 Architecture Decision: Final

**Question asked:** Should VIDYA use ColPali / ColSmol / lightweight VLM / API VLM?

**Answer:**

```
V3 Implementation: Gemini 1.5 Flash Vision API
  ├── Retrieval: Text-based ChromaDB (V1/V2 — unchanged)
  ├── Rendering: PyMuPDF (pdf_renderer.py)
  └── Generation: Gemini Vision sees page image + text context + question

Future Upgrade Path (when GPU available):
  └── ColSmol → implement ColPaliRetriever in visual_retriever.py
               → switch vector store to Qdrant or Vespa
               → no graph node changes needed (abstract class handles swap)
```

---

## Future: When to Use ColPali

When ALL of these are true:
- ✅ GPU available (≥8 GB VRAM)
- ✅ Vector store supports multi-vector MaxSim (Qdrant / Vespa)
- ✅ Storage available (≥10 GB per large document corpus)
- ✅ Offline-first is a hard requirement (no API allowed)
