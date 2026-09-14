import re
from typing import Dict, List, Tuple

SECTION_PATTERNS = {
    "summary": [
        r"^(professional\s+)?summary",
        r"^(career\s+)?objective",
        r"^profile",
        r"^about(\s+me)?",
        r"^executive\s+summary",
        r"^personal\s+statement",
    ],
    "education": [
        r"^education(al\s+background)?",
        r"^academic\s+(background|qualifications|history)",
        r"^qualifications",
        r"^degrees?",
    ],
    "experience": [
        r"^(work|professional|employment)\s+experience",
        r"^experience",
        r"^work\s+history",
        r"^employment\s+history",
        r"^career\s+history",
        r"^relevant\s+experience",
    ],
    "projects": [
        r"^(technical\s+|academic\s+|personal\s+)?projects",
        r"^key\s+projects",
        r"^project\s+work",
    ],
    "skills": [
        r"^(technical\s+|core\s+)?skills",
        r"^technical\s+proficiencies",
        r"^competencies",
        r"^technologies(\s+and\s+tools)?",
        r"^areas\s+of\s+expertise",
        r"^tools(\s+and\s+technologies)?",
    ],
    "certifications": [
        r"^certifications?",
        r"^certificates?",
        r"^licenses?(\s+and\s+certifications)?",
        r"^courses?",
    ],
    "achievements": [
        r"^achievements?",
        r"^awards?(\s+and\s+honors)?",
        r"^honors?(\s+and\s+awards)?",
        r"^publications?",
        r"^accomplishments?",
    ],
}

def detect_sections(text: str) -> Dict[str, str]:
    """
    Parses resume text into sections based on recognized headings.
    Returns a dictionary of section names to their text content.
    Includes a 'header' section for top-level contact/intro text before any section.
    """
    lines = text.split("\n")
    sections: Dict[str, List[str]] = {
        "header": [],
        "summary": [],
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
        "certifications": [],
        "achievements": [],
        "other": [],
    }

    current_section = "header"

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if current_section in sections:
                sections[current_section].append(line)
            continue

        # Check if line looks like a heading:
        # e.g., short line (< 50 chars), no trailing period, potentially uppercase or bold-like
        is_heading_candidate = len(stripped) < 55 and not stripped.endswith(".") and not stripped.startswith("-")

        matched_section = None
        if is_heading_candidate:
            clean_heading = re.sub(r"^[0-9.\-\s]+|[^\w\s]", "", stripped).lower().strip()
            for sec_name, patterns in SECTION_PATTERNS.items():
                for pat in patterns:
                    if re.search(pat, clean_heading, re.IGNORECASE):
                        matched_section = sec_name
                        break
                if matched_section:
                    break

        if matched_section:
            current_section = matched_section
        else:
            sections[current_section].append(line)

    return {k: "\n".join(v).strip() for k, v in sections.items() if "\n".join(v).strip()}

def get_section_status(sections: Dict[str, str]) -> Dict[str, bool]:
    """Returns boolean flags indicating which standard sections are present."""
    return {
        "contact": len(sections.get("header", "")) > 10,
        "summary": len(sections.get("summary", "")) > 15,
        "education": len(sections.get("education", "")) > 15,
        "experience": len(sections.get("experience", "")) > 15,
        "projects": len(sections.get("projects", "")) > 15,
        "skills": len(sections.get("skills", "")) > 10,
        "certifications": len(sections.get("certifications", "")) > 10,
    }
