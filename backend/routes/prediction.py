"""
Prediction routes — FakeProof Labs
Image upload → CNN inference → Grad-CAM → Gemini explanation → enriched response.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pathlib import Path
from datetime import datetime, timezone
import asyncio
import shutil
import logging
import time
from typing import Dict
import uuid

from config.settings import settings
from services.model_service import model_service
from services.gemini_service import gemini_service
from services.gradcam_service import gradcam_service
from services.heatmap_service import heatmap_service
from utils.image_preprocessing import ImagePreprocessor

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Prediction"])

preprocessor = ImagePreprocessor(target_size=settings.IMAGE_SIZE)


# ── POST /api/predict ─────────────────────────────────────────────────────────

@router.post("/predict", response_model=Dict, status_code=status.HTTP_200_OK)
async def predict_deepfake(file: UploadFile = File(...)):
    """
    Full forensic analysis pipeline.

    Steps
    -----
    1. Validate & save file
    2. Preprocess image
    3. CNN inference
    4. Grad-CAM heatmap generation (non-fatal)
    5. Gemini AI explanation (non-fatal)
    6. Return enriched JSON

    Response
    --------
    {
        "prediction":      "Fake" | "Real",
        "confidence":      float,
        "processing_time": float,          # ms
        "ai_analysis":     str,
        "gemini_powered":  bool,
        "gradcam_score":   int | null,     # 0–100 AI attention score
        "heatmap_image":   str | null,     # base64 PNG — colourised heatmap
        "overlay_image":   str | null,     # base64 PNG — original + heatmap blend
        "original_image":  str | null,     # base64 PNG — original resized
        "status":          "success"
    }
    """

    # ── Guard: model must be loaded ───────────────────────────────────────────
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "The deepfake detection model is not loaded. "
                f"Reason: {model_service.load_error or 'unknown'}. "
                "Please check the server logs and ensure a valid model file exists."
            ),
        )

    # ── Validate extension ────────────────────────────────────────────────────
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file_extension}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = settings.UPLOAD_DIR / unique_filename

    try:
        # ── Save temporarily ──────────────────────────────────────────────────
        with file_path.open("wb") as buf:
            shutil.copyfileobj(file.file, buf)

        if file_path.stat().st_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum: {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB",
            )

        # ── Preprocess ────────────────────────────────────────────────────────
        preprocessed = preprocessor.preprocess(file_path)
        if preprocessed is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not process the image. Please upload a valid image (JPEG, PNG, or WebP).",
            )

        # ── CNN Inference ─────────────────────────────────────────────────────
        t0 = time.perf_counter()
        model_result = model_service.predict(
            preprocessed,
            confidence_threshold=settings.CONFIDENCE_THRESHOLD,
        )
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)

        prediction = model_result["prediction"]
        confidence = model_result["confidence"]
        raw_score  = model_result["raw_score"]

        # ── Grad-CAM (run in thread pool — CPU-bound TF ops) ──────────────────
        gradcam_score  = None
        heatmap_b64    = None
        overlay_b64    = None
        original_b64   = None

        try:
            loop = asyncio.get_event_loop()

            # Determine target class: 0 = fake, 1 = real (matches training)
            target_class = 1 if prediction == "Real" else 0

            heatmap = await loop.run_in_executor(
                None,
                lambda: gradcam_service.generate(
                    model_service._model,
                    preprocessed,
                    target_class_index=target_class,
                    invert_labels=model_service.invert_labels,
                ),
            )

            if heatmap is not None:
                logger.info("Heatmap generated")
                gradcam_score = gradcam_service.compute_attention_score(heatmap)

                output_size = (settings.IMAGE_SIZE[1], settings.IMAGE_SIZE[0])  # (W, H)

                heatmap_b64  = await loop.run_in_executor(
                    None,
                    lambda: heatmap_service.heatmap_to_base64(heatmap, output_size),
                )
                overlay_b64  = await loop.run_in_executor(
                    None,
                    lambda: heatmap_service.overlay_to_base64(file_path, heatmap, alpha=0.45, output_size=output_size),
                )
                logger.info("Overlay generated")
                
                original_b64 = await loop.run_in_executor(
                    None,
                    lambda: heatmap_service.original_to_base64(file_path, output_size),
                )
                
                logger.info("Base64 encoding completed")
                logger.info(f"Grad-CAM complete  score={gradcam_score}")
            else:
                logger.warning("Grad-CAM returned None — skipping visualisation.")

        except Exception as gc_exc:
            import traceback
            tb = traceback.format_exc()
            logger.error(
                f"Grad-CAM pipeline failed (non-fatal) due to exception.\n"
                f"Exception type: {type(gc_exc).__name__}\n"
                f"Exception details: {gc_exc}\n"
                f"Traceback:\n{tb}"
            )

        # ── Gemini explanation ────────────────────────────────────────────────
        ai_analysis = await gemini_service.generate_explanation(
            prediction=prediction,
            confidence=confidence,
        )

        # ── Build response ────────────────────────────────────────────────────
        response = {
            "prediction":      prediction,
            "confidence":      confidence,
            "processing_time": elapsed_ms,
            "ai_analysis":     ai_analysis,
            "gemini_powered":  gemini_service.is_ready,
            "gradcam_score":   gradcam_score,
            "heatmap_image":   heatmap_b64,
            "overlay_image":   overlay_b64,
            "original_image":  original_b64,
            "status":          "success",
        }
        logger.info("Response payload generated")

        logger.info(
            f"Analysis complete: {prediction} ({confidence}%)  "
            f"time={elapsed_ms}ms  gradcam={gradcam_score}  gemini={gemini_service.is_ready}"
        )
        return response

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Prediction error: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error during prediction: {exc}",
        )
    finally:
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as exc:
                logger.warning(f"Could not delete temp file {unique_filename}: {exc}")


# ── GET /api/health ───────────────────────────────────────────────────────────

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Structured health check for FakeProof Labs platform."""
    model_ok = model_service.is_loaded
    return {
        "status":           "healthy" if model_ok else "degraded",
        "backend":          True,
        "model_loaded":     model_ok,
        "model_error":      model_service.load_error,
        "gemini_available": gemini_service.is_ready,
        "gradcam_available": model_ok,   # Grad-CAM requires the model
        "timestamp":        datetime.now(timezone.utc).isoformat(),
        "version":          settings.API_VERSION,
    }
