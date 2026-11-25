# Weslat — Corporate Profile 2026

A4 portrait, 18 pages, Arabic RTL. Plain HTML/CSS rendered to PDF with Playwright.

```bash
npm install
npm run build   # → dist/Weslat-Corporate-Profile-2026.pdf + preview/page-01…18.png + preview/contact-sheet.png
npm run qa      # forbidden words, 18 A4 pages, overflow, headline lines, text ≥ 9pt, Cairo only
```

## Adding photos

Only four photo slots. Drop the files into `assets/photos/` with these exact names, then run `npm run build`.
Photos get a blue duotone automatically. Until a file exists, the slot shows a finished brand panel (pages 07, 15) or the person's initials (page 17).

| File | Page |
|---|---|
| `operations.jpg` | 07 — services divider |
| `team.jpg` | 15 — network & team |
| `gm-musab.jpg` | 17 — leadership |
| `founder-ibrahim.jpg` | 17 — leadership |

If a face is cropped, set `object-position` on that `<img>` in `src/profile.html`.

## Sources

- **Logo:** `assets/brand/weslat-logo-white.svg`, vector paths taken unmodified from the Weslat brand guideline (page 3, white version).
- **Font:** Cairo (SIL OFL), local `.woff2` files in `assets/fonts/`.
- **Map (cover, pages 04, 05, 07, 15, 16, 18):** Natural Earth, Sudan 1:50m plus the Halaib Triangle from the 1:10m disputed-areas layer, merged by `scripts/make-map.mjs` at build time into one reusable SVG (outline, route lines between the 5 branches, dots, labels).
