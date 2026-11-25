# Weslat — Corporate Profile 2026

A4 portrait, 18 pages, Arabic RTL. Plain HTML/CSS rendered to PDF with Playwright.

```bash
npm install
npm run build   # → dist/Weslat-Corporate-Profile-2026.pdf + preview/page-01.png … page-18.png
npm run qa      # forbidden words, 18 A4 pages, overflow, headline lines, font sizes, Cairo only
```

## Adding photos

Drop real photos into `assets/photos/` with these exact names, then run `npm run build`.
A missing photo shows as a flat placeholder with an Arabic caption.

| File | Page |
|---|---|
| `founder-ibrahim.jpg` | 02, 03 |
| `gm-musab.jpg` | 03 (same framing as Ibrahim) |
| `team.jpg` | 04 |
| `branch-front.jpg` | 06 |
| `intercity.jpg` | 07 |
| `pickup.jpg` | 08 |
| `delivery.jpg` | 09 (text panel sits bottom-right; keep faces in the upper part) |
| `storage.jpg` | 10 |
| `app.jpg` | 11 |
| `packaging.jpg` | 14 |

If a face is cropped, set `object-position` on that `<img>` in `src/profile.html` (default is `50% 30%`).

## Sources

- **Logo:** `assets/brand/weslat-logo-white.svg`, vector paths taken unmodified from the Weslat brand guideline (page 3, white version).
- **Font:** Cairo (SIL OFL), local `.woff2` files in `assets/fonts/`.
- **Map (page 16):** Natural Earth, Sudan 1:50m plus the Halaib Triangle from the 1:10m disputed-areas layer, merged by `scripts/make-map.mjs` at build time.
