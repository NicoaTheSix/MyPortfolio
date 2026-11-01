# DeskTiles — User Guide

DeskTiles is a native Windows desktop widget app. Arrange text, images and timers in hexagonal, triangular or rectangular tiles. Windows 10/11 x64 is supported; Linux is planned.

## Start

1. Extract the complete `DeskTiles-Windows-x64.zip` archive.
2. Open the `DeskTiles` folder and run `DeskTiles.exe`. No installer, administrator rights, Python, .NET or separate C++ runtime is required.
3. In the upper-right language selector, choose **English**. You can also use the **Language** submenu in a tile's context menu or the tray menu.

The interface changes immediately. Your preference is remembered at the next launch. Switching preserves pending edits, selected tiles, font settings and running timers. It changes interface text only; your own tile content, paths and font names are never translated.

## Tiles and selection

- Choose **Hexagon (default)**, **Triangle** or **Rectangle (3:2)** and click **+ Add tile**.
- Click a tile to select it. Hold **Shift** and click to add or remove a tile from the selection.
- Drag a selected tile to move the entire selected group while preserving its relative positions. Shift-drag also works. Nearby tiles snap together; overlapping drops return to their original positions.
- Press **Esc** to clear selection. Double-click a tile to open the controller.
- Use **Always on top** or **Pin to desktop** to choose the display layer for selected tiles.

## Content

Select one or more tiles, choose **Text**, **Image** or **Timer**, edit the fields, then click **Apply to selected tiles**.

- Text supports multiple lines and Unicode.
- Images support PNG, JPEG and BMP. Images are cropped to fill the selected shape. Directly chosen images reference their original paths; export a JSON layout to include them in a portable backup.
- Timers support count down and count up. Use **Start timer**, **Pause timer** and **Reset timer**. Saved timers reopen paused.

## Appearance

- **Size and text…**: width 80–480 px; requested font size 8–96 px; installed supported fonts and text color. Check only the settings you want to apply.
- Text that does not fit is rendered smaller without changing the saved font size. Long content can be shortened with an ellipsis. Missing Chinese glyphs use a covering fallback font for consistent measurement and rendering.
- **Border style…**: solid, pixel, animated RGB or single-color breathing; width 1–12 px and effect cycle 2–60 seconds.
- **Background…**: color and 0–100% transparency. Transparency affects the background only. Text, images and borders keep their opacity; fully transparent tile areas remain selectable and draggable.
- Appearance changes can be applied to multiple selected tiles. Resizing that would cause a collision leaves the settings unchanged.

## Save, export and import

Changes are saved automatically after successful operations. Default data folder: `%LOCALAPPDATA%\HexDesk` (the historic folder name is retained for compatibility).

**Layout JSON…** provides:

- **Export layout with images…**: save tiles, positions, styles and embedded images in one JSON file.
- **Import JSON: replace…**: replace the current layout after confirmation and a backup.
- **Import JSON: merge…**: keep existing tiles and add the imported group with new IDs, repositioning it if necessary to avoid overlaps.

The included `範例配置.json` is a three-shape sample with an embedded image. Font files are not embedded; unavailable fonts use a fallback. Imported timers start paused.

Limits: 500 tiles, 128 MiB JSON, 16 MiB per image, 64 MiB of images in total and 64 million pixels per decoded image.

Language is stored separately in `ui-settings.json` in the data folder. Importing a layout never changes it. Missing, unknown or corrupt preferences default to Traditional Chinese. Corrupt preferences are not overwritten at startup; an explicit language choice can replace them. If saving fails, the current language and pending edits stay intact.

## Close, update and troubleshoot

Closing the controller hides it; tiles continue to run. Double-click a tile or use **Open controller** from the tray to return. To quit, apply pending edits and choose **Save and exit DeskTiles**.

Before updating, save and exit the old version, then open the new executable. Starting another copy with the same data folder restores the existing controller instead of running two writers. A leftover `session.lock` file alone is normal; do not delete it as a workaround.

- Missing tiles: **Bring back all tiles** moves them to the main display and sets them always on top.
- Missing image: choose the source file again or import a JSON backup containing it.
- Unwritable data folder: use the folder and Windows error shown by the app, or choose a different location:

```powershell
.\DeskTiles.exe --data-dir 'D:\DeskTilesData'
```

The app logs absolute input/output paths and progress in `session.log`. Layout backups include `layout.backup` and pre-import backups. Windows system file/color dialogs use the language resources available in Windows.
