"""
verify_gradcam.py — FakeProof Labs
Grad-CAM pipeline verification utility.
Performs model inference on an image and saves the original, heatmap, and overlay images.
"""

import sys
import argparse
import base64
import logging
from pathlib import Path
import numpy as np

# Add backend directory to system path to enable imports
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from config.settings import settings
from services.model_service import model_service
from services.gradcam_service import gradcam_service
from services.heatmap_service import heatmap_service
from utils.image_preprocessing import ImagePreprocessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s — %(levelname)s — %(message)s")
logger = logging.getLogger(__name__)

def verify(image_path_str: str):
    image_path = Path(image_path_str)
    if not image_path.exists():
        logger.error(f"Image file does not exist: {image_path}")
        sys.exit(1)

    # 1. Load Model
    logger.info(f"Loading TensorFlow model from settings: {settings.MODEL_PATH}")
    model_loaded = model_service.load_model(settings.MODEL_PATH, settings.INVERT_LABELS)
    if not model_loaded:
        logger.error(f"Failed to load TensorFlow model: {model_service.load_error}")
        sys.exit(1)
    logger.info("Model loaded successfully.")

    # 2. Preprocess Image
    preprocessor = ImagePreprocessor(target_size=settings.IMAGE_SIZE)
    preprocessed = preprocessor.preprocess(image_path)
    if preprocessed is None:
        logger.error("Could not preprocess image. Ensure it is a valid JPEG/PNG/WebP.")
        sys.exit(1)
    logger.info(f"Image preprocessed successfully. Tensor shape: {preprocessed.shape}")

    # 3. Model Inference
    logger.info("Running model inference...")
    pred_res = model_service.predict(preprocessed, settings.CONFIDENCE_THRESHOLD)
    logger.info(f"Prediction: {pred_res['prediction']} (Confidence: {pred_res['confidence']}%, Raw Score: {pred_res['raw_score']:.6f})")

    # 4. Grad-CAM Computation
    logger.info("Computing Grad-CAM gradients...")
    target_class = 1 if pred_res['prediction'] == "Real" else 0
    heatmap = gradcam_service.generate(
        model_service._model,
        preprocessed,
        target_class_index=target_class,
        invert_labels=model_service.invert_labels
    )

    if heatmap is None:
        logger.error("Grad-CAM generation returned None.")
        sys.exit(1)

    gradcam_score = gradcam_service.compute_attention_score(heatmap)
    logger.info(f"Grad-CAM Attention Score: {gradcam_score}/100")

    # 5. Generate Images
    logger.info("Generating base64 maps...")
    output_size = (settings.IMAGE_SIZE[1], settings.IMAGE_SIZE[0])
    original_b64 = heatmap_service.original_to_base64(image_path, output_size)
    heatmap_b64 = heatmap_service.heatmap_to_base64(heatmap, output_size)
    overlay_b64 = heatmap_service.overlay_to_base64(image_path, heatmap, alpha=0.45, output_size=output_size)

    # 6. Save Debug Images
    debug_dir = backend_dir / "debug_gradcam"
    debug_dir.mkdir(exist_ok=True)
    logger.info(f"Saving output files to: {debug_dir}")

    with open(debug_dir / "original.png", "wb") as f:
        f.write(base64.b64decode(original_b64))
    with open(debug_dir / "heatmap.png", "wb") as f:
        f.write(base64.b64decode(heatmap_b64))
    with open(debug_dir / "overlay.png", "wb") as f:
        f.write(base64.b64decode(overlay_b64))

    logger.info("Saved original.png")
    logger.info("Saved heatmap.png")
    logger.info("Saved overlay.png")
    logger.info("Grad-CAM verification completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify Grad-CAM on a test image.")
    parser.add_argument("--image", type=str, required=True, help="Path to input image file.")
    args = parser.parse_args()
    verify(args.image)
