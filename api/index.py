"""
Vercel Serverless Function entry point for FastAPI backend.
"""
import os
import sys
import traceback

# Ensure repository root is on sys.path so 'backend' package imports work cleanly
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.app.main import app
except Exception as e:
    err_tb = traceback.format_exc()
    err_msg = str(e)
    print(f"FATAL STARTUP ERROR in api/index.py: {err_msg}\n{err_tb}", file=sys.stderr, flush=True)

    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="Backend Startup Diagnostic")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    async def startup_error_diagnostic(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "BACKEND_STARTUP_ERROR",
                    "message": f"Backend initialization error: {err_msg}",
                    "detail": err_tb,
                    "tip": "Check DATABASE_URL in Vercel settings and ensure IPv4 connection pooler is used.",
                }
            },
        )
