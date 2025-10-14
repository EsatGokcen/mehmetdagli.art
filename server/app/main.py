from typing import Literal, cast
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.routers.portfolio import router as portfolio_router
from app.routers.events import router as events_router
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router

# --- App ---
app = FastAPI(title="Mehmet Art API")

# --- CORS ---
allowed_origins = settings.CORS_ORIGINS or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Sessions ---
# Coerce SameSite to one of the accepted literals: 'lax' | 'strict' | 'none'
_raw_ss = (settings.COOKIE_SAMESITE or "lax").lower()
if _raw_ss not in ("lax", "strict", "none"):
    _raw_ss = "lax"
same_site_value: Literal["lax", "strict", "none"] = cast(
    Literal["lax", "strict", "none"], _raw_ss
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    session_cookie=settings.SESSION_COOKIE_NAME,
    max_age=settings.SESSION_MAX_AGE,     # 1 hour
    same_site=same_site_value,            # typed literal now
    https_only=settings.COOKIE_SECURE,
)

# Static media (uploaded images)
app.mount("/media", StaticFiles(directory="app/media"), name="media")

# Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(portfolio_router)
app.include_router(events_router)


@app.get("/health")
def health():
    return {"status": "ok"}