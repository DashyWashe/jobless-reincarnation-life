/* ===================== VISUAL EFFECTS: story scenes, celebrations, action feedback ===================== */

/* ---------- illustrated scene banners for story cards ---------- */
let _sc = 0;
const ARC_SCENE = { tutor: 'road', boreas: 'court', displaced: 'storm', ranoa: 'library', labyrinth: 'cave', mangod: 'void', asura: 'court', sanctum: 'snow', laplace: 'aurora', school: 'library', longroad: 'lake', laplace_war: 'storm' };
const KIND_SCENE = { Family: 'hearth', Reunion: 'hearth', Friendship: 'hearth', Childhood: 'hearth', Danger: 'storm', Confrontation: 'arena', Hardship: 'storm', Dream: 'void', Temptation: 'void',
  Festival: 'lanterns', Season: 'lanterns', Fame: 'lanterns', Journey: 'road', Discovery: 'road', Encounter: 'town', 'Turning Point': 'aurora', Milestone: 'sunrise', Reflection: 'lake', Farewell: 'lake',
  Legacy: 'lake', School: 'library', Training: 'library', Breakthrough: 'library', Guild: 'town', Opportunity: 'town', Tavern: 'town', Honor: 'court', Intrigue: 'court', Competition: 'arena' };
const EV_SCENE = { library_grimoire: 'library', scholar_visit: 'library', sky_seed: 'aurora', deja_vu: 'road', ancestor_portrait: 'hearth', well_festival: 'lanterns', statue_mustache: 'town', patron_plea: 'town' };
function sceneFor(c) { return EV_SCENE[c.id] || (c.arc && ARC_SCENE[c.arc]) || KIND_SCENE[c.kind] || (c.milestone ? 'sunrise' : 'road'); }
function scenePeaks(y, amp, seed, fill, step) { let d = `M0 130 L0 ${y}`; for (let x = 0; x <= 600; x += step || 30) d += ` L${x} ${(y - amp * Math.abs(Math.sin(x * 0.013 + seed) + 0.6 * Math.sin(x * 0.031 + seed * 2))).toFixed(1)}`; return `<path d="${d} L600 ${y} L600 130 Z" fill="${fill}"/>`; }
function sceneHills(y, amp, seed, fill) { let d = `M0 130 L0 ${y}`; for (let x = 0; x <= 600; x += 12) d += ` L${x} ${(y - amp * (0.6 * Math.sin(x * 0.011 + seed) + 0.4 * Math.sin(x * 0.027 + seed * 1.7))).toFixed(1)}`; return `<path d="${d} L600 130 Z" fill="${fill}"/>`; }
function sceneStars(n, h, seed) { let s = ''; for (let i = 0; i < n; i++) { const x = (hashStr(seed + 'x' + i) % 600), y = (hashStr(seed + 'y' + i) % h), r = 0.5 + (hashStr(seed + 'r' + i) % 10) / 10; s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff6e0" opacity="${0.3 + (i % 5) * 0.12}"${i % 3 === 0 ? ` class="fx-twinkle" style="animation-delay:${(i % 7) * 0.4}s"` : ''}/>`; } return s; }
const SCENES = {
  hearth: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a22"/><stop offset="1" stop-color="#24180f"/></linearGradient><linearGradient id="${g}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f5383"/><stop offset="1" stop-color="#e6a77c"/></linearGradient><radialGradient id="${g}f" cx="0.5" cy="0.8" r="0.6"><stop offset="0" stop-color="#ffb357" stop-opacity=".85"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><rect x="70" y="20" width="90" height="72" rx="3" fill="url(#${g}w)"/><path d="M115 20 V92 M70 56 H160" stroke="#1d140e" stroke-width="5"/><rect x="66" y="16" width="98" height="80" rx="4" fill="none" stroke="#1d140e" stroke-width="6"/>
    <circle cx="140" cy="38" r="6" fill="#fff1d2" opacity=".9"/><rect x="0" y="108" width="600" height="22" fill="#1b120c"/>
    <circle cx="460" cy="110" r="120" fill="url(#${g}f)"/><path d="M390 130 V64 Q460 20 530 64 V130 Z" fill="#170f0b"/><path d="M410 130 V80 Q460 48 510 80 V130 Z" fill="#2b1810"/>
    <g class="fx-flicker"><path d="M440 128 Q446 96 460 86 Q458 104 470 98 Q476 114 480 128 Z" fill="#ff9b3d"/><path d="M450 128 Q455 108 462 100 Q463 112 470 110 Q472 120 472 128 Z" fill="#ffd27a"/></g>
    <path d="M260 0 V30" stroke="#1d140e" stroke-width="1.5"/><g class="fx-sway"><rect x="252" y="30" width="16" height="20" rx="3" fill="#ffcf7a"/><circle cx="260" cy="40" r="22" fill="#ffcf7a" opacity=".16"/></g>`,
  storm: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1618"/><stop offset=".6" stop-color="#7c3324"/><stop offset="1" stop-color="#d0683a"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><path d="M380 0 L366 34 L378 36 L360 70" fill="none" stroke="#fff3cf" stroke-width="2.4" class="fx-flash"/>
    ${scenePeaks(96, 46, 1.2, '#3a1c1a', 24)}${scenePeaks(116, 30, 3.4, '#170c0c', 20)}
    ${[60, 140, 230, 330, 420, 510].map((x, i) => `<circle cx="${x}" cy="${110 - (i % 3) * 8}" r="${1.4 + (i % 2)}" fill="#ffb067" class="fx-float" style="animation-delay:${i * 0.7}s"/>`).join('')}`,
  void: (g) => `<defs><radialGradient id="${g}a" cx=".5" cy=".55" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ece9f2"/><stop offset="1" stop-color="#c9c4da"/></radialGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/>${[30, 52, 76].map((r, i) => `<circle cx="300" cy="72" r="${r}" fill="none" stroke="#b7b0d0" stroke-width="${1.2 - i * 0.3}" opacity="${0.7 - i * 0.18}"/>`).join('')}
    <g class="fx-drift">${[[120, 40, 14], [180, 90, 9], [430, 34, 12], [500, 88, 16], [80, 100, 8], [540, 50, 7]].map(([x, y, s]) => `<path d="M${x} ${y - s} L${x + s * .8} ${y} L${x} ${y + s} L${x - s * .8} ${y} Z" fill="#d6d0ea" opacity=".75"/>`).join('')}</g>
    <g opacity=".55">${Array.from({ length: 30 }, (_, i) => `<rect x="${288 + (i % 5) * 5}" y="${44 + Math.floor(i / 5) * 9}" width="4.6" height="8.4" fill="${['#cfcbd9', '#bdb8cb', '#e2dfea', '#aaa4bd'][i % 4]}"/>`).join('')}</g>`,
  lanterns: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25304f"/><stop offset=".6" stop-color="#7c5c80"/><stop offset="1" stop-color="#e3a578"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/>${sceneStars(18, 40, 'ln')}${sceneHills(112, 10, 2, '#2a2438')}
    <path d="M-10 18 Q150 70 310 22 Q460 70 610 20" fill="none" stroke="#1d1a26" stroke-width="1.3"/>
    ${[[40, 32], [100, 48], [160, 54], [220, 46], [280, 30], [350, 40], [410, 52], [470, 50], [530, 38], [585, 24]].map(([x, y], i) => `<g class="fx-sway" style="animation-delay:${(i % 4) * 0.5}s"><line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y}" stroke="#1d1a26"/><rect x="${x - 6}" y="${y}" width="12" height="15" rx="4" fill="${['#ffcf6e', '#ff9f6a', '#ffe39a'][i % 3]}"/><circle cx="${x}" cy="${y + 7}" r="16" fill="#ffcf7a" opacity=".14"/></g>`).join('')}
    <path d="M0 0 L40 0 L20 14 Z M80 0 L120 0 L100 14 Z M480 0 L520 0 L500 14 Z M560 0 L600 0 L580 14 Z" fill="#b8423f" opacity=".85"/>`,
  road: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d87b2"/><stop offset=".7" stop-color="#d8b897"/><stop offset="1" stop-color="#ecc69c"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><circle cx="470" cy="62" r="14" fill="#fff0d0" opacity=".9"/>${scenePeaks(78, 30, .7, '#8e97b8', 30)}${sceneHills(98, 12, 1.1, '#5b7a5c')}${sceneHills(116, 10, 3.3, '#3e5a43')}
    <path d="M260 130 C 280 112, 330 108, 320 100 C 310 94, 350 90, 380 86" fill="none" stroke="#d8c08c" stroke-width="7" stroke-linecap="round" opacity=".85"/>
    <g fill="#2c2a26"><rect x="120" y="86" width="3" height="28"/><path d="M110 88 L140 88 L146 93 L140 98 L110 98 Z"/></g>
    <g class="fx-drift" stroke="#2f3140" stroke-width="1.3" fill="none"><path d="M200 34 q4 -4 8 0 q4 -4 8 0"/><path d="M222 26 q3 -3 6 0 q3 -3 6 0"/></g>`,
  aurora: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121c36"/><stop offset="1" stop-color="#2a3a62"/></linearGradient><linearGradient id="${g}r" x1="0" x2="1"><stop offset="0" stop-color="#5fe0b5" stop-opacity="0"/><stop offset=".4" stop-color="#5fe0b5" stop-opacity=".55"/><stop offset=".7" stop-color="#8f7ce6" stop-opacity=".45"/><stop offset="1" stop-color="#8f7ce6" stop-opacity="0"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/>${sceneStars(40, 90, 'au')}
    <g class="fx-drift"><path d="M0 50 C 120 10, 240 70, 360 30 S 560 40, 600 20 L600 44 C 540 70, 420 44, 360 62 S 120 50, 0 80 Z" fill="url(#${g}r)"/><path d="M0 30 C 160 60, 260 0, 420 34 S 560 10, 600 30 L600 40 C 540 26, 440 54, 380 50 S 140 40, 0 46 Z" fill="url(#${g}r)" opacity=".6"/></g>
    ${scenePeaks(112, 24, 2.2, '#0d1424', 26)}<g fill="#0d1424"><rect x="452" y="70" width="10" height="34"/><rect x="470" y="60" width="12" height="44"/><rect x="490" y="74" width="10" height="30"/><path d="M450 70 L457 58 L464 70 Z M468 60 L476 44 L484 60 Z M488 74 L495 62 L502 74 Z"/></g><rect x="474" y="70" width="3" height="5" fill="#ffd99a" class="fx-twinkle"/>`,
  sunrise: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f5683"/><stop offset=".6" stop-color="#f0b483"/><stop offset="1" stop-color="#ffe0a6"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><g class="fx-spin" style="transform-origin:300px 112px">${Array.from({ length: 16 }, (_, i) => { const a = Math.PI + i * Math.PI / 15; return `<path d="M300 112 L${(300 + Math.cos(a - .03) * 420).toFixed(0)} ${(112 + Math.sin(a - .03) * 420).toFixed(0)} L${(300 + Math.cos(a + .03) * 420).toFixed(0)} ${(112 + Math.sin(a + .03) * 420).toFixed(0)} Z" fill="#fff4d6" opacity=".12"/>`; }).join('')}</g>
    <circle cx="300" cy="112" r="34" fill="#fff3d2"/><circle cx="300" cy="112" r="60" fill="#ffe7b3" opacity=".25"/>${sceneHills(116, 8, .4, '#6a5a6e')}${sceneHills(124, 6, 2.6, '#4a3f52')}`,
  lake: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e3c5e"/><stop offset=".55" stop-color="#c58c7c"/><stop offset=".72" stop-color="#f1ba8d"/><stop offset=".72" stop-color="#7a6c86"/><stop offset="1" stop-color="#3a4060"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><circle cx="380" cy="86" r="16" fill="#ffe9c4"/><rect x="368" y="96" width="24" height="2" fill="#ffe9c4" opacity=".6"/><rect x="360" y="102" width="40" height="1.6" fill="#ffe9c4" opacity=".4" class="fx-drift"/><rect x="372" y="108" width="18" height="1.4" fill="#ffe9c4" opacity=".35"/>
    ${scenePeaks(94, 14, 1.8, '#4b4a66', 40)}<g stroke="#232535" stroke-width="2" stroke-linecap="round">${[40, 52, 60, 74, 530, 544, 556].map((x, i) => `<path d="M${x} 130 Q${x + (i % 2 ? 4 : -4)} 112 ${x + (i % 2 ? 2 : -2)} ${98 + (i % 3) * 4}"/>`).join('')}</g>`,
  library: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#231c34"/><stop offset="1" stop-color="#3d3156"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/>${[30, 150, 450, 570].map(x => `<rect x="${x - 14}" y="0" width="28" height="130" fill="#17121f"/>`).join('')}
    <path d="M44 130 V40 Q90 -6 136 40 V130 M464 130 V40 Q510 -6 556 40 V130" fill="#2d2440" stroke="#17121f" stroke-width="4"/>
    ${[[60, 64], [60, 88], [480, 64], [480, 88]].map(([x, y], i) => Array.from({ length: 9 }, (_, k) => `<rect x="${x + k * 7}" y="${y + (k % 3)}" width="6" height="${16 - (k % 3)}" fill="${['#7a3b3b', '#3b5a7a', '#6b5a2e', '#3f6a4a', '#5a3f6a'][(k + i) % 5]}"/>`).join('')).join('')}
    <g class="fx-spin" style="transform-origin:300px 66px"><circle cx="300" cy="66" r="40" fill="none" stroke="#9ad4ff" stroke-width="1.4" opacity=".75"/><circle cx="300" cy="66" r="30" fill="none" stroke="#9ad4ff" stroke-width=".8" stroke-dasharray="4 5" opacity=".7"/>${Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return `<circle cx="${(300 + Math.cos(a) * 40).toFixed(1)}" cy="${(66 + Math.sin(a) * 40).toFixed(1)}" r="3" fill="#cfeaff"/>`; }).join('')}<path d="M300 26 L334 86 L266 86 Z M300 106 L266 46 L334 46 Z" fill="none" stroke="#9ad4ff" stroke-width=".8" opacity=".55"/></g>
    <circle cx="300" cy="66" r="56" fill="#9ad4ff" opacity=".07"/>`,
  town: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3858"/><stop offset="1" stop-color="#d79b78"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/>${sceneStars(14, 30, 'tw')}
    <path d="M0 130 V80 L30 60 L60 80 V70 L90 50 L120 70 V84 L150 62 L190 84 V66 L220 44 L250 66 V82 L280 66 L310 82 V60 L340 40 L370 60 V78 L400 58 L430 78 V64 L460 48 L490 64 V86 L520 64 L560 86 V72 L600 56 V130 Z" fill="#1f2333"/>
    ${[[40, 90], [96, 76], [104, 98], [226, 70], [236, 92], [330, 70], [346, 96], [452, 76], [466, 98], [540, 96]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="7" height="9" fill="#ffd68a" opacity="${0.6 + (i % 3) * 0.13}"${i % 4 === 0 ? ' class="fx-twinkle"' : ''}/>`).join('')}
    <path d="M330 40 V20" stroke="#1f2333" stroke-width="2"/><path d="M331 20 h22 l-6 6 l6 6 h-22 Z" fill="#a8423b" class="fx-sway"/><path d="M196 44 q-6 -10 0 -18 q6 -8 0 -16" fill="none" stroke="#c9c2c8" stroke-width="3" opacity=".25" class="fx-drift"/>`,
  court: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2034"/><stop offset="1" stop-color="#4c3551"/></linearGradient><radialGradient id="${g}c" cx=".5" cy=".1" r=".6"><stop offset="0" stop-color="#ffd890" stop-opacity=".35"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><rect width="600" height="130" fill="url(#${g}c)"/>${[60, 160, 440, 540].map(x => `<rect x="${x - 12}" y="0" width="24" height="130" fill="#1c1524"/><rect x="${x - 16}" y="0" width="32" height="8" fill="#241b2e"/>`).join('')}
    ${[110, 210, 390, 490].map((x, i) => `<g class="fx-sway" style="animation-delay:${i * 0.6}s"><path d="M${x - 14} 0 H${x + 14} V58 L${x} 50 L${x - 14} 58 Z" fill="${i % 2 ? '#2f4a7a' : '#8a2b34'}"/><path d="M${x} 18 l6 8 l-6 8 l-6 -8 Z" fill="#d9b46c"/></g>`).join('')}
    <path d="M270 0 V14 M330 0 V14 M262 14 H338 L326 26 H274 Z" fill="#c8a35c" stroke="#c8a35c"/>${[274, 290, 310, 326].map(x => `<circle cx="${x}" cy="30" r="2.2" fill="#ffe6a8" class="fx-twinkle"/>`).join('')}<rect y="118" width="600" height="12" fill="#1c1524"/><path d="M220 118 H380 L360 108 H240 Z" fill="#8a2b34"/>`,
  snow: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8299bf"/><stop offset="1" stop-color="#e1e7f1"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/>${scenePeaks(80, 52, .9, '#b9c6dc', 34)}${scenePeaks(104, 34, 2.7, '#eef2f8', 30)}
    <path d="M300 130 L300 120 L316 120 L316 110 L332 110 L332 100 L348 100 L348 90 L364 90 L364 80 L380 80" fill="none" stroke="#7d8aa3" stroke-width="2"/><g fill="#4e5568"><rect x="372" y="62" width="30" height="18"/><path d="M368 62 L387 50 L406 62 Z"/></g>
    ${Array.from({ length: 22 }, (_, i) => `<circle cx="${(hashStr('sn' + i) % 600)}" cy="${(hashStr('sy' + i) % 120)}" r="${1 + (i % 3) * .5}" fill="#fff" opacity=".85" class="fx-fall" style="animation-delay:${(i % 6) * 0.9}s"/>`).join('')}`,
  cave: (g) => `<defs><radialGradient id="${g}a" cx=".5" cy=".7" r=".8"><stop offset="0" stop-color="#2f2445"/><stop offset="1" stop-color="#0f0c16"/></radialGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><path d="M0 0 H600 V20 L580 34 L560 18 L540 40 L520 16 L500 30 L470 14 L440 36 L410 16 L380 28 L340 12 L300 32 L260 14 L220 30 L190 12 L160 34 L130 16 L100 28 L70 14 L40 30 L20 16 L0 26 Z" fill="#0b0910"/>
    ${[[120, 118, 18, '#5fd6e0'], [150, 124, 12, '#9b7ce6'], [440, 120, 22, '#9b7ce6'], [470, 126, 14, '#5fd6e0'], [300, 128, 10, '#5fd6e0']].map(([x, y, h, c], i) => `<path d="M${x - h * .35} ${y} L${x} ${y - h * 1.6} L${x + h * .35} ${y} Z" fill="${c}" opacity=".85"/><circle cx="${x}" cy="${y - h * .6}" r="${h * 1.4}" fill="${c}" opacity=".12" class="fx-twinkle" style="animation-delay:${i * .5}s"/>`).join('')}
    <rect y="126" width="600" height="4" fill="#0b0910"/>`,
  arena: (g) => `<defs><linearGradient id="${g}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a22"/><stop offset="1" stop-color="#b06a3e"/></linearGradient></defs>
    <rect width="600" height="130" fill="url(#${g}a)"/><path d="M0 70 Q300 30 600 70 V130 H0 Z" fill="#2a1c16"/><path d="M0 90 Q300 56 600 90" fill="none" stroke="#4a3226" stroke-width="10"/>
    ${[60, 140, 460, 540].map((x, i) => `<path d="M${x} 70 V30" stroke="#1d130e" stroke-width="2"/><path d="M${x + 1} 30 h20 l-5 5 l5 5 h-20 Z" fill="${i % 2 ? '#2f4a7a' : '#a8423b'}" class="fx-sway"/>`).join('')}
    <g transform="translate(300 78)" stroke="#e7d4a8" stroke-width="3" stroke-linecap="round"><path d="M-26 -26 L26 26 M26 -26 L-26 26"/><path d="M-30 -18 l12 -12 M18 30 l12 -12 M30 -18 l-12 -12 M-18 30 l-12 -12" stroke-width="2.2"/></g>`,
};
const LIGHT_SCENES = ['void', 'snow', 'sunrise', 'road'];
function evScene(c) { const k = sceneFor(c); const g = 'sc' + (++_sc); return `<svg class="scene sc-${k}${LIGHT_SCENES.includes(k) ? ' lt' : ''}" viewBox="0 0 600 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${(SCENES[k] || SCENES.road)(g)}</svg>`; }

/* ---------- celebration sparks (canvas, frame-rate capped) ---------- */
const FX = { cv: null, ctx: null, parts: [], raf: 0, last: 0, lastDraw: -1e9 };
function fxEnsure() {
  if (FX.cv && document.body.contains(FX.cv)) return;
  const c = document.createElement('canvas'); c.id = 'fx'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
  FX.cv = c; FX.ctx = c.getContext('2d'); fxResize();
}
function fxResize() { if (!FX.cv) return; const dpr = Math.min(2, window.devicePixelRatio || 1); FX.cv.width = window.innerWidth * dpr; FX.cv.height = window.innerHeight * dpr; FX.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
window.addEventListener('resize', fxResize);
function sparks(x, y, n, colors, power) {
  if (FPS() <= 0) return;
  fxEnsure();
  n = Math.min(n, Math.max(0, 260 - FX.parts.length));
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = (0.35 + Math.random() * 0.65) * (power || 260);
    FX.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (power || 260) * 0.45, life: 0, max: 0.7 + Math.random() * 0.8, r: 1 + Math.random() * 2.2, c: colors[i % colors.length], star: Math.random() < 0.35 });
  }
  if (!FX.raf) { FX.last = 0; FX.raf = requestAnimationFrame(fxStep); }
}
function fxStep(t) {
  const fps = FPS(); if (fps <= 0) { FX.parts = []; FX.ctx && FX.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); FX.raf = 0; return; }
  if (fps < 1000 && t - FX.lastDraw < 1000 / fps - 2) { FX.raf = requestAnimationFrame(fxStep); return; }
  FX.lastDraw = t;
  const dt = Math.min(0.05, FX.last ? (t - FX.last) / 1000 : 0.016); FX.last = t;
  const ctx = FX.ctx; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  FX.parts = FX.parts.filter(p => (p.life += dt) < p.max);
  for (const p of FX.parts) {
    p.vy += 420 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
    const a = 1 - p.life / p.max;
    ctx.globalAlpha = a * 0.25; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); ctx.fill();
    ctx.globalAlpha = a;
    if (p.star) { const r = p.r * 2.2; ctx.beginPath(); ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r * .3, p.y - r * .3); ctx.lineTo(p.x + r, p.y); ctx.lineTo(p.x + r * .3, p.y + r * .3); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r * .3, p.y + r * .3); ctx.lineTo(p.x - r, p.y); ctx.lineTo(p.x - r * .3, p.y - r * .3); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  if (FX.parts.length) FX.raf = requestAnimationFrame(fxStep); else { ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); FX.raf = 0; }
}
const TIER_SPARK = { common: ['#c9ccd2'], uncommon: ['#8fd19a', '#e9f6ea'], rare: ['#86b4f0', '#e6f0ff'], epic: ['#bb98f0', '#f1e8ff'], legendary: ['#f2c063', '#fff2cf'], mythic: ['#f27f78', '#ffd9c8', '#f2c063'], admin: ['#6fe3e3', '#bb98f0', '#f2c063', '#8fd19a'], earned: ['#e2c07a', '#fff2cf'] };
/* big moments get a center-screen banner; everything else gets a small burst at the toast */
function celebrate(kind, title, sub, tier) {
  const now = performance.now(), quick = now - (celebrate.last || 0) < 350; celebrate.last = now;
  if (quick && (kind === 'goal' || kind === 'ach')) return;
  const toastEl = $('#toasts') && $('#toasts').lastElementChild;
  const r = toastEl ? toastEl.getBoundingClientRect() : null;
  const x = r ? r.left + 24 : window.innerWidth / 2, y = r ? r.top + r.height / 2 : 90;
  const gold = ['#f2c063', '#fff2cf', '#e2a84a'];
  let big = null;
  if (kind === 'rank') {
    const rank = RANKS.findIndex(n => title.startsWith(n + ' ·'));
    const aura = title.startsWith('Battle Aura') ? AURA_STAGES.findIndex(a => title.endsWith(a)) : -1;
    if (rank >= 4) big = { t: RANKS[rank], s: title.split(' · ')[1] || '', cls: 'r' + rank };
    else if (aura >= 3) big = { t: AURA_STAGES[aura], s: 'Battle Aura', cls: 'aura' };
    sparks(x, y, rank >= 4 || aura >= 3 ? 36 : 18, gold, 240);
  } else if (kind === 'trait') {
    const ti = TIER_IDX[tier]; sparks(x, y, ti >= 4 ? 34 : 20, TIER_SPARK[tier] || gold, 230);
    if (ti >= 4) big = { t: title, s: `${tierName(tier)} trait`, cls: 'tier-' + tier };
  } else if (kind === 'ach') sparks(x, y, 22, gold, 230);
  else if (kind === 'goal') sparks(x, y, 12, ['#9ad4a0', '#fff2cf'], 190);
  else if (kind === 'disc') sparks(x, y, 18, ['#86d0e0', '#e6f6ff', '#f2c063'], 210);
  if (big && !RM()) bigBanner(big.t, big.s, big.cls);
}
function bigBanner(t, s, cls) {
  const old = $('.fxbanner'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'fxbanner ' + (cls || ''); el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<i class="fb-orn"></i><small>${esc(s)}</small><b>${esc(t)}</b><i class="fb-orn"></i>`;
  document.body.appendChild(el);
  const r = el.getBoundingClientRect(); sparks(r.left + r.width / 2, r.top + r.height / 2, 46, ['#f2c063', '#fff2cf', '#e2a84a', '#ffffff'], 340);
  setTimeout(() => el.remove(), 2600);
}

/* ---------- floating gains beside the button you pressed ---------- */
function floatChips(tags, x, y) {
  if (RM() || !tags || !tags.length) return;
  tags.slice(0, 3).forEach((tg, i) => {
    const el = document.createElement('div'); el.className = 'fchip ' + (tg.c || ''); el.textContent = tg.t; el.setAttribute('aria-hidden', 'true');
    el.style.left = Math.round(Math.min(window.innerWidth - 150, Math.max(8, x - 30))) + 'px'; el.style.top = Math.round(y - 14 - i * 26) + 'px'; el.style.animationDelay = (i * 0.09) + 's';
    document.body.appendChild(el); setTimeout(() => el.remove(), 1500);
  });
}
