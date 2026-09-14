import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    Integer,
    ForeignKey,
    DateTime,
    JSON,
    Boolean,
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, default=0)
    extracted_text = Column(Text, nullable=False)
    raw_data = Column(JSON, nullable=True)  # Stores parsed sections, contact, education, experience, etc.
    ats_score = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="resumes")
    skills = relationship("ResumeSkill", back_populates="resume", cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="resume", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    canonical_name = Column(String(100), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)

class ResumeSkill(Base):
    __tablename__ = "resume_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    confidence = Column(Float, default=1.0)
    level = Column(Integer, default=75)  # 0 to 100

    resume = relationship("Resume", back_populates="skills")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="jobs")
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)
    experience_score = Column(Float, nullable=False)
    education_score = Column(Float, nullable=False)
    keyword_score = Column(Float, nullable=False)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    partial_skills = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="matches")
    job = relationship("Job", back_populates="matches")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    type = Column(String(50), nullable=False)  # skill-gap, content, structure
    priority = Column(String(20), nullable=False)  # high, medium, low
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    effort = Column(String(50), nullable=True)
    impact = Column(String(50), nullable=True)
    resources = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    resume = relationship("Resume", back_populates="recommendations")
