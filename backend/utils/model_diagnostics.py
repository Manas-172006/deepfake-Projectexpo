"""
Model Diagnostics — FakeProof Labs
Run this script to probe the loaded model and determine the correct
label mapping for the best_model.h5 checkpoint.

Usage (from backend/ directory):
    python utils/model_diagnostics.py

Output:
    Raw sigmoid score for a synthetic test input.
    Recommended label mapping.
"""

import sys
import numpy as np
from pathlib import Path

# Add backend root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import tensorflow as tf

MODEL_PATH = Path(__file__).parent.parent.parent / "models" / "best_model.h5"


def probe_model():
    print("=" * 60)
    print("FakeProof Labs — Model Diagnostics")
    print("=" * 60)

    if not MODEL_PATH.exists():
        print(f"ERROR: Model not found at {MODEL_PATH}")
        return

    print(f"Loading model from: {MODEL_PATH}")
    print(f"File size: {MODEL_PATH.stat().st_size:,} bytes")

    try:
        model = tf.keras.models.load_model(str(MODEL_PATH), compile=False)
    except Exception as e:
        print(f"ERROR loading model: {e}")
        return

    print(f"Input shape:  {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
    print()

    # ── Test with synthetic inputs ────────────────────────────────────────────
    # All-zeros (black image) — should be neither real nor fake
    black = np.zeros((1, 224, 224, 3), dtype=np.float32)
    # All-ones (white image) — should be neither real nor fake
    white = np.ones((1, 224, 224, 3), dtype=np.float32)
    # Random noise — statistically closer to real camera noise
    np.random.seed(42)
    noise = np.random.uniform(0, 1, (1, 224, 224, 3)).astype(np.float32)

    for name, arr in [("Black (zeros)", black), ("White (ones)", white), ("Random noise", noise)]:
        score = float(model.predict(arr, verbose=0)[0][0])
        label = 'REAL (>0.5)' if score > 0.5 else 'FAKE (<=0.5)'
        print(f"{name:20s}  raw_score={score:.6f}  ->  {label}")

    print()
    print("Training notebook mapping: {'fake': 0, 'real': 1}")
    print("Notebook get_prediction:   pred > 0.5 -> REAL, pred <= 0.5 -> FAKE")
    print()
    print("If random noise scores HIGH (>0.5), the model may have learned")
    print("an inverted mapping. In that case, flip the threshold logic:")
    print("  score > 0.5 -> FAKE  (inverted)")
    print("  score <= 0.5 -> REAL (inverted)")
    print("=" * 60)


if __name__ == "__main__":
    probe_model()
