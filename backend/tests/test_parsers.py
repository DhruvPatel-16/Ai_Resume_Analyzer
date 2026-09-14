import pytest
import io
import fitz
import docx
from backend.app.parsers.pdf_parser import extract_text_from_pdf, PDFParseError
from backend.app.parsers.docx_parser import extract_text_from_docx, DOCXParseError

def create_sample_pdf(text: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def create_sample_docx(text: str) -> bytes:
    doc = docx.Document()
    doc.add_paragraph(text)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

def test_pdf_extraction_success():
    sample_text = "John Doe\nPython and FastAPI Software Engineer\nExperience at Tech Corp"
    pdf_bytes = create_sample_pdf(sample_text)
    text, meta = extract_text_from_pdf(pdf_bytes)
    assert "John Doe" in text
    assert "Python" in text
    assert meta["page_count"] == 1

def test_pdf_extraction_invalid_signature():
    with pytest.raises(PDFParseError, match="File signature does not match"):
        extract_text_from_pdf(b"Not a real pdf document file content")

def test_pdf_extraction_empty():
    with pytest.raises(PDFParseError):
        extract_text_from_pdf(b"")

def test_docx_extraction_success():
    sample_text = "Jane Doe\nSenior React and TypeScript Frontend Engineer"
    docx_bytes = create_sample_docx(sample_text)
    text, meta = extract_text_from_docx(docx_bytes)
    assert "Jane Doe" in text
    assert "React" in text
    assert meta["paragraph_count"] >= 1

def test_docx_extraction_invalid_signature():
    with pytest.raises(DOCXParseError, match="File signature does not match"):
        extract_text_from_docx(b"Invalid bytes for docx")
