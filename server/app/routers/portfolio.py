from fastapi import APIRouter

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

# temporary in-memory data
FAKE_PORTFOLIO = [
    {"id": 1, "title": "Untitled I", "year": 2023, "medium": "Oil on canvas"},
    {"id": 2, "title": "Untitled II", "year": 2024, "medium": "Acrylic on canvas"},
    {"id": 3, "title": "Study", "year": 2022, "medium": "Charcoal on paper"},
]

@router.get("")
def list_items():
    return FAKE_PORTFOLIO