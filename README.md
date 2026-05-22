# FakeProof Labs — AI-Generated Face Detection & Explainability

> Explainable CNN detection for AI-generated face imagery, built as an inference-first forensic demo platform.

---

## Overview

**FakeProof Labs** is a full-stack system for detecting AI-generated face images and explaining the decision with Grad-CAM visualizations.

This repository is intended as an **inference and user-facing demo** of an existing CNN model. The original training dataset is not included locally.

---

## What It Does

- Detects whether a face image is **Real** or **Fake** using a TensorFlow CNN
- Computes **Grad-CAM heatmaps** showing model attention
- Returns **visual overlays** and **confidence scores**
- Supports **Gemini AI explanations** as an optional enhancement
- Runs as **FastAPI backend + React frontend**

---

## Architecture

### Backend
- FastAPI application in `backend/`
- TensorFlow/Keras model inference in `backend/services/model_service.py`
- Grad-CAM explainability in `backend/services/gradcam_service.py`
- Heatmap encoding in `backend/services/heatmap_service.py`

### Frontend
- React + Vite app in `frontend/`
- Image upload, webcam capture, and results dashboard
- Grad-CAM overlay display in `frontend/src/components/GradCAMViewer.jsx`

### Model
- Saved model file: `models/best_model.h5`
- Binary output: `0 = Fake`, `1 = Real`
- Expected input: `224×224 RGB`, normalized to `[0,1]`

---

## Grad-CAM Fix

The repository includes a compatibility fix for Keras 3 / TensorFlow model graph behavior in `backend/services/gradcam_service.py`.

Key improvements:
- ensures the loaded model is built before Grad-CAM graph creation
- supports both `model.inputs` / `model.input` and `model.outputs` / `model.output`
- recursively locates the last convolutional layer in nested model structures
- preserves the existing prediction pipeline unchanged

---

## Setup

### Backend

```powershell
cd deepfake-projectexpo/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` and set any required values, especially:
- `GEMINI_API_KEY`
- `GEMINI_ENABLED`
- `INVERT_LABELS`

Start the API:

```powershell
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```powershell
cd deepfake-projectexpo/frontend
npm install
npm run dev
```

---

## API Endpoints

### `POST /api/predict`
Upload a face image and receive:
- `prediction`
- `confidence`
- `raw_score`
- `gradcam_score`
- `heatmap_image`
- `overlay_image`
- `original_image`
- `ai_analysis`

### `GET /api/health`
Returns backend and model status.

---

## Repository Cleanup

The root now keeps only the core delivery structure. Historical analysis and deployment notes are archived under `docs/archive/`.

---

## Notes

- This repository is intentionally an **inference and explainability system**. It does not contain the full Kaggle dataset or training data.
- Grad-CAM visualizations are generated from the exported `best_model.h5` checkpoint.
- Use `INVERT_LABELS=True` only if the model appears to be consistently flipped.

---

## Recommended Next Steps

- add unit tests for model inference and Grad-CAM
- document dataset provenance clearly
- add a Docker compose demo for easy local launch
- validate `frontend/` and `backend/` startup with CI checks