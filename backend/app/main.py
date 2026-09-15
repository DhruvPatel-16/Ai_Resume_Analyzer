from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine, Base
from backend.app.db import models
from sqlalchemy import text
from backend.app.api.routes import auth, resumes, jobs, improvements, dashboard

def init_db():
    """Initializes tables and applies lightweight schema migrations."""
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE resumes ADD COLUMN file_data TEXT"))
                conn.commit()
            except Exception:
                pass
    except Exception as e:
        print(f"Database table initialization notice: {e}")

init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom error format handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
            }
        },
    )

# Include API Routers with standard /api prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(improvements.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)

# Also mount without /api prefix so Vercel rewrites work whether /api is preserved or stripped
app.include_router(auth.router, prefix="", include_in_schema=False)
app.include_router(resumes.router, prefix="", include_in_schema=False)
app.include_router(jobs.router, prefix="", include_in_schema=False)
app.include_router(improvements.router, prefix="", include_in_schema=False)
app.include_router(dashboard.router, prefix="", include_in_schema=False)

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected",
        "llm_configured": bool(settings.LLM_API_KEY),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
