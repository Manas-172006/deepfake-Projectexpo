"""
Improved Deepfake Detection training pipeline. (ARCHIVE COPY)

This script was moved to archive/efficientnet_experiments to remove repo drift
from the production CNN training pipeline. Keep here for reference.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict, Optional

import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
import tensorflow as tf
from tensorflow.keras import callbacks, layers
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)


IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
AUTOTUNE = tf.data.AUTOTUNE
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train an improved deepfake detection model.")
    parser.add_argument(
        "--data-dir",
        type=Path,
        required=True,
        help="Root dataset directory containing train/valid/test or a single class subdirectory structure.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Directory to save best_model.h5, metrics, and plots.",
    )
    parser.add_argument(
        "--base-model",
        type=str,
        default="EfficientNetB0",
        choices=["EfficientNetB0", "EfficientNetB2"],
        help="Base ImageNet model for transfer learning.",
    )
    parser.add_argument("--epochs", type=int, default=20, help="Maximum number of training epochs.")
    parser.add_argument("--fine-tune-epochs", type=int, default=5, help="Additional fine-tuning epochs after initial training.")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE, help="Input batch size.")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for dataset loading.")
    parser.add_argument("--verbose", type=int, default=1, help="Verbosity level for training.")
    return parser.parse_args()


def detect_gpu() -> None:
    gpus = tf.config.list_physical_devices("GPU")
    print("GPU available:" if gpus else "No GPU detected.")
    for gpu in gpus:
        print(f"  - {gpu.name}")

# ... (rest of script retained as reference) ...
