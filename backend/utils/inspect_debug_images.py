import numpy as np
from pathlib import Path
from PIL import Image

def inspect():
    debug_dir = Path(__file__).resolve().parent.parent / "debug_gradcam"
    print("Inspecting debug images in:", debug_dir)
    
    for name in ["original.png", "heatmap.png", "overlay.png"]:
        path = debug_dir / name
        if not path.exists():
            print(f"{name} does not exist!")
            continue
        
        try:
            img_pil = Image.open(path)
            img = np.array(img_pil)
        except Exception as e:
            print(f"Failed to read {name}: {e}")
            continue
            
        print(f"\n--- {name} ---")
        print(f"Shape: {img.shape}")
        print(f"Min:   {img.min()}")
        print(f"Max:   {img.max()}")
        print(f"Mean:  {img.mean():.4f}")
        print(f"Std:   {img.std():.4f}")
        
        # Check colors
        # Let's count how many pixels are completely black (0, 0, 0)
        black_pixels = np.sum(np.all(img[:, :, :3] == 0, axis=-1))
        total_pixels = img.shape[0] * img.shape[1]
        print(f"Black pixels: {black_pixels} / {total_pixels} ({black_pixels/total_pixels*100:.2f}%)")

if __name__ == "__main__":
    inspect()
