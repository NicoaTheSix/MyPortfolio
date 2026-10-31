# DeskTiles user guide

Arrange hexagonal, triangular and rectangular tiles on your Windows desktop to display text, images or timers. Each tile can stay above other windows or on the desktop layer. You can also select a group to move it or update its appearance together.

## Start here

1. Download [DeskTiles-Windows-x64.zip](release/DeskTiles-Windows-x64.zip) and extract the entire archive.
2. Open the extracted `DeskTiles` folder and double-click `DeskTiles.exe`.
3. On first launch, three example tiles and the content controller appear.
4. Select tiles on the left, edit the content on the right, then click **Apply to all selected tiles** (套用至所有選取格).

The portable build supports **Windows 10 / 11 x64**. You do not need Visual Studio, Python, .NET, extra runtime packages or administrator permissions. A Linux version has not been implemented. A source-code checkout must be built separately; the portable ZIP already contains the compiled EXE.

The screenshots and the current application use Chinese UI labels. This guide explains their actions in English.

## Add, select and move tiles

- The shape selector defaults to a hexagon. You can also choose an upward-pointing equilateral triangle or a 3:2 rectangle, then click **Add tile**. The context menu and system tray also offer add actions.
- Click a tile to select it. **Shift + click** adds it to or removes it from the selection. Clicking an already selected tile makes it the only selection; starting a drag instead preserves the group selection.
- Drag any selected tile to move the entire group while preserving its relative positions.
- Tiles snap when brought near another tile. Different shapes prefer edge midpoints or corners and can also snap along edges. Releasing a group in an overlapping position restores its original position.
- Press **Esc** to clear the selection. Double-click a tile to reopen the controller.
- Use the tile context menu to set selected tiles to **Always on top** or **Desktop layer**.

## Text, images and timers

Select tiles first, then choose a content type on the right of the controller.

- **Text:** Supports Chinese text, multiple lines and centered display. Enter the text, then apply it.
- **Images:** Browse to a PNG, JPEG or BMP file, then apply it. Images retain their aspect ratio and are cropped to the tile shape. Directly selected images reference the original file path. Export a JSON configuration to back them up or move them to another computer.
- **Timers:** Choose a countdown or elapsed-time timer. For a countdown, enter the total number of seconds and apply it, then start, pause or reset. Elapsed time is saved when the program closes; timers remain paused when reopened.

Applying content with multiple tiles selected changes all selected tiles. To change appearance only, use the separate appearance buttons on the left.

## Size, typography and borders

- **Size and text:** Choose whether to apply tile size, text styling or both. Width ranges from 80–480 px; font size ranges from 8–96 px. Select an installed font and choose a text color or enter its color code.
- Resizing a group scales its relative positions. If there is insufficient space, the existing configuration is retained.
- **Borders and style:** Solid, pixel, RGB rainbow and single-color breathing borders are supported. Border width ranges from 1–12 px; animation cycles range from 2–60 seconds. You can change colors or stop playback.
- **Background and transparency:** Background color and transparency can be applied separately. 0% is opaque and 100% is fully transparent. Only the background changes; text, images and borders retain their own settings. Fully transparent empty areas remain selectable and draggable.
- Click **Apply** after editing settings. The controller defaults to an 18 px UI font and a 32 px header. These sizes are separate from each tile's content font.

## Save, back up and move to another computer

Completed actions are saved automatically. The default data folder is `%LOCALAPPDATA%\HexDesk`; the older folder name is retained for compatibility. Startup displays the actual absolute input and output paths.

The **Configuration JSON** menu in the upper right provides:

1. **Export entire layout:** Saves every tile, position, style and image content into one JSON file.
2. **Replace import:** Replaces the current layout after confirmation and a backup.
3. **Merge import:** Keeps existing tiles, assigns new IDs to imported tiles and, if needed, shifts the imported group to avoid overlaps.

The bundled example configuration contains all three shapes and one embedded example image. Try it with merge import. Images are embedded in the JSON and are saved to the data folder's `assets` directory after import. Fonts are stored by name only. If another computer lacks a font, the program reports it and uses a fallback font.

Limits: 500 tiles, 16 MiB per image, 64 MiB of images in total, a 128 MiB JSON file and 64 million pixels per image. Invalid configurations or damaged images leave the current layout unchanged.

## Close, exit and update

Closing the controller only hides its panel. Desktop tiles and timers keep running. Double-click a tile or use the system tray to bring the panel back.

Before exiting, apply any pending edits, then choose **Save and exit DeskTiles** from a tile context menu or the system tray. Exit the old version before running an update. The new version restores the layout from the same data folder.

Starting the program again with the same data folder brings back the existing controller. It does not start two writers for the same layout or automatically terminate the old version.

## Troubleshooting

- **An older version is still running:** The new launch normally restores its window. Save and exit the old version from the tray, then start the new EXE.
- **The data directory is not writable:** Check the displayed path and Windows error code, or choose another writable directory.
- **A `session.lock` file remains:** This is normal. Its presence alone does not mean the program is running. Do not delete the lock file to resolve duplicate launches.
- **Tiles are missing:** Choose **Recover all tiles** in the tray menu to move them onto the main display and bring them to the top.
- **An image cannot be loaded:** Select its source file again, or import a JSON configuration that includes it.

For an independent data folder, run this in PowerShell:

```powershell
.\DeskTiles.exe --data-dir 'D:\DeskTilesData'
```

Different data directories can run separately without changing one another's layouts. Compatibility across Windows versions, multiple displays, DPI settings and Explorer restarts remains subject to further testing.
