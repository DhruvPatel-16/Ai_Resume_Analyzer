import re
from typing import Dict, List, Any, Optional

EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
PHONE_REGEX = r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}"
LINKEDIN_REGEX = r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/[a-zA-Z0-9_-]+"
GITHUB_REGEX = r"(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+"
PORTFOLIO_REGEX = r"(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:dev|io|tech|me|app|com|org)(?:\/[a-zA-Z0-9_-]+)*"

DEGREE_PATTERNS = [
    r"b\.?\s*tech(?:\s+in\s+[^,\n]+)?",
    r"bachelor(?:\s+of\s+[^,\n]+)?",
    r"b\.?s\.?(?:\s+in\s+[^,\n]+)?",
    r"m\.?\s*tech(?:\s+in\s+[^,\n]+)?",
    r"master(?:\s+of\s+[^,\n]+)?",
    r"m\.?s\.?(?:\s+in\s+[^,\n]+)?",
    r"ph\.?d\.?(?:\s+in\s+[^,\n]+)?",
    r"associate(?:\s+degree)?(?:\s+in\s+[^,\n]+)?",
]

def extract_personal_info(text: str, header_text: str = "") -> Dict[str, Any]:
    """Extracts contact and personal details."""
    search_space = header_text if header_text else text[:1000]
    
    # Email
    email_match = re.search(EMAIL_REGEX, search_space)
    email = email_match.group(0) if email_match else ""

    # Phone
    phone_match = re.search(PHONE_REGEX, search_space)
    phone = phone_match.group(0) if phone_match else ""

    # LinkedIn
    linkedin_match = re.search(LINKEDIN_REGEX, search_space, re.IGNORECASE)
    linkedin = linkedin_match.group(0) if linkedin_match else ""

    # GitHub
    github_match = re.search(GITHUB_REGEX, search_space, re.IGNORECASE)
    github = github_match.group(0) if github_match else ""

    # Portfolio
    portfolio = ""
    for url_match in re.finditer(r"https?:\/\/[^\s,]+", search_space):
        url = url_match.group(0)
        if "linkedin.com" not in url and "github.com" not in url:
            portfolio = url
            break

    # Location heuristic (City, ST or City, Country)
    location = ""
    loc_match = re.search(r"([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-zA-Z\s]+))", search_space)
    if loc_match:
        cand = loc_match.group(1).strip()
        if not any(kw in cand.lower() for kw in ["university", "college", "school", "technologies", "inc"]):
            location = cand

    # Candidate Name heuristic (first clean line of header that isn't email, phone, or title)
    name = ""
    for line in search_space.split("\n"):
        line = line.strip()
        if (
            line
            and len(line) < 40
            and not re.search(EMAIL_REGEX, line)
            and not re.search(PHONE_REGEX, line)
            and not any(w in line.lower() for w in ["resume", "curriculum", "vitae", "profile", "summary", "contact", "http"])
        ):
            name = line
            break

    return {
        "name": name or "Candidate",
        "email": email,
        "phone": phone,
        "location": location or "Location not specified",
        "linkedin": linkedin or "linkedin.com",
        "github": github or "github.com",
        "portfolio": portfolio,
    }

def extract_education(education_text: str) -> List[Dict[str, Any]]:
    """Extracts education records from education section text."""
    if not education_text:
        return []

    lines = [l.strip() for l in education_text.split("\n") if l.strip()]
    items: List[Dict[str, Any]] = []

    current_item: Dict[str, Any] = {
        "degree": "",
        "institution": "",
        "year": "",
        "gpa": "",
    }

    for line in lines:
        # Check for degree
        found_degree = None
        for pat in DEGREE_PATTERNS:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                found_degree = m.group(0).title()
                break

        # Check for year (4 digits between 1980 and 2030)
        year_match = re.search(r"\b(19\d\d|20[0-2]\d|2030)\b", line)
        year = year_match.group(0) if year_match else ""

        # Check for GPA or CGPA
        gpa_match = re.search(r"(?:GPA|CGPA)[:\s]*([0-9]\.[0-9]{1,2}(?:\s*\/\s*[0-9](?:\.0)?)?|\d{1,2}(?:\.\d+)?%)", line, re.IGNORECASE)
        gpa = gpa_match.group(1) if gpa_match else ""

        if found_degree:
            if current_item["degree"]:
                items.append(current_item)
                current_item = {"degree": "", "institution": "", "year": "", "gpa": ""}
            current_item["degree"] = found_degree
            if year:
                current_item["year"] = year
            if gpa:
                current_item["gpa"] = gpa
        elif any(kw in line.lower() for kw in ["university", "college", "institute", "school", "academy", "polytechnic"]):
            current_item["institution"] = line
            if year and not current_item["year"]:
                current_item["year"] = year
            if gpa and not current_item["gpa"]:
                current_item["gpa"] = gpa
        else:
            if year and not current_item["year"]:
                current_item["year"] = year
            if gpa and not current_item["gpa"]:
                current_item["gpa"] = gpa

    if current_item["degree"] or current_item["institution"]:
        items.append(current_item)

    # If no structured records were found, create one fallback record from non-empty text
    if not items and len(lines) > 0:
        items.append({
            "degree": lines[0],
            "institution": lines[1] if len(lines) > 1 else "",
            "year": "",
            "gpa": "",
        })

    return items

