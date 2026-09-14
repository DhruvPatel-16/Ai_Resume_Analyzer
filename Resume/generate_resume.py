import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf(output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=28,
        bottomMargin=28,
    )

    styles = getSampleStyleSheet()

    # Typography styles
    header_name = ParagraphStyle(
        "HeaderName",
        fontName="Helvetica-Bold",
        fontSize=21,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
    )

    header_sub = ParagraphStyle(
        "HeaderSub",
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor("#4338ca"),
    )

    contact_info = ParagraphStyle(
        "ContactInfo",
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )

    section_title = ParagraphStyle(
        "SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=2,
    )

    body = ParagraphStyle(
        "Body",
        fontName="Helvetica",
        fontSize=8.2,
        leading=10.8,
        textColor=colors.HexColor("#1e293b"),
    )

    body_bold = ParagraphStyle(
        "BodyBold",
        fontName="Helvetica-Bold",
        fontSize=8.4,
        leading=11,
        textColor=colors.HexColor("#0f172a"),
    )

    bullet = ParagraphStyle(
        "Bullet",
        fontName="Helvetica",
        fontSize=8.2,
        leading=10.6,
        textColor=colors.HexColor("#334155"),
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=1.5,
    )

    story = []

    # 1. Header
    story.append(Paragraph("DHRUV", header_name))
    story.append(Paragraph("Full-Stack AI Engineer &amp; Systems Architect", header_sub))
    story.append(Spacer(1, 2))
    
    contact_text = (
        "<b>Email:</b> dhruv.dev@example.com &nbsp;|&nbsp; "
        "<b>Phone:</b> +91 98765 43210 &nbsp;|&nbsp; "
        "<b>Location:</b> India &nbsp;|&nbsp; "
        "<b>GitHub:</b> github.com/Sigmaboy69 &nbsp;|&nbsp; "
        "<b>LinkedIn:</b> linkedin.com/in/dhruv-dev"
    )
    story.append(Paragraph(contact_text, contact_info))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=5))

    # 2. Professional Summary
    story.append(Paragraph("PROFESSIONAL SUMMARY", section_title))
    summary_text = (
        "High-velocity Full-Stack &amp; AI Engineer specializing in architecting modern web platforms, "
        "asynchronous microservices, and applied NLP/machine learning systems. Expert in React 19, TypeScript, "
        "Tailwind CSS v4, FastAPI, Python, and cloud containerization. Proven track record designing explainable ATS "
        "scoring engines, TF-IDF semantic matching algorithms, and high-throughput telemetry pipelines."
    )
    story.append(Paragraph(summary_text, body))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=5))

    # 3. Technical Skills
    story.append(Paragraph("TECHNICAL SKILLS", section_title))
    skills = [
        ("Languages:", "Python, TypeScript, JavaScript, SQL, C++, HTML5, CSS3, Shell"),
        ("Frontend:", "React 19, Next.js, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Responsive UI, Micro-Animations"),
        ("Backend & APIs:", "FastAPI, Node.js, Express, RESTful Architecture, JWT Authentication, SQLAlchemy ORM, Pydantic"),
        ("AI / ML & NLP:", "PyMuPDF, python-docx, Scikit-Learn (TF-IDF, Cosine Similarity), LLM APIs, Regex Extraction, AST Parsing"),
        ("DevOps & DBs:", "PostgreSQL, SQLite, Redis, Docker, Docker Compose, Git, GitHub Actions, Linux, Postman"),
    ]
    for label, items in skills:
        story.append(Paragraph(f"<b>{label}</b> {items}", body))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=5))

    # 4. Work Experience
    story.append(Paragraph("WORK EXPERIENCE", section_title))
    exp_header = (
        "<b>Full-Stack Software Engineer</b> &nbsp;|&nbsp; "
        "Independent Developer &amp; Open-Source Contributor &nbsp;|&nbsp; <i>2023 – Present</i>"
    )
    story.append(Paragraph(exp_header, body_bold))
    story.append(Paragraph(
        "• Engineered and deployed full-stack web platforms integrating React 19 frontends with asynchronous FastAPI and Node.js backend services.",
        bullet
    ))
    story.append(Paragraph(
        "• Architected database layers using PostgreSQL and Redis caching, cutting average API response times by 35% under load.",
        bullet
    ))
    story.append(Paragraph(
        "• Enforced 100% automated test coverage with Pytest and configured continuous integration pipelines via GitHub Actions.",
        bullet
    ))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=5))

    # 5. Technical Projects
    story.append(Paragraph("TECHNICAL PROJECTS", section_title))

    # Project 1: AI Resume Analyzer
    p1 = (
        "<b>AI Resume Analyzer &amp; Job Matcher</b> &nbsp;|&nbsp; "
        "<i>React 19, TypeScript, FastAPI, Scikit-Learn, PyMuPDF, Tailwind v4</i>"
    )
    story.append(Paragraph(p1, body_bold))
    story.append(Paragraph(
        "• Architected an end-to-end ATS evaluation and semantic job matching platform processing multi-format .pdf and .docx documents.",
        bullet
    ))
    story.append(Paragraph(
        "• Implemented an explainable 6-category weighted ATS scoring engine and TF-IDF cosine similarity matcher with 500+ canonical skill ontology.",
        bullet
    ))
    story.append(Paragraph(
        "• Developed dual document extractors (PyMuPDF with pypdfium2 fallback &amp; python-docx) achieving 99.8% text and metadata extraction accuracy.",
        bullet
    ))
    story.append(Paragraph(
        "• Crafted a dynamic living UI with ambient background lighting, physics-based card hover elevation, and animated score counters.",
        bullet
    ))
    story.append(Spacer(1, 3))

    # Project 2: CloudPulse Telemetry
    p2 = (
        "<b>CloudPulse — Distributed Telemetry &amp; Analytics Platform</b> &nbsp;|&nbsp; "
        "<i>FastAPI, Python, Redis, PostgreSQL, Docker</i>"
    )
    story.append(Paragraph(p2, body_bold))
    story.append(Paragraph(
        "• Developed high-throughput asynchronous telemetry ingestion service processing 800+ active event streams with sub-15ms response latency.",
        bullet
    ))
    story.append(Paragraph(
        "• Implemented dual-tiered Redis in-memory caching layer for merchant lookups and analytics, reducing database load by 35% during peak traffic.",
        bullet
    ))
    story.append(Paragraph(
        "• Containerized application stack with Docker Compose and configured automated CI/CD validation pipelines using GitHub Actions.",
        bullet
    ))
    story.append(Spacer(1, 3))

    # Project 3: PR-Sentinel
    p3 = (
        "<b>PR-Sentinel — Automated Pull Request Code Review Bot</b> &nbsp;|&nbsp; "
        "<i>Python, TypeScript, OpenAI API, GitHub Actions, AST</i>"
    )
    story.append(Paragraph(p3, body_bold))
    story.append(Paragraph(
        "• Built an automated GitHub Action bot analyzing pull requests for AST syntax patterns, cyclomatic complexity, and security vulnerabilities.",
        bullet
    ))
    story.append(Paragraph(
        "• Integrated OpenAI LLM API with deterministic rule-based fallback heuristics to provide verifiable, hallucination-free code improvements.",
        bullet
    ))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=5))

    # 6. Education
    story.append(Paragraph("EDUCATION", section_title))
    edu = (
        "<b>Bachelor of Technology (B.Tech) in Computer Science &amp; Engineering</b> &nbsp;|&nbsp; "
        "<i>2021 – 2025</i>"
    )
    story.append(Paragraph(edu, body_bold))
    story.append(Paragraph(
        "<b>Relevant Coursework:</b> Data Structures &amp; Algorithms, Database Systems, Operating Systems, Machine Learning, Computer Networks, Software Engineering",
        bullet
    ))

    doc.build(story)
    print(f"[OK] Resume PDF generated at: {output_path}")

    # Generate preview PNG if pymupdf is available
    try:
        import fitz
        doc_pdf = fitz.open(output_path)
        page = doc_pdf[0]
        pix = page.get_pixmap(dpi=150)
        img_path = os.path.splitext(output_path)[0] + "_preview.png"
        pix.save(img_path)
        print(f"[OK] Preview image generated at: {img_path}")
    except Exception as e:
        pass

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_pdf = os.path.join(current_dir, "Dhruv_Resume.pdf")
    generate_pdf(target_pdf)
