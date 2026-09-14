import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_auth_registration_and_login():
    reg_payload = {
        "name": "Test Engineer",
        "email": "test_engineer_unique@example.com",
        "password": "SecurePassword123!",
    }
    # Register
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code in (201, 400)  # 400 if already created in previous run
    
    # Login
    login_payload = {
        "email": "test_engineer_unique@example.com",
        "password": "SecurePassword123!",
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token_data = res_login.json()
    assert "access_token" in token_data
    assert token_data["user"]["name"] == "Test Engineer"

def test_seed_sample_resume():
    response = client.post("/api/resumes/sample")
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "Marcus_Vance_Resume.pdf"
    assert data["atsScore"] >= 75
    assert len(data["technicalSkills"]) > 5
    assert len(data["education"]) >= 1
    assert len(data["experience"]) >= 1

def test_job_match_endpoint():
    jd_payload = {
        "title": "Senior Python Developer",
        "company": "Stripe",
        "description": "Looking for Python, FastAPI, PostgreSQL, Docker, AWS backend engineer.",
    }
    response = client.post("/api/matches", json=jd_payload)
    assert response.status_code == 200
    data = response.json()
    assert "matchScore" in data
    assert "matchedSkills" in data
    assert "missingSkills" in data
    assert len(data["multiJobComparison"]) > 0

def test_bullet_improver_endpoint():
    payload = {
        "bullet": "built a backend system using Python and FastAPI"
    }
    response = client.post("/api/improve/bullet", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "improved" in data
    assert "explanation" in data
    assert data["improved"] != ""
