import os
import uuid
from collections import defaultdict
from datetime import date
from typing import Iterable

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import Event, EventImage
from app.schemas.events import EventCreate, EventUpdate, EventOut
from app.core.security import require_admin, require_csrf

router = APIRouter(prefix="/api/events", tags=["events"])
MEDIA_DIR = "app/media"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _event_out(ev: Event, images: Iterable[EventImage]) -> EventOut:
    return EventOut(
        id=ev.id,
        title=ev.title,
        location=ev.location,
        start_date=ev.start_date,
        end_date=ev.end_date,
        details=ev.details,
        images=[img.image_path for img in sorted(images, key=lambda x: (x.sort_order, x.id))],
    )

@router.get("", response_model=list[EventOut])
def list_events(
    db: Session = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    q: str | None = Query(None, description="search title/location/details"),
    upcoming_only: bool = Query(False, description="end_date >= today, or start_date >= today if no end_date"),
):
    query = db.query(Event)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Event.title.ilike(like)) |
            (Event.location.ilike(like)) |
            (Event.details.ilike(like))
        )
    if upcoming_only:
        today = date.today().isoformat()
        query = query.filter(
            (Event.end_date == None) | (Event.end_date >= today) | (Event.start_date >= today)
        )
    order_clause = Event.start_date.asc().nullslast() if upcoming_only else Event.start_date.desc().nullslast()
    events = (
        query.order_by(order_clause, Event.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    if not events:
        return []

    ev_ids = [e.id for e in events]
    imgs = db.query(EventImage).filter(EventImage.event_id.in_(ev_ids)).all()
    grouped: dict[int, list[EventImage]] = defaultdict(list)
    for im in imgs:
        grouped[im.event_id].append(im)

    return [_event_out(e, grouped.get(e.id, [])) for e in events]

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
    return _event_out(ev, [])

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

    imgs = db.query(EventImage).filter_by(event_id=ev.id).all()
    return _event_out(ev, imgs)

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

# -------- Images for events --------

@router.get(
    "/{event_id}/images",
    response_model=list[str],
    dependencies=[],
)
def list_images(event_id: int, db: Session = Depends(get_db)):
    ev = db.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    imgs = db.query(EventImage).filter_by(event_id=event_id).order_by(EventImage.sort_order.asc(), EventImage.id.asc()).all()
    return [im.image_path for im in imgs]

@router.post(
    "/{event_id}/images",
    response_model=list[str],
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def upload_images(
    event_id: int,
    files: list[UploadFile] = File(..., description="One or more image files"),
    db: Session = Depends(get_db),
):
    ev = db.get(Event, event_id)
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    os.makedirs(MEDIA_DIR, exist_ok=True)
    saved: list[EventImage] = []
    for uf in files:
        original = uf.filename or ""
        ext = os.path.splitext(original)[1].lower() or ".jpg"
        fname = f"{uuid.uuid4().hex}{ext}"
        path = os.path.join(MEDIA_DIR, fname)
        with open(path, "wb") as f:
            f.write(uf.file.read())
        im = EventImage(event_id=event_id, image_path=f"/media/{fname}")
        db.add(im)
        saved.append(im)
    db.commit()
    return [im.image_path for im in saved]

@router.delete(
    "/{event_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def delete_image(event_id: int, image_id: int, db: Session = Depends(get_db)):
    im = db.get(EventImage, image_id)
    if not im or im.event_id != event_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    db.delete(im)
    db.commit()
    return None