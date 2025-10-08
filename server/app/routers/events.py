from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Event
from app.schemas.events import EventCreate, EventUpdate, EventOut
from app.core.security import require_admin, require_csrf

router = APIRouter(prefix="/api/events", tags=["events"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[EventOut])
def list_events(
    db: Session = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    q = db.query(Event).order_by(Event.start_date.desc().nullslast(), Event.id.desc())
    return q.offset(offset).limit(limit).all()

@router.post(
    "",
    response_model=EventOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    ev = Event(**payload.model_dump())
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev

@router.put(
    "/{event_id}",
    response_model=EventOut,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    ev = db.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    for k, v in payload.model_dump().items():
        setattr(ev, k, v)
    db.commit()
    db.refresh(ev)
    return ev

@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    db.delete(ev)
    db.commit()
    return None