"""
Configuration settings for the Deepfake Detection API
Centralized configuration management for scalability
"""

from pydantic_settings import BaseSettings
from pathlib import Path
from typing import Optional

from .constants import CONFIDENCE_THRESHOLD as CONST_CONFIDENCE_THRESHOLD
from .constants import IMAGE_SIZE as CONST_IMAGE_SIZE

class Settings(BaseSettings):
    # API Configuration
    API_TITLE: str = "FakeProof Labs API"
    API_VERSION: str = "2.0.0"
    API_DESCRIPTION: str = "FakeProof Labs — AI-powered forensic media authenticity platform"

    # CORS Configuration
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # Alternative React port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Model Configuration
    MODEL_PATH: Path = Path(__file__).parent.parent.parent / "models" / "best_model.h5"

    IMAGE_SIZE: tuple[int, int] = CONST_IMAGE_SIZE

    # Upload Configuration
    UPLOAD_DIR: Path = Path(__file__).parent.parent / "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    # Allow webp to match frontend accepted types
    ALLOWED_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png", ".webp"}

    # Model Inference Configuration
    CONFIDENCE_THRESHOLD: float = CONST_CONFIDENCE_THRESHOLD

    # ── Label inversion ──────────────────────────────────────────────────────
    # The training notebook maps: score > 0.5 → Real, score <= 0.5 → Fake.
    # If the saved checkpoint has an inverted mapping (high scores = Fake),
    # set INVERT_LABELS=True in .env to flip the interpretation.
    # Run backend/utils/model_diagnostics.py to determine the correct value.
    INVERT_LABELS: bool = False   # CORRECTED: Use notebook mapping directly

    # ── Gemini / Google AI Studio ────────────────────────────────────────────
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL:   str           = "gemini-1.5-flash"
    # Set to False to disable Gemini even when the key is present
    GEMINI_ENABLED: bool          = True

    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()

# Create upload directory if it doesn't exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)