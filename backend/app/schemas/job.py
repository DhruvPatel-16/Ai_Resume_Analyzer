from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class JobAnalyzeRequest(BaseModel):
    title: str
    description: str
    company: Optional[str] = ""

class JobMatchRequest(BaseModel):
    resume_id: Optional[str] = None
    job_id: Optional[str] = None
    title: Optional[str] = "Senior Backend Engineer"
    description: str
    company: Optional[str] = "Company"
