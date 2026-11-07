"""Compatibility entry point; use the single pinned bilingual publisher."""
import argparse
import pathlib
import subprocess
p = argparse.ArgumentParser()
p.add_argument('--source', required=True, help='DeskTile_mac directory')
args = p.parse_args()
root = pathlib.Path(__file__).resolve().parent
source = pathlib.Path(args.source).resolve()
print('[0/2] Absolute source:', source, flush=True)
print('[0/2] Absolute publisher:', root / 'build-desktiles.mjs', flush=True)
print('[0/2] Absolute output:', root / 'desktiles', flush=True)
if source.name != 'DeskTile_mac':
    p.error('--source must identify DeskTile_mac under the complete DeskTile checkout')
print('[1/2] Publish the pinned Windows and Mac release together.', flush=True)
subprocess.run(['node', str(root / 'build-desktiles.mjs'), '--source', str(source.parent)], cwd=root, check=True)
print('[2/2] Verify both archives and bilingual documents.', flush=True)
subprocess.run(['node', str(root / 'check-desktiles.mjs')], cwd=root, check=True)
