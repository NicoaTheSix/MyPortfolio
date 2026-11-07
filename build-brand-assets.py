"""Resize approved brand art without cropping, recoloring or redrawing it."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import sys
sys.stdout.reconfigure(encoding="utf-8")

from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=Path(r'D:\VIDEOS\designs\nicoa-lab-brand-icon\standards'))
args = parser.parse_args()
root = Path(__file__).resolve().parent
source = args.source.resolve()
output = root / 'assets' / 'brand'
pins = {
    'symbol': ('79a19ca983aa4a02462b271d17a96dd0371809761f2ee3a098b7f43ce5ea1c90', (1254, 1254)),
    'wordmark': ('66b9272baf203eaf1e35a07d5fd3010b05714dbc3049c6e5f6bf32c4d49505b0', (2172, 724)),
}
jobs = [('symbol', 128, 'webp'), ('symbol', 256, 'webp'),
        ('wordmark', 360, 'webp'), ('wordmark', 720, 'webp'), ('wordmark', 1440, 'webp'),
        ('symbol', 32, 'png'), ('symbol', 64, 'png'), ('symbol', 180, 'png')]
sha = lambda data: hashlib.sha256(data).hexdigest()
for role in pins:
    print('[0/4] Absolute input:', source / f'nicoa-lab-{role}.png', flush=True)
    print('[0/4] Absolute source-copy output:', output / 'source' / f'nicoa-lab-{role}.png', flush=True)
for role, width, ext in jobs:
    print('[0/4] Absolute resized output:', output / f'nicoa-lab-{role}-{width}.{ext}', flush=True)
print('[0/4] Absolute manifest output:', output / 'source-manifest.json', flush=True)
images = {}
for role, (expected_hash, dimensions) in pins.items():
    file = source / f'nicoa-lab-{role}.png'
    assert sha(file.read_bytes()) == expected_hash, f'{role}: unapproved source'
    images[role] = Image.open(file)
    assert images[role].size == dimensions, f'{role}: dimensions changed'
print('[1/4] Approved source hashes and original dimensions verified.', flush=True)
(output / 'source').mkdir(parents=True, exist_ok=True)
assets = []
for role in pins:
    original = source / f'nicoa-lab-{role}.png'
    copied = output / 'source' / original.name
    shutil.copyfile(original, copied)
    assert original.read_bytes() == copied.read_bytes()
    assets.append({'path': copied.relative_to(root).as_posix(), 'role': role, 'source': str(original),
                   'width': images[role].width, 'height': images[role].height,
                   'bytes': copied.stat().st_size, 'sha256': sha(copied.read_bytes()), 'original': True})
print('[2/4] Original PNGs copied byte for byte; source files unchanged.', flush=True)
for index, (role, width, ext) in enumerate(jobs, 1):
    image = images[role]
    height = width * image.height // image.width
    assert width * image.height == height * image.width, 'Aspect ratio must remain exact'
    resized = image.resize((width, height), Image.Resampling.LANCZOS)
    file = output / f'nicoa-lab-{role}-{width}.{ext}'
    if ext == 'webp':
        resized.save(file, 'WEBP', lossless=True, method=6)
    else:
        resized.save(file, 'PNG', optimize=True)
    assets.append({'path': file.relative_to(root).as_posix(), 'role': role, 'source': str(source / f'nicoa-lab-{role}.png'),
                   'width': width, 'height': height, 'bytes': file.stat().st_size,
                   'sha256': sha(file.read_bytes()), 'original': False})
    print(f'[3/4] Resized {index}/{len(jobs)}: {file}', flush=True)
manifest = {'brand': "Nicoa'Lab", 'sourceVersion': 'v1.01',
            'confirmation_id': 'nicoa-lab-logo-standard-confirmation-20261107-01',
            'method': 'Proportional LANCZOS downsampling only; no crop, redraw, recolor or transparency edit.',
            'assets': assets, 'publicFiles': [a['path'] for a in assets]}
(output / 'source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('[4/4] Brand assets and provenance manifest saved.', flush=True)
