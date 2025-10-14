from passlib.context import CryptContext
from fastapi import Request, HTTPException, status, Header
from datetime import datetime, timezone
import secrets
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    if not hashed:
        return False
    return pwd_context.verify(plain, hashed)

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def _session_expired(request: Request) -> bool:
    login_at = request.session.get("login_at")
    if not isinstance(login_at, (int, float)):
        return True
    now = datetime.now(tz=timezone.utc).timestamp()
    return (now - float(login_at)) > settings.SESSION_MAX_AGE

def require_admin(request: Request):
    if not request.session.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    if _session_expired(request):
        request.session.clear()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

def issue_csrf_token(request: Request) -> str:
    token = secrets.token_urlsafe(32)
    request.session["csrf_token"] = token
    return token

def require_csrf(request: Request, x_csrf_token: str | None = Header(default=None)):
    session_token = request.session.get("csrf_token")
    if not session_token or not x_csrf_token or session_token != x_csrf_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid CSRF token")