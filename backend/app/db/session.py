import os
import tempfile
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

db_url = settings.DATABASE_URL or "sqlite:///./resume_analyzer.db"

# 1. Normalize Supabase and Neon URLs (postgres:// -> postgresql://)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# 2. Configure PostgreSQL for serverless (SSL and driver fallback)
connect_args = {}
if db_url.startswith("postgresql://") or db_url.startswith("postgresql+"):
    # Ensure SSL mode is enabled for hosted cloud databases (Neon, Supabase)
    if "sslmode" not in db_url:
        separator = "&" if "?" in db_url else "?"
        db_url = f"{db_url}{separator}sslmode=require"

    # Driver fallback: if psycopg2 is missing, use pg8000 (pure Python)
    try:
        import psycopg2  # noqa: F401
    except ImportError:
        try:
            import pg8000  # noqa: F401
            if db_url.startswith("postgresql://"):
                db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
        except ImportError:
            pass

# 3. Handle SQLite on Serverless / Read-only environments (Vercel, AWS Lambda)
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

    is_serverless = bool(
        os.environ.get("VERCEL")
        or os.environ.get("VERCEL_ENV")
        or os.environ.get("VERCEL_REGION")
        or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")
        or os.environ.get("LAMBDA_TASK_ROOT")
        or os.environ.get("NOW_REGION")
    )

    # Check if local current directory is writable
    is_writable = True
    try:
        test_file = os.path.join(".", ".perm_check")
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
    except Exception:
        is_writable = False

    # In read-only or serverless environments, redirect relative SQLite DB to /tmp
    if is_serverless or not is_writable:
        tmp_db = os.path.join(tempfile.gettempdir(), "resume_analyzer.db").replace("\\", "/")
        db_url = f"sqlite:///{tmp_db}"

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_initialized = False

def ensure_db_initialized():
    """Initializes tables and applies lightweight schema migrations on demand."""
    global _initialized
    if not _initialized:
        try:
            # Import models to ensure all metadata is registered
            from backend.app.db import models  # noqa: F401
            Base.metadata.create_all(bind=engine)
            with engine.connect() as conn:
                try:
                    conn.execute(text("ALTER TABLE resumes ADD COLUMN file_data TEXT"))
                    conn.commit()
                except Exception:
                    pass
            _initialized = True
        except Exception as e:
            print(f"Database initialization notice: {e}")

def get_db():
    """Dependency that yields a database session and closes it on exit."""
    ensure_db_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
