/**
 * CMSys brand asset generator
 * ------------------------------------------------------------------
 * Produces resolution-independent SVG artwork for the CMSys identity:
 *   public/brand/crest.svg      — gold laurel + rope ring naval crest
 *   public/brand/icon.svg       — app-icon (rounded navy tile + crest)
 *   public/brand/wordmark.svg   — CMSys · SLN LOGISTICS · TRINCOMALEE
 *   public/brand/banner.svg     — crest + wordmark lockup (login/hero)
 *
 * Run: node scripts/gen-brand-svg.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = new URL("../public/brand/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const CX = 100;
const CY = 100;

const r2 = (n) => Math.round(n * 100) / 100;
const polar = (r, deg) => [
  r2(CX + r * Math.cos((deg * Math.PI) / 180)),
  r2(CY + r * Math.sin((deg * Math.PI) / 180)),
];

/* ── laurel leaves ───────────────────────────────────────────────── */
function leafBranches() {
  const out = [];
  const START = 104;   // degrees, bottom-left start
  const SWEEP = 152;   // sweep up toward the top
  const COUNT = 10;
  for (const side of ["left", "right"]) {
    for (let i = 0; i < COUNT; i++) {
      const t = (i + 0.5) / COUNT;
      let theta = START + t * SWEEP;
      if (side === "right") theta = 180 - theta;
      const r = 70.5 + 2.4 * Math.sin(t * Math.PI * 3);
      const [x, y] = polar(r, theta);
      let rot = theta + 108 - 30 * Math.sin(t * Math.PI);
      if (side === "right") rot = 180 - rot;
      const scale = 1.02 + 0.42 * Math.sin((t + 0.1) * Math.PI);
      out.push(
        `<g transform="translate(${x} ${y}) rotate(${r2(rot)}) scale(${r2(scale)})">` +
          `<path d="M0 0C3.6 -4.8,10.6 -8.6,20.5 -6.4C19.6 -0.6,13.5 4.6,0 0Z" fill="url(#goldLeaf)" stroke="#7d4b09" stroke-width="0.85" stroke-linejoin="round"/>` +
          `<path d="M2 0.6C8 -1.6,14 -3.2,19 -4.8" fill="none" stroke="#fff7d6" stroke-width="0.9" stroke-linecap="round" opacity="0.8"/>` +
          `<path d="M2 0.8C8 0.6,14 -0.4,18.4 -1.6" fill="none" stroke="#8a5511" stroke-width="0.5" stroke-linecap="round" opacity="0.5"/>` +
          `</g>`
      );
    }
    const stem = [];
    for (let i = 0; i <= 44; i++) {
      const t = i / 44;
      let theta = START - 8 + t * (SWEEP + 16);
      if (side === "right") theta = 180 - theta;
      const [x, y] = polar(69, theta);
      stem.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
    }
    out.push(
      `<path d="${stem.join(" ")}" fill="none" stroke="#8a5511" stroke-width="2.1" stroke-linecap="round" opacity="0.9"/>` +
      `<path d="${stem.join(" ")}" fill="none" stroke="#f6d382" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>`
    );
  }
  return out.join("");
}

/* ── braided rope ring ───────────────────────────────────────────── */
function ropeRing(radius, thickness, count) {
  const seg = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 360;
    const [x, y] = polar(radius, a);
    const tilt = a + 34;
    seg.push(
      `<ellipse cx="${x}" cy="${y}" rx="${r2(thickness * 0.72)}" ry="${r2(
        thickness * 0.42
      )}" transform="rotate(${r2(tilt)} ${x} ${y})" fill="url(#rope)" stroke="#6d4209" stroke-width="0.55" opacity="0.98"/>`
    );
  }
  return seg.join("");
}

/* ── waves through the lower third of the medallion ───────────────── */
const wave = (y, amp, color, op, scale = 1) =>
  `<path d="M-10 ${y} C 18 ${y - amp} 38 ${y + amp * 0.75} 64 ${y + amp * 0.15} C 88 ${
    y - amp * 0.5
  } 112 ${y + amp} 136 ${y + amp * 0.2} C 162 ${y - amp * 0.45} 186 ${y + amp * 0.5} 210 ${
    y - amp * 0.25
  } L 210 210 L -10 210 Z" fill="${color}" opacity="${op}" transform="translate(0 ${
    (1 - scale) * 22
  })"/>`;

