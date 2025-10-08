from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Event
from app.schemas.events import EventCreate, EventUpdate, EventOut
from app.core.security import require_admin

router = APIRouter(prefix="/api/events", tags=["events"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.start_date.desc().nullslast()).all()

@router.post("", response_model=EventOut, dependencies=[Depends(require_admin)])
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    ev = Event(**payload.model_dump()); db.add(ev); db.commit(); db.refresh(ev); return ev

@router.put("/{event_id}", response_model=EventOut, dependencies=[Depends(require_admin)])
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    ev = db.get(Event, event_id); 
    if not ev: raise ValueError("Not found")
    for k, v in payload.model_dump().items(): setattr(ev, k, v)
    db.commit(); db.refresh(ev); return ev

@router.delete("/{event_id}", dependencies=[Depends(require_admin)])
def delete_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.get(Event, event_id); 
    if ev: db.delete(ev); db.commit()
    return {"ok": True}