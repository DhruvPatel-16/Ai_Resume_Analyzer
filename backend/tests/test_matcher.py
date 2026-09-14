import pytest
from backend.app.matching.job_analyzer import analyze_job_description
from backend.app.matching.matcher import match_resume_with_job, calculate_semantic_similarity

def test_analyze_job_description():
    desc = """
    We are looking for a Senior Backend Developer.
    Requirements:
    - Python
    - FastAPI
    - PostgreSQL
    - Docker
    - AWS
    - 3+ years of experience
    
    Nice to have:
    - Kubernetes
    - Kafka
    """
    job_data = analyze_job_description("Senior Backend Developer", desc, "Tech Inc")
    assert job_data["title"] == "Senior Backend Developer"
    assert "Python" in job_data["required_skills"]
    assert "FastAPI" in job_data["required_skills"]
    assert job_data["required_experience_years"] == 3

def test_match_resume_with_job():
    resume_text = "Experienced in Python, FastAPI, PostgreSQL, Docker, Git. Built REST APIs."
    resume_skills = [
        {"name": "Python", "category": "Programming"},
        {"name": "FastAPI", "category": "Backend"},
        {"name": "PostgreSQL", "category": "Database"},
        {"name": "Docker", "category": "DevOps"},
        {"name": "Git", "category": "Tools"},
    ]
    job_data = {
        "title": "Backend Engineer",
        "company": "Stripe",
        "description": "Looking for Python, FastAPI, PostgreSQL, Docker, and AWS backend services.",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
        "preferred_skills": ["Kubernetes"],
        "required_experience_years": 2,
    }
    experience_list = [{"company": "Company", "role": "Engineer", "bullets": ["Built APIs"]}]
    education_list = [{"degree": "B.Tech"}]

    match = match_resume_with_job(
        resume_text,
        resume_skills,
        job_data,
        experience_list,
        education_list,
    )

    assert match["match_score"] > 50
    assert "Python" in match["matched_skills"]
    assert "PostgreSQL" in match["matched_skills"]
    missing_names = [m["name"] for m in match["missing_skills"]]
    assert "AWS" in missing_names
    assert len(match["multi_job_comparison"]) == 6

def test_semantic_similarity():
    t1 = "FastAPI Python backend web development"
    t2 = "Python web development using FastAPI framework"
    t3 = "Classical baroque painting and Renaissance history"

    sim_high = calculate_semantic_similarity(t1, t2)
    sim_low = calculate_semantic_similarity(t1, t3)
    assert sim_high > sim_low
