import os, time
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/api/social", tags=["social"]) 

INSTAGRAM_TOKEN = os.getenv("INSTAGRAM_TOKEN", "").strip()
CACHE_TTL = 300  # seconds
_cache: Dict[str, Any] = {"ts": 0, "data": []}

@router.get("/instagram")
async def instagram_feed(limit: int = 12) -> List[Dict[str, Any]]:
    """
    Returns a list of Instagram media objects (images & videos) using
    the Instagram Basic Display API and a long-lived token.
    Fields: id, media_type (IMAGE/VIDEO/CAROUSEL_ALBUM), media_url, thumbnail_url, permalink, caption, timestamp
    """
    if not INSTAGRAM_TOKEN:
        # If token is not configured, return empty list rather than 500
        return []

    now = time.time()
    if now - _cache["ts"] < CACHE_TTL and _cache["data"]:
        return _cache["data"][:limit]

    url = "https://graph.instagram.com/me/media"
    params = {
        "fields": "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp",
        "access_token": INSTAGRAM_TOKEN,
        "limit": min(limit, 25),
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json().get("data", [])
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Instagram API error: {e}")

    # Basic Display API returns VIDEOS with media_url = mp4; CAROUSEL has first child via separate call (skipped here)
    # For simplicity, keep CAROUSEL_ALBUM items as-is; media_url is usually the first image.
    _cache["data"] = data
    _cache["ts"] = now
    return data[:limit]