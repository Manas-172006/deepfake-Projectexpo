"""
CNN V2 training script — reproducible training for the existing Sequential CNN
This script trains the same architecture family as the deployed model (not EfficientNet).
Outputs saved to models/v2/ and evaluation artifacts to evaluation/.
"""

import argparse
from pathlib import Path
import json
import random
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks

from backend.config.constants import IMAGE_SIZE, LABEL_MAPPING, CONFIDENCE_THRESHOLD

# Reproducibility
def set_seed(seed: int):
    import os
    os.environ['PYTHONHASHSEED'] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)


def build_cnn(input_shape=(224,224,3)):
    inputs = layers.Input(shape=input_shape)
    x = layers.Conv2D(32, (3,3), activation='relu', padding='same')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)

    x = layers.Conv2D(64, (3,3), activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)

    x = layers.Conv2D(128, (3,3), activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)

    x = layers.Conv2D(128, (3,3), activation='relu', padding='same', name='conv2d_3')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)

    x = layers.Flatten()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(1, activation='sigmoid')(x)

    model = models.Model(inputs, outputs, name='cnn_v2')
    return model


def main():
    parser = argparse.ArgumentParser(description='Train CNN v2')
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, default=Path(__file__).resolve().parents[2] / 'models' / 'v2')
    parser.add_argument('--epochs', type=int, default=20)
    parser.add_argument('--batch-size', type=int, default=32)
    parser.add_argument('--seed', type=int, default=42)
    args = parser.parse_args()

    set_seed(args.seed)

    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    IMAGE_SIZE_LOCAL = IMAGE_SIZE  # (H,W)

    train_ds = tf.keras.utils.image_dataset_from_directory(
        args.data_dir,
        labels='inferred',
        label_mode='binary',
        batch_size=args.batch_size,
        image_size=IMAGE_SIZE_LOCAL,
        shuffle=True,
        validation_split=0.15,
        subset='training',
        seed=args.seed,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        args.data_dir,
        labels='inferred',
        label_mode='binary',
        batch_size=args.batch_size,
        image_size=IMAGE_SIZE_LOCAL,
        shuffle=False,
        validation_split=0.15,
        subset='validation',
        seed=args.seed,
    )

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(AUTOTUNE)
    val_ds = val_ds.cache().prefetch(AUTOTUNE)

    model = build_cnn(input_shape=(*IMAGE_SIZE_LOCAL, 3))
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()])

    checkpoint = callbacks.ModelCheckpoint(str(output_dir / 'best_model_v2.h5'), monitor='val_accuracy', save_best_only=True, verbose=1, save_format='h5')
    early_stop = callbacks.EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True, verbose=1)

    history = model.fit(train_ds, validation_data=val_ds, epochs=args.epochs, callbacks=[checkpoint, early_stop])

    # Save history and brief metrics
    metrics_path = output_dir / 'metrics.json'
    with metrics_path.open('w') as fp:
        json.dump({k: [float(x) for x in v] for k, v in history.history.items()}, fp)

    print('Training complete. Artifacts saved to', output_dir)


if __name__ == '__main__':
    main()
