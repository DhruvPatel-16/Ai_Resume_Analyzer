import pytest
from backend.app.scoring.ats_scorer import calculate_ats_score

def test_ats_scoring_formula_and_weights():
    parsed_sections = {
        "summary": "Experienced engineer with high impact.",
        "skills": "Python, React, FastAPI, PostgreSQL, Docker, Git",
        "experience": "Engineered high throughput services, reduced latency by 35% across 500+ users.",
        "education": "B.Tech Computer Science at University",
        "projects": "CloudPulse telemetry platform",
    }
    extracted_skills = [
        {"name": "Python", "category": "Programming"},
        {"name": "React", "category": "Frontend"},
        {"name": "FastAPI", "category": "Backend"},
        {"name": "PostgreSQL", "category": "Database"},
        {"name": "Docker", "category": "DevOps"},
        {"name": "Git", "category": "Tools"},
    ]
    education_list = [
        {"degree": "B.Tech Computer Science", "institution": "University", "year": "2024", "gpa": "3.8"}
    ]
    experience_list = [
        {
            "company": "Stripe",
            "role": "Software Engineer",
            "duration": "2024-Present",
            "bullets": ["Engineered high throughput services", "Reduced latency by 35%"],
        }
    ]
    projects_list = [{"name": "CloudPulse", "description": "Full stack telemetry platform"}]
    personal_info = {
        "name": "Marcus Vance",
        "email": "marcus.vance@example.com",
        "phone": "+1234567890",
        "github": "github.com/marcusvance",
    }

    result = calculate_ats_score(
        parsed_sections,
        extracted_skills,
        education_list,
        experience_list,
        projects_list,
        personal_info,
    )

    ats_score = result["ats_score"]
    assert 0 <= ats_score <= 100
    assert len(result["breakdown"]) == 6
    assert any(b["category"] == "Skills Match" and b["weight"] == 30 for b in result["breakdown"])
    assert any(b["category"] == "Keywords" and b["weight"] == 20 for b in result["breakdown"])
    assert any(b["category"] == "Experience Relevance" and b["weight"] == 20 for b in result["breakdown"])
    assert any(b["category"] == "Education" and b["weight"] == 10 for b in result["breakdown"])
    assert any(b["category"] == "Resume Structure" and b["weight"] == 10 for b in result["breakdown"])
    assert any(b["category"] == "Achievements" and b["weight"] == 10 for b in result["breakdown"])

    assert len(result["high_reasons"]) > 0
    assert len(result["quality_checks"]) == 4
