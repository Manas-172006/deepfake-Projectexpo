"""
Model service — FakeProof Labs
Singleton TensorFlow model loader and inference engine.

Training notebook facts (verified from Training.ipynb):
────────────────────────────────────────────────────────
  Dataset   : 140k-real-and-fake-faces (Kaggle)
  class_indices : {'fake': 0, 'real': 1}   ← alphabetical Keras assignment
  Preprocessing : rescale=1./255, target_size=(224,224), RGB
  Architecture  : Sequential CNN, final Dense(1, activation='sigmoid')
  Loss          : binary_crossentropy
  Saved as      : models/best_model.h5  (ModelCheckpoint, best val_accuracy)

  Notebook get_prediction (Cell 13):
      pred = model.predict(img_array)[0][0]
      label = "REAL" if pred > 0.5 else "FAKE"
      confidence = pred if pred > 0.5 else 1 - pred

  Therefore the CANONICAL mapping is:
      sigmoid score > 0.5  →  REAL  (class 1)
      sigmoid score <= 0.5 →  FAKE  (class 0)

IMPORTANT — inverted-label detection:
  Some saved checkpoints (especially early ones) may have learned an
  inverted mapping where high scores correspond to FAKE images.
  The INVERT_LABELS setting in .env lets you flip the interpretation
  without retraining.  Set INVERT_LABELS=True if obviously fake images
  are being classified as Real.
"""

import tensorflow as tf
import numpy as np
from pathlib import Path
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

_MIN_MODEL_BYTES = 1024  # anything smaller is a placeholder


