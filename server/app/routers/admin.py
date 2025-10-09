from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from app.core.config import settings
from app.core.security import require_admin, require_csrf, verify_password, hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])

class ChangePasswordIn(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)

@router.post("/password", dependencies=[Depends(require_admin), Depends(require_csrf)])
def change_password(payload: ChangePasswordIn, request: Request):
    if not verify_password(payload.current_password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_hash = hash_password(payload.new_password)
    # Paste this value into ADMIN_PASSWORD_HASH in your .env
    return {"new_password_hash": new_hash}