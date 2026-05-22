"""
Image preprocessing — FakeProof Labs

Matches EXACTLY the training notebook (Training.ipynb Cell 13):

    def preprocess_image(img_path):
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)          # float32, [0, 255]
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0                # normalise to [0, 1]
        return img_array

Key facts:
  - target_size = (224, 224)
  - colour mode = RGB  (Keras default for load_img)
  - normalisation = divide by 255.0  (NOT ImageNet mean/std)
  - output dtype = float32
  - output shape = (1, 224, 224, 3)
"""

import numpy as np
from PIL import Image
from pathlib import Path
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """
    Preprocessing pipeline that exactly replicates the training notebook.
    """

    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        self.target_size = target_size  # (height, width)

    def preprocess(self, image_path: Path) -> Optional[np.ndarray]:
        """
        Full pipeline: load → RGB → resize → float32 → /255 → add batch dim.

        Returns (1, H, W, 3) float32 array with values in [0, 1],
        or None on failure.
        """
        try:
            # ── Load & convert to RGB ─────────────────────────────────────────
            img = Image.open(image_path)
            if img.mode != "RGB":
                logger.debug(f"Converting image from {img.mode} to RGB")
                img = img.convert("RGB")

            # ── Resize (matches target_size=(224,224) in load_img) ────────────
            # PIL resize takes (width, height); target_size is (height, width)
            pil_size = (self.target_size[1], self.target_size[0])  # (W, H)
            img = img.resize(pil_size, Image.Resampling.LANCZOS)

            # ── To numpy float32 ──────────────────────────────────────────────
            # Keras img_to_array returns float32 in [0, 255]
            arr = np.array(img, dtype=np.float32)   # (H, W, 3), [0, 255]

            # ── Normalise to [0, 1] ───────────────────────────────────────────
            arr = arr / 255.0                        # (H, W, 3), [0, 1]

            # ── Add batch dimension ───────────────────────────────────────────
            arr = np.expand_dims(arr, axis=0)        # (1, H, W, 3)

            logger.info(
                f"Preprocessed: shape={arr.shape}  "
                f"dtype={arr.dtype}  "
                f"min={arr.min():.4f}  "
                f"max={arr.max():.4f}  "
                f"mean={arr.mean():.4f}"
            )
            return arr

        except Exception as exc:
            logger.error(f"Preprocessing failed for {image_path}: {exc}")
            return None
