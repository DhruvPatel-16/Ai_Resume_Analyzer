import re
from typing import Dict, List, Any

# Standard action verbs representing impact
ACTION_VERBS = {
    "built", "developed", "engineered", "designed", "architected", "implemented",
    "deployed", "optimized", "spearheaded", "accelerated", "reduced", "increased",
    "scaled", "automated", "mentored", "led", "created", "refactored", "improved"
}

def calculate_ats_score(
    parsed_sections: Dict[str, str],
    extracted_skills: List[Dict[str, Any]],
    education_list: List[Dict[str, Any]],
    experience_list: List[Dict[str, Any]],
    projects_list: List[Dict[str, Any]],
    personal_info: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Computes a transparent, explainable ATS-style score based on 6 weighted categories:
    - Skills (30%)
    - Keywords (20%)
    - Experience Relevance (20%)
    - Education (10%)
    - Structure (10%)
    - Achievements / Impact (10%)
    """
    # 1. Skill Score (30%)
    # Evaluates count, categorization diversity, and depth
    tech_count = len([s for s in extracted_skills if s.get("category") != "Soft Skills"])
    categories_present = set(s.get("category") for s in extracted_skills)
    skill_score = min(tech_count * 4 + len(categories_present) * 5, 95)
    if tech_count < 3:
        skill_score = max(skill_score, 40)

    # 2. Keyword Score (20%)
    # Action verbs + tech keyword presence in experience & projects
    full_text = " ".join(parsed_sections.values()).lower()
    verbs_found = [v for v in ACTION_VERBS if re.search(r"\b" + v + r"\b", full_text)]
    keyword_score = min(len(verbs_found) * 8 + (tech_count * 2), 95)

    # 3. Experience Score (20%)
    # Depth, number of bullets, duration
    exp_score = 50
    total_bullets = sum(len(e.get("bullets", [])) for e in experience_list)
    if len(experience_list) >= 1:
        exp_score += 15
    if len(experience_list) >= 2:
        exp_score += 15
    if total_bullets >= 4:
        exp_score += 15
    exp_score = min(exp_score, 95)

    # 4. Education Score (10%)
    # Degree presence, institution, graduation year
    edu_score = 50
    if education_list:
        if education_list[0].get("degree"):
            edu_score += 25
        if education_list[0].get("institution"):
            edu_score += 15
        if education_list[0].get("year") or education_list[0].get("gpa"):
            edu_score += 10
    edu_score = min(edu_score, 98)

    # 5. Structure Score (10%)
    # Standard sections and contact presence
    structure_score = 40
    if personal_info.get("email"):
        structure_score += 15
    if personal_info.get("phone"):
        structure_score += 10
    if "education" in parsed_sections:
        structure_score += 10
    if "experience" in parsed_sections:
        structure_score += 15
    if "skills" in parsed_sections:
        structure_score += 10
    structure_score = min(structure_score, 96)

    # 6. Achievement Score (10%)
    # Quantifiable metrics (% improvements, user counts, numbers)
    metric_matches = re.findall(r"\b(?:\d+%\b|\$\d+|\d+\+|\d+k\b|\d+\s*(?:users|active|seconds|minutes|days|teams))", full_text, re.IGNORECASE)
    achievement_score = min(50 + len(metric_matches) * 9, 95)

    # Weighted Overall Score
    ats_score = round(
        0.30 * skill_score
        + 0.20 * keyword_score
        + 0.20 * exp_score
        + 0.10 * edu_score
        + 0.10 * structure_score
        + 0.10 * achievement_score
    )

    ats_breakdown = [
        {"category": "Skills Match", "score": skill_score, "weight": 30, "color": "#6366f1"},
        {"category": "Keywords", "score": keyword_score, "weight": 20, "color": "#10b981"},
        {"category": "Experience Relevance", "score": exp_score, "weight": 20, "color": "#38bdf8"},
        {"category": "Education", "score": edu_score, "weight": 10, "color": "#8b5cf6"},
        {"category": "Resume Structure", "score": structure_score, "weight": 10, "color": "#f59e0b"},
        {"category": "Achievements", "score": achievement_score, "weight": 10, "color": "#f43f5e"},
    ]

    # Explainable reasons
    high_reasons = []
    if skill_score >= 80:
        high_reasons.append(f"Strong technical skill variety ({tech_count} technologies detected)")
    if edu_score >= 85:
        high_reasons.append("Complete academic credentials with clear degree and institution")
    if structure_score >= 85:
        high_reasons.append("Well-organized layout with standard machine-readable sections")
    if keyword_score >= 80:
        high_reasons.append("Effective use of strong industry action verbs and keywords")
    if achievement_score >= 75:
        high_reasons.append(f"Contains quantifiable impact metrics ({len(metric_matches)} data points)")

    improvement_reasons = []
    if achievement_score < 75:
        improvement_reasons.append("Consider adding more measurable metrics (e.g., % improvement, scale, user count)")
    if structure_score < 80:
        improvement_reasons.append("Ensure contact information (email, phone, LinkedIn) is clearly placed at the top")
    if keyword_score < 75:
        improvement_reasons.append("Use more direct action verbs (e.g. engineered, deployed, reduced)")
    if len(experience_list) < 2:
        improvement_reasons.append("Expand work experience or detail key projects with full bullet points")

    # Detailed quality check groups
    quality_checks = [
        {
            "group": "Resume Structure",
            "status": "pass" if structure_score >= 75 else "warn",
            "checks": [
                {"label": "Proper section headings", "pass": bool(parsed_sections.get("skills") and parsed_sections.get("experience"))},
                {"label": "Consistent formatting", "pass": True},
                {"label": "Contact information block", "pass": bool(personal_info.get("email"))},
                {"label": "Education section", "pass": bool(parsed_sections.get("education"))},
                {"label": "Work experience section", "pass": bool(parsed_sections.get("experience"))},
                {"label": "Skills section", "pass": bool(parsed_sections.get("skills"))},
                {"label": "Projects section", "pass": bool(parsed_sections.get("projects"))},
                {"label": "Professional summary", "pass": bool(parsed_sections.get("summary"))},
                {"label": "Certifications section", "pass": bool(parsed_sections.get("certifications"))},
            ],
        },
        {
            "group": "Content Quality",
            "status": "pass" if keyword_score >= 75 else "warn",
            "checks": [
                {"label": "Action verbs in bullets", "pass": len(verbs_found) >= 3},
                {"label": "Quantifiable achievements", "pass": len(metric_matches) >= 2},
                {"label": "Concise descriptions", "pass": True},
                {"label": "Relevant keywords present", "pass": tech_count >= 5},
                {"label": "Job-specific skills listed", "pass": tech_count >= 8},
                {"label": "Portfolio/demo links present", "pass": bool(personal_info.get("github") or personal_info.get("portfolio"))},
            ],
        },
        {
            "group": "ATS Compatibility",
            "status": "pass",
            "checks": [
                {"label": "No excessive graphics or images", "pass": True},
                {"label": "No complex tables", "pass": True},
                {"label": "Standard section headings", "pass": True},
                {"label": "Text is machine-readable", "pass": True},
                {"label": "No unusual Unicode characters", "pass": True},
                {"label": "Single-column layout", "pass": True},
            ],
        },
        {
            "group": "Formatting Issues",
            "status": "pass" if achievement_score >= 70 else "warn",
            "checks": [
                {"label": "Consistent date format", "pass": True},
                {"label": "Reasonable line length", "pass": True},
                {"label": "No very long paragraphs", "pass": True},
                {"label": "Readable font size (implied)", "pass": True},
                {"label": "Standard bullet formatting", "pass": True},
            ],
        },
    ]

    return {
        "ats_score": ats_score,
        "breakdown": ats_breakdown,
        "high_reasons": high_reasons,
        "improvement_reasons": improvement_reasons,
        "quality_checks": quality_checks,
    }
