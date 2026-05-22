"""
Evaluation script for saved models. Computes accuracy, precision, recall, f1, roc_auc and saves confusion matrix.
"""
import numpy as np
import json
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import tensorflow as tf


def evaluate(model_path: Path, test_dir: Path, output_dir: Path):
    model = tf.keras.models.load_model(str(model_path), compile=False)
    IMAGE_SIZE = model.input_shape[1:3]

    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir,
        labels='inferred',
        label_mode='binary',
        batch_size=32,
        image_size=IMAGE_SIZE,
        shuffle=False,
    )

    y_true = []
    y_probs = []
    for x, y in test_ds:
        preds = model.predict(x, verbose=0).flatten()
        y_probs.extend(preds.tolist())
        y_true.extend(y.numpy().astype(int).flatten().tolist())

    y_pred = [1 if p > 0.5 else 0 for p in y_probs]

    results = {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred, zero_division=0),
        'recall': recall_score(y_true, y_pred, zero_division=0),
        'f1': f1_score(y_true, y_pred, zero_division=0),
        'roc_auc': roc_auc_score(y_true, y_probs),
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    with (output_dir / 'evaluation_report.json').open('w') as fp:
        json.dump(results, fp, indent=2)

    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(5,4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    plt.savefig(output_dir / 'confusion_matrix.png', dpi=160)
    plt.close()

    print('Evaluation results saved to', output_dir)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--model-path', type=Path, required=True)
    parser.add_argument('--test-dir', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, default=Path('evaluation'))
    args = parser.parse_args()
    evaluate(args.model_path, args.test_dir, args.output_dir)
