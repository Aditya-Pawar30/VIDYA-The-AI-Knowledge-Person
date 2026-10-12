# VIDYA V3 — Visual Understanding Roadmap & Learning Plan

> **Status**: Planning & Learning Phase — NO implementation started yet.
> **Last Updated**: 2026-09-26
> **Author**: VIDYA Engineering Notebook

---

## 🗺️ What is V3?

V3 is about giving VIDYA the ability to **understand visual content** inside study materials — diagrams, flowcharts, charts, tables, figures embedded in PDFs — not just raw text.

### V3 End Goal (Conceptual Target — Subject to Change After Learning)

```
PDF / Study Material
        ↓
Document Analysis
  ├── Text Extraction
  ├── Visual Content Identification (diagrams, charts, figures)
  └── Structure/Layout Understanding (tables, columns, headings)
        ↓
Text Knowledge + Visual Knowledge + Structural Knowledge
        ↓
Retrieval (Text + Visual)
        ↓
Relevant Text + Relevant Visual Context
        ↓
LLM / VLM
        ↓
Teaching Response
(with relevant visual aid surfaced if it helps the student)
```

> ⚠️ **IMPORTANT**: This architecture is the **conceptual target only**.
> It WILL be revised after completing the V3 learning roadmap.
> The final technology stack has NOT been decided yet.

---

## ✅ What Has Been Implemented (V1 & V2 — COMPLETE & WORKING)

| Milestone | Status | What It Does |
| :--- | :--- | :--- |
| **V1 — RAG Core Pipeline** | ✅ COMPLETE | PDF → Chunks → Embeddings (`all-MiniLM-L6-v2`) → ChromaDB → Retrieve → LLM Answer |
| **Milestone 9 — LangGraph** | ✅ COMPLETE | State graph engine with `VIDYAState`, `router_node`, conditional edges, modular nodes |
| **V2.1 — Calculator Tool** | ✅ COMPLETE | Safe AST Math Evaluator, `calculator_tool()`, `calculator_node` in LangGraph |
| **V2.2 — Web Search Tool** | ✅ COMPLETE | `ddgs` 9.16.0, `web_search_tool()`, `web_search_node`, live web context injection |

> 🔒 **V1 and V2 are FROZEN. Nothing in the learning or planning phases below touches existing code.**

---

## 🧠 V3 Learning Status (Concepts Only — Nothing Implemented)

### CONCEPTUALLY LEARNED ✅

These topics have been studied at concept level. Nothing is coded yet.

| Topic | Key Concepts Covered |
| :--- | :--- |
| **Image Fundamentals** | Pixels, RGB, channels, tensors, basic image representation |
| **CNN Fundamentals** | What CNN is, filters/kernels, convolution operation, feature maps, hierarchical feature learning |
| **OCR Fundamentals** | OCR meaning, text detection vs recognition, printed/handwriting text, basic OCR limitations |

---

### NOT YET LEARNED ❌

Everything below is still to be studied, in sequence.

---

## 📚 V3 Learning Roadmap — Step-by-Step

> **Engineering Principle**: We do NOT choose a technology before understanding why it exists and what problem it solves.
> Every section below answers: *What problem existed? What does this solve? Does VIDYA need it?*

---

### V3.1 — Image Fundamentals
**Status**: ✅ Conceptually Learned

Topics covered:
- Pixels, RGB, channels
- Tensors as image representation
- Basic image data structures

---

### V3.2 — CNN Fundamentals
**Status**: ✅ Conceptually Learned

Topics covered:
- What a CNN is
- Filters / Kernels
- Convolution operation
- Feature maps
- Hierarchical feature learning (edges → shapes → objects)

---

### V3.3 — OCR Fundamentals
**Status**: ✅ Conceptually Learned

Topics covered:
- What OCR is
- Text detection vs text recognition
- Printed text vs handwriting
- OCR limitations for complex layouts

---

### V3.4 — Complete CNN Concepts
**Status**: ❌ Not Yet Learned

Topics to learn:
- Stride — how much the filter moves each step
- Padding — handling border pixels
- Pooling — downsampling feature maps (Max Pooling, Average Pooling)
- Receptive Field — how much of the original image one neuron "sees"
- Transfer Learning — reusing pretrained weights for new tasks
- Pretrained CNNs — ImageNet-trained models and why they generalize
- CNN Limitations — what CNNs struggle with (global context, long-range dependencies, non-spatial data)

---

### V3.5 — CNN Architecture Families
**Status**: ❌ Not Yet Learned

For each architecture below, we will learn:
- What problem existed BEFORE this architecture
- What this architecture changed
- Why the change mattered
- Strengths
- Limitations
- Whether it is still used today
- Whether VIDYA needs it

