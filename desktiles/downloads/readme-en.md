# DeskTiles

DeskTiles is a native desktop tile application for Windows and macOS. Choose a hexagon, triangle or 3:2 rectangle and add text, pictures or timers. Group dragging, snapping, transparent backgrounds, animated borders and JSON backups help arrange a desktop layout.

The v1.02 release adds a thin dark-gray outline to the smooth rounded four-shape logo on both platforms. The outer corners remain transparent. The circle in the logo is not an additional tile type. The repository now includes the supplied Windows features and the native Mac implementation.

## Download and update

- Windows 10 / 11 x64: extract [DeskTiles-Windows-x64.zip](release/DeskTiles-Windows-x64.zip), then open `DeskTiles/DeskTiles.exe`. The portable build uses a static C++ runtime.
- macOS 12+: extract [DeskTiles-macOS-universal.zip](DeskTile_mac/release/DeskTiles-macOS-universal.zip), then open `DeskTiles.app`. Universal 2 includes Apple silicon and Intel code.

Save and exit the old app before extracting the complete update. X hides the controller; it does not quit the app. Keep your saved layout and the package's third-party notices. Linux is not available.

The Mac package uses an ad-hoc signature. It has no Developer ID signature or Apple notarization. Intel hardware, multiple monitors, other macOS versions and long-running stress tests still need validation. Read the [Mac guide and limitations](DeskTile_mac/README.md) before downloading.

## Windows features

- Select a shape and add a tile. Shift-click selects several tiles; drag one selected tile to move the group. Tiles snap near one another.
- Use text, PNG/JPEG/BMP images, count-up/countdown timers or alarms. Apply content to selected tiles.
- Adjust size, font, colors, background transparency and solid, pixel, RGB or breathing borders. Choose desktop or always-on-top layers.
- Switch between Traditional Chinese and English from the controller, tray or tile menu. The app saves the preference; your tile content is not translated.
- Start at sign-in is off by default and requires explicit consent. This update does not enable it automatically.
- A persisted alarm has a known clock-activation issue after restarting the app. This icon release does not fix that issue or claim the due-alarm regression passed.

![English Windows controller in an earlier release](docs/control-en.png)

The [English user guide](docs/UserGuide.en.md) and [Chinese user guide](docs/使用說明.md) provide the full Windows controls, alarm settings, startup consent, data handling and troubleshooting steps.

## Mac features and differences

Mac uses Objective-C++ / AppKit with the shared C++ core and native macOS controls. It supports three tile shapes, text, images, timers, multi-selection, dragging, snapping, appearance settings and JSON layouts. Its UI uses Chinese labels. Windows alarms, language switching and sign-in launch have not been ported.

Mac sizes use logical points. Desktop layering uses native window levels. Mission Control, Stage Manager and Show Desktop behavior still require hardware testing. See the [Mac guide](DeskTile_mac/README.md) for data directories, backups, file locking and validation limits.

## Layout compatibility

Windows exports JSON v3 and reads v1–v3. Mac exports and reads v1/v2 only. Windows v3 layouts cannot currently be imported into Mac, even when they contain no alarms. Windows can import Mac v2 layouts. Import can replace or merge supported layouts; imported timers start paused. Export with embedded images when moving supported layouts between computers.

## Validation for v1.02

The project reports 222 Windows core checks, 192 integration checks, language/restart checks and icon decoding checks. The Mac icon-release workflow reports 170 core checks, AppKit integration, standard/Retina icon decoding, Finder configuration, arm64/x86_64 architectures and ad-hoc signing checks. The website publisher verifies supplied files and hashes without executing the application tests.

The Windows alarm restart issue and the Mac validation and signing limits above remain. Historical validation summaries refer to their original packages, not the current download.

## Source and notices

Windows uses C++17 / Win32 / GDI+. Mac uses Objective-C++ / AppKit and C++. The archives retain their third-party MIT notices; no project-wide license is asserted here.

[Source repository](https://github.com/NicoaTheSix/DeskTile) · [v1.02 release source](https://github.com/NicoaTheSix/DeskTile/commit/5b522ef14a789503b4ab3f55ede080f8ab3f1028) · [Mac validation workflow](https://github.com/NicoaTheSix/DeskTile/actions/runs/42757989847)

This English README is maintained by the website from the project's supplied documentation. The original Chinese README is available as a separate download.