class ModelService:
    """
    Singleton service for the TensorFlow deepfake detection model.
    Loads once at startup; all requests share the same in-memory model.
    """

    _instance    = None
    _model       = None
    _load_error: Optional[str] = None
    _invert_labels: bool = False   # set via settings.INVERT_LABELS

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    # ── public API ────────────────────────────────────────────────────────────

    def load_model(self, model_path: Path, invert_labels: bool = False) -> bool:
        """
        Validate and load the Keras model.

        Parameters
        ----------
        model_path     : path to the .h5 / .keras file
        invert_labels  : if True, flip the sigmoid interpretation
                         (high score → Fake instead of Real)
        """
        if self._model is not None:
            logger.info("Model already loaded — skipping.")
            return True

        self._load_error   = None
        self._invert_labels = invert_labels

        # ── 1. Existence ──────────────────────────────────────────────────────
        if not model_path.exists():
            self._load_error = f"Model file not found: {model_path}"
            logger.error(f"❌ {self._load_error}")
            self._log_search_hint(model_path)
            return False

        # ── 2. Size ───────────────────────────────────────────────────────────
        file_size = model_path.stat().st_size
        logger.info(f"Model file: {model_path}  ({file_size:,} bytes)")

        if file_size < _MIN_MODEL_BYTES:
            self._load_error = (
                f"Model file is only {file_size} bytes — "
                "this is a placeholder, not a real model. "
                "Replace it with the actual trained .h5 file."
            )
            logger.error(f"❌ {self._load_error}")
            return False

        # ── 3. Extension ──────────────────────────────────────────────────────
        suffix = model_path.suffix.lower()
        if suffix not in {".h5", ".keras"}:
            self._load_error = f"Unexpected extension '{suffix}'. Expected .h5 or .keras."
            logger.error(f"❌ {self._load_error}")
            return False

        # ── 4. TensorFlow load ────────────────────────────────────────────────
        logger.info("Loading model with TensorFlow/Keras…")
        model = self._try_load(model_path, compile=True)
        if model is None:
            logger.warning("Standard load failed — retrying without compile…")
            model = self._try_load(model_path, compile=False)
        if model is None:
            return False

        self._model = model
        
        # ── Mandatory Logging ──────────────────────────────────────────────────
        logger.info("Model loaded successfully")
        logger.info(f"TensorFlow version: {tf.__version__}")
        keras_version = tf.keras.__version__ if hasattr(tf.keras, "__version__") else "unknown"
        logger.info(f"Keras version: {keras_version}")
        
        try:
            logger.info(f"Model input tensor: {self._model.input}")
        except Exception as e:
            logger.info(f"Model input tensor (dynamic shape check): {self._model.input_shape}")
            
        try:
            logger.info(f"Model output tensor: {self._model.output}")
        except Exception as e:
            logger.info(f"Model output tensor (dynamic shape check): {self._model.output_shape}")
        # ──────────────────────────────────────────────────────────────────────

        logger.info(f"   Input  shape  : {self._model.input_shape}")
        logger.info(f"   Output shape  : {self._model.output_shape}")
        logger.info("   Class mapping : 0=Fake, 1=Real")
        logger.info(f"   Label mapping : {'INVERTED (high→Fake)' if invert_labels else 'STANDARD (high→Real)'}")
        logger.info(
            "   Canonical mapping from notebook: "
            "score>0.5 → Real, score<=0.5 → Fake"
        )
        if invert_labels:
            logger.warning(
                "⚠️  INVERT_LABELS=True — predictions are flipped. "
                "Use this only if the model consistently misclassifies obvious fakes as real."
            )

        # ── 5. Warm-up pass (builds graph, surfaces shape errors early) ───────
        try:
            dummy = np.zeros((1, *self._model.input_shape[1:]), dtype=np.float32)
            warm_score = float(self._model.predict(dummy, verbose=0)[0][0])
            logger.info(f"   Warm-up score (black image): {warm_score:.6f}")
        except Exception as exc:
            logger.warning(f"Warm-up pass failed (non-fatal): {exc}")

        self._log_inference_diagnostics()
        return True

    def _log_inference_diagnostics(self) -> None:
        """Run quick synthetic inference checks and log raw sigmoid scores."""
        try:
            tests = {
                "Black (zeros)": np.zeros((1, 224, 224, 3), dtype=np.float32),
                "White (ones)": np.ones((1, 224, 224, 3), dtype=np.float32),
                "Random noise": np.random.default_rng(42).uniform(0.0, 1.0, (1, 224, 224, 3)).astype(np.float32),
            }
            for name, arr in tests.items():
                score = float(self._model.predict(arr, verbose=0)[0][0])
                label = "REAL" if score > 0.5 else "FAKE"
                logger.info(f"   Diagnostic {name}: raw_score={score:.6f} -> {label}")
        except Exception as exc:
            logger.warning(f"Diagnostic inference failed: {exc}")

    def predict(
        self,
        preprocessed_image: np.ndarray,
        confidence_threshold: float = 0.5,
    ) -> Dict:
        """
        Run inference on a preprocessed image batch.

        Canonical mapping (from Training.ipynb Cell 13):
            sigmoid score > threshold  →  Real
            sigmoid score <= threshold →  Fake

        If self._invert_labels is True, the mapping is flipped:
            sigmoid score > threshold  →  Fake
            sigmoid score <= threshold →  Real

        Returns
        -------
        {
            'prediction' : 'Real' | 'Fake',
            'confidence' : float  (0–100, 2 dp),
            'raw_score'  : float  (0–1,   4 dp),
            'is_fake'    : bool,
        }
        """
        if self._model is None:
            raise RuntimeError(
                f"Model not loaded. Error: {self._load_error or 'unknown'}"
            )

        # ── Inference ─────────────────────────────────────────────────────────
        raw_output = self._model.predict(preprocessed_image, verbose=0)
        raw_score  = float(raw_output[0][0])

        logger.debug(f"Raw sigmoid output: {raw_score:.6f}")
        logger.info(
            f"Preprocessing check — "
            f"input shape={preprocessed_image.shape}  "
            f"dtype={preprocessed_image.dtype}  "
            f"min={preprocessed_image.min():.4f}  "
            f"max={preprocessed_image.max():.4f}"
        )

        # ── Label mapping ─────────────────────────────────────────────────────
        if not self._invert_labels:
            # Standard: score > threshold → Real  (matches notebook)
            is_real = raw_score > confidence_threshold
        else:
            # Inverted: score > threshold → Fake
            is_real = raw_score <= confidence_threshold

        is_fake    = not is_real
        confidence = raw_score if is_real else (1.0 - raw_score)

        result = {
            "prediction" : "Real" if is_real else "Fake",
            "confidence" : round(confidence * 100, 2),
            "raw_score"  : round(raw_score, 4),
            "is_fake"    : is_fake,
        }

        logger.info(
            f"Prediction: {result['prediction']}  "
            f"confidence={result['confidence']}%  "
            f"raw_score={raw_score:.6f}  "
            f"threshold={confidence_threshold}  "
            f"inverted={self._invert_labels}"
        )
        return result

    # ── properties ────────────────────────────────────────────────────────────

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def load_error(self) -> Optional[str]:
        return self._load_error

    @property
    def invert_labels(self) -> bool:
        return self._invert_labels

    # ── private helpers ───────────────────────────────────────────────────────

    def _try_load(self, path: Path, compile: bool) -> Optional[object]:
        try:
            return tf.keras.models.load_model(str(path), compile=compile)
        except Exception as exc:
            self._load_error = str(exc)
            logger.error(f"TF load error (compile={compile}): {exc}")
            return None

    @staticmethod
    def _log_search_hint(missing_path: Path) -> None:
        root  = missing_path.parent.parent.parent
        found = list(root.rglob("*.h5")) + list(root.rglob("*.keras"))
        if found:
            logger.info("Hint — model files found in project tree:")
            for f in found:
                logger.info(f"   {f}  ({f.stat().st_size:,} bytes)")
        else:
            logger.info("Hint — no .h5 or .keras files found under project root.")


# Global singleton
model_service = ModelService()
