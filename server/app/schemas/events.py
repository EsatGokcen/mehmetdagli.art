from pydantic import BaseModel

class EventBase(BaseModel):
    title: str
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    details: str | None = None

class EventCreate(EventBase): pass
class EventUpdate(EventBase): pass

class EventOut(EventBase):
    id: int
    class Config:
        from_attributes = True