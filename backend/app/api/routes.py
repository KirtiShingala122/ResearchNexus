"""
ResearchNexus — Health-check & system-info routes.
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["system"])


@router.get("/health")
async def health_check():
    """Return service health status."""
    return {
        "status": "ok",
        "project": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
