"""
ResearchLens — Core Configuration

Centralised settings loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application-wide settings sourced from env vars."""

    # --- Application ---
    APP_NAME: str = "ResearchLens"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # --- Server ---
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # --- MongoDB ---
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "researchlens"

    # --- OpenAlex ---
    OPENALEX_EMAIL: str = ""

    # --- CORS ---
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
