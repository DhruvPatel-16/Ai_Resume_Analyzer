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

def test_resume_download_and_preview():
    # 1. Seed a sample resume
    res = client.post("/api/resumes/sample")
    assert res.status_code == 200
    resume_id = res.json()["id"]

    # 2. Test download
    dl = client.get(f"/api/resumes/{resume_id}/download")
    assert dl.status_code == 200
    assert dl.headers["content-type"] == "application/pdf"
    assert "attachment" in dl.headers.get("content-disposition", "")
    assert len(dl.content) > 100

    # 3. Test preview
    pv = client.get(f"/api/resumes/{resume_id}/preview")
    assert pv.status_code == 200
    assert pv.headers["content-type"] == "application/pdf"
    assert "inline" in pv.headers.get("content-disposition", "")
    assert len(pv.content) > 100

def test_compare_multiple_resumes():
    # 1. Seed two resumes
    r1 = client.post("/api/resumes/sample").json()["id"]
    r2 = client.post("/api/resumes/sample").json()["id"]

    # 2. Test comparison with 2+ resumes
    resp = client.post("/api/resumes/compare", json={"resume_ids": [r1, r2]})
    assert resp.status_code == 200
    data = resp.json()
    assert data["totalCompared"] == 2
    assert len(data["resumes"]) == 2
    assert "sharedSkills" in data
    assert "bestAtsId" in data

    # 3. Test validation error with less than 2 resumes
    err_resp = client.post("/api/resumes/compare", json={"resume_ids": [r1]})
    assert err_resp.status_code == 400

def test_batch_upload_resumes():
    # Read two existing test resumes
    import os
    r1_path = os.path.join("Resume", "Alex_Chen_Resume.pdf")
    r2_path = os.path.join("Resume", "Priya_Sharma_Resume.pdf")
    
    with open(r1_path, "rb") as f1, open(r2_path, "rb") as f2:
        b1 = f1.read()
        b2 = f2.read()

    files = [
        ("files", ("Alex_Chen_Resume.pdf", b1, "application/pdf")),
        ("files", ("Priya_Sharma_Resume.pdf", b2, "application/pdf")),
    ]
    resp = client.post("/api/resumes/batch-upload", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert data["successful"] == 2
    assert data["failed"] == 0
    assert len(data["resumes"]) == 2
    assert data["activeAnalysis"] is not None


