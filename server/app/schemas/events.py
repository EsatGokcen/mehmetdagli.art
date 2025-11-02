from typing import Annotated, List
from pydantic import BaseModel, Field, StringConstraints

Title = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

class EventBase(BaseModel):
    title: Title
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    details: str | None = None

class EventCreate(EventBase):
    pass

class EventUpdate(EventBase):
    pass

class EventOut(EventBase):
    id: int
    images: list[str] = []   # keep strings for public pages

    class Config:
        from_attributes = True

# NEW: return IDs for admin fetch/list/upload
class EventImageOut(BaseModel):
    id: int
    image_path: str

    class Config:
        from_attributes = True