Architectures to study:
- **LeNet** — The first practical CNN (1998). Solved handwritten digit recognition.
- **AlexNet** — The CNN that won ImageNet 2012, proved deep CNNs at scale.
- **VGG** — Showed that depth (very small 3×3 filters) matters.
- **GoogLeNet / Inception** — Solved the problem of choosing filter sizes using parallel branches.
- **ResNet** — Solved vanishing gradients in very deep networks using skip connections.
- **DenseNet** — Every layer connects to every other layer, maximizing feature reuse.
- **EfficientNet** — Systematically scales width, depth, resolution together for efficiency.

---

### V3.6 — Complete OCR Concepts
**Status**: ❌ Not Yet Learned

Topics to learn:
- Complete OCR pipeline (detection → recognition → correction)
- Printed text OCR
- Handwriting recognition
- Table structure detection
- Mathematical equations and formula recognition
- Complex multi-column layouts
- OCR accuracy and failure modes
- Modern deep learning OCR approaches (CRNN, attention-based recognition)

---

### V3.7 — Object Detection
**Status**: ❌ Not Yet Learned

Topics to learn:
- Image classification vs object detection (what is the difference?)
- Bounding boxes — what they are and how detection works
- **YOLO** — Real-time detection (You Only Look Once). Why it's fast.
- **Faster R-CNN** — Region Proposal Network + classifier. Why it's accurate.
- **DETR** — Detection Transformer. Using attention for detection.
- When to use each architecture
- Strengths and limitations
- Does VIDYA need object detection?

---

### V3.8 — Image Segmentation
**Status**: ❌ Not Yet Learned

Topics to learn:
- Semantic segmentation — classifying every pixel by category
- Instance segmentation — distinguishing individual objects of the same class
- Panoptic segmentation — combining semantic + instance
- **SAM (Segment Anything Model)** — Foundation model for open-world segmentation
- When segmentation is useful vs detection
- Does VIDYA need segmentation?

---

### V3.9 — Vision Transformers (ViT)
**Status**: ❌ Not Yet Learned

Topics to learn:
- Why vision moved beyond pure CNN architectures
- Image patches — splitting images into fixed-size patches
- Patch embeddings — converting patches to token vectors
- Positional information — encoding spatial position
- Self-attention in image context
- **ViT (Vision Transformer)** — Full transformer applied to image patches
- CNN vs ViT comparison — strengths, limitations, data requirements
- Hybrid approaches combining CNN + Transformer

---

### V3.10 — Vision-Language Models (VLMs)
**Status**: ❌ Not Yet Learned

Topics to learn:
- What a VLM is — models that understand both images and text together
- Image encoders (CNN or ViT backbone) + Language models connected
- How image and text representations are aligned (contrastive learning, CLIP)
- Visual Question Answering (VQA)
- Visual reasoning — describing relationships, understanding diagrams
- VLM limitations — hallucination, resolution limits, diagram understanding
- Why VLMs are directly relevant to VIDYA's V3 goal
- Key models to understand: CLIP, LLaVA, GPT-4o Vision, Gemini Vision, PaliGemma

---

### V3.11 — Document AI
**Status**: ❌ Not Yet Learned

Topics to learn:
- Document Layout Understanding — text is not just strings, it has position and structure
- What document-specific models understand that generic VLMs don't
- Text + position together (bounding boxes + semantic meaning)
- Table detection and extraction
- Chart and figure identification
- Multi-column layout handling
- Header/footer/footnote distinction
- Key models: **LayoutLM**, **Donut**, **Pix2Struct**
- Why document AI exists separately from general VLMs
- Does VIDYA need document AI specifically?

---

### V3.12 — Multimodal Embeddings
**Status**: ❌ Not Yet Learned

Topics to learn:
- Text embeddings (what we already use in V1 RAG)
- Image embeddings — representing visual content as vectors
- Multimodal / shared embedding spaces — images and text in the same vector space
- Why this enables cross-modal retrieval (query with text → retrieve relevant image)
- Visual similarity search
- Why normal text-only embeddings are insufficient for visual document content

---

### V3.13 — Multimodal RAG
**Status**: ❌ Not Yet Learned

Topics to learn:
- Text retrieval (V1 RAG — already implemented)
- Image retrieval — finding relevant images/diagrams for a query
- Page-level retrieval — treating a full page as a unit
- Visual context retrieval — finding diagrams that explain a concept
- Reranking — combining text and visual relevance scores
- Combining text + visual context into a single prompt for the LLM/VLM
- How this connects to and extends VIDYA's existing RAG architecture

---

### V3.14 — Modern Visual Document Retrieval
**Status**: ❌ Not Yet Learned

Topics to learn:
- **ColPali** — Visual document retrieval using late-interaction on page images
- Why ColPali is different from OCR → text → embeddings pipeline
- Late-interaction approaches — how they work and why they're efficient
- When page-image retrieval beats text-extraction pipelines
- Tradeoffs: compute cost, accuracy, document type compatibility

---

