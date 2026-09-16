import os
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine, Base, ensure_db_initialized
from backend.app.db import models  # noqa: F401
from sqlalchemy import text
from backend.app.api.routes import auth, resumes, jobs, improvements, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_db_initialized()
    except Exception as e:
        print(f"Startup DB init notice: {e}", flush=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Vercel Serverless Path Normalization Middleware
@app.middleware("http")
async def vercel_path_normalization(request: Request, call_next):
    """
    Normalizes paths when running behind Vercel serverless function rewrites.
    Restores the real destination path if Vercel routes through /api/index.py.
    """
    original_path = (
        request.headers.get("x-invoke-path")
        or request.headers.get("x-matched-path")
        or request.headers.get("x-real-path")
        or request.query_params.get("__path__")
    )
    current_path = request.scope.get("path", "")
    if original_path and current_path in ("/api/index.py", "/api/index", "/api/", "/api", "/index.py", "/"):
        clean_path = original_path.split("?")[0]
        if not clean_path.startswith("/"):
            clean_path = f"/{clean_path}"
        request.scope["path"] = clean_path

    response = await call_next(request)
    return response

# Handle preflight OPTIONS requests gracefully
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return JSONResponse(status_code=200, content={"status": "ok"})

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom error format handler for HTTPExceptions
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

# Global unhandled exception handler to provide actionable error diagnostics instead of opaque 500s
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    err_tb = traceback.format_exc()
    err_msg = str(exc) or "Internal Server Error"
    print(f"ERROR on {request.method} {request.url.path}: {err_msg}\n{err_tb}")
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": f"Server Error: {err_msg}",
                "detail": err_tb if os.environ.get("VERCEL_ENV") != "production" else err_msg,
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

# Also mount under /api/index.py in case Vercel rewrites pass function name in path
app.include_router(auth.router, prefix="/api/index.py", include_in_schema=False)
app.include_router(resumes.router, prefix="/api/index.py", include_in_schema=False)
app.include_router(jobs.router, prefix="/api/index.py", include_in_schema=False)
app.include_router(improvements.router, prefix="/api/index.py", include_in_schema=False)
app.include_router(dashboard.router, prefix="/api/index.py", include_in_schema=False)

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    db_status = "connected"
    db_error = None
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "error"
        db_error = str(e)

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "database": db_status,
        "database_error": db_error,
        "database_type": engine.url.drivername,
        "llm_configured": bool(settings.LLM_API_KEY),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
