# DeskTiles for macOS

DeskTiles is a native AppKit application for macOS 12 and later. The Universal 2 package includes Apple silicon and Intel code. Extract the complete archive and open `DeskTiles.app`.

The app uses an ad-hoc signature. It has not been signed with Developer ID or notarized by Apple. Intel hardware, multiple monitors, other macOS versions and long-running stress tests still need validation.

## Using tiles

- Choose a hexagon, triangle or 3:2 rectangle, then add a tile.
- Click to select, Shift-click to select several tiles, and drag a selected tile to move the group. Nearby tiles snap together.
- Add text, a PNG/JPEG/BMP image, or a count-up/countdown timer. Edit the fields and apply them to the selected tiles.
- Change border style, background transparency, size and installed font. Windows fonts may not be installed on your Mac; unavailable fonts fall back to the system font.
- Use a tile's context menu or the menu-bar icon to reopen the controller, change layers, find tiles or quit.

Closing the controller does not quit the application. Use Save and exit DeskTiles, or Command-Q, to save and exit. Quit the old version before updating, then extract the complete new package. If the Dock retains an old icon, remove that shortcut and add the new app again.

## Layouts and data

Export JSON v2 with embedded images for a portable backup. Mac reads v1/v2 only. Windows exports v3 and reads v1–v3; its v3 layouts cannot be imported into Mac, even without alarms. Windows can import Mac v2. Import can replace or merge supported layouts; imported timers start paused. Directly chosen images still refer to their original paths until exported.

The default data directory is `~/Library/Application Support/DeskTiles/`. The app keeps a saved layout, backup and pre-import backups. A system file lock prevents two processes from writing to the same directory. Do not delete `session.lock` as a workaround. A corrupt layout is preserved rather than overwritten with an empty one.

An independent directory can be selected at launch:

```sh
./DeskTiles.app/Contents/MacOS/DeskTiles --data-dir /tmp/my-desktile-data
```

## Differences from Windows

The Mac UI uses Chinese labels and native macOS title bars, buttons, menus and file dialogs. Windows alarms, Chinese/English switching and sign-in launch are not available in this Mac release.

Dimensions use macOS logical points. The desktop layer uses native macOS window levels rather than Windows Explorer. Mission Control, Stage Manager and Show Desktop behavior still require hardware testing. Transparent corners update pointer passthrough at about 12 Hz; transparent tile interiors remain draggable. Completed timers use the system sound without requesting extra notification permission.

## Validation and source

The project reports 170 core checks and AppKit integration checks on Apple silicon. The icon release also verifies standard/Retina icon decoding, Finder configuration, both executable architectures and the ad-hoc signature. The website publisher checks the supplied package and its SHA-256; it does not rerun Mac application tests.

[Source repository](https://github.com/NicoaTheSix/DeskTile) · [macOS icon-release checks](https://github.com/NicoaTheSix/DeskTile/actions/runs/42359672604)

The original Chinese Mac README is available as a separate download. This English page is a website translation.