### V3.15 — VIDYA V3 Architecture Decision
**Status**: ❌ Not Started (Locked until V3.14 is complete)

Only after completing V3.1 through V3.14 will we:
1. Compare all available approaches
2. Map each approach to VIDYA's specific product requirements
3. Identify which components VIDYA actually needs
4. Explicitly decide which technologies are NOT needed and why
5. Design the finalized V3 architecture
6. Write the V3 implementation plan
7. Begin implementation

---

## 🗂️ Technology Landscape Overview (Reference Map)

This table shows what each model family does. It is NOT a decision — it is a reference to understand the landscape as we study.

| Technology | Primary Role | Example Models | Relevant to VIDYA? |
| :--- | :--- | :--- | :--- |
| **OCR** | Read text from images | Tesseract, PaddleOCR, TrOCR | Possibly — for image-heavy PDFs |
| **Object Detection** | Find and locate objects in images | YOLO, Faster R-CNN, DETR | Maybe — for identifying diagram regions |
| **Segmentation** | Identify exact pixel regions | SAM, Mask R-CNN | Possibly — for isolating figures |
| **CNN** | Learn visual features from images | ResNet, EfficientNet | Possibly — as backbone in other models |
| **ViT** | Transformer-based visual representation | ViT, DeiT, DINO | Possibly — as backbone for VLM |
| **VLM** | Understand image + text together | LLaVA, GPT-4o, Gemini, PaliGemma | Very likely — core of V3 |
| **Document AI** | Understand document layout + content | LayoutLM, Donut, Pix2Struct | Possibly — for structured PDFs |
| **Multimodal Embeddings** | Embed image + text in shared vector space | CLIP, SigLIP | Likely — for visual retrieval |
| **Multimodal RAG** | Retrieve text + visual context together | ColPali + VLM | Very likely — extends V1 RAG |
| **LLM** | Reason and generate teaching response | Llama, Groq, GPT-4 | Already in use — V1 complete |

---

## 🚫 What is NOT Happening in V3 Planning Phase

| Action | Status |
| :--- | :--- |
| CNN implementation in VIDYA | ❌ NOT HAPPENING YET |
| OCR integration in VIDYA | ❌ NOT HAPPENING YET |
| VLM integration | ❌ NOT HAPPENING YET |
| YOLO / object detection in VIDYA | ❌ NOT HAPPENING YET |
| Multimodal RAG implementation | ❌ NOT HAPPENING YET |
| New vision dependencies installed | ❌ NOT HAPPENING YET |
| V1 / V2 code modified | ❌ WILL NOT BE TOUCHED |
| Final V3 architecture decided | ❌ NOT YET DECIDED |

---

## ▶️ What Comes Next (After This Document)

**Next Learning Step:**
> Complete the missing CNN concepts (V3.4) — Stride, Padding, Pooling, Receptive Field, Transfer Learning, Pretrained CNNs, CNN Limitations.
> 
> Then study CNN architecture families (V3.5) one by one: LeNet → AlexNet → VGG → GoogLeNet → ResNet → DenseNet → EfficientNet.
>
> Then continue sequentially through V3.6 → V3.7 → V3.8 → V3.9 → V3.10 → V3.11 → V3.12 → V3.13 → V3.14 → V3.15.

**Implementation begins ONLY at V3.15 — after all learning is complete.**

---

## 📁 Related Documentation

| File | Purpose |
| :--- | :--- |
| [`plans/v3_visual_understanding_roadmap.md`](file:///c:/Users/91895/Documents/projects/VIDYA%20%E2%80%94%20The%20AI%20Knowledge%20Person/ai-tutor/plans/v3_visual_understanding_roadmap.md) | This document — V3 learning plan |
| [`plans/v2_2_web_search_plan.md`](file:///c:/Users/91895/Documents/projects/VIDYA%20%E2%80%94%20The%20AI%20Knowledge%20Person/ai-tutor/plans/v2_2_web_search_plan.md) | V2.2 Web Search — COMPLETE |
| [`plans/v2_1_calculator_and_router_plan.md`](file:///c:/Users/91895/Documents/projects/VIDYA%20%E2%80%94%20The%20AI%20Knowledge%20Person/ai-tutor/plans/v2_1_calculator_and_router_plan.md) | V2.1 Calculator — COMPLETE |
| [`plans/milestone_9_langgraph_plan.md`](file:///c:/Users/91895/Documents/projects/VIDYA%20%E2%80%94%20The%20AI%20Knowledge%20Person/ai-tutor/plans/milestone_9_langgraph_plan.md) | Milestone 9 LangGraph — COMPLETE |
| [`docs/05_VIDYA_Master_Architecture_Handbook.md`](file:///c:/Users/91895/Documents/projects/VIDYA%20%E2%80%94%20The%20AI%20Knowledge%20Person/ai-tutor/docs/05_VIDYA_Master_Architecture_Handbook.md) | Master Engineering Handbook |
