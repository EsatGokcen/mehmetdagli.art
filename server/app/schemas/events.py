from typing import Annotated
from pydantic import BaseModel, Field, StringConstraints

Title = Annotated[str, StringConstraints(min_length=1, strip_whitespace=True)]

class EventBase(BaseModel):
    title: Title
    location: str | None = None
    start_date: str | None = None  # ISO date string (YYYY-MM-DD)
    end_date: str | None = None
    details: str | None = None

class EventCreate(EventBase):
    pass

class EventUpdate(EventBase):
    pass

class EventOut(EventBase):
    id: int

    class Config:
        from_attributes = True