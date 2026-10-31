# DeskTiles

A native Windows desktop widget app for arranging text, images and timers in hexagonal, triangular or rectangular tiles. It supports group dragging, snapping, always-on-top or desktop layers, transparent backgrounds, pixel / RGB / breathing borders, and JSON configurations with embedded images.

## Start here as a user

1. Download [DeskTiles-Windows-x64.zip](release/DeskTiles-Windows-x64.zip) and extract the entire archive.
2. Open the extracted `DeskTiles` folder and double-click `DeskTiles.exe`.
3. Choose a shape on the left and add it. Edit content on the right and apply it.

**The portable ZIP runs after extraction.** It supports Windows 10 / 11 x64, with no Visual Studio, Python, .NET, extra runtime installation or administrator permissions required. The EXE uses the static C++ runtime and contains an embedded logo.

**The source project must be built.** A source-only checkout does not include a ready-to-run user EXE unless it has been built separately. A Linux version has not been developed and remains future work.

The source project's extracted user build is `release/DeskTiles/DeskTiles.exe`. See the [user guide](docs/使用說明.md) for full steps. The ZIP contains `README.txt`, the user guide, an example configuration with embedded image data and third-party license notices.

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

![DeskTiles controller, original Chinese UI](docs/control.png)

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
- **Drag:** Record original group positions → create contact candidates → check group collisions → snap → commit or restore → save.
- **Appearance / size / background:** Display input / output locations → validate → apply checked fields and refresh caches → save. Settings dialogs show three-stage progress.
- **Save:** Write a temporary file → back up the previous version → atomically replace it. Corrupt layouts are not overwritten directly; timers reopen paused.
- **JSON export:** Display paths → collect layout and images → validate → atomically replace the destination after completing a temporary file.
- **JSON import:** Display paths → validate format, values, overlap and images → back up → save images and a candidate layout → recreate windows. Merge preserves existing IDs and timer states; imported tiles receive new IDs and may shift as a group.
- **Animation and timing:** Reuse caches for static content. Active animations share an approximately 12 FPS timer; timers use per-second events. Events are removed when not needed.

## Development, checks and packaging

Development requires Windows x64, PowerShell, Visual Studio C++ desktop development tools and the Windows SDK. The portable user build does not require these tools.

```powershell
# Build and run 170 core checks; use a separate output while the old EXE is running
.\build.ps1 -OutputName DeskTiles-update.exe

# Windows UI, corrupt-file protection and exclusive-lock checks
.\verify.ps1 -ExecutableName DeskTiles-update.exe

# Duplicate launch restores the hidden controller and preserves the existing layout
.\verify-activation.ps1 -ExecutableName DeskTiles-update.exe

# Copy the executable and docs, then create the ZIP and SHA-256 checksums
.\package.ps1

# Extract the ZIP and run the packaged build to verify Windows functionality
.\verify-package.ps1
```

Each script prints absolute input / output paths before progress stages. `run.ps1` can launch the newest build or accept `-ExecutableName` and `-DataDir`. Desktop-layer tests require access to a normal desktop and Explorer. The application itself does not need administrator permissions.

See the [validation summary](docs/驗證摘要.txt). Tests use dedicated working directories and do not use or package personal layouts.

## Project files

| Location | Purpose |
| --- | --- |
| `release/` | Ready-to-run folder, ZIP and SHA-256 checksums |
| `core.hpp` | Cross-platform model, shapes, selection, snapping, collision detection, timers and internal persistence |
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