/* ── crest ───────────────────────────────────────────────────────── */
const crest = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="CMSys SLN Logistics crest">
  <defs>
    <radialGradient id="disc" cx="38%" cy="26%" r="82%">
      <stop offset="0%" stop-color="#124a8e"/>
      <stop offset="46%" stop-color="#0a3167"/>
      <stop offset="100%" stop-color="#04142f"/>
    </radialGradient>
    <linearGradient id="goldLeaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff4c8"/>
      <stop offset="38%" stop-color="#f7d273"/>
      <stop offset="72%" stop-color="#e0a52c"/>
      <stop offset="100%" stop-color="#a96c12"/>
    </linearGradient>
    <linearGradient id="goldRing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff0bd"/>
      <stop offset="45%" stop-color="#edbd4f"/>
      <stop offset="100%" stop-color="#9c6410"/>
    </linearGradient>
    <linearGradient id="rope" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbe6a2"/>
      <stop offset="50%" stop-color="#deac33"/>
      <stop offset="100%" stop-color="#8d5a0d"/>
    </linearGradient>
    <linearGradient id="waveA" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6df2ff"/>
      <stop offset="45%" stop-color="#25a8f5"/>
      <stop offset="100%" stop-color="#0a53c4"/>
    </linearGradient>
    <linearGradient id="waveB" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0d6fd8"/>
      <stop offset="100%" stop-color="#062a63"/>
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#e8f1fb"/>
      <stop offset="100%" stop-color="#b9cbe0"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1.4" stdDeviation="1.6" flood-color="#03102a" flood-opacity="0.55"/>
    </filter>
    <filter id="leafShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1.6" stdDeviation="1.2" flood-color="#3a2503" flood-opacity="0.55"/>
    </filter>
    <clipPath id="discClip"><circle cx="100" cy="100" r="76"/></clipPath>
  </defs>

  <!-- outer thin ring -->
  <circle cx="100" cy="100" r="95.5" fill="none" stroke="url(#goldRing)" stroke-width="1.6" opacity="0.85"/>
  <circle cx="100" cy="100" r="91" fill="none" stroke="#f3cf7d" stroke-width="0.9" opacity="0.5"/>

  <!-- twisted rope ring -->
  <g filter="url(#soft)">
    <circle cx="100" cy="100" r="87.6" fill="none" stroke="#8a5a10" stroke-width="6.2" opacity="0.9"/>
    ${ropeRing(87.6, 6.2, 72)}
    <circle cx="100" cy="100" r="90.9" fill="none" stroke="#f7d78f" stroke-width="1.1" opacity="0.55"/>
  </g>

  <!-- navy medallion -->
  <circle cx="100" cy="100" r="77" fill="url(#disc)"/>
  <circle cx="100" cy="100" r="77" fill="none" stroke="url(#goldRing)" stroke-width="2.2"/>
  <circle cx="100" cy="100" r="74" fill="none" stroke="#9fd8ff" stroke-width="0.8" opacity="0.28"/>

  <!-- emissive halo behind the emblem -->
  <circle cx="100" cy="88" r="40" fill="#5cc8ff" opacity="0.10" filter="url(#soft)"/>

  <!-- waves -->
  <g clip-path="url(#discClip)">
    ${wave(152, 11, "url(#waveB)", 1)}
    ${wave(140, 10, "url(#waveA)", 0.92)}
    ${wave(133, 6, "#bff8ff", 0.4)}
  </g>

  <!-- laurel wreath -->
  <g filter="url(#leafShadow)">${leafBranches()}</g>

  <!-- emblem: bearing star over the anchor crown -->
  <g filter="url(#soft)">
    <path d="M100 77.5 L114.5 91.5 L100 105.5 L85.5 91.5 Z" fill="url(#steel)"/>
    <rect x="63.5" y="96" width="73" height="7.6" rx="3.8" fill="url(#steel)"/>
    <path d="M100 104 L70.5 150.5" fill="none" stroke="url(#steel)" stroke-width="9.4" stroke-linecap="round"/>
    <path d="M100 104 L129.5 150.5" fill="none" stroke="url(#steel)" stroke-width="9.4" stroke-linecap="round"/>
    <circle cx="100" cy="128" r="7.8" fill="url(#steel)"/>
  </g>
</svg>`;

/* ── app icon ────────────────────────────────────────────────────── */
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="CMSys icon">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b57b8"/>
      <stop offset="48%" stop-color="#0a3478"/>
      <stop offset="100%" stop-color="#020d24"/>
    </linearGradient>
    <radialGradient id="sheen" cx="24%" cy="12%" r="70%">
      <stop offset="0%" stop-color="#7fd4ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#7fd4ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8fd0ff" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#8fd0ff" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="118" fill="url(#tile)"/>
  <rect width="512" height="512" rx="118" fill="url(#sheen)"/>
  <rect x="1.5" y="1.5" width="509" height="509" rx="116.5" fill="none" stroke="url(#edge)" stroke-width="3"/>
  <g transform="translate(256 256) scale(2.18) translate(-100 -100)">
    ${crest
      .replace(/^<svg[^>]*>/, "")
      .replace(/<\/svg>$/, "")
      .replace(/id="([a-zA-Z]+)"/g, 'id="i-$1"')
      .replace(/url\(#([a-zA-Z]+)\)/g, "url(#i-$1)")}
  </g>
</svg>`;

