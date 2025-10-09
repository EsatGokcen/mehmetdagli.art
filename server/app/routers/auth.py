from fastapi import APIRouter, Depends, Request, HTTPException, Form
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.security import verify_password, require_admin, issue_csrf_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- simple in-memory login lockout (MVP) ---
FAILED_ATTEMPTS: dict[str, dict] = {}
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 10

def _is_locked(key: str) -> bool:
    rec = FAILED_ATTEMPTS.get(key)
    if not rec:
        return False
    until = rec.get("until")
    return bool(until and until > datetime.utcnow())

def _register_failure(key: str):
    rec = FAILED_ATTEMPTS.get(key, {"count": 0, "until": None})
    rec["count"] += 1
    if rec["count"] >= MAX_ATTEMPTS:
        rec["until"] = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
        rec["count"] = 0
    FAILED_ATTEMPTS[key] = rec

def _clear_failures(key: str):
    if key in FAILED_ATTEMPTS:
        del FAILED_ATTEMPTS[key]

@router.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    key = (request.client.host if request.client else None) or "unknown"
    if _is_locked(key):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try later.")
    if username != settings.ADMIN_USERNAME or not verify_password(password, settings.ADMIN_PASSWORD_HASH):
        _register_failure(key)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    request.session["is_admin"] = True
    # rotate CSRF token on login for good measure
    issue_csrf_token(request)
    _clear_failures(key)
    return {"ok": True}

@router.post("/logout")
async def logout(request: Request, _=Depends(require_admin)):
    request.session.clear()
    return {"ok": True}

@router.get("/me")
async def me(request: Request):
    return {"is_admin": bool(request.session.get("is_admin", False))}

@router.get("/csrf", dependencies=[Depends(require_admin)])
async def csrf(request: Request):
    """Return the current CSRF token; create if missing (no rotation)."""
    token = request.session.get("csrf_token")
    if not token:
        token = issue_csrf_token(request)
    return {"csrf": token}