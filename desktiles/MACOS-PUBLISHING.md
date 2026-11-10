# macOS release maintenance

The single publisher now updates both Windows and macOS. Run from the website root:

```powershell
node build-desktiles.mjs --source D:\DeskTile
node check-desktiles.mjs
```

`add-macos-download.py --source D:\DeskTile\DeskTile_mac` remains a compatibility entry point and calls the same publisher and checks. It no longer overwrites the current release with the former Mac-only page template. Both packages are pinned in `release.mjs`; the publisher checks exact hashes and sizes before copying. It logs absolute inputs/outputs, then reports validation, copying, page generation, indexing and homepage progress. It never executes application binaries.

Current Mac archive: 451920 bytes (DeskTiles v1.02); SHA-256 `A864E6AFA4B2B765A0294D54EA907F68989A677811AF0F80EC62537A355C0FC8`. macOS 12+, Universal 2, ad-hoc signing, no Developer ID or Apple notarization. Intel hardware and multiple displays remain unverified. Windows exports v3 layouts; Mac reads/exports only v1/v2 and cannot import Windows v3. Windows can import Mac v2.

The old `macos.html`, `guide-macos-zh.md`, example and notice download paths remain available. `macos.html` serves the current Chinese guide; `mac.html` and `en/mac.html` are the bilingual navigation targets. The former 97a45205… Mac archive and the older Windows archive are superseded, not republished.
