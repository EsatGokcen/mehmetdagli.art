import os, uuid
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models import Artwork
from app.schemas.portfolio import ArtworkCreate, ArtworkUpdate, ArtworkOut
from app.core.security import require_admin

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=list[ArtworkOut])
def list_items(db: Session = Depends(get_db)):
    return db.query(Artwork).order_by(Artwork.id.desc()).all()

@router.post("", response_model=ArtworkOut, dependencies=[Depends(require_admin)])
def create_item(payload: ArtworkCreate, db: Session = Depends(get_db)):
    item = Artwork(**payload.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.put("/{item_id}", response_model=ArtworkOut, dependencies=[Depends(require_admin)])
def update_item(item_id: int, payload: ArtworkUpdate, db: Session = Depends(get_db)):
    item = db.get(Artwork, item_id)
    if not item: raise ValueError("Not found")
    for k, v in payload.model_dump().items():
        setattr(item, k, v)
    db.commit(); db.refresh(item)
    return item

@router.delete("/{item_id}", dependencies=[Depends(require_admin)])
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Artwork, item_id)
    if item: 
        db.delete(item); db.commit()
    return {"ok": True}

# Image upload
MEDIA_DIR = "app/media"

@router.post("/{item_id}/image", response_model=ArtworkOut, dependencies=[Depends(require_admin)])
def upload_image(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    os.makedirs(MEDIA_DIR, exist_ok=True)

    # handle missing/None filename gracefully
    original = file.filename or ""
    ext = os.path.splitext(original)[1].lower() or ".jpg"

    fname = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(MEDIA_DIR, fname)

    with open(path, "wb") as f:
        f.write(file.file.read())

    item = db.get(Artwork, item_id)
    if not item:
        raise ValueError("Not found")
    item.image_path = f"/media/{fname}"
    db.commit()
    db.refresh(item)
    return item