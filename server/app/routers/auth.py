from fastapi import APIRouter, Depends, Request, HTTPException, Form
from app.core.config import settings
from app.core.security import verify_password, require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    if username != settings.ADMIN_USERNAME or not verify_password(password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    request.session["is_admin"] = True
    return {"ok": True}

@router.post("/logout")
async def logout(request: Request, _=Depends(require_admin)):
    request.session.clear()
    return {"ok": True}

@router.get("/me")
async def me(request: Request):
    return {"is_admin": bool(request.session.get("is_admin", False))}

from app.core.config import settings

@router.get("/debug-env")
def debug_env():
    return {
        "username_loaded": settings.ADMIN_USERNAME == "admin",
        "hash_loaded": bool(settings.ADMIN_PASSWORD_HASH),
    }