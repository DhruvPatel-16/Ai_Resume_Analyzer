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
    redirect_slashes=False,
)

# ── CORS Middleware ────────────────────────────────────────────────────────────
# Must be added BEFORE custom middleware so it wraps everything.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel edge headers handle origin restriction; wildcard here for serverless
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Custom exception handlers ──────────────────────────────────────────────────

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


# ── Health / root endpoints ────────────────────────────────────────────────────
# These are registered FIRST so they match before routers.

@app.api_route("/", methods=["GET", "POST", "HEAD", "OPTIONS"])
@app.api_route("/health", methods=["GET", "POST", "HEAD", "OPTIONS"])
@app.api_route("/api/health", methods=["GET", "POST", "HEAD", "OPTIONS"])
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


# ── API Routers ────────────────────────────────────────────────────────────────
# Mounted under /api prefix (settings.API_V1_STR = "/api").
# Vercel rewrites /api/(.*) → /api/index.py and forwards the ORIGINAL path,
# so FastAPI sees /api/auth/register, /api/resumes/upload, etc. unchanged.

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(improvements.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
