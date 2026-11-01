# DeskTiles

Project repository: [NicoaTheSix/DeskTile](https://github.com/NicoaTheSix/DeskTile). The portable build is available below. The website download is the verified local release; the repository does not yet contain all recent rendering fixes. An overall project license has not been specified; third-party notices remain in the ZIP.

A native Windows desktop widget app for arranging text, images and timers in hexagonal, triangular or rectangular tiles. It supports group dragging, snapping, always-on-top or desktop layers, transparent backgrounds, pixel / RGB / breathing borders, and JSON configurations with embedded images.

## Start here as a user

1. Download [DeskTiles-Windows-x64.zip](release/DeskTiles-Windows-x64.zip) and extract the entire archive.
2. Open the extracted `DeskTiles` folder and double-click `DeskTiles.exe`.
3. Choose a shape on the left and add it. Edit content on the right and apply it.

**The portable ZIP runs after extraction.** It supports Windows 10 / 11 x64, with no Visual Studio, Python, .NET, extra runtime installation or administrator permissions required. The EXE uses the static C++ runtime and contains an embedded logo.

**The source project must be built.** A source-only checkout does not include a ready-to-run user EXE unless it has been built separately. A Linux version has not been developed and remains future work.

The source project's extracted user build is `release/DeskTiles/DeskTiles.exe`. See the [user guide](docs/使用說明.md) for full steps. The ZIP contains `README.txt`, the user guide, an example configuration with embedded image data and third-party license notices.

## Bilingual interface

Choose **Language → English / 繁體中文** in the controller, a tile's context menu or the tray menu. The interface updates immediately and remembers your preference. It preserves pending edits, selection and running timers; your own tile content is not translated. See the project-provided [English user guide](docs/UserGuide.en.md).

**Before updating, choose Save and exit DeskTiles from the old version's tray menu, then open the new EXE. Closing the controller with X only hides it. Keep your existing configuration.**

## Common actions

| Task | Action |
| --- | --- |
| Add tiles | Select a hexagon (default), upward-pointing equilateral triangle or 3:2 rectangle; choose Add tile |
| Select / move a group | Shift + click to select multiple tiles; drag any selected tile to move the group and snap near other tiles |
| Text, images, timers | Select tiles, choose the content type on the right, configure it and apply |
| Size and font | Size and text; width 80–480 px, font size 8–96 px |
| Appearance | Borders and style / Background and transparency; can apply to multiple tiles |
| Display layer | Choose always-on-top or desktop layer from the context menu or controller |
| Back up / move | Export a configuration JSON with embedded images; replace or merge on import |
| Recover missing tiles | Recover all tiles from the tray menu |
| Exit | Apply edits, then choose Save and exit DeskTiles from a context menu or the tray |

Closing the controller only hides it; tiles continue running in the background. Double-click a tile or launch the program again to restore the controller. Save and exit the old version before updating.

![DeskTiles controller in English](docs/control-en.png)

## Features and scope

- Hexagons, equilateral triangles and 3:2 rectangles in independent borderless windows. Areas outside the shapes allow normal desktop interaction.
- Text, PNG / JPEG / BMP images, elapsed-time timers and countdowns. Multiple selected tiles can be updated together.
- Relative group positions, mixed-shape collision detection and snapping within 22 px. An overlapping drop restores the previous position.
- Custom sizes, installed fonts, font sizes and text colors. A resize that causes collisions retains the existing settings for the entire group.
- Solid, pixel, RGB rainbow and selected-color breathing borders. Border thickness 1–12 px and animation cycles 2–60 seconds.
- Separate background color and 0–100% transparency controls. Only the background is affected; fully transparent areas remain selectable and draggable.
- An 18 px controller UI, 32 px header and monochrome pixel 2×2 logo. Tile content font size is configured independently.
- JSON contains the full layout and Base64 image data. Imports can replace or merge; imported timers start paused.
- Limits: 500 tiles, 128 MiB JSON, 16 MiB per image, 64 MiB of image data in total and 64 million pixels per image.

## Data location and startup issues

The default data folder is `%LOCALAPPDATA%\HexDesk`. Its previous name is retained to reuse existing layouts. You may run:

```powershell
.\DeskTiles.exe --data-dir 'D:\DeskTilesData'
```

Startup displays the absolute layout and log paths and progress. The layout file is `layout.hexdesk`; the previous saved version is `layout.backup`. Imports create an additional `import-before-*.hexdesk` backup. Imported images are saved to `assets` using SHA-256 names. Directly selected external images continue to reference their original paths; export JSON to include them in a backup.

Only one process may write to a given data directory. Repeated launch identifies the lock owner and restores that instance's controller, without resetting unapplied fields or terminating the older version. A genuine write failure displays the data location and Windows error code. A remaining `session.lock` file is normal; do not delete it to fix startup issues.

## Execution flow and progress

- **Startup:** Resolve the data folder → acquire the lock or restore the existing window → display absolute input / output paths → five initialization stages → load layout and icons → create tiles, controller and tray → wait for input.
- **Add:** Display output layout path → find adjacent free space, create a tile and save, with three progress stages.
- **Drag:** Select the primary tile immediately and update the panel → capture the mouse and record group positions → preview snapping after the movement threshold → read final coordinates on release → check collision and commit or restore → save. Shift-click deselection and double-click controller activation wait until release without movement; interrupted capture cancels the preview.
- **Appearance / size / background:** Display input / output locations → validate → apply checked fields and refresh caches → save. Settings dialogs show three-stage progress.
- **Save:** Write a temporary file → back up the previous version → atomically replace it. Corrupt layouts are not overwritten directly; timers reopen paused.
- **JSON export:** Display paths → collect layout and images → validate → atomically replace the destination after completing a temporary file.
- **JSON import:** Display paths → validate format, values, overlap and images → back up → save images and a candidate layout → recreate windows. Merge preserves existing IDs and timer states; imported tiles receive new IDs and may shift as a group.
- **Animation and timing:** Reuse caches for static content. Active animations share an approximately 12 FPS timer; timers use per-second events. Events are removed when not needed.

## Development, checks and packaging

Development requires Windows x64, PowerShell, Visual Studio C++ desktop development tools and the Windows SDK. The portable user build does not require these tools.

```powershell
# Build and run 179 core checks; use a separate output while the old EXE is running
.\build.ps1 -OutputName DeskTiles-update.exe

# Windows UI, corrupt-file protection and exclusive-lock checks
.\verify.ps1 -ExecutableName DeskTiles-update.exe

# Duplicate launch restores the hidden controller and preserves the existing layout
.\verify-activation.ps1 -ExecutableName DeskTiles-update.exe

# Language switching, actual restarts, preference protection and full English integration
.\verify-language.ps1 -FullEnglish

# Copy the executable and docs, then create the ZIP and SHA-256 checksums
.\package.ps1

# Extract the ZIP and verify real-screen composition and window layers during normal startup
.\verify-package.ps1 -Composition
```

Each script prints absolute input / output paths before progress stages. `run.ps1` can launch the newest build or accept `-ExecutableName` and `-DataDir`. Desktop-layer tests require access to a normal desktop and Explorer. The application itself does not need administrator permissions.

See the [validation summary](docs/驗證摘要.txt). Tests use dedicated working directories and do not use or package personal layouts.

## Rendering and window layers

1. Startup displays the absolute layout and log paths, then loads configuration, creates windows and opens the controller in five stages.
2. Each polygon uses a normal borderless input host with a DWM full-client transparent frame. The host is painted with zero alpha; a layered child presents text, images and borders through `UpdateLayeredWindow`. Polygon hit testing remains active even in transparent areas. The host no longer uses `WS_EX_NOREDIRECTIONBITMAP`, which suppressed visible composition during ordinary startup.
3. Desktop mode keeps independent top-level composition and uses Explorer as the owner, below normal windows; it no longer reparents the host as an Explorer child. Always-on-top mode clears the owner and explicitly sets `HWND_TOPMOST`. Coordinates remain screen coordinates, and desktop clicks do not activate the window.
4. Content caches and the shared animation timer are retained. The transparent frame is reset after DWM composition changes; existing data and layout formats remain compatible.
5. `verify-composition.ps1` calls `verify-composition.py` to launch saved on-top and desktop layouts normally. It checks actual screen pixels, backgrounds, borders, text, images, foreground-window coverage, transparent hit testing and dragging. Memory exports or `PrintWindow` are not treated as proof of visible output.

Developer command: `./verify-composition.ps1 -ExecutablePath 'D:\DeskTile\release\DeskTiles\DeskTiles.exe'`. These checks require an interactive Windows desktop, Python and Pillow 12.3 or newer; the portable app does not. The script logs absolute paths and progress, temporarily shows the desktop and restores windows in `finally`, and operates only on dedicated fixtures. Results go to `build/composition-*`. Concurrent foreground activity can interfere with pixel checks.

The project reports **179 core checks, 166 Windows integration checks in each UI language, and 64 actual-screen checks of the extracted EXE during normal startup**. Language regression covers 18 checks, actual preference restarts, corrupt preferences and failed saves. These are project-provided results; website publication verifies file integrity and does not rerun the desktop suite. Other Windows versions, Explorer restarts, DPI, multiple monitors and sustained workloads still need compatibility testing. Linux remains planned.

## Project files

| Location | Purpose |
| --- | --- |
| `release/` | Ready-to-run folder, ZIP and SHA-256 checksums |
| `core.hpp` | Cross-platform model, shapes, selection, snapping, collision detection, timers and internal persistence |
| `localization.hpp` | Traditional Chinese / English strings, language codes and core error translations |
| `config.hpp` | JSON, Base64 images, validation and merging |
| `win32.cpp` | Windows tiles, controller, desktop layer, icons, tray and integration checks |
| `tests.cpp` | Core checks |
| `DeskTiles.rc`, `HexDesk.manifest` | Embedded icons, standard-user permissions and DPI declarations |
| `assets/` | Monochrome pixel sources, logo outputs and asset scripts |
| `third_party/nlohmann/` | JSON dependency and MIT license; no build-time download required |
| `docs/` | User guide, current screenshots, example configuration and validation summary |
| `build/` | Development executables and reproducible build / test artifacts |

The internal format is `HEXDESK 5`, with v1–v4 read support. JSON uses `format: HexDesk`, version 2 and can read version 1. Shape values are 0 for hexagons, 1 for triangles and 2 for rectangles; old formats without a shape field default to hexagons. Selection, control identifiers and other transient state are not saved to JSON. Fonts are stored by name; font files are not packaged.

## Technical basis and future work

Built with C++17, Win32, GDI+ and Windows system libraries. Transparency and the interactive shape region are managed separately so alpha-zero areas do not become click-through. The desktop layer depends on an Explorer host and is sensitive to compatibility differences.

- Duplicate launch uses [Restart Manager](https://learn.microsoft.com/en-us/windows/win32/api/restartmanager/nf-restartmanager-rmgetlist) only to identify the lock holder, then restores its controller. It does not shut down or restart other programs.
- Layered-window rendering follows [UpdateLayeredWindow](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-updatelayeredwindow) and [extended window styles](https://learn.microsoft.com/en-us/windows/win32/winmsg/extended-window-styles).
- JSON uses [nlohmann/json v3.12.0](https://github.com/nlohmann/json/releases/tag/v3.12.0). Its license is included in the portable package.
- A Linux display backend and packaging are future work. The Windows EXE is not a native Linux application.
- Further testing is needed across Windows versions, DPI / multiple displays, Explorer restarts, large layouts and long-running workloads. Existing performance numbers are short local samples, not a guarantee for every environment.

## Git publishing flow

Inspect changes and remotes → exclude personal layouts, logs and temporary files → validate scripts and release SHA-256 → commit source, documentation and release files → push to origin/main → compare local and remote commits. `build/`, `Data/` and `*.user` are ignored. Personal data remains outside the project in LocalAppData.

## Dragging and font regression checks

Launch `--interaction-test --data-dir` with an absolute path to a dedicated empty test folder → log paths and progress → exercise immediate selection, quick release, repeated clicks followed by dragging, Shift and lost capture → verify text and timer pixels for three shapes at small sizes and large requested fonts → restore the test layout → write `interaction-results.txt` and exit. This mode must use a dedicated data folder, never a personal layout.

Font rendering resolves the requested font and styles, falls back to Microsoft JhengHei UI when needed, computes the shape's content region and measures multiline text. A bounded binary search reduces the displayed size if needed; only complete lines are drawn and long content receives an ellipsis. Static output is cached. Saved font names and sizes are not changed. If the requested font lacks Chinese glyphs, the whole content run uses a font covering those characters so measurement and drawing remain consistent; supported English content keeps the selected font.

Selection changes redraw only affected borders without rebuilding text or image caches. The 25 dragging/font checks are part of full Windows verification. The current total, including 18 language checks, is 166 Windows integration checks.

## Demonstration video

[Watch the 30-second demonstration](docs/DeskTiles-fixes-demo.mp4).

`record-demo.py` is a development recording tool requiring Python, Pillow and FFmpeg; the app does not require them. It logs absolute executable, dedicated fixture and output paths, creates fictional data, launches a separate instance, replays actual Win32 selection, dragging and font controls, captures only that process's windows, encodes a 30-second H.264 MP4, validates saved positions and fonts, and exits its own instance. Frame progress is reported every second. The output is `docs/DeskTiles-fixes-demo.mp4`; its validation summary shares the filename with a `.txt` extension, and sample frames are stored in `build/video-demo-*`.

`--demo-capture --data-dir` is explicitly enabled only for dedicated demonstration data; normal startup does not export tile PNGs.

## Language switching implementation and verification

Build the Chinese/English strings in `localization.hpp` → connect the controller, dialogs, menus, tile state and errors → save the preference separately as `ui-settings.json` → capture pending edits → change labels and menu choices → restore values, selection and focus → redraw tiles → verify switching and preference persistence after an actual restart. Stages log progress and absolute paths.

Language tests run `--language-test` with dedicated data, switch every window while preserving drafts and timers, simulate a locked preference file, restart into English, switch back and restart into Chinese, and check corrupt-file recovery without overwriting it. `-FullEnglish` runs all Windows functionality in English. Settings change only when Apply is explicitly pressed.

The app sets Windows UI language preferences with [SetThreadUILanguage](https://learn.microsoft.com/en-us/windows/win32/api/winnls/nf-winnls-setthreaduilanguage); system file and color dialogs depend on the language resources installed in Windows.
