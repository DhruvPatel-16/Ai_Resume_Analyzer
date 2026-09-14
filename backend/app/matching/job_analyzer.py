import re
from typing import Dict, List, Any
from backend.app.nlp.skills import extract_skills_from_text, normalize_skill_name

def analyze_job_description(title: str, description: str, company: str = "") -> Dict[str, Any]:
    """
    Parses a job description to extract:
    - Title, Company
    - Required skills vs Preferred/Nice-to-have skills
    - Years of experience required
    - Education requirements
    - Key domain keywords
    """
    clean_desc = description.strip()
    extracted_skills = extract_skills_from_text(clean_desc)
    
    # Split text into "Required" and "Preferred/Nice to have" sections if present
    required_skills: List[str] = []
    preferred_skills: List[str] = []

    lower_desc = clean_desc.lower()
    split_match = re.split(r"(?:nice\s+to\s+have|preferred\s+qualifications|bonus\s+points?|plus\b)", lower_desc)
    
    if len(split_match) > 1:
        req_text = split_match[0]
        pref_text = split_match[1]
        
        req_skills_data = extract_skills_from_text(req_text)
        pref_skills_data = extract_skills_from_text(pref_text)
        
        required_skills = [s["name"] for s in req_skills_data if s.get("category") != "Soft Skills"]
        preferred_skills = [s["name"] for s in pref_skills_data if s.get("category") != "Soft Skills" and s["name"] not in required_skills]
    else:
        # If no explicit split, take top skills as required and remainder as preferred
        tech_skills = [s["name"] for s in extracted_skills if s.get("category") != "Soft Skills"]
        required_skills = tech_skills[:7]
        preferred_skills = tech_skills[7:]

    # Experience requirement heuristic (e.g. "3+ years", "5-7 years")
    exp_match = re.search(r"(\d+)\+?\s*(?:-\s*(\d+))?\s*(?:years?|yrs?)\b", lower_desc)
    required_exp_years = int(exp_match.group(1)) if exp_match else 2

    # Education requirement heuristic
    edu_req = "Bachelor's Degree in Computer Science or related field"
    if "master" in lower_desc or "m.s." in lower_desc or "m.tech" in lower_desc:
        edu_req = "Master's Degree preferred"

    # Keywords extraction from JD
    words = re.findall(r"\b[A-Za-z0-9#+.-]{2,}\b", clean_desc)
    word_freq: Dict[str, int] = {}
    stop_words = {"the", "and", "for", "with", "that", "this", "from", "have", "you", "will", "our", "team", "are"}
    for w in words:
        wl = w.lower()
        if wl not in stop_words and len(wl) > 2:
            word_freq[w] = word_freq.get(w, 0) + 1

    return {
        "title": title or "Software Engineer",
        "company": company or "Target Company",
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "required_experience_years": required_exp_years,
        "education_requirement": edu_req,
        "all_skills": [s["name"] for s in extracted_skills],
    }
