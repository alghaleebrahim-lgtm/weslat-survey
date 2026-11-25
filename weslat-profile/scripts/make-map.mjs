// Builds the reusable Sudan network graphic and writes it into src/profile.html
// between the <!-- map:start --> / <!-- map:end --> markers, as hidden <defs>.
// Pages compose it with <use href="#map-outline">, #map-routes, #map-dots, #map-labels.
// Colours come from CSS custom properties set on each <use>/<svg>, e.g. --map-stroke.
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

const toMulti = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const merged = polygonClipping.union(toMulti(read('assets/geo/ne50m-sudan.json')), toMulti(read('assets/geo/ne10m-halaib.json')));

// Equirectangular projection, corrected for the latitude of central Sudan. Output is 1000 units wide.
const k = Math.cos((16 * Math.PI) / 180);
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const poly of merged) for (const [x, y] of poly[0]) {
  minX = Math.min(minX, x); maxX = Math.max(maxX, x);
  minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const s = 1000 / ((maxX - minX) * k);
const H = (maxY - minY) * s;
const proj = ([lon, lat]) => [(lon - minX) * k * s, (maxY - lat) * s];
const f = (v) => v.toFixed(1);

// Drop tiny Red Sea islands so the outline stays clean at print size.
const area = (ring) => {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(a / 2);
};
const outline = merged
  .filter((poly) => area(poly[0]) > 0.05)
  .map((poly) => poly.map((ring) => 'M' + ring.map((p) => proj(p).map(f).join(',')).join('L') + 'Z').join(''))
  .join('');

// Branches at their real coordinates. dx/dy/anchor place the name next to the dot (RTL text).
const cities = {
  portsudan: { name: 'بورتسودان', note: 'المقر الرئيسي', lon: 37.2164, lat: 19.6158, hq: true, dx: -26, dy: -26, anchor: 'start' },
  atbara: { name: 'عطبرة', lon: 33.9869, lat: 17.7022, dx: -24, dy: 10, anchor: 'start' },
  omdurman: { name: 'أم درمان', lon: 32.4777, lat: 15.6445, dx: -24, dy: 10, anchor: 'start' },
  madani: { name: 'ود مدني', lon: 33.5199, lat: 14.4012, dx: -24, dy: 22, anchor: 'start' },
  kassala: { name: 'كسلا', lon: 36.4, lat: 15.451, dx: 24, dy: 10, anchor: 'end' },
};
for (const c of Object.values(cities)) [c.x, c.y] = proj([c.lon, c.lat]);

// Route ring following the real road corridors: Port Sudan – Atbara – Omdurman – Wad Madani – Kassala – Port Sudan.
const ring = ['portsudan', 'atbara', 'omdurman', 'madani', 'kassala', 'portsudan'];
const curve = (a, b, bend) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  return `M${f(a.x)},${f(a.y)}Q${f(mx - dy * bend)},${f(my + dx * bend)} ${f(b.x)},${f(b.y)}`;
};
const routes = ring.slice(0, -1).map((id, i) => curve(cities[id], cities[ring[i + 1]], i % 2 ? 0.12 : -0.12));

const S = (props) => `style="${props}"`;
let defs = `<svg class="map-defs" width="0" height="0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs>\n`;
defs += `<path id="map-outline" ${S('fill:var(--map-fill,none);stroke:var(--map-stroke,#8A94A6);stroke-width:var(--map-sw,2.4);stroke-linejoin:round')} d="${outline}"/>\n`;
defs += `<g id="map-routes" ${S('fill:none;stroke:var(--route,#FFBA08);stroke-width:var(--route-sw,7);stroke-linecap:round')}>\n`;
for (const d of routes) defs += `  <path d="${d}"/>\n`;
defs += `</g>\n<g id="map-dots">\n`;
for (const c of Object.values(cities)) {
  defs += c.hq
    ? `  <circle cx="${f(c.x)}" cy="${f(c.y)}" r="22" ${S('fill:var(--hq,#FFBA08);stroke:var(--dot-ring,#fff);stroke-width:6')}/>\n`
    : `  <circle cx="${f(c.x)}" cy="${f(c.y)}" r="13" ${S('fill:var(--dot,#002EB0);stroke:var(--dot-ring,#fff);stroke-width:5')}/>\n`;
}
defs += `</g>\n<g id="map-labels" ${S('font-family:Cairo;font-size:var(--label-size,34px);font-weight:700;fill:var(--label,#0F172A);direction:rtl')}>\n`;
for (const c of Object.values(cities)) {
  const note = c.note ? `<tspan ${S('font-weight:500;fill:var(--label-note,#475569)')}> · ${c.note}</tspan>` : '';
  defs += `  <text x="${f(c.x + c.dx)}" y="${f(c.y + c.dy)}" text-anchor="${c.anchor}">${c.name}${note}</text>\n`;
}
defs += `</g>\n</defs></svg>`;

// Inject into every page source that carries the markers (profile + cover options).
const re = /(<!-- map:start -->)[\s\S]*?(<!-- map:end -->)/;
for (const file of ['src/profile.html', 'src/covers.html']) {
  const htmlPath = path.join(root, file);
  if (!fs.existsSync(htmlPath)) continue;
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (!re.test(html)) throw new Error(`map markers not found in ${file}`);
  fs.writeFileSync(htmlPath, html.replace(re, `$1\n${defs}\n$2`));
}
console.log(`map written: viewBox 0 0 1000 ${f(H)}`);
