from pydantic import BaseModel

class ArtworkBase(BaseModel):
    title: str
    year: int | None = None
    medium: str | None = None
    price: float | None = None
    available: bool = True
    description: str | None = None

class ArtworkCreate(ArtworkBase): pass

class ArtworkUpdate(ArtworkBase): pass

class ArtworkOut(ArtworkBase):
    id: int
    image_path: str | None = None
    class Config:
        from_attributes = True
