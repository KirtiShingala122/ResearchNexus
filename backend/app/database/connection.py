"""
ResearchLens — Database connection manager.

Provides async MongoDB client via Motor.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    """Open the MongoDB connection pool."""
    global _client
    _client = AsyncIOMotorClient(settings.MONGODB_URI)


async def close_db() -> None:
    """Close the MongoDB connection pool."""
    global _client
    if _client is not None:
        _client.close()
        _client = None


def get_database():
    """Return the default database handle."""
    if _client is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _client[settings.MONGODB_DB_NAME]
