import os
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

def _bool(x: str | None, default: bool=False) -> bool:
    if x is None:
        return default
    return x.lower() in ("1", "true", "yes", "on")

def _list(x: str | None) -> list[str]:
    if not x:
        return []
    return [s.strip() for s in x.split(",") if s.strip()]

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    SESSION_SECRET: str = os.getenv("SESSION_SECRET", "change-me")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD_HASH: str = os.getenv("ADMIN_PASSWORD_HASH", "")

    # Session / cookie
    SESSION_MAX_AGE: int = int(os.getenv("SESSION_MAX_AGE", "3600"))  # seconds
    SESSION_COOKIE_NAME: str = os.getenv("SESSION_COOKIE_NAME", "session")
    COOKIE_SECURE: bool = _bool(os.getenv("COOKIE_SECURE"), False)    # True in production HTTPS
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "lax")        # 'lax' or 'none' if cross-site

    # CORS
    CORS_ORIGINS: List[str] = _list(os.getenv("CORS_ORIGINS"))

settings = Settings()