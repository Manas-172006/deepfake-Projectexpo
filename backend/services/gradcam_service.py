"""
Grad-CAM Service — FakeProof Labs
Generates Class Activation Maps for neural network explainability.

Algorithm
---------
Grad-CAM (Gradient-weighted Class Activation Mapping):
  1. Forward pass → get final conv layer activations
  2. Backward pass → compute gradients of the class score w.r.t. those activations
  3. Global-average-pool the gradients → per-channel importance weights
  4. Weighted sum of activation maps → raw CAM
  5. ReLU + normalise to [0, 1]

Reference: Selvaraju et al., 2017 — https://arxiv.org/abs/1610.02391
"""

import logging
import numpy as np
from pathlib import Path
from typing import Optional, Tuple, Dict
import tensorflow as tf

logger = logging.getLogger(__name__)


class GradCAMService:
    """
    Singleton Grad-CAM generator.
    Works with any Keras model that has at least one Conv2D layer.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    # ── public API ────────────────────────────────────────────────────────────

    def generate(
        self,
        model: tf.keras.Model,
        preprocessed_image: np.ndarray,
        target_class_index: int = 0,
    ) -> Optional[np.ndarray]:
        """
        Compute a Grad-CAM heatmap for *preprocessed_image*.

        Parameters
        ----------
        model               : loaded Keras model
        preprocessed_image  : (1, H, W, 3) float32 array, values in [0, 1]
        target_class_index  : output neuron index (0 for binary sigmoid)

        Returns
        -------
        heatmap : (H, W) float32 array, values in [0, 1], or None on failure

        Note
        ----
        Uses conv2d_3 as the last conv layer (from Training.ipynb).
        For binary classification, we compute gradients of the raw sigmoid output.
        """
        try:
            last_conv = self._find_last_conv_layer(model)
            if last_conv is None:
                logger.warning("No Conv2D layer found — Grad-CAM unavailable.")
                return None

            logger.info(
                f"Grad-CAM using layer: {last_conv.name} "
                f"(expected: conv2d_3 from notebook)"
            )

            # Build a sub-model that outputs (conv_activations, predictions)
            grad_model = tf.keras.Model(
                inputs=model.inputs,
                outputs=[last_conv.output, model.output],
            )

            img_tensor = tf.cast(preprocessed_image, tf.float32)

            with tf.GradientTape() as tape:
                tape.watch(img_tensor)
                conv_outputs, predictions = grad_model(img_tensor, training=False)

                # For binary sigmoid: use the raw output score
                # For multi-class softmax: use predictions[:, target_class_index]
                if predictions.shape[-1] == 1:
                    class_score = predictions[:, 0]
                else:
                    class_score = predictions[:, target_class_index]

            # Gradients of class score w.r.t. conv feature maps
            grads = tape.gradient(class_score, conv_outputs)  # (1, h, w, C)

            if grads is None:
                logger.warning("Gradient tape returned None — model may not be differentiable.")
                return None

            # Global average pooling over spatial dims → (C,)
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

            # Weight each channel by its importance
            conv_outputs = conv_outputs[0]                    # (h, w, C)
            heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]  # (h, w, 1)
            heatmap = tf.squeeze(heatmap)                     # (h, w)

            # ReLU — keep only positive activations
            heatmap = tf.nn.relu(heatmap).numpy()

            # Normalise to [0, 1]
            heatmap = self._normalise(heatmap)

            logger.info(
                f"Grad-CAM generated  shape={heatmap.shape}  "
                f"min={heatmap.min():.3f}  max={heatmap.max():.3f}"
            )
            return heatmap.astype(np.float32)

        except Exception as exc:
            logger.error(f"Grad-CAM generation failed: {exc}", exc_info=True)
            return None

    def compute_attention_score(self, heatmap: np.ndarray) -> int:
        """
        Derive a 0–100 "AI Attention Score" from the heatmap.

        High score = strong, concentrated activation (suspicious regions found).
        Low score  = diffuse or weak activation (no clear artifacts).
        """
        if heatmap is None or heatmap.size == 0:
            return 0

        # Mean activation × concentration factor
        mean_act   = float(np.mean(heatmap))
        top_10_pct = float(np.percentile(heatmap, 90))
        score      = (mean_act * 0.4 + top_10_pct * 0.6) * 100
        return min(100, max(0, round(score)))

    # ── private helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _find_last_conv_layer(model: tf.keras.Model) -> Optional[tf.keras.layers.Layer]:
        """Return the last Conv2D (or equivalent) layer in the model."""
        last_conv = None
        for layer in model.layers:
            if isinstance(layer, (
                tf.keras.layers.Conv2D,
                tf.keras.layers.DepthwiseConv2D,
                tf.keras.layers.SeparableConv2D,
            )):
                last_conv = layer
        return last_conv

    @staticmethod
    def _normalise(arr: np.ndarray) -> np.ndarray:
        """Min-max normalise to [0, 1]; handle all-zero case."""
        mn, mx = arr.min(), arr.max()
        if mx - mn < 1e-8:
            return np.zeros_like(arr)
        return (arr - mn) / (mx - mn)


# Global singleton
gradcam_service = GradCAMService()
