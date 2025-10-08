from typing import Annotated
from pydantic import BaseModel, Field, StringConstraints

Title = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

class ArtworkBase(BaseModel):
    title: Title
    year: int | None = Field(default=None, ge=0, le=2100)
    medium: str | None = None
    price: float | None = Field(default=None, ge=0)
    available: bool = True
    description: str | None = None

class ArtworkCreate(ArtworkBase):
    pass

class ArtworkUpdate(ArtworkBase):
    pass

class ArtworkOut(ArtworkBase):
    id: int
    image_path: str | None = None

    class Config:
        from_attributes = True