def extract_experience(experience_text: str) -> List[Dict[str, Any]]:
    """Extracts job experience entries, bullets, and technologies."""
    if not experience_text:
        return []

    lines = [l.strip() for l in experience_text.split("\n") if l.strip()]
    entries: List[Dict[str, Any]] = []

    current_entry: Optional[Dict[str, Any]] = None

    date_range_regex = r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{4})\s*[-–—to]+\s*(?:Present|Current|Now|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)"

    for line in lines:
        is_bullet = line.startswith("-") or line.startswith("*") or line.startswith("•")
        has_dates = bool(re.search(date_range_regex, line, re.IGNORECASE))

        if has_dates or (not is_bullet and ("developer" in line.lower() or "engineer" in line.lower() or "intern" in line.lower() or "manager" in line.lower() or "lead" in line.lower())):
            if current_entry and (current_entry["company"] or current_entry["role"] or current_entry["bullets"]):
                entries.append(current_entry)

            # Split title and company if formatted as "Role at Company" or "Role | Company" or "Company - Role"
            role = line
            company = ""
            duration = ""
            
            date_match = re.search(date_range_regex, line, re.IGNORECASE)
            if date_match:
                duration = date_match.group(0)
                line_without_date = line.replace(duration, "").strip(" -–—,|")
            else:
                line_without_date = line

            parts = re.split(r"\s+(?:at|@|\||-|–|—)\s+", line_without_date)
            if len(parts) >= 2:
                role = parts[0].strip()
                company = parts[1].strip()
            else:
                role = line_without_date

            current_entry = {
                "company": company or "Company",
                "role": role or "Software Engineer",
                "duration": duration or "Recent",
                "technologies": [],
                "bullets": [],
            }
        elif is_bullet and current_entry:
            clean_bullet = line.lstrip("-*• ").strip()
            if clean_bullet:
                current_entry["bullets"].append(clean_bullet)
        elif current_entry:
            # Append non-bullet line if short or context
            if len(current_entry["bullets"]) == 0:
                current_entry["bullets"].append(line)
            else:
                current_entry["bullets"][-1] += " " + line

    if current_entry and (current_entry["company"] or current_entry["role"] or current_entry["bullets"]):
        entries.append(current_entry)

    return entries

def extract_projects(projects_text: str) -> List[Dict[str, Any]]:
    """Extracts projects with names, descriptions, and outcomes."""
    if not projects_text:
        return []

    lines = [l.strip() for l in projects_text.split("\n") if l.strip()]
    projects: List[Dict[str, Any]] = []
    current_proj: Optional[Dict[str, Any]] = None

    for line in lines:
        is_bullet = line.startswith("-") or line.startswith("*") or line.startswith("•")
        
        # New project candidate: short line with title-like formatting or containing pipe/colon
        if not is_bullet and len(line) < 60 and not line.endswith("."):
            if current_proj and (current_proj["name"] or current_proj["description"]):
                projects.append(current_proj)

            parts = re.split(r"[:|–—-]", line)
            name = parts[0].strip()
            desc = parts[1].strip() if len(parts) > 1 else ""

            current_proj = {
                "name": name,
                "description": desc,
                "technologies": [],
                "outcome": "",
            }
        elif current_proj:
            clean_line = line.lstrip("-*• ").strip()
            if not current_proj["description"]:
                current_proj["description"] = clean_line
            else:
                # Check if this line looks like an outcome or impact
                if any(w in clean_line.lower() for w in ["user", "active", "star", "download", "feature", "reduced", "improved", "increased"]):
                    current_proj["outcome"] = clean_line
                else:
                    current_proj["description"] += " " + clean_line

    if current_proj and (current_proj["name"] or current_proj["description"]):
        projects.append(current_proj)

    return projects
