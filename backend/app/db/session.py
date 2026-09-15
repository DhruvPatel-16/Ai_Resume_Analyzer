import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

db_url = settings.DATABASE_URL or "sqlite:///./resume_analyzer.db"

# Supabase and Neon sometimes provide URLs starting with postgres:// instead of postgresql://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    # On Vercel serverless functions with read-only root, use /tmp for SQLite fallback
    if os.environ.get("VERCEL") and db_url.startswith("sqlite:///./"):
        db_url = "sqlite:////tmp/resume_analyzer.db"
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that yields a database session and closes it on exit."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
