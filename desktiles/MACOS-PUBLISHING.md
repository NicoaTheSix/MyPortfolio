# macOS release maintenance

After running `npm run build:desktiles -- --source <Windows source>`, run:

    python3 add-macos-download.py --source <DeskTile_mac source>
    npm run check:desktiles

The macOS step verifies SHA256 before copying only the release ZIP, guide,
example JSON and third-party notices. It adds both-language downloads and updates
the source manifest. It is safe to rerun.

2026-11-07 handoff: the Desktile 專員 confirmed macOS checksum
97a45205a10405c5996ac475d16ecc1c35b8eab9a88cb4de284a1795b715bfb2,
macOS 12+, Universal 2, ad-hoc signing, no Developer ID or notarization.
Intel hardware and multiple displays remain unverified.

The supplied Windows checkout has ZIP 77b33651… (170 core / 123 integration
checks). The existing website contains the newer 8b506c95… release (179 / 166
plus 64 screen checks). Preserve the existing website Windows release.