/* ── wordmark ────────────────────────────────────────────────────── */
const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 210" role="img" aria-label="CMSys SLN Logistics Trincomalee">
  <defs>
    <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="42%" stop-color="#e6eef8"/>
      <stop offset="58%" stop-color="#b9c8da"/>
      <stop offset="100%" stop-color="#eef5ff"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe9a3"/>
      <stop offset="35%" stop-color="#f8d370"/>
      <stop offset="36%" stop-color="#f4c04b"/>
      <stop offset="68%" stop-color="#e09a1e"/>
      <stop offset="100%" stop-color="#c97c07"/>
    </linearGradient>
    <linearGradient id="divider" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#f0b429"/>
    </linearGradient>
  </defs>

  <!-- CMSys -->
  <text x="0" y="104" font-family="'Segoe UI Semibold','Helvetica Neue',Arial,sans-serif"
        font-size="112" font-weight="800" letter-spacing="-2" fill="url(#silver)">CMS<tspan fill="url(#goldText)">ys</tspan></text>

  <!-- SLN LOGISTICS -->
  <text x="4" y="158" font-family="'Segoe UI',Arial,sans-serif" font-size="42" font-weight="700"
        letter-spacing="4.2" fill="#dfe9f5" opacity="0.96">SLN LOGISTICS</text>

  <!-- divider -->
  <rect x="5" y="176" width="176" height="3.4" rx="1.7" fill="url(#divider)"/>

  <!-- TRINCOMALEE -->
  <text x="332" y="190" font-family="'Segoe UI',Arial,sans-serif" font-size="25" font-weight="600"
        letter-spacing="6.4" fill="#f4c563">TRINCOMALEE</text>
</svg>`;

/* ── banner lockup ───────────────────────────────────────────────── */
const banner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" role="img" aria-label="CMSys — SLN Logistics, Trincomalee">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#03152f"/>
      <stop offset="45%" stop-color="#062a5c"/>
      <stop offset="100%" stop-color="#010b1e"/>
    </linearGradient>
    <radialGradient id="flare" cx="20%" cy="46%" r="52%">
      <stop offset="0%" stop-color="#2d7dd2" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#2d7dd2" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="46%" stop-color="#e7eff9"/>
      <stop offset="70%" stop-color="#b6c7da"/>
      <stop offset="100%" stop-color="#f2f8ff"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffeaa8"/>
      <stop offset="42%" stop-color="#f3bd3c"/>
      <stop offset="100%" stop-color="#c87d05"/>
    </linearGradient>
    <linearGradient id="divider" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#f0b429"/>
    </linearGradient>
    <linearGradient id="horizon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0e4f9c" stop-opacity="0"/>
      <stop offset="50%" stop-color="#1e7fd4" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0e4f9c" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="420" rx="28" fill="url(#bg)"/>
  <rect width="1200" height="420" rx="28" fill="url(#flare)"/>

  <!-- depth grid -->
  <g stroke="#8ecbff" stroke-width="1" opacity="0.08">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="420"/>`).join("")}
    ${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}"/>`).join("")}
  </g>

  <!-- horizon glow -->
  <rect x="0" y="336" width="1200" height="2.4" fill="url(#horizon)"/>

  <!-- crest -->
  <g transform="translate(52 74) scale(1.38)">
    ${crest
      .replace(/^<svg[^>]*>/, "")
      .replace(/<\/svg>$/, "")
      .replace(/id="([a-zA-Z]+)"/g, 'id="b-$1"')
      .replace(/url\(#([a-zA-Z]+)\)/g, "url(#b-$1)")}
  </g>

  <!-- wordmark -->
  <text x="358" y="196" font-family="'Segoe UI Semibold','Helvetica Neue',Arial,sans-serif"
        font-size="146" font-weight="800" letter-spacing="-3" fill="url(#silver)">CMS<tspan fill="url(#goldText)">ys</tspan></text>
  <text x="364" y="278" font-family="'Segoe UI',Arial,sans-serif" font-size="54" font-weight="700"
        letter-spacing="4.6" fill="#e6f0fb">SLN LOGISTICS</text>
  <rect x="366" y="298" width="232" height="4.2" rx="2.1" fill="url(#divider)"/>
  <text x="678" y="324" font-family="'Segoe UI',Arial,sans-serif" font-size="28" font-weight="600"
        letter-spacing="7.4" fill="#f5c65f">TRINCOMALEE</text>

  <!-- footer meta -->
  <text x="366" y="356" font-family="'Segoe UI',Arial,sans-serif" font-size="18" font-weight="600"
        letter-spacing="3.2" fill="#7fb6e6" opacity="0.9">LOGISTICS MANAGEMENT SYSTEM · v2.7.59</text>

  <rect x="0.75" y="0.75" width="1198.5" height="418.5" rx="27.5" fill="none" stroke="#7cc0ff" stroke-opacity="0.28" stroke-width="1.5"/>
</svg>`;

writeFileSync(new URL("crest.svg", OUT), crest);
writeFileSync(new URL("icon.svg", OUT), icon);
writeFileSync(new URL("wordmark.svg", OUT), wordmark);
writeFileSync(new URL("banner.svg", OUT), banner);
console.log("brand svg written → public/brand/{crest,icon,wordmark,banner}.svg");
