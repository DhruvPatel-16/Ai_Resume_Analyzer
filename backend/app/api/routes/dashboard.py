from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import User, Resume
from backend.app.api.deps import get_current_user_optional

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Returns dashboard overview statistics, latest resume details,
    score progression, and high-level health indicators.
    """
    query = db.query(Resume)
    if current_user:
        query = query.filter(Resume.user_id == current_user.id)
    
    all_resumes = query.order_by(Resume.created_at.asc()).all()
    latest_resume = all_resumes[-1] if all_resumes else None

    # Score history across uploaded versions
    score_history = []
    for i, r in enumerate(all_resumes):
        score_history.append({
            "version": f"v{i+1}",
            "ats": int(r.ats_score),
            "match": min(max(int(r.ats_score * 0.95), 50), 98),
        })

    # If user has no resumes yet, provide standard benchmark progression
    if not score_history:
        score_history = [
            {"version": "v1", "ats": 68, "match": 62},
            {"version": "v2", "ats": 76, "match": 73},
            {"version": "v3", "ats": 80, "match": 77},
            {"version": "v4", "ats": 84, "match": 81},
        ]

    active_analysis = latest_resume.raw_data if (latest_resume and latest_resume.raw_data) else None

    return {
        "user": {
            "name": current_user.name if current_user else "Marcus Vance",
            "email": current_user.email if current_user else "marcus.vance@email.com",
            "plan": "Pro",
            "avatar": current_user.name[:2].upper() if current_user else "MV",
        },
        "hasResume": latest_resume is not None,
        "resumeId": latest_resume.id if latest_resume else None,
        "filename": latest_resume.filename if latest_resume else "Marcus_Vance_Resume.pdf",
        "atsScore": int(latest_resume.ats_score) if latest_resume else 84,
        "jobMatchScore": min(max(int(latest_resume.ats_score * 0.95), 50), 98) if latest_resume else 81,
        "totalResumes": len(all_resumes),
        "scoreHistory": score_history,
        "activeAnalysis": active_analysis,
    }
