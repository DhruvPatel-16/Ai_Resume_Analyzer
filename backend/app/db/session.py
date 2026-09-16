import os
import re
import ssl
import tempfile
import urllib.parse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

db_url = (settings.DATABASE_URL or "").strip()
if not db_url:
    db_url = "sqlite:///./resume_analyzer.db"

# 1. Normalize Supabase and Neon URLs (postgres:// -> postgresql://)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# 2. Sanitize database URL for unencoded special characters in credentials
def sanitize_postgres_url(url: str) -> str:
    """Safely URL-encodes special characters in user/password credentials if present."""
    if not (url.startswith("postgresql://") or url.startswith("postgresql+")):
        return url
    try:
        prefix_end = url.index("://") + 3
        prefix = url[:prefix_end]
        rest = url[prefix_end:]
        if "@" in rest:
            last_at = rest.rfind("@")
            auth_part = rest[:last_at]
            host_part = rest[last_at + 1:]
            if ":" in auth_part:
                user, pwd = auth_part.split(":", 1)
                user_clean = urllib.parse.quote(urllib.parse.unquote(user), safe="")
                pwd_clean = urllib.parse.quote(urllib.parse.unquote(pwd), safe="")
                return f"{prefix}{user_clean}:{pwd_clean}@{host_part}"
    except Exception:
        pass
    return url

db_url = sanitize_postgres_url(db_url)

# 3. Detect environment
is_serverless = bool(
    os.environ.get("VERCEL")
    or os.environ.get("VERCEL_ENV")
    or os.environ.get("VERCEL_REGION")
    or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")
    or os.environ.get("LAMBDA_TASK_ROOT")
    or os.environ.get("NOW_REGION")
)

connect_args = {}
engine_kwargs = {
    "echo": False,
}

# 4. Configure PostgreSQL for serverless (driver fallback, timeouts, and SSL)
if db_url.startswith("postgresql://") or db_url.startswith("postgresql+"):
    has_psycopg2 = False
    try:
        import psycopg2  # noqa: F401
        has_psycopg2 = True
    except ImportError:
        has_psycopg2 = False

    if not has_psycopg2:
        try:
            import pg8000  # noqa: F401
            if db_url.startswith("postgresql://"):
                db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
            # pg8000 uses ssl_context and does NOT accept the 'sslmode' query param
            connect_args["ssl_context"] = ssl.create_default_context()
            connect_args["timeout"] = 10
            if "sslmode" in db_url:
                db_url = re.sub(r"[?&]sslmode=[^&]+", "", db_url)
                if "?" not in db_url and "&" in db_url:
                    db_url = db_url.replace("&", "?", 1)
        except ImportError:
            pass
    else:
        # psycopg2 driver
        if "sslmode" not in db_url:
            separator = "&" if "?" in db_url else "?"
            db_url = f"{db_url}{separator}sslmode=require"
        # Prevent indefinite hang on unreachable host / IPv6 timeout
        connect_args["connect_timeout"] = 10

    engine_kwargs["pool_pre_ping"] = True
    if is_serverless:
        from sqlalchemy.pool import NullPool
        engine_kwargs["poolclass"] = NullPool

# 5. Handle SQLite on Serverless / Read-only environments (Vercel, AWS Lambda)
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

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

engine_kwargs["connect_args"] = connect_args

# 6. Resilient Engine Creation
try:
    engine = create_engine(db_url, **engine_kwargs)
except Exception as e:
    print(f"Warning: Failed to create primary engine for {db_url}: {e}. Falling back to SQLite.", flush=True)
    tmp_db = os.path.join(tempfile.gettempdir(), "resume_analyzer.db").replace("\\", "/")
    fallback_url = f"sqlite:///{tmp_db}"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

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
            print(f"Database initialization notice: {e}", flush=True)

def get_db():
    """Dependency that yields a database session and closes it on exit."""
    ensure_db_initialized()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
