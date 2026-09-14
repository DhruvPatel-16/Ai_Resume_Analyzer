from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Resume, Job, JobMatch
from backend.app.schemas.job import JobAnalyzeRequest, JobMatchRequest
from backend.app.matching.job_analyzer import analyze_job_description
from backend.app.matching.matcher import match_resume_with_job
from backend.app.ai.recommendations import generate_recommendations, generate_skill_roadmap

router = APIRouter(prefix="", tags=["Jobs & Matching"])

@router.post("/jobs/analyze")
def analyze_job(job_in: JobAnalyzeRequest):
    """Extracts required skills, preferred skills, and keywords from a job description."""
    if not job_in.description or len(job_in.description.strip()) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too short. Please provide a detailed description.",
        )

    result = analyze_job_description(job_in.title, job_in.description, job_in.company or "")
    return result

@router.post("/matches")
def match_job(match_in: JobMatchRequest, db: Session = Depends(get_db)):
    """
    Compares a candidate's resume with a target job description:
    Computes overall match score, semantic similarity, skill overlaps, and missing skills.
    """
    if not match_in.description or len(match_in.description.strip()) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is too short. Please provide a detailed description.",
        )

    # Find the target resume
    resume = None
    if match_in.resume_id:
        resume = db.query(Resume).filter(Resume.id == match_in.resume_id).first()
    
    if not resume:
        # Get latest active resume
        resume = db.query(Resume).filter(Resume.is_active == True).order_by(Resume.created_at.desc()).first()
    
    if not resume:
        # Fallback to any latest resume
        resume = db.query(Resume).order_by(Resume.created_at.desc()).first()

    # Extract resume data
    if resume and resume.raw_data:
        resume_text = resume.extracted_text
        resume_skills = resume.raw_data.get("technicalSkills", []) + resume.raw_data.get("softSkills", [])
        experience_list = resume.raw_data.get("experience", [])
        education_list = resume.raw_data.get("education", [])
        ats_data = {"breakdown": resume.raw_data.get("atsBreakdown", [])}
    else:
        # Default benchmark resume baseline if no resume uploaded yet
        resume_text = "Python, React, TypeScript, PostgreSQL, FastAPI, Docker, Git, SQL, Redis"
        resume_skills = [
            {"name": "Python", "category": "Programming", "level": 95},
            {"name": "React", "category": "Frontend", "level": 92},
            {"name": "PostgreSQL", "category": "Database", "level": 85},
            {"name": "FastAPI", "category": "Backend", "level": 80},
            {"name": "SQL", "category": "Database", "level": 87},
            {"name": "Git", "category": "DevOps", "level": 93},
        ]
        experience_list = [{"role": "Software Engineer", "company": "Tech Corp"}]
        education_list = [{"degree": "B.Tech Computer Science"}]
        ats_data = {"breakdown": []}

    job_data = analyze_job_description(
        match_in.title or "Software Engineer",
        match_in.description,
        match_in.company or "Company",
    )
    job_data["description"] = match_in.description

    match_result = match_resume_with_job(
        resume_text,
        resume_skills,
        job_data,
        experience_list,
        education_list,
    )

    # Generate dynamic recommendations for this specific JD
    recs = generate_recommendations(
        resume_skills,
        match_result["missing_skills"],
        ats_data,
        job_title=job_data["title"],
    )
    roadmap = generate_skill_roadmap(match_result["missing_skills"])

    # Keywords analysis comparing JD keywords with Resume
    jd_words = list(dict.fromkeys(job_data.get("all_skills", []) + match_result["matched_skills"]))
    resume_lower = resume_text.lower()
    keywords_analysis = []
    for w in jd_words[:12]:
        freq = resume_lower.count(w.lower())
        keywords_analysis.append({
            "word": w,
            "frequency": freq,
            "inJD": True,
            "category": "skill",
        })

    response = {
        "title": job_data["title"],
        "company": job_data["company"],
        "description": match_in.description,
        "matchScore": match_result["match_score"],
        "skillScore": match_result["skill_score"],
        "semanticScore": match_result["semantic_score"],
        "experienceScore": match_result["experience_score"],
        "educationScore": match_result["education_score"],
        "keywordScore": match_result["keyword_score"],
        "matchedSkills": match_result["matched_skills"],
        "partialSkills": match_result["partial_skills"],
        "missingSkills": match_result["missing_skills"],
        "multiJobComparison": match_result["multi_job_comparison"],
        "recommendations": recs,
        "skillRoadmap": roadmap,
        "keywords": keywords_analysis,
    }

    return response
