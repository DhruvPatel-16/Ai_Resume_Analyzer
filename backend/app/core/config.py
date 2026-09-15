import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume Analyzer & Job Matcher"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "supersecret_resume_ai_jwt_key_development_only_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: default SQLite for zero-config out-of-the-box local execution
    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"
    
    # Optional LLM Integration (OpenAI-compatible or Gemini)
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"
    
    # Production / Vercel deployment URLs
    FRONTEND_URL: str = ""
    VERCEL_URL: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8443",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8443",
        "*"
    ]
    
    MAX_FILE_SIZE_MB: int = 10
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "uploads"))

    model_config = {"env_file": ".env", "extra": "allow"}

    def get_cors_origins(self) -> List[str]:
        origins = list(self.CORS_ORIGINS)
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        vercel_url = os.environ.get("VERCEL_URL") or self.VERCEL_URL
        if vercel_url:
            vercel_origin = f"https://{vercel_url}" if not vercel_url.startswith("http") else vercel_url
            if vercel_origin not in origins:
                origins.append(vercel_origin)
        return origins

settings = Settings()
