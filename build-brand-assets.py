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
    'symbol': ('0e0178e2e868cfd44c00b4d276710af6d8c05c543b7fb8ec731ce08e6928db48', (1254, 1254)),
    'wordmark': ('20cf8a1d71babb3b25051a98dd29f8976909da541ecf9f07fb429860948993ea', (2172, 724)),
}
jobs = [('symbol', 128, 'webp'), ('symbol', 256, 'webp'),
        ('wordmark', 360, 'webp'), ('wordmark', 720, 'webp'), ('wordmark', 1440, 'webp'),
        ('symbol', 32, 'png'), ('symbol', 64, 'png'), ('symbol', 180, 'png')]
sha = lambda data: hashlib.sha256(data).hexdigest()
def original_name(role):
    return f'nicoa-lab-{role}-transparent.png'

def resized_name(role, width, ext):
    return f'nicoa-lab-{role}-transparent-{width}.{ext}'

def check_alpha(image, label):
    assert image.mode == 'RGBA', f'{label}: alpha channel missing'
    alpha = image.getchannel('A')
    w, h = image.size
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        assert alpha.getpixel(corner) == 0, f'{label}: exterior corner must be transparent'
    # The approved artwork uses near-opaque alpha inside the frame (e.g. 254).
    assert alpha.getpixel((w // 2, h // 2)) >= 250, f'{label}: interior lost its fill'

for role in pins:
    print('[0/4] Absolute input:', source / original_name(role), flush=True)
    print('[0/4] Absolute source-copy output:', output / 'source' / original_name(role), flush=True)
for role, width, ext in jobs:
    print('[0/4] Absolute resized output:', output / resized_name(role, width, ext), flush=True)
print('[0/4] Absolute manifest output:', output / 'source-manifest.json', flush=True)
images = {}
for role, (expected_hash, dimensions) in pins.items():
    file = source / original_name(role)
    assert sha(file.read_bytes()) == expected_hash, f'{role}: unapproved source'
    images[role] = Image.open(file)
    assert images[role].size == dimensions, f'{role}: dimensions changed'
    check_alpha(images[role], file.name)
print('[1/4] Approved source hashes, dimensions and alpha verified.', flush=True)
(output / 'source').mkdir(parents=True, exist_ok=True)
assets = []
for role in pins:
    original = source / original_name(role)
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
    file = output / resized_name(role, width, ext)
    if ext == 'webp':
        resized.save(file, 'WEBP', lossless=True, method=6)
    else:
        resized.save(file, 'PNG', optimize=True)
    with Image.open(file) as decoded:
        assert decoded.size == (width, height)
        check_alpha(decoded, file.name)
    assets.append({'path': file.relative_to(root).as_posix(), 'role': role, 'source': str(source / original_name(role)),
                   'width': width, 'height': height, 'bytes': file.stat().st_size,
                   'sha256': sha(file.read_bytes()), 'original': False})
    print(f'[3/4] Resized {index}/{len(jobs)}: {file}', flush=True)
manifest = {'brand': "Nicoa'Lab", 'sourceVersion': 'v1.02',
            'confirmation_id': 'nicoa-lab-logo-outside-alpha-confirmation-20261108-01',
            'method': 'Proportional RGBA LANCZOS downsampling; preserve exterior transparency and interior fill.',
            'assets': assets, 'publicFiles': [a['path'] for a in assets]}
(output / 'source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('[4/4] Brand assets and provenance manifest saved.', flush=True)
