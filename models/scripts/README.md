# Model Training Scripts

This folder contains the production training pipeline for the deepfake detector.

## train_deepfake_detector.py

Usage:

```bash
cd deepfake-Projectexpo
python models/scripts/train_deepfake_detector.py --data-dir <dataset-root> --output-dir models
```

Expected dataset structure:

- `<dataset-root>/train/fake`
- `<dataset-root>/train/real`
- `<dataset-root>/valid/fake`
- `<dataset-root>/valid/real`
- `<dataset-root>/test/fake`
- `<dataset-root>/test/real`

If explicit `valid/` is not available, the script will split the training data automatically.

The script saves:

- `models/best_model.h5`
- `models/training_metrics.json`
- `models/class_mapping.json`
- training plots in `models/history/`
- `models/confusion_matrix.png`
- `models/roc_curve.png`
