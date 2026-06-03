# Centralized constants for training and inference
# Keep values here to ensure training and inference use identical settings.

IMAGE_SIZE = (224, 224)  # (height, width)
NORMALIZATION = {
    "method": "rescale",
    "scale": 1.0 / 255.0,
}

LABEL_MAPPING = {"fake": 0, "real": 1}
CONFIDENCE_THRESHOLD = 0.5
GRADCAM_LAST_CONV_LAYER = "conv2d_3"
