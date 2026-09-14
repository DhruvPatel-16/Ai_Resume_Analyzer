from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ResumeUploadResponse(BaseModel):
    resume_id: str
    filename: str
    status: str
    message: str

class BulletImprovementRequest(BaseModel):
    bullet: str

class BulletImprovementResponse(BaseModel):
    original: str
    improved: str
    explanation: str

class ResumeHistoryItem(BaseModel):
    id: str
    filename: str
    uploadedAt: str
    atsScore: int
    jobMatch: int
    skills: int
    active: bool = False
