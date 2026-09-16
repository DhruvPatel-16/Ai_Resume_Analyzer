-- ==============================================================================
-- AI RESUME ANALYZER & JOB MATCHER — SUPABASE / POSTGRESQL SCHEMA INITIALIZATION
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- to immediately create all required tables, constraints, and indexes.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER DEFAULT 0,
    file_path VARCHAR(500),
    file_data TEXT,
    extracted_text TEXT NOT NULL,
    raw_data JSONB,
    ats_score FLOAT DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_resumes_user_id ON resumes(user_id);

-- 3. Canonical Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    canonical_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS ix_skills_canonical_name ON skills(canonical_name);
CREATE INDEX IF NOT EXISTS ix_skills_category ON skills(category);

-- 4. Extracted Resume Skills Table
CREATE TABLE IF NOT EXISTS resume_skills (
    id VARCHAR(36) PRIMARY KEY,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    skill_id VARCHAR(36) REFERENCES skills(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    level INTEGER DEFAULT 75
);
CREATE INDEX IF NOT EXISTS ix_resume_skills_resume_id ON resume_skills(resume_id);

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(200),
    location VARCHAR(200),
    description TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    preferred_skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_jobs_user_id ON jobs(user_id);

-- 6. Job Matches Table
CREATE TABLE IF NOT EXISTS job_matches (
    id VARCHAR(36) PRIMARY KEY,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    job_id VARCHAR(36) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score FLOAT NOT NULL,
    skill_score FLOAT NOT NULL,
    semantic_score FLOAT NOT NULL,
    experience_score FLOAT NOT NULL,
    education_score FLOAT NOT NULL,
    keyword_score FLOAT NOT NULL,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    partial_skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_job_matches_resume_id ON job_matches(resume_id);
CREATE INDEX IF NOT EXISTS ix_job_matches_job_id ON job_matches(job_id);

-- 7. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(36) PRIMARY KEY,
    resume_id VARCHAR(36) NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    job_id VARCHAR(36) REFERENCES jobs(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    effort VARCHAR(50),
    impact VARCHAR(50),
    resources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_recommendations_resume_id ON recommendations(resume_id);
