// npm run build → dist/Weslat-Corporate-Profile-2026.pdf + preview/page-01.png … page-18.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/profile.html');
const pdfOut = path.join(root, 'dist/Weslat-Corporate-Profile-2026.pdf');
const previewDir = path.join(root, 'preview');

// 1. Sudan map (page 16) from Natural Earth data
execFileSync(process.execPath, [path.join(root, 'scripts/make-map.mjs')], { stdio: 'inherit' });

fs.mkdirSync(path.dirname(pdfOut), { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });
for (const f of fs.readdirSync(previewDir)) if (/^page-\d+\.png$/.test(f)) fs.rmSync(path.join(previewDir, f));

const browser = await chromium.launch();
try {
  // A4 at 96 dpi
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // 2. PDF
  await page.pdf({ path: pdfOut, printBackground: true, preferCSSPageSize: true });

  // 3. PNG previews (2×)
  // Show one page at a time so fractional page heights never leak an edge of the neighbour.
  const sections = await page.$$('section.page');
  for (let i = 0; i < sections.length; i++) {
    await page.evaluate((n) => {
      document.querySelectorAll('section.page').forEach((s, j) => { s.style.display = j === n ? '' : 'none'; });
    }, i);
    const file = path.join(previewDir, `page-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 793.7, height: 1122.5 } });
  }
  await page.evaluate(() => document.querySelectorAll('section.page').forEach((s) => (s.style.display = '')));

  // 4. Missing photos report
  const missing = await page.$$eval('section.page', (secs) =>
    secs.flatMap((s, i) =>
      [...s.querySelectorAll('figure.photo')]
        .filter((f) => !f.querySelector('img'))
        .map((f) => ({ page: i + 1, caption: f.querySelector('.ph')?.textContent.trim() })),
    ),
  );
  const html = fs.readFileSync(src, 'utf8');
  const wanted = [...new Set([...html.matchAll(/assets\/photos\/([\w-]+\.jpg)/g)].map((m) => m[1]))];
  const absent = wanted.filter((f) => !fs.existsSync(path.join(root, 'assets/photos', f)));

  console.log(`PDF: ${path.relative(root, pdfOut)}`);
  console.log(`PNG previews: ${sections.length} pages in preview/`);
  if (absent.length) {
    console.log(`\nMissing photos (placeholders used): ${absent.join(', ')}`);
    for (const m of missing) console.log(`  page ${String(m.page).padStart(2, '0')}: ${m.caption}`);
  } else {
    console.log('All photos present.');
  }
} finally {
  await browser.close();
}
