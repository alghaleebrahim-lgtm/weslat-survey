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

  // 3b. Contact sheet: all pages side by side (6 × 3) to check the colour rhythm
  const sheetHtml = path.join(previewDir, '.contact-sheet.html');
  const imgs = sections.map((_, i) => `<img src="page-${String(i + 1).padStart(2, '0')}.png">`).join('');
  fs.writeFileSync(sheetHtml, `<body style="margin:0;background:#5b6270;display:grid;grid-template-columns:repeat(6,300px);gap:14px;padding:14px;width:max-content">${imgs.replace(/<img /g, '<img style="width:300px;display:block" ')}</body>`);
  const sheet = await browser.newPage({ viewport: { width: 1900, height: 800 }, deviceScaleFactor: 1.5 });
  await sheet.goto(pathToFileURL(sheetHtml).href, { waitUntil: 'networkidle' });
  await sheet.screenshot({ path: path.join(previewDir, 'contact-sheet.png'), fullPage: true });
  await sheet.close();
  fs.rmSync(sheetHtml);

  // 3c. Cover options (not in the PDF until one is chosen): preview/cover-A|B|C.png + covers-compare.png
  const coversSrc = path.join(root, 'src/covers.html');
  if (fs.existsSync(coversSrc)) {
    const cp = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
    await cp.goto(pathToFileURL(coversSrc).href, { waitUntil: 'networkidle' });
    await cp.evaluate(() => document.fonts.ready);
    const ids = await cp.$$eval('section[data-cover]', (xs) => xs.map((x) => x.dataset.cover));
    for (const id of ids) {
      await cp.evaluate((k) => document.querySelectorAll('section[data-cover]').forEach((x) => (x.style.display = x.dataset.cover === k ? '' : 'none')), id);
      await cp.screenshot({ path: path.join(previewDir, `cover-${id}.png`), clip: { x: 0, y: 0, width: 793.7, height: 1122.5 } });
    }
    await cp.close();
    const cmpHtml = path.join(previewDir, '.covers.html');
    fs.writeFileSync(cmpHtml, `<body style="margin:0;background:#5b6270;display:flex;gap:24px;padding:24px;width:max-content;font-family:sans-serif">${ids
      .map((id) => `<figure style="margin:0;color:#fff;text-align:center;font-size:22px"><img src="cover-${id}.png" style="width:560px;display:block"><figcaption style="padding-top:10px">Option ${id}</figcaption></figure>`)
      .join('')}</body>`);
    const cmp = await browser.newPage({ viewport: { width: 1800, height: 900 }, deviceScaleFactor: 1.5 });
    await cmp.goto(pathToFileURL(cmpHtml).href, { waitUntil: 'networkidle' });
    await cmp.screenshot({ path: path.join(previewDir, 'covers-compare.png'), fullPage: true });
    await cmp.close();
    fs.rmSync(cmpHtml);
    console.log(`Cover options: ${ids.map((i) => `cover-${i}.png`).join(', ')} + covers-compare.png in preview/`);
  }

  // 4. Missing photos report (photo slots fall back to a designed brand panel)
  const missing = await page.$$eval('section.page', (secs) =>
    secs.flatMap((s, i) =>
      [...s.querySelectorAll('[data-photo]')].filter((f) => !f.querySelector('img')).map((f) => ({ page: i + 1, file: f.dataset.photo })),
    ),
  );

  console.log(`PDF: ${path.relative(root, pdfOut)}`);
  console.log(`PNG previews: ${sections.length} pages + contact-sheet.png in preview/`);
  if (missing.length) {
    console.log('\nMissing photos (brand panel shown, or text-only leadership layout):');
    for (const m of missing) console.log(`  page ${String(m.page).padStart(2, '0')}: assets/photos/${m.file}`);
  } else {
    console.log('All photos present.');
  }
} finally {
  await browser.close();
}
