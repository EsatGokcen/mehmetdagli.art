from fastapi import APIRouter, Depends, Request, HTTPException, Form, status
from datetime import datetime, timezone
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
    return rec["count"] >= MAX_ATTEMPTS and (
        datetime.now(tz=timezone.utc).timestamp() - rec["ts"]
    ) < LOCKOUT_MINUTES * 60


def _note_fail(key: str):
    now = datetime.now(tz=timezone.utc).timestamp()
    rec = FAILED_ATTEMPTS.get(key)
    if not rec:
        FAILED_ATTEMPTS[key] = {"count": 1, "ts": now}
    else:
        rec["count"] += 1
        rec["ts"] = now


def _clear_fail(key: str):
    FAILED_ATTEMPTS.pop(key, None)


@router.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    # request.client can be None in some ASGI setups; guard it
    client = request.client
    client_host = getattr(client, "host", None) or "unknown"
    key = f"{client_host}:{username}"

    if _is_locked(key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts, try later",
        )

    if username != settings.ADMIN_USERNAME or not verify_password(
        password, settings.ADMIN_PASSWORD_HASH
    ):
        _note_fail(key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    _clear_fail(key)

    # establish session
    request.session.clear()
    request.session["is_admin"] = True
    request.session["login_at"] = datetime.now(tz=timezone.utc).timestamp()
    issue_csrf_token(request)

    return {"ok": True}


@router.post("/logout", dependencies=[Depends(require_admin)])
async def logout(request: Request):
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