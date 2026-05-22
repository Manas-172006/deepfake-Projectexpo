"""
Dataset validation tools: counts, corrupt image check, simple duplicate detection (perceptual hashing not included to avoid extra deps).
"""
from pathlib import Path
from PIL import Image
import hashlib

IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'}


def count_classes(data_dir: Path):
    counts = {}
    for p in sorted(data_dir.iterdir()):
        if p.is_dir():
            counts[p.name] = sum(1 for f in p.rglob('*') if f.suffix.lower() in IMAGE_EXT)
    return counts


def find_corrupt_images(data_dir: Path):
    corrupt = []
    for f in data_dir.rglob('*'):
        if not f.is_file():
            continue
        if f.suffix.lower() not in IMAGE_EXT:
            continue
        try:
            with Image.open(f) as im:
                im.verify()
        except Exception:
            corrupt.append(str(f))
    return corrupt


def find_duplicates(data_dir: Path):
    # Simple byte-level duplicate detection (fast). Not perceptual.
    hashes = {}
    dups = []
    for f in data_dir.rglob('*'):
        if not f.is_file():
            continue
        if f.suffix.lower() not in IMAGE_EXT:
            continue
        h = hashlib.sha256(f.read_bytes()).hexdigest()
        if h in hashes:
            dups.append((str(f), hashes[h]))
        else:
            hashes[h] = str(f)
    return dups


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-dir', type=Path, required=True)
    args = parser.parse_args()
    print('Class counts:')
    print(count_classes(args.data_dir))
    print('\nCorrupt images:')
    corrupt = find_corrupt_images(args.data_dir)
    print(len(corrupt))
    print('\nDuplicate sample (first 10):')
    dups = find_duplicates(args.data_dir)
    print(len(dups))
    print(dups[:10])
