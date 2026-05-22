"""
Heatmap Service — FakeProof Labs
Converts raw Grad-CAM float arrays into colourised PNG images
and blended overlay composites, returned as base64-encoded strings.
"""

import base64
import io
import logging
from typing import Optional, Tuple

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# Jet-like colour map: maps [0, 1] → (R, G, B) uint8
# Sampled from matplotlib's 'jet' at 256 points — no matplotlib dependency needed.
_JET_COLOURS = np.array([
    [  0,   0, 143], [  0,   0, 159], [  0,   0, 175], [  0,   0, 191],
    [  0,   0, 207], [  0,   0, 223], [  0,   0, 239], [  0,   0, 255],
    [  0,  16, 255], [  0,  32, 255], [  0,  48, 255], [  0,  64, 255],
    [  0,  80, 255], [  0,  96, 255], [  0, 112, 255], [  0, 128, 255],
    [  0, 144, 255], [  0, 160, 255], [  0, 176, 255], [  0, 192, 255],
    [  0, 208, 255], [  0, 224, 255], [  0, 240, 255], [  0, 255, 255],
    [ 16, 255, 239], [ 32, 255, 223], [ 48, 255, 207], [ 64, 255, 191],
    [ 80, 255, 175], [ 96, 255, 159], [112, 255, 143], [128, 255, 128],
    [143, 255, 112], [159, 255,  96], [175, 255,  80], [191, 255,  64],
    [207, 255,  48], [223, 255,  32], [239, 255,  16], [255, 255,   0],
    [255, 239,   0], [255, 223,   0], [255, 207,   0], [255, 191,   0],
    [255, 175,   0], [255, 159,   0], [255, 143,   0], [255, 128,   0],
    [255, 112,   0], [255,  96,   0], [255,  80,   0], [255,  64,   0],
    [255,  48,   0], [255,  32,   0], [255,  16,   0], [255,   0,   0],
    [239,   0,   0], [223,   0,   0], [207,   0,   0], [191,   0,   0],
    [175,   0,   0], [159,   0,   0], [143,   0,   0], [128,   0,   0],
], dtype=np.uint8)

# Stretch the 64-entry table to 256 entries
_LUT = np.zeros((256, 3), dtype=np.uint8)
for i in range(256):
    idx = int(i / 255 * 63)
    _LUT[i] = _JET_COLOURS[idx]


class HeatmapService:
    """
    Converts Grad-CAM float arrays into base64-encoded PNG images.
    All methods are stateless — no singleton needed, but we keep one for consistency.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    # ── public API ────────────────────────────────────────────────────────────

    def heatmap_to_base64(
        self,
        heatmap: np.ndarray,
        output_size: Tuple[int, int] = (224, 224),
    ) -> Optional[str]:
        """
        Convert a (H, W) float32 heatmap → colourised PNG → base64 string.

        Parameters
        ----------
        heatmap     : (H, W) float32 array, values in [0, 1]
        output_size : (width, height) of the output PNG

        Returns
        -------
        base64-encoded PNG string, or None on failure.
        """
        try:
            coloured = self._apply_colormap(heatmap)          # (H, W, 3) uint8
            img = Image.fromarray(coloured, mode="RGB")
            img = img.resize(output_size, Image.Resampling.LANCZOS)
            return self._pil_to_base64(img)
        except Exception as exc:
            logger.error(f"heatmap_to_base64 failed: {exc}")
            return None

    def overlay_to_base64(
        self,
        original_image_path,
        heatmap: np.ndarray,
        alpha: float = 0.45,
        output_size: Tuple[int, int] = (224, 224),
    ) -> Optional[str]:
        """
        Blend the original image with the colourised heatmap → base64 PNG.

        Parameters
        ----------
        original_image_path : Path to the original image file
        heatmap             : (H, W) float32 array, values in [0, 1]
        alpha               : heatmap opacity (0 = original only, 1 = heatmap only)
        output_size         : (width, height) of the output PNG
        """
        try:
            # Load and resize original
            orig = Image.open(original_image_path).convert("RGB")
            orig = orig.resize(output_size, Image.Resampling.LANCZOS)
            orig_arr = np.array(orig, dtype=np.float32)

            # Colourised heatmap resized to match
            coloured = self._apply_colormap(heatmap)
            heat_img = Image.fromarray(coloured, mode="RGB")
            heat_img = heat_img.resize(output_size, Image.Resampling.LANCZOS)
            heat_arr = np.array(heat_img, dtype=np.float32)

            # Alpha blend
            blended = (1 - alpha) * orig_arr + alpha * heat_arr
            blended = np.clip(blended, 0, 255).astype(np.uint8)

            result_img = Image.fromarray(blended, mode="RGB")
            return self._pil_to_base64(result_img)

        except Exception as exc:
            logger.error(f"overlay_to_base64 failed: {exc}")
            return None

    def original_to_base64(
        self,
        image_path,
        output_size: Tuple[int, int] = (224, 224),
    ) -> Optional[str]:
        """Encode the original image as a base64 PNG for the API response."""
        try:
            img = Image.open(image_path).convert("RGB")
            img = img.resize(output_size, Image.Resampling.LANCZOS)
            return self._pil_to_base64(img)
        except Exception as exc:
            logger.error(f"original_to_base64 failed: {exc}")
            return None

    # ── private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _apply_colormap(heatmap: np.ndarray) -> np.ndarray:
        """Map float [0,1] heatmap → uint8 RGB using the jet-like LUT."""
        indices = (np.clip(heatmap, 0, 1) * 255).astype(np.uint8)
        return _LUT[indices]

    @staticmethod
    def _pil_to_base64(img: Image.Image) -> str:
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return base64.b64encode(buf.getvalue()).decode("utf-8")


# Global singleton
heatmap_service = HeatmapService()
