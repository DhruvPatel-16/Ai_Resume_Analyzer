import pytest
from backend.app.nlp.skills import extract_skills_from_text, normalize_skill_name

def test_normalize_skill_name():
    assert normalize_skill_name("ReactJS") == "React"
    assert normalize_skill_name("react.js") == "React"
    assert normalize_skill_name("postgres") == "PostgreSQL"
    assert normalize_skill_name("JS") == "JavaScript"
    assert normalize_skill_name("k8s") == "Kubernetes"
    assert normalize_skill_name("docker-compose") == "Docker"
    assert normalize_skill_name("Python") == "Python"

def test_extract_skills_canonical_and_categorized():
    text = """
    Software Engineer with deep experience in Python, ReactJS, FastAPI, and Postgres.
    Built microservices with Docker, Kubernetes, and deployed to AWS.
    Knowledge of Git, Redis, and Machine Learning with PyTorch.
    Strong Communication and Problem Solving.
    """
    skills = extract_skills_from_text(text)
    names = {s["name"] for s in skills}
    categories = {s["category"] for s in skills}

    assert "Python" in names
    assert "React" in names  # Normalized from ReactJS
    assert "FastAPI" in names
    assert "PostgreSQL" in names  # Normalized from Postgres
    assert "Docker" in names
    assert "AWS" in names
    assert "Communication" in names

    assert "Programming" in categories
    assert "Frontend" in categories
    assert "Backend" in categories
    assert "Database" in categories
    assert "DevOps" in categories
    assert "Soft Skills" in categories

def test_extract_skills_proficiency_weighting():
    body_text = "I know Python and Docker."
    exp_text = "Senior Python engineer building distributed services with Python."
    skills = extract_skills_from_text(body_text, experience_text=exp_text)
    
    python_skill = next(s for s in skills if s["name"] == "Python")
    docker_skill = next(s for s in skills if s["name"] == "Docker")
    
    # Python is in experience and mentioned multiple times, so level should be higher
    assert python_skill["level"] > docker_skill["level"]
    assert python_skill["in_experience"] is True
