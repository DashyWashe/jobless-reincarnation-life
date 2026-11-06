/* ===================== WORLD MAP: the Six-Faced World ===================== */
const MAP_POS = {
  buena: [604, 298], roa: [630, 262], ars: [668, 330], meadowmere: [640, 380], sharia: [468, 168], sanctum: [548, 132], ironroot: [432, 232], redwyrm: [548, 252], shirone: [468, 362], border: [530, 408],
  millishion: [226, 446], doldia: [316, 382], silverleaf: [282, 352], zant: [168, 378], tidereef: [150, 478],
  rikarisu: [192, 172], migurd_village: [118, 122], superd_camp: [262, 116], demon_fort: [148, 238],
  rapan: [836, 138], oasis: [884, 196], sky_temple: [890, 392],
};
const MAP_CONT = {
  central: { name: 'Central Continent', at: [560, 205], fill: '#7d8a6a', pts: [[398, 150], [470, 116], [560, 100], [646, 126], [704, 186], [726, 268], [708, 352], [692, 424], [610, 448], [520, 444], [438, 424], [404, 362], [378, 290], [386, 212]] },
  demon: { name: 'Demon Continent', at: [196, 92], fill: '#8a7468', pts: [[66, 108], [142, 58], [244, 66], [324, 98], [344, 170], [302, 240], [232, 290], [140, 292], [78, 240], [48, 170]] },
  millis: { name: 'Millis Continent', at: [238, 520], fill: '#6f8a6c', pts: [[118, 338], [200, 318], [302, 330], [362, 372], [352, 442], [302, 500], [210, 524], [138, 502], [98, 440]] },
  begaritt: { name: 'Begaritt Continent', at: [846, 84], fill: '#b39a6c', pts: [[738, 92], [822, 58], [922, 70], [962, 130], [942, 210], [862, 240], [772, 222], [730, 160]] },
  heaven: { name: 'Heaven Continent', at: [892, 352], fill: '#9aa6b8', pts: [[828, 362], [898, 338], [958, 364], [952, 428], [884, 452], [822, 424]] },
};
/* break up smooth blobs into believable coastlines: extra points pushed in and out along each edge */
function roughen(pts, seed, amp) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length]; out.push(a);
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    for (const t of [0.33, 0.66]) { const h = ((hashStr(seed + ':' + i + ':' + t) % 1000) / 1000 - 0.5) * 2 * amp; out.push([+(a[0] + dx * t + nx * h).toFixed(1), +(a[1] + dy * t + ny * h).toFixed(1)]); }
  }
  return out;
}
function smoothPath(pts) {
  const n = pts.length; let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + ' Z';
}
const mapMtn = (x, y, s, snow) => `<path d="M${x - s} ${y + s * .7} L${x} ${y - s * .8} L${x + s} ${y + s * .7} Z" fill="#5b5448" opacity=".55"/><path d="M${x} ${y - s * .8} L${x + s * .38} ${y - s * .15} L${x - s * .3} ${y - s * .2} Z" fill="${snow ? '#f2f4f8' : '#8d8576'}" opacity="${snow ? .9 : .55}"/>`;
const mapTree = (x, y) => `<circle cx="${x}" cy="${y}" r="5" fill="#3f5a3a" opacity=".55"/><circle cx="${x + 6}" cy="${y + 3}" r="4" fill="#4a6a43" opacity=".55"/>`;
function hiddenTown(L, t) { return (t.id === 'superd_camp' || t.id === 'silverleaf') && !(L && (L.flags['found_' + t.id] || L.home === t.id || (L.towns || []).includes(t.id))); }
function worldMap(L, sel) {
  const id = 'wm' + (++_pg), here = L ? L.town : null, seen = new Set(L ? L.towns || [] : []), conts = new Set(L ? L.visited || [] : []);
  const P = [];
  P.push(`<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f4766"/><stop offset="1" stop-color="#22354f"/></linearGradient>
    <radialGradient id="${id}v" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
    <filter id="${id}sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0b1220" flood-opacity=".45"/></filter></defs>`);
  P.push(`<rect width="1000" height="560" fill="url(#${id}s)"/>`);
  for (let k = 0; k < 9; k++) { const y = 40 + k * 60; P.push(`<path d="M${(k * 97) % 140} ${y} q 14 -6 28 0 t 28 0" fill="none" stroke="#9fb6d0" stroke-width="1" opacity=".18"/><path d="M${520 + (k * 61) % 300} ${y + 24} q 12 -5 24 0 t 24 0" fill="none" stroke="#9fb6d0" stroke-width="1" opacity=".14"/>`); }
  for (const [cid, c] of Object.entries(MAP_CONT)) {
    const d = smoothPath(roughen(c.pts, cid, 13)), known = !L || conts.has(cid);
    P.push(`<path d="${d}" fill="${c.fill}" filter="url(#${id}sh)" opacity="${known ? 1 : .78}"/><path d="${d}" fill="none" stroke="#e9dcbc" stroke-width="1.6" opacity=".55"/><path d="${d}" fill="none" stroke="#2a2a22" stroke-width="3" opacity=".12" transform="translate(0 2)"/>`);
  }
  // terrain
  [[520, 248, 14], [548, 236, 18], [575, 252, 13], [530, 270, 10], [565, 274, 11]].forEach(([x, y, s]) => P.push(mapMtn(x, y, s)));
  [[420, 214, 12, 1], [446, 206, 10, 1], [520, 128, 12, 1], [556, 118, 14, 1], [586, 132, 10, 1]].forEach(([x, y, s, sn]) => P.push(mapMtn(x, y, s, sn)));
  [[96, 196, 10], [120, 206, 8], [300, 200, 9]].forEach(([x, y, s]) => P.push(mapMtn(x, y, s)));
  for (let i = 0; i < 16; i++) P.push(mapTree(258 + (i % 6) * 15 + (i > 5 ? 6 : 0), 352 + Math.floor(i / 6) * 16));
  for (let i = 0; i < 5; i++) P.push(`<path d="M${780 + i * 30} ${180 + (i % 2) * 14} q 12 -8 24 0" fill="none" stroke="#8a7650" stroke-width="2" opacity=".5"/>`);
  P.push(`<g fill="#eef2f8" opacity=".75"><ellipse cx="852" cy="448" rx="30" ry="8"/><ellipse cx="930" cy="438" rx="26" ry="7"/><ellipse cx="880" cy="336" rx="22" ry="6"/></g>`);
  // continent labels
  for (const c of Object.values(MAP_CONT)) P.push(`<text x="${c.at[0]}" y="${c.at[1]}" text-anchor="middle" class="wm-cont">${esc(c.name.replace(' Continent', '').toUpperCase())}</text>`);
  P.push(`<text x="430" y="510" text-anchor="middle" class="wm-sea">RING SEA</text><text x="0" y="0" text-anchor="middle" class="wm-sea" transform="translate(776 296) rotate(-90)">EASTERN SEA</text>`);
  // your route through life
  if (L && (L.towns || []).length > 1) {
    const pts = L.towns.filter(t => MAP_POS[t]).map(t => MAP_POS[t]);
    P.push(`<path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="#f2cf83" stroke-width="2.2" stroke-dasharray="5 5" stroke-linecap="round" opacity=".85"/>`);
  }
  // towns
  for (const t of TOWNS) {
    const pos = MAP_POS[t.id]; if (!pos) continue;
    const hid = hiddenTown(L, t), isHere = t.id === here, v = seen.has(t.id), isSel = t.id === sel;
    const r = 3 + t.size * 1.3;
    const cls = `wm-town${isHere ? ' here' : ''}${v ? ' seen' : ''}${hid ? ' hid' : ''}${isSel ? ' sel' : ''}`;
    const label = hid ? '?' : t.name;
    P.push(`<g class="${cls}" data-a="maptown" data-v="${t.id}" ${hid ? '' : `data-tip="town:${t.id}"`} tabindex="0" role="button" aria-label="${esc(hid ? 'Hidden place' : t.name)}">
      ${isHere ? `<circle cx="${pos[0]}" cy="${pos[1]}" r="${r + 9}" class="wm-ring"/>` : ''}<circle cx="${pos[0]}" cy="${pos[1]}" r="${r + 6}" fill="transparent"/>
      <circle cx="${pos[0]}" cy="${pos[1]}" r="${r}" class="wm-dot"/>${t.size >= 4 ? `<circle cx="${pos[0]}" cy="${pos[1]}" r="${r - 2.4}" fill="none" stroke="#2a2418" stroke-width="1"/>` : ''}
      <text x="${pos[0] + r + 5}" y="${pos[1] + 4}" class="wm-lbl">${esc(label)}</text></g>`);
  }
  // compass
  P.push(`<g transform="translate(70 500)" opacity=".75"><circle r="22" fill="none" stroke="#e9dcbc" stroke-width="1"/><path d="M0 -20 L5 0 L0 20 L-5 0 Z" fill="#e9dcbc"/><path d="M-20 0 L0 4 L20 0 L0 -4 Z" fill="#e9dcbc" opacity=".6"/><text y="-26" text-anchor="middle" class="wm-n">N</text></g>`);
  P.push(`<rect width="1000" height="560" fill="url(#${id}v)" pointer-events="none"/>`);
  return `<div class="wmap"><svg viewBox="0 0 1000 560" role="img" aria-label="Map of the Six-Faced World">${P.join('')}</svg></div>`;
}
function mapPanel(L, tid) {
  const t = TOWN[tid] || TOWN[L.town]; const isHere = t.id === L.town; const hid = hiddenTown(L, t);
  if (hid) return `<div class="wm-panel"><div class="wm-p-main"><b>A hidden place</b><small>Someone must show you the way before it appears on your map.</small></div></div>`;
  const ti = travelInfo(L, t.id);
  return `<div class="wm-panel"><div class="wm-p-main"><b>${esc(t.name)}</b><small>${t.realm === CONT[t.cont].name ? '' : esc(t.realm) + ' · '}${CONT[t.cont].name} · ${SIZE_NAMES[t.size]}</small><p>${esc(t.note)}</p></div>
    <div class="wm-p-side">${isHere ? '<span class="tagc on">You are here</span>' : ti.ok ? btn(`Travel · ${ti.cost} gold`, 'travel', { data: { id: t.id }, disabled: L.ap <= 0, cost: '1', cls: 'gold' }) : `<small class="r-why">${icon('lock')} ${esc(ti.why)}</small>`}${(L.towns || []).includes(t.id) && !isHere ? '<span class="tagc">Visited</span>' : ''}</div></div>`;
}
function mapLegend(L) {
  const towns = TOWNS.filter(t => MAP_POS[t.id]);
  const seen = towns.filter(t => (L.towns || []).includes(t.id)).length;
  return `<div class="wm-legend"><span><i class="lg-here"></i>You are here</span><span><i class="lg-seen"></i>Visited</span><span><i class="lg-new"></i>Not yet visited</span><span><i class="lg-route"></i>Your journey</span><b class="num">${seen} of ${towns.length} places · ${(L.visited || []).length} of 5 continents</b></div>`;
}
