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
from typing import Optional
import tensorflow as tf
import keras

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
        invert_labels: bool = False,
    ) -> Optional[np.ndarray]:
        """
        Compute a Grad-CAM heatmap for *preprocessed_image*.

        Parameters
        ----------
        model               : loaded Keras model
        preprocessed_image  : (1, H, W, 3) float32 array, values in [0, 1]
        target_class_index  : output neuron index (0 for binary sigmoid)
        invert_labels       : flip mapping for binary classification if needed

        Returns
        -------
        heatmap : (H, W) float32 array, values in [0, 1], or None on failure
        """
        try:
            logger.info(f"TensorFlow version: {tf.__version__}")
            keras_version = tf.keras.__version__ if hasattr(tf.keras, "__version__") else "unknown"
            logger.info(f"Keras version: {keras_version}")

            last_conv = self._find_last_conv_layer(model)
            if last_conv is None:
                raise ValueError("No Conv2D layer found in the model.")

            logger.info("Last convolutional layer found")
            logger.info(f"Layer name: {last_conv.name}")
            logger.info(f"Layer type: {type(last_conv).__name__}")
            try:
                logger.info(f"Layer output shape: {last_conv.output_shape}")
            except Exception as e:
                logger.info(f"Layer output shape: shape attributes not initialized ({e})")

            # ── 1. Reconstruct functional sub-model via layer traversal ──────
            input_tensor = tf.keras.Input(shape=(224, 224, 3))
            x = input_tensor
            last_conv_output = None
            
            # Apply all layers up to the second-to-last layer
            for layer in model.layers[:-1]:
                x = layer(x)
                if layer is last_conv:
                    last_conv_output = x
            
            # Extract logit manually from the final layer to prevent sigmoid gradient saturation
            last_layer = model.layers[-1]
            if hasattr(last_layer, "kernel") and last_layer.kernel is not None:
                logit = keras.ops.matmul(x, last_layer.kernel)
                if getattr(last_layer, "bias", None) is not None:
                    logit = keras.ops.add(logit, last_layer.bias)
            else:
                logit = last_layer(x)
            
            grad_model = tf.keras.Model(
                inputs=input_tensor,
                outputs=[last_conv_output, logit],
            )
            
            # Log the output shape of the conv layer from our newly constructed graph
            logger.info(f"Reconstructed layer output shape: {last_conv_output.shape}")

            img_tensor = tf.cast(preprocessed_image, tf.float32)

            logger.info("Gradient computation started")
            with tf.GradientTape() as tape:
                tape.watch(img_tensor)
                conv_outputs, logits = grad_model(img_tensor, training=False)

                # For binary sigmoid (logit shape [-1] == 1):
                # We explain the logit directly. Real is class 1, Fake is class 0.
                if logits.shape[-1] == 1:
                    p_logit = logits[:, 0]
                    if not invert_labels:
                        class_score = p_logit if target_class_index == 1 else -p_logit
                    else:
                        class_score = -p_logit if target_class_index == 1 else p_logit
                else:
                    # Multi-class softmax logits
                    class_score = logits[:, target_class_index]

            # Gradients of class score w.r.t. conv feature maps
            grads = tape.gradient(class_score, conv_outputs)  # (1, h, w, C)
            logger.info("Gradient computation completed")

            if grads is None:
                raise ValueError("Gradient computation failed. Gradient tape returned None.")

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
                f"Heatmap generated  shape={heatmap.shape}  "
                f"min={heatmap.min():.3f}  max={heatmap.max():.3f}"
            )
            return heatmap.astype(np.float32)

        except Exception as exc:
            import traceback
            tb = traceback.format_exc()
            logger.error(
                f"Grad-CAM generation failed due to exception.\n"
                f"Exception type: {type(exc).__name__}\n"
                f"Exception details: {exc}\n"
                f"Traceback:\n{tb}"
            )
            raise exc

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
