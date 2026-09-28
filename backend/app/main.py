"""
ResearchLens — FastAPI Application Entry Point

AI-Powered Bibliometric and Research Discovery Platform.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router as api_router
from app.database.connection import connect_db, close_db


# ── Lifespan ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    # Startup
    try:
        await connect_db()
        print(f"[OK] MongoDB connected ({settings.MONGODB_URI})")
    except Exception as exc:
        # Allow the app to start even without Mongo for Phase 1
        print(f"[WARN] MongoDB not available - skipping ({exc})")
    yield
    # Shutdown
    await close_db()
    print("[OK] MongoDB connection closed")


# ── App Factory ─────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-Powered Bibliometric and Research Discovery Platform — "
        "backend API for collecting, analysing, and visualising scientific "
        "paper data sourced from OpenAlex."
    ),
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──────────────────────────────────────────────
app.include_router(api_router, prefix="/api")


# ── Dev Entry Point ─────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True,
    )
