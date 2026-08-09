"""
FakeProof Labs — FastAPI application entry point. 
Configures CORS, structured startup logging, and route registration.
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from routes.prediction import router as prediction_router
from services.gemini_service import gemini_service
from services.model_service import model_service

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    _banner("FakeProof Labs — AI Forensic Platform — Starting Up")

    # ── TensorFlow model ──────────────────────────────────────────────────────
    logger.info(f"Model path : {settings.MODEL_PATH}")
    logger.info(f"Invert labels: {settings.INVERT_LABELS}")
    model_ok = model_service.load_model(
        settings.MODEL_PATH,
        invert_labels=settings.INVERT_LABELS,
    )

    if model_ok:
        logger.info("✅ TensorFlow model loaded — prediction endpoint is READY.")
    else:
        logger.error(
            "❌ TensorFlow model FAILED to load.\n"
            f"   Reason : {model_service.load_error}\n"
            "   The /api/predict endpoint will return HTTP 503 until the model is fixed.\n"
            "   The rest of the API (health check, etc.) will continue to work."
        )

    # ── Gemini AI ─────────────────────────────────────────────────────────────
    if settings.GEMINI_ENABLED and settings.GEMINI_API_KEY:
        gemini_ok = gemini_service.initialise(
            api_key=settings.GEMINI_API_KEY,
            model_name=settings.GEMINI_MODEL,
        )
        if gemini_ok:
            logger.info("✅ Gemini AI explanation service is ACTIVE.")
        else:
            logger.warning(
                "⚠️  Gemini initialisation failed — "
                "static fallback explanations will be used."
            )
    else:
        logger.info(
            "ℹ️  Gemini disabled (GEMINI_ENABLED=False or GEMINI_API_KEY not set). "
            "Static fallback explanations will be used."
        )

    _banner("Startup complete — API is listening")
    yield
    logger.info("FakeProof Labs API shutting down…")


# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    lifespan=lifespan,
)

# ── CORS Setup ────────────────────────────────────────────────────────────────
allowed_origins = list(settings.ALLOWED_ORIGINS)
if settings.PRODUCTION_FRONTEND_URLS:
    extra_origins = [
        origin.strip()
        for origin in settings.PRODUCTION_FRONTEND_URLS.split(",")
        if origin.strip()
    ]
    allowed_origins.extend(extra_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(prediction_router)


@app.get("/")
async def root():
    return {
        "message": "FakeProof Labs — AI Forensic Media Authenticity Platform",
        "version": settings.API_VERSION,
        "status":  "running",
        "docs":    "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": model_service.is_loaded
    }



# ── Helpers ───────────────────────────────────────────────────────────────────

def _banner(text: str) -> None:
    bar = "─" * 60
    logger.info(bar)
    logger.info(f"  {text}")
    logger.info(bar)


# ── Dev entry-point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
