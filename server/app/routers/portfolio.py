import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import Artwork
from app.schemas.portfolio import ArtworkCreate, ArtworkUpdate, ArtworkOut
from app.core.security import require_admin, require_csrf

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

MEDIA_DIR = "app/media"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _remove_media_file(image_path: str) -> None:
    """
    Best-effort deletion of a file under app/media for paths like '/media/<name.ext>'.
    Won't raise if the file doesn't exist.
    """
    if not image_path:
        return
    fname = os.path.basename(image_path)
    if not fname:
        return
    fs_path = os.path.join(MEDIA_DIR, fname)
    try:
        if os.path.exists(fs_path):
            os.remove(fs_path)
    except Exception:
        # Don't fail API call if filesystem delete has an issue
        pass

@router.get("", response_model=list[ArtworkOut])
def list_items(
    db: Session = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    q: str | None = Query(None, description="search title/medium/description"),
    available: bool | None = Query(None),
):
    query = db.query(Artwork)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Artwork.title.ilike(like)) |
            (Artwork.medium.ilike(like)) |
            (Artwork.description.ilike(like))
        )
    if available is not None:
        query = query.filter(Artwork.available == available)
    return (
        query.order_by(Artwork.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.post(
    "",
    response_model=ArtworkOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def create_item(payload: ArtworkCreate, db: Session = Depends(get_db)):
    item = Artwork(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put(
    "/{item_id}",
    response_model=ArtworkOut,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def update_item(item_id: int, payload: ArtworkUpdate, db: Session = Depends(get_db)):
    item = db.get(Artwork, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    for k, v in payload.model_dump().items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Artwork, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    # remove image from disk if present
    if item.image_path:
        _remove_media_file(item.image_path)

    db.delete(item)
    db.commit()
    return None

# ------- Image upload/replace -------

@router.post(
    "/{item_id}/image",
    response_model=ArtworkOut,
    dependencies=[Depends(require_admin), Depends(require_csrf)],
)
def upload_image(item_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    item = db.get(Artwork, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    os.makedirs(MEDIA_DIR, exist_ok=True)

    original = file.filename or ""
    ext = os.path.splitext(original)[1].lower() or ".jpg"
    fname = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(MEDIA_DIR, fname)

    # write new file to disk
    with open(path, "wb") as f:
        f.write(file.file.read())

    # swap image in DB
    old_path = item.image_path
    item.image_path = f"/media/{fname}"
    db.add(item)
    db.commit()
    db.refresh(item)

    # now safely remove the old file (best-effort)
    if old_path:
        _remove_media_file(old_path)

    return item