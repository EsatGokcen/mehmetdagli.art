from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.routers.portfolio import router as portfolio_router
from app.routers.events import router as events_router
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Mehmet Dagli Art API")

# --- middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Sessions
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET,
    session_cookie="md_session",
)

# Static media (uploaded images)
app.mount("/media", StaticFiles(directory="app/media"), name="media")

# Create tables
#Base.metadata.create_all(bind=engine) # --- HANDLED BY ALEMBIC ---

# Routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(portfolio_router)
app.include_router(events_router)

@app.get("/health")
def health():
    return {"status": "ok"}