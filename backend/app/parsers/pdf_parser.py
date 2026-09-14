import io
from typing import Tuple, Dict, Any

class PDFParseError(Exception):
    pass

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
    """
    Extract text and metadata from PDF bytes.
    Uses PyMuPDF (fitz) with automatic fallback to pypdfium2.
    """
    if not file_bytes or len(file_bytes) < 10:
        raise PDFParseError("PDF file is empty or corrupted.")

    if not file_bytes.startswith(b"%PDF-"):
        raise PDFParseError("File signature does not match a valid PDF document.")

    text_pages = []
    metadata = {
        "page_count": 0,
        "is_scanned": False,
        "parser_used": "pymupdf",
    }

    # Primary parser: PyMuPDF (fitz)
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        metadata["page_count"] = len(doc)
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                text_pages.append(text.strip())
        doc.close()
    except Exception as e:
        # Fallback to pypdfium2 if fitz fails
        try:
            import pypdfium2 as pdfium
            pdf = pdfium.PdfDocument(file_bytes)
            metadata["page_count"] = len(pdf)
            metadata["parser_used"] = "pypdfium2"
            for page in pdf:
                textpage = page.get_textpage()
                page_text = textpage.get_text_range()
                if page_text:
                    text_pages.append(page_text.strip())
        except Exception as fallback_err:
            raise PDFParseError(f"Failed to extract text from PDF: {str(e)} | Fallback error: {str(fallback_err)}")

    full_text = "\n\n".join(text_pages).strip()

    # Check if text is essentially empty (e.g. scanned image-only PDF)
    if len(full_text) < 20:
        metadata["is_scanned"] = True
        if not full_text:
            raise PDFParseError("Unable to extract text from this PDF. It appears to be an image or scanned document without selectable text.")

    return full_text, metadata
