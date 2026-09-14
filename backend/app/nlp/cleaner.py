import re
import unicodedata

def clean_text(text: str) -> str:
    """
    Cleans raw resume or job text:
    - Normalizes unicode characters (e.g. smart quotes, em dashes, ligatures).
    - Normalizes multiple spaces and tabs into single spaces.
    - Normalizes multiple consecutive newlines.
    - Preserves bullet points, email addresses, URLs, and code/tech characters (+, #, ., -).
    """
    if not text:
        return ""

    # Normalize unicode to NFKC
    text = unicodedata.normalize("NFKC", text)

    # Standardize bullet symbols to standard hyphen
    text = re.sub(r"[•●▪▸►◦⁃\u2022\u2023\u25E6\u2043\u2219]", "\n- ", text)

    # Standardize quotation marks and dashes
    text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    text = text.replace("—", " - ").replace("–", " - ")

    # Remove non-printable control characters except tab and newline
    text = "".join(ch for ch in text if ch in ("\n", "\r", "\t") or ord(ch) >= 32)

    # Replace windows carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Replace horizontal tabs with spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Consolidate excessive newlines (max 2 consecutive newlines)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)

    return text.strip()
