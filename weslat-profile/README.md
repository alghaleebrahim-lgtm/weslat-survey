# Weslat — Corporate Profile 2026

A4 portrait, 19 pages, Arabic RTL. Plain HTML/CSS rendered to PDF with Playwright.

```bash
npm install
npm run build   # → dist/Weslat-Corporate-Profile-2026.pdf + preview/page-01…19.png + preview/contact-sheet.png
npm run qa      # forbidden words + dialect scan, 19 A4 pages, overflow, headline lines, text ≥ 8.5pt, Cairo only
```

## Adding photos

Only four photo slots. Drop the files into `assets/photos/` with these exact names, then run `npm run build`.
Photos get a blue duotone automatically. Until a file exists, the slot shows a finished brand panel (pages 07, 15) or the person's initials (page 18).

| File | Page |
|---|---|
| `operations.jpg` | 07 — services divider |
| `team.jpg` | 16 — network & team |
| `gm-musab.jpg` | 18 — leadership |
| `founder-ibrahim.jpg` | 18 — leadership |

If a face is cropped, set `object-position` on that `<img>` in `src/profile.html`.

## Sources

- **Logo:** `assets/brand/weslat-logo-white.svg`, vector paths taken unmodified from the Weslat brand guideline (page 3, white version).
- **Font:** Cairo (SIL OFL), local `.woff2` files in `assets/fonts/`.
- **Map (cover, pages 04, 05, 07, 16, 17, 19):** Natural Earth, Sudan 1:50m plus the Halaib Triangle from the 1:10m disputed-areas layer, merged by `scripts/make-map.mjs` at build time into one reusable SVG (outline, route lines between the 5 branches, dots, labels).
