import sys
import numpy as np
from pathlib import Path

# Add backend directory to system path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import tensorflow as tf
from config.settings import settings
from services.model_service import model_service
from services.gradcam_service import gradcam_service
from utils.image_preprocessing import ImagePreprocessor

def run_diagnostics():
    image_path = backend_dir.parent / "assets" / "gradcam_real.png"
    if not image_path.exists():
        print(f"Error: image not found at {image_path}")
        return
        
    print("=========================================")
    print("Grad-CAM Diagnostic Audit")
    print("=========================================")
    
    # 1. Load model
    model_service.load_model(settings.MODEL_PATH, settings.INVERT_LABELS)
    model = model_service._model
    
    # 2. Preprocess image
    preprocessor = ImagePreprocessor(target_size=settings.IMAGE_SIZE)
    preprocessed = preprocessor.preprocess(image_path)
    
    # 3. Predict
    pred_res = model_service.predict(preprocessed, settings.CONFIDENCE_THRESHOLD)
    print(f"Prediction: {pred_res}")
    
    # 4. Probe Grad-CAM for different conv layers
    conv_layers = [layer for layer in model.layers if isinstance(layer, (
        tf.keras.layers.Conv2D,
        tf.keras.layers.DepthwiseConv2D,
        tf.keras.layers.SeparableConv2D
    ))]
    
    print(f"\nFound {len(conv_layers)} conv layers in model:")
    for i, layer in enumerate(conv_layers):
        print(f"  {i}: {layer.name}")
        
    # We will compute Grad-CAM for each conv layer and print stats
    target_class = 1 if pred_res['prediction'] == "Real" else 0
    
    for layer in conv_layers:
        print(f"\n--- Diagnostic for layer: {layer.name} ---")
        try:
            # Let's intercept Grad-CAM generation logic to print raw/processed stats
            # Reconstruct model up to this layer
            input_tensor = tf.keras.Input(shape=(224, 224, 3))
            x = input_tensor
            target_conv_output = None
            
            for l in model.layers[:-1]:
                x = l(x)
                if l.name == layer.name:
                    target_conv_output = x
            
            # Final layer logit
            last_layer = model.layers[-1]
            if hasattr(last_layer, "kernel") and last_layer.kernel is not None:
                import keras
                logit = keras.ops.matmul(x, last_layer.kernel)
                if getattr(last_layer, "bias", None) is not None:
                    logit = keras.ops.add(logit, last_layer.bias)
            else:
                logit = last_layer(x)
                
            grad_model = tf.keras.Model(inputs=input_tensor, outputs=[target_conv_output, logit])
            
            # Gradient tape
            img_tensor = tf.cast(preprocessed, tf.float32)
            with tf.GradientTape() as tape:
                tape.watch(img_tensor)
                conv_outputs, logits = grad_model(img_tensor, training=False)
                p_logit = logits[:, 0]
                class_score = p_logit if target_class == 1 else -p_logit
                
            grads = tape.gradient(class_score, conv_outputs)
            
            if grads is None:
                print(f"  Gradients are None for layer {layer.name}!")
                continue
                
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
            conv_outputs = conv_outputs[0]
            heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
            heatmap = tf.squeeze(heatmap).numpy()
            
            print(f"  Raw Heatmap stats (before ReLU):")
            print(f"    Min:   {heatmap.min():.6f}")
            print(f"    Max:   {heatmap.max():.6f}")
            print(f"    Mean:  {heatmap.mean():.6f}")
            print(f"    Std:   {heatmap.std():.6f}")
            
            # Apply ReLU
            heatmap_relu = np.maximum(heatmap, 0)
            print(f"  Heatmap stats (after ReLU):")
            print(f"    Min:   {heatmap_relu.min():.6f}")
            print(f"    Max:   {heatmap_relu.max():.6f}")
            print(f"    Mean:  {heatmap_relu.mean():.6f}")
            print(f"    Std:   {heatmap_relu.std():.6f}")
            
            # Normalization check
            mn, mx = heatmap_relu.min(), heatmap_relu.max()
            if mx - mn < 1e-8:
                norm_heatmap = np.zeros_like(heatmap_relu)
            else:
                norm_heatmap = (heatmap_relu - mn) / (mx - mn)
                
            print(f"  Normalized Heatmap stats:")
            print(f"    Min:   {norm_heatmap.min():.6f}")
            print(f"    Max:   {norm_heatmap.max():.6f}")
            print(f"    Mean:  {norm_heatmap.mean():.6f}")
            print(f"    Std:   {norm_heatmap.std():.6f}")
            
            # Let's check how many elements are non-zero
            non_zero = np.sum(norm_heatmap > 0.05)
            total = norm_heatmap.size
            print(f"    Actively firing (>0.05): {non_zero} / {total} ({non_zero/total*100:.2f}%)")
            
        except Exception as e:
            print(f"  Failed for layer {layer.name}: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    run_diagnostics()
