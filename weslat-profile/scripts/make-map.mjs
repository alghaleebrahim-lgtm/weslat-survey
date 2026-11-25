// Builds the Sudan network map (page 16) from Natural Earth data and writes it
// into src/profile.html between the <!-- map:start --> / <!-- map:end --> markers.
//
// Sources (public domain, Natural Earth):
//   assets/geo/ne50m-sudan.json   — Admin-0 countries 1:50m, "Sudan" (via world-atlas 2.0.2)
//   assets/geo/ne10m-halaib.json  — Admin-0 disputed areas 1:10m, "Halayib Triangle"
// The Halaib Triangle is merged into the outline so the map shows Sudan's claimed border.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import polygonClipping from 'polygon-clipping';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const sudan = read('assets/geo/ne50m-sudan.json');
const halaib = read('assets/geo/ne10m-halaib.json');
const toMulti = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const merged = polygonClipping.union(toMulti(sudan), toMulti(halaib));

// Equirectangular projection, corrected for the latitude of central Sudan.
const k = Math.cos((16 * Math.PI) / 180);
const W = 1000; // output width in SVG units
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const poly of merged) for (const [x, y] of poly[0]) {
  minX = Math.min(minX, x); maxX = Math.max(maxX, x);
  minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const s = W / ((maxX - minX) * k);
const H = (maxY - minY) * s;
const proj = ([lon, lat]) => [(lon - minX) * k * s, (maxY - lat) * s];

// Drop tiny islands (Red Sea) so the outline stays clean at print size.
const area = (ring) => {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(a / 2);
};
const d = merged
  .filter((poly) => area(poly[0]) > 0.05)
  .map((poly) => poly.map((ring) => 'M' + ring.map((p) => proj(p).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join(''))
  .join('');

const cities = [
  // label: 'end' = name to the left of the dot, 'start' = to the right, 'above' = above-left (RTL text).
  { id: 'portsudan', name: 'بورتسودان', note: 'المقر الرئيسي', lon: 37.2164, lat: 19.6158, hq: true, label: 'above' },
  { id: 'atbara', name: 'عطبرة', lon: 33.9869, lat: 17.7022, label: 'end' },
  { id: 'omdurman', name: 'أم درمان', lon: 32.4777, lat: 15.6445, label: 'end' },
  { id: 'kassala', name: 'كسلا', lon: 36.4, lat: 15.451, label: 'start' },
  { id: 'madani', name: 'ود مدني', lon: 33.5199, lat: 14.4012, label: 'end' },
];
for (const c of cities) [c.x, c.y] = proj([c.lon, c.lat]);
const hq = cities.find((c) => c.hq);

const f = (v) => v.toFixed(1);
let svg = `<svg class="map" viewBox="-20 -20 ${f(W + 40)} ${f(H + 40)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="خريطة شبكة فروع وصلت في السودان">\n`;
svg += `  <path class="map-outline" d="${d}"/>\n`;
for (const c of cities.filter((c) => !c.hq)) {
  svg += `  <line class="map-link" x1="${f(hq.x)}" y1="${f(hq.y)}" x2="${f(c.x)}" y2="${f(c.y)}"/>\n`;
}
for (const c of cities) {
  const dx = c.label === 'start' ? 22 : c.label === 'above' ? -4 : -22;
  const dy = c.label === 'above' ? -30 : 11;
  svg += `  <circle class="map-dot${c.hq ? ' map-dot--hq' : ''}" cx="${f(c.x)}" cy="${f(c.y)}" r="${c.hq ? 13 : 10}"/>\n`;
  svg += `  <text class="map-label" x="${f(c.x + dx)}" y="${f(c.y + dy)}" text-anchor="${c.label === 'start' ? 'end' : 'start'}">${c.name}${c.note ? `<tspan class="map-note"> (${c.note})</tspan>` : ''}</text>\n`;
}
svg += '</svg>';

const htmlPath = path.join(root, 'src/profile.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const re = /(<!-- map:start -->)[\s\S]*?(<!-- map:end -->)/;
if (!re.test(html)) throw new Error('map markers not found in src/profile.html');
fs.writeFileSync(htmlPath, html.replace(re, `$1\n${svg}\n$2`));
console.log(`map written: ${merged.length} polygon(s), viewBox ${W}x${f(H)}`);
