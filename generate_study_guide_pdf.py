import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# ── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)
PDF_PATH = os.path.join(DOCS_DIR, "VIDYA_Complete_System_Design_And_Engineering_Guide.pdf")


# ── Color Palette ────────────────────────────────────────────────────────────
PRIMARY = colors.HexColor("#1A365D")    # Deep Navy
SECONDARY = colors.HexColor("#2B6CB0")  # Royal Blue
ACCENT = colors.HexColor("#D69E2E")     # Warm Amber
DARK_TEXT = colors.HexColor("#2D3748")  # Charcoal
LIGHT_BG = colors.HexColor("#F7FAFC")   # Cool White
BORDER_CLR = colors.HexColor("#E2E8F0") # Light Border
SUCCESS_CLR = colors.HexColor("#2F855A")# Green
WARN_CLR = colors.HexColor("#C53030")   # Red


def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=0.55 * inch,
        rightMargin=0.55 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
    )

    styles = getSampleStyleSheet()

    # Custom typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        alignment=1, # Center
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        alignment=1,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1A202C")
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#2C5282")
    )

    story = []

    # ── Header / Banner ──────────────────────────────────────────────────────
    story.append(Paragraph("VIDYA: The AI Knowledge Person", title_style))
    story.append(Paragraph("Comprehensive Engineering Study Guide: System Design, Code Lifecycle, Project Execution & Troubleshooting Case Studies", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=15))

    # ── Section 1: Executive Overview & System Design ────────────────────────
    story.append(Paragraph("1. System Design: Evolution & Architecture Blueprint", h1_style))
    story.append(Paragraph(
        "VIDYA started as a basic RAG pipeline and systematically evolved through 3 major architectural phases into a resilient, multimodal AI teaching agent.",
        body_style
    ))

    arch_table_data = [
        [
            Paragraph("<b>Phase</b>", bold_body),
            Paragraph("<b>Core Problem Solved</b>", bold_body),
            Paragraph("<b>Technology Stack</b>", bold_body),
            Paragraph("<b>Key Architectural Limitation</b>", bold_body),
        ],
        [
            Paragraph("<b>V1: Core RAG</b>", body_style),
            Paragraph("Reading student textbooks and answering domain-specific queries without hallucinations.", body_style),
            Paragraph("pypdf, SentenceTransformers (MiniLM-L6), ChromaDB, Groq (Llama-3.3-70B)", body_style),
            Paragraph("Single sequential pipeline; rigid flow; no ability to choose alternative actions or do math.", body_style),
        ],
        [
            Paragraph("<b>V2: LangGraph & Tooling</b>", body_style),
            Paragraph("Dynamic decision making: routing queries between PDF knowledge, web search, and calculation.", body_style),
            Paragraph("LangGraph StateGraph, DuckDuckGo Search (DDGS), Python AST Safe Calculator", body_style),
            Paragraph("Blind to visual elements (diagrams, flowcharts, architectures, and tables in PDFs).", body_style),
        ],
        [
            Paragraph("<b>V3: Visual Retrieval & VLM</b>", body_style),
            Paragraph("Multimodal document tutoring: seeing actual page diagrams, figures, and structural layouts.", body_style),
            Paragraph("PyMuPDF (Fitz image rendering), Google GenAI SDK (Gemini 3.8 Flash Vision), Intent-gated routing", body_style),
            Paragraph("Cloud API rate limits (5 RPM on free tier); solved via smart intent filtering and backoff retries.", body_style),
        ],
    ]

    t_arch = Table(arch_table_data, colWidths=[1.1*inch, 2.1*inch, 2.0*inch, 2.0*inch])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_CLR),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    # Architectural Diagram
    story.append(Paragraph("<b>End-to-End System Architecture (LangGraph Flow):</b>", h2_style))
    diagram_text = (
        "                    [ Student Query ]\n"
        "                           |\n"
        "                           v\n"
        "                  +-----------------+\n"
        "                  |   Router Node   |  (Intent Classification: RAG / CALC / WEB)\n"
        "                  +-----------------+\n"
        "                    /      |      \\\n"
        "        +----------+       |       +-------------+\n"
        "        |                  v                     |\n"
        "  [ CALCULATOR ]     [ WEB SEARCH ]        [ RETRIEVE NODE ]\n"
        "  (Safe AST Math)   (Live DuckDuckGo)     - ChromaDB (Text Chunks)\n"
        "        |                  |              - Visual Page Index (PyMuPDF)\n"
        "        |                  |                     |\n"
        "        +---------->       +------------>        v\n"
        "                     \\             /     [ Visual Intent Check ]\n"
        "                      \\           /        /                 \\\n"
        "                   +-----------------+   (Yes)              (No)\n"
        "                   | Generate Answer | <--+                   |\n"
        "                   | Node (LLM/VLM)  | <----------------------+\n"
        "                   +-----------------+  (Gemini 3.8 Vision) (Groq Fast RAG)\n"
        "                           |\n"
        "                           v\n"
        "                  [ Tutoring Response ]"
    )
    t_diag = Table([[Paragraph(f"<pre>{diagram_text}</pre>", code_style)]], colWidths=[7.2*inch])
    t_diag.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#1A202C")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_diag)
    story.append(Spacer(1, 14))

    # ── Section 2: Code Lifecycle & Flow (Start to End) ──────────────────────
    story.append(Paragraph("2. Code Lifecycle: How Data Travels from Start to End", h1_style))
    story.append(Paragraph(
        "Understanding exactly where code starts, which file executes next, and how states are updated is critical for full-stack AI engineering.",
        body_style
    ))

    flow_data = [
        [
            Paragraph("<b>Step & File</b>", bold_body),
            Paragraph("<b>What Executes</b>", bold_body),
            Paragraph("<b>State Transition (VIDYAState)</b>", bold_body),
        ],
        [
            Paragraph("<b>1. Entry Point</b><br/><code>app/main.py</code>", body_style),
            Paragraph("Configures stdout encoding (UTF-8) on Windows. Triggers Ingest pipeline followed by QA test queries.", body_style),
            Paragraph("Initializes empty dictionary conforming to <code>VIDYAState</code> schema.", body_style),
        ],
        [
            Paragraph("<b>2. Ingest Graph</b><br/><code>app/graph.py</code><br/><code>app/nodes.py</code>", body_style),
            Paragraph(
                "Executes sequential ingestion:<br/>"
                "• <code>load_pdf_node</code>: Extracts text via <code>pypdf</code>.<br/>"
                "• <code>split_text_node</code>: Creates 100-word chunks (20-word overlap).<br/>"
                "• <code>embed_node</code>: Vectorizes chunks into 384-dim embeddings.<br/>"
                "• <code>store_node</code>: Persists vectors into ChromaDB.<br/>"
                "• <code>visual_index_node</code>: PyMuPDF renders pages to PNG in <code>data/rendered_pages/</code>.<br/>"
                "• <code>suggest_node</code>: Generates 3 student study questions.",
                body_style
            ),
            Paragraph("Populates: <code>pdf_text</code>, <code>chunks</code>, <code>embeddings</code>, and <code>suggestions</code>.", body_style),
        ],
        [
            Paragraph("<b>3. Router Node</b><br/><code>app/nodes.py</code><br/><code>app/llm.py</code>", body_style),
            Paragraph(
                "<code>router_node</code> invokes <code>classify_intent(query)</code>:<br/>"
                "• Rule 1: Checks for PDF constraint phrases ('from my pdf').<br/>"
                "• Rule 2: Regex check for arithmetic/percentages ('17.5% of 85000').<br/>"
                "• Rule 3: Keywords for real-time web ('latest', 'search online').<br/>"
                "• Fallback: Zero-shot classification via Groq LLM.",
                body_style
            ),
            Paragraph("Outputs <code>route_choice</code>: ('RAG', 'CALCULATOR', 'WEB_SEARCH', 'GENERAL').", body_style),
        ],
        [
            Paragraph("<b>4. Conditional Execution</b><br/><code>app/graph.py</code><br/>(Select Route)", body_style),
            Paragraph(
                "LangGraph conditional edge branches the graph:<br/>"
                "• If CALCULATOR -> <code>calculator_node</code> (safe math evaluation).<br/>"
                "• If WEB_SEARCH -> <code>web_search_node</code> (DuckDuckGo web query).<br/>"
                "• If RAG -> <code>retrieve_node</code> (ChromaDB top-3 chunks + visual page reference).",
                body_style
            ),
            Paragraph("Sets <code>tool_used</code>, <code>tool_result</code>, or <code>context_chunks</code> & <code>visual_pages</code>.", body_style),
        ],
        [
            Paragraph("<b>5. Answer Generation</b><br/><code>app/nodes.py</code><br/><code>app/vision/visual_retriever.py</code>", body_style),
            Paragraph(
                "<code>generate_answer_node</code> checks visual keywords:<br/>"
                "• <b>Visual Query</b> ('flowchart', 'diagram', 'chart'): Routes to Gemini 3.8 Flash Vision with page image.<br/>"
                "• <b>Standard Query</b>: Routes to Groq Llama-3.3-70B fast text tutor.",
                body_style
            ),
            Paragraph("Produces final <code>answer</code> text formatted for the student.", body_style),
        ],
    ]

    t_flow = Table(flow_data, colWidths=[1.5*inch, 3.5*inch, 2.2*inch])
    t_flow.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_CLR),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_flow)
    story.append(Spacer(1, 14))

    # ── Section 3: How Projects are Run in the Real World ────────────────────
    story.append(Paragraph("3. How to Run AI Projects: Professional Engineering Standards", h1_style))
    story.append(Paragraph(
        "A common point of confusion for developers is how production projects are executed, managed, and debugged compared to single-file scripts.",
        body_style
    ))

    run_points = [
        "<b>1. Virtual Environment Isolation:</b> Never install packages globally into your operating system. Always use <code>python -m venv venv</code> and activate it (<code>venv\\Scripts\\activate</code> on Windows or <code>source venv/bin/activate</code> on Mac/Linux). This isolates conflicting dependencies.",
        "<b>2. Module Execution (<code>python -m app.main</code> vs <code>python app/main.py</code>):</b> When running an application that uses package-relative imports (like <code>from app.nodes import ...</code>), running <code>python app/main.py</code> fails with <i>ModuleNotFoundError: No module named 'app'</i> because Python sets sys.path to <code>app/</code>. Running <code>python -m app.main</code> from the project root correctly preserves the root directory on <code>sys.path</code>.",
        "<b>3. Environment Variable Security (.env):</b> API keys (GROQ_API_KEY, GEMINI_API_KEY) must never be hardcoded in Python files. Use <code>python-dotenv</code> to read <code>.env</code> at startup, and ensure <code>.env</code> is added to <code>.gitignore</code>.",
        "<b>4. Separation of Concerns (File Topology):</b><br/>"
        "• <code>app/graph_state.py</code>: The single source of truth data structure (TypedDict).<br/>"
        "• <code>app/nodes.py</code>: Pure functions that consume State and return dict updates.<br/>"
        "• <code>app/graph.py</code>: Graph assembly, edge wiring, and compilation.<br/>"
        "• <code>app/tools.py</code> & <code>app/vision/</code>: Independent, testable domain modules."
    ]

    for pt in run_points:
        story.append(Paragraph(f"• {pt}", body_style))
        story.append(Spacer(1, 3))
    story.append(Spacer(1, 10))

    # ── Section 4: Engineering Challenges & How We Solved Them ───────────────
    story.append(Paragraph("4. Real-World Engineering Bugs & How We Overcame Them", h1_style))
    story.append(Paragraph(
        "During the development of VIDYA V3, we encountered 5 critical, production-grade blockers. Here is the exact problem breakdown, why it happened, and how we engineered the solution.",
        body_style
    ))

    troubleshoot_data = [
        [
            Paragraph("<b>Issue & Root Cause</b>", bold_body),
            Paragraph("<b>Why It Failed (Technical Breakdown)</b>", bold_body),
            Paragraph("<b>Engineering Solution Implemented</b>", bold_body),
        ],
        [
            Paragraph("<b>1. ColPali Storage & Vector Store Blocker</b>", body_style),
            Paragraph(
                "ColPali/ColSmol requires downloading 5 to 8 GB PaliGemma model checkpoints locally. Furthermore, ColPali uses multi-vector late interaction (MaxSim), which ChromaDB cannot natively index without custom C++ engines or heavy Vespa/Qdrant clusters.",
                body_style
            ),
            Paragraph(
                "<b>Lightweight VLM Paradigm:</b> Decoupled text retrieval from vision. PyMuPDF renders pages to lightweight PNGs at ingest. At query time, only relevant pages are sent to Gemini Vision API. Zero local storage overhead, zero GPU requirement, instant execution.",
                body_style
            ),
        ],
        [
            Paragraph("<b>2. Groq Vision Model Decommissioned</b><br/><code>Error 400: model_decommissioned</code>", body_style),
            Paragraph(
                "Groq retired <code>llama-3.2-90b-vision-preview</code>. When the fallback path attempted to call this model, the API rejected the request completely.",
                body_style
            ),
            Paragraph(
                "<b>Resilient Fallback:</b> Diverted Groq fallback directly to the stable <code>llama-3.3-70b-versatile</code> text LLM, ensuring that if vision fails, text RAG continues without crashing.",
                body_style
            ),
        ],
        [
            Paragraph("<b>3. Gemini Deprecated Models & Free Tier Rate Limits</b><br/><code>Error 404 & 429 Quota Exceeded</code>", body_style),
            Paragraph(
                "• <b>404 Error:</b> Google deprecated <code>gemini-1.5-flash</code> and <code>gemini-2.5-flash</code> for new keys.<br/>"
                "• <b>429 Error:</b> Free tier accounts enforce a strict <b>5 Requests Per Minute (5 RPM)</b> ceiling. Running 6 test queries back-to-back exhausted the quota.",
                body_style
            ),
            Paragraph(
                "<b>Dual-Layer Defense:</b><br/>"
                "1. <b>Model Migration:</b> Upgraded to official <code>gemini-3.8-flash</code>.<br/>"
                "2. <b>Smart Intent Gating:</b> Text questions use Groq; only queries with visual keywords ('diagram', 'chart') hit Gemini.<br/>"
                "3. <b>Exponential Backoff:</b> Added auto-retry logic with 12s sleep on 429 errors.",
                body_style
            ),
        ],
        [
            Paragraph("<b>4. Windows Console Unicode Encoding</b><br/><code>UnicodeEncodeError: charmap codec</code>", body_style),
            Paragraph(
                "Windows PowerShell uses legacy <code>cp1252</code> code page by default. Printing Unicode arrow characters (<code>\u2192</code>) caused catastrophic crashes inside console stdout.",
                body_style
            ),
            Paragraph(
                "<b>Safe Encoding Standard:</b> Replaced non-ASCII symbols with standard ASCII (<code>-></code>) across all graph nodes, and configured <code>sys.stdout.reconfigure(encoding='utf-8')</code> at startup.",
                body_style
            ),
        ],
        [
            Paragraph("<b>5. Google GenAI SDK Migration & IDE Lint Warning</b>", body_style),
            Paragraph(
                "• Google sunsetted <code>google.generativeai</code> with a deprecation warning.<br/>"
                "• The new <code>google-genai</code> uses a dynamic namespace package that IDE type checkers (Pyright/Pylance) failed to resolve initially.",
                body_style
            ),
            Paragraph(
                "<b>Modern SDK Upgrade:</b> Migrated to <code>from google import genai</code> with <code>types.Part.from_bytes()</code>. Added graceful exception-guarded imports with <code># type: ignore</code> to achieve 100% clean IDE analysis and zero console warnings.",
                body_style
            ),
        ],
    ]

    t_trouble = Table(troubleshoot_data, colWidths=[1.8*inch, 2.7*inch, 2.7*inch])
    t_trouble.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#EDF2F7")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_CLR),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_trouble)
    story.append(Spacer(1, 14))

    # ── Section 5: Key Takeaways & Summary for Students ──────────────────────
    story.append(Paragraph("5. Summary & Engineering Takeaways", h1_style))
    takeaways = [
        "<b>Architectures Must Be Composable:</b> Decoupling LLMs behind abstract classes (like <code>VisualRetriever</code>) ensures you can switch between Gemini, ColPali, or Ollama without touching any LangGraph node logic.",
        "<b>Never Loop Blindly on Failures:</b> When an AI or distributed pipeline encounters unexpected status codes (400, 404, 429), stop execution, inspect the exact payload/trace, formulate hypotheses, and apply deliberate fixes instead of repetitive retries.",
        "<b>Multimodal Grounding Prevents Hallucination:</b> In Test 6, when asked if diagrams existed in a text-only PDF, text-only LLMs invented fake flowcharts. Gemini Vision examined the actual rendered page image and accurately stated: <i>'No diagrams exist in this document.'</i> Visual grounding is critical for truthfulness.",
        "<b>Rate Limits Demand Intent Filtering:</b> In production, API calls cost money and have latency. Filter intents upstream so only queries that strictly need expensive multimodal models trigger them."
    ]

    for t in takeaways:
        story.append(Paragraph(f"✔ {t}", body_style))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_CLR, spaceAfter=10))
    story.append(Paragraph("<i>VIDYA AI Knowledge Person — Master Engineering Study Guide | Generated for Architectural Mastery</i>", ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, alignment=1, textColor=colors.gray)))

    doc.build(story)
    print(f"[Success] PDF generated at: {PDF_PATH}")


if __name__ == "__main__":
    build_pdf()
