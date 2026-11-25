// npm run qa — automated checks from §11 of the brief. Run after `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/profile.html');
const pdf = path.join(root, 'dist/Weslat-Corporate-Profile-2026.pdf');
const problems = [];
const ok = (msg) => console.log(`  ✓ ${msg}`);

// 1. Forbidden words (visible text only, comments stripped)
const html = fs.readFileSync(src, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const text = html.replace(/<[^>]+>/g, ' ');
for (const w of ['إرسالية', 'إرساليات', 'الدفع عند الاستلام']) if (text.includes(w)) problems.push(`forbidden word: «${w}»`);
for (const m of text.matchAll(/توصيل(?!\s+بين\s+المدن)/g)) problems.push(`«توصيل» not followed by «بين المدن» near: ${text.slice(m.index - 20, m.index + 30)}`);
// Sudanese dialect (v2.1 is Modern Standard Arabic only)
const dialect = ['ليه', 'شنو', 'عشان', 'ما في', 'بتاع', 'زول', 'دايرين', 'كده', 'ده ', 'دي ', 'بقى', 'براها', 'حيوصل', 'مشوار', 'البزنس', 'تانية', 'قدامه', 'جوه'];
const words = text.split(/[\s،.:؛«»()…·—–-]+/).filter(Boolean);
for (const d of dialect) if ((' ' + words.join(' ') + ' ').includes(' ' + d.trim() + ' ')) problems.push(`dialect word: «${d.trim()}»`);
// بيـ / حيـ verb prefixes: flag words starting with them unless on the MSA allow-list
const allow = new Set(['بين', 'بيع', 'البيع', 'بيئة', 'حيث', 'حين']);
for (const w of words) if (/^(بي|حي)[\u0600-\u06FF]{3,}$/.test(w) && !allow.has(w)) problems.push(`possible dialect verb prefix: «${w}»`);
if (!problems.length) ok('forbidden-word and dialect check');

// 2. PDF: 18 A4 pages
try {
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
  const pages = +info.match(/Pages:\s+(\d+)/)[1];
  const a4 = /Page size:\s+59[45][.\d]* x 84[12][.\d]* pts/.test(info);
  if (pages !== 19) problems.push(`PDF has ${pages} pages, expected 19`);
  if (!a4) problems.push('PDF page size is not A4');
  if (pages === 19 && a4) ok('PDF is 19 pages, A4');
} catch {
  console.log('  ! pdfinfo not available — PDF page count not checked');
}

// 3. Layout checks in the browser
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const layout = await page.evaluate(() => {
  const out = [];
  const mm = 96 / 25.4;
  const pt = 96 / 72;
  const fontsUsed = new Set();
  document.querySelectorAll('section.page').forEach((sec, i) => {
    const n = String(i + 1).padStart(2, '0');
    const P = sec.getBoundingClientRect();
    const footer = sec.querySelector('.footer');
    const footerTop = footer ? footer.getBoundingClientRect().top - P.top : P.height;
    // every text-bearing leaf element
    const els = [...sec.querySelectorAll('*')].filter(
      (e) => !e.closest('svg') && !e.closest('.footer') && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()),
    );
    for (const e of els) {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      fontsUsed.add(cs.fontFamily);
      const size = parseFloat(cs.fontSize) / pt;
      const label = e.textContent.trim().slice(0, 30);
      if (size < 8.45) out.push(`p${n}: text below 8.5pt (${size.toFixed(1)}pt): ${label}`);
      if (r.left < P.left - 0.5 || r.right > P.right + 0.5 || r.top < P.top - 0.5 || r.bottom > P.bottom + 0.5)
        out.push(`p${n}: text outside page: ${label}`);
      if (footer && r.bottom - P.top > footerTop - 1 * mm && !e.closest('.ph'))
        out.push(`p${n}: text runs into footer zone: ${label}`);
      if (e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible') out.push(`p${n}: clipped text: ${label}`);
    }
    // headlines: max 2 lines
    for (const h of sec.querySelectorAll('.h1')) {
      const lh = parseFloat(getComputedStyle(h).lineHeight);
      const lines = Math.round(h.getBoundingClientRect().height / lh);
      if (lines > 2) out.push(`p${n}: headline has ${lines} lines: ${h.textContent.trim().slice(0, 30)}`);
    }
  });
  return { out, fontsUsed: [...fontsUsed] };
});
await browser.close();
problems.push(...layout.out);
if (!layout.out.length) ok('no overflow, no footer collisions, page headlines ≤ 2 lines, text ≥ 8.5pt');
const nonCairo = layout.fontsUsed.filter((f) => !/^"?Cairo"?/.test(f));
if (nonCairo.length) problems.push(`non-Cairo font families: ${nonCairo.join(', ')}`);
else ok('Cairo is the only font family');

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exitCode = 1;
} else console.log('\nQA passed.');
