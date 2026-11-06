/* ===================== PORTRAITS: painted faces, real hairstyles, genetics, scars, age, and beauty =====================
   Shapes are authored in head-relative units: u runs across the face (−1 left edge, +1 right edge),
   v runs down it (−0.82 crown, 0 eye line, +0.97 chin). They scale with age, race, and sex. */
const HAIR_STYLES = ['Cropped', 'Side-swept', 'Long and straight', 'High ponytail', 'Side braid', 'Tousled', 'Bob', 'Slicked back', 'Long waves', 'Twin tails', 'Bun', 'Hime cut', 'Wolf cut', 'Spiky'];
const FACE_SHAPES = ['Oval', 'Square', 'Heart', 'Round'];
const BROW_SHAPES = ['Soft', 'Straight', 'Arched', 'Heavy'];
const EYE_SHAPES = ['Almond', 'Round', 'Narrow', 'Hooded'];
const MARK_NAMES = { none: 'None', freckles: 'Freckles', scar: 'Old scar', mole: 'Beauty mark', paint: 'Tribal markings' };
const BEARD_NAMES = { none: 'Clean-shaven', stubble: 'Stubble', beard: 'Full beard', mustache: 'Mustache' };
const R1 = (n) => Math.round(n * 10) / 10;
/* attractiveness: the Looks stat as a 0–1 beauty value, and how people would describe it */
const beautyOf = (looks) => clamp(((looks == null ? 8 : looks) - 2) / 16, 0, 1);
function beautyWord(looks, sex) {
  const l = looks == null ? 8 : looks;
  return l >= 17 ? 'Breathtaking' : l >= 14 ? 'Striking' : l >= 11 ? (sex === 'f' ? 'Beautiful' : 'Handsome') : l >= 8 ? 'Attractive' : l >= 5 ? 'Pleasant-looking' : l >= 3 ? 'Plain' : 'Homely';
}
let _pg = 0;
/* tapered lock of hair from root to tip; w is root width, bend curves it sideways */
function lockD(x0, y0, x1, y1, w, bend) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const mx = (x0 + x1) / 2 + nx * bend, my = (y0 + y1) / 2 + ny * bend;
  return `M${R1(x0 - nx * w / 2)} ${R1(y0 - ny * w / 2)} Q${R1(mx - nx * w * .34)} ${R1(my - ny * w * .34)} ${R1(x1)} ${R1(y1)} Q${R1(mx + nx * w * .34)} ${R1(my + ny * w * .34)} ${R1(x0 + nx * w / 2)} ${R1(y0 + ny * w / 2)}Z`;
}
/* a path written in head units: ['M',u,v,'C',u,v,u,v,u,v,'Q',u,v,u,v,'L',u,v,'Z'] */
function npath(m, cmds) {
  let s = '', i = 0;
  while (i < cmds.length) { const c = cmds[i++]; if (c === 'Z') { s += 'Z'; continue; } const n = c === 'C' ? 3 : c === 'Q' ? 2 : 1; s += c; for (let k = 0; k < n; k++) { s += m(cmds[i], cmds[i + 1]) + ' '; i += 2; } }
  return s;
}
/* ---------- HAIR ----------
   Front hair is one silhouette: the crown over the skull, side panels down past the temples or cheeks, and a fringe
   edge cut into locks. Back hair is a second silhouette behind the head with a hem of pointed tips. */
const jit = (seed, k, a) => ((hashStr(seed + k) % 1000) / 1000 - .5) * a;
/* the hem of a hair panel between two points, cut into n pointed locks (blunt when n = 0) */
function hemN(c, u0, v0, u1, v1, n, depth, curl, seed, k) {
  if (!n) { c.push('L', u1, v1); return; }
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2;
    const tu = u0 + (u1 - u0) * tm + jit(seed, k + 'u' + i, .06), tv = v0 + (v1 - v0) * tm + depth + jit(seed, k + 'v' + i, depth * .5);
    const eu = u0 + (u1 - u0) * t1, ev = v0 + (v1 - v0) * t1;
    c.push('Q', u0 + (u1 - u0) * (t0 + .2 / n) + curl * .04, tv - depth * .55, tu, tv, 'Q', eu - (u1 - u0) * (.2 / n) + curl * .04, tv - depth * .4, eu, ev);
  }
}
/* the front silhouette; f = fringe tips (left to right) as [u, v, curl, cut], val = how high the cuts between locks reach.
   drop: long face-framing locks that continue from sv down past the shoulders, flaring by flare and inset by din.
   Returns the path commands with .valleys (where locks part) and .tips for the shading pass. */
function frontN(o, seed) {
  const vol = o.vol || .06, wide = o.wide || .04, sv = o.sv == null ? -.1 : o.sv, inner = o.inner || .93, st = o.sideTips || 0, fr = o.fringe || [], val = o.val == null ? -.62 : o.val;
  const drop = o.drop || 0, fl = o.flare || 0, din = o.din || 0, dt = o.dropTips || 2, wv = o.wave || 0;
  const c = ['M', -1.0 - wide, sv], valleys = [];
  if (o.spikes) { c.push('C', -1.14 - wide, -.5, -1.1 - wide, -.8, -.92, -.9); for (const sp of o.spikes) c.push('L', sp[0], sp[1], 'L', sp[2], sp[3]); c.push('C', 1.1 + wide, -.8, 1.14 + wide, -.5, 1.0 + wide, sv); }
  else c.push('C', -1.12 - wide, -.62, -.66, -1.0 - vol, 0, -1.0 - vol, 'C', .66, -1.0 - vol, 1.12 + wide, -.62, 1.0 + wide, sv);
  if (drop) {
    // the right face-framing curtain: down the outside, a hem of locks, back up the inside to the temple
    const ob = 1.04 + wide + fl, ib = inner + din;
    c.push('C', 1.02 + wide + fl * .3 + wv * .2, sv + (drop - sv) * .35, ob + .02 - wv * .22, drop - (drop - sv) * .3, ob, drop);
    hemN(c, ob, drop, ib, drop - .06, dt, .16, o.sideCurl || 0, seed, 'dr');
    c.push('C', ib - .01 - wv * .22, drop - (drop - sv) * .45, inner - .01 + wv * .2, sv + (drop - sv) * .25, inner, sv);
  } else if (o.round && !st) c.push('Q', 1.0 + wide, sv + .1, .86 + wide, sv + .08, 'L', inner, sv - (o.sideRise || 0));
  else hemN(c, 1.0 + wide, sv, inner, sv - (o.sideRise || 0), st, .12, o.sideCurl || 0, seed, 'sr');
  // up the inside of the right panel to where the fringe starts
  const fr0 = fr.length ? fr[fr.length - 1] : [inner, -.3, 0];
  const top = Math.min(sv, fr0[1]);
  c.push('C', inner + .02, Math.max(top, sv - .25), inner + .03, top - .05, Math.min(inner, fr0[0] + .14), top - .12);
  // the fringe, right to left: up into a cut, down to a lock tip
  if (o.hairline) { const h = o.hairline; c.push('C', .8, h + .1, .45, h - .02, .14, h, 'L', 0, h + (o.peak || 0), 'L', -.14, h, 'C', -.45, h - .02, -.8, h + .1, -inner, Math.min(sv, -.3) - .12); }
  else {
    let pu = Math.min(inner, fr0[0] + .14);
    const cut = o.cut || .22;
    for (let i = fr.length - 1; i >= 0; i--) {
      const [tu, tv, cu] = fr[i], nu = i > 0 ? (tu + fr[i - 1][0]) / 2 : -Math.min(inner, -fr[0][0] + .14);
      const vu = i > 0 ? Math.max(val, Math.min(tv, fr[i - 1][1]) - (fr[i][3] || cut) + jit(seed, 'val' + i, .05)) : Math.min(sv, fr[0][1]) - .12;
      c.push('Q', pu - (pu - tu) * .35 + (cu || 0) * .05, (tv + val) / 2 - .02, tu, tv);
      c.push('Q', tu - (tu - nu) * .25 + (cu || 0) * .06, tv - (tv - vu) * .7, nu, vu);
      if (i > 0) valleys.push([nu, vu]);
      pu = nu;
    }
  }
  // down the inside of the left panel, then the left side hem (or curtain) back out
  const ltop = Math.min(sv, fr.length ? fr[0][1] : -.3);
  c.push('C', -inner - .03, ltop - .05, -inner - .02, Math.max(ltop, sv - .25), -inner, drop ? sv : sv - (o.sideRise || 0));
  if (drop) {
    const ob = 1.04 + wide + fl, ib = inner + din;
    c.push('C', -inner + .01 - wv * .2, sv + (drop - sv) * .25, -ib + .01 + wv * .22, drop - (drop - sv) * .45, -ib, drop - .06);
    hemN(c, -ib, drop - .06, -ob, drop, dt, .16, -(o.sideCurl || 0), seed, 'dl');
    c.push('C', -ob - .02 + wv * .22, drop - (drop - sv) * .3, -1.02 - wide - fl * .3 - wv * .2, sv + (drop - sv) * .35, -1.0 - wide, sv);
  } else if (o.round && !st) c.push('L', -.86 - wide, sv + .08, 'Q', -1.0 - wide, sv + .1, -1.0 - wide, sv);
  else hemN(c, -inner, sv - (o.sideRise || 0), -1.0 - wide, sv, st, .12, -(o.sideCurl || 0), seed, 'sl');
  c.push('Z');
  c.valleys = valleys; c.tips = fr.map(f => [f[0], f[1]]);
  return c;
}
/* a back curtain behind the head and shoulders, hemmed with pointed locks */
function backN(len, wide, tips, seed, flare, wave) {
  const c = ['M', -1.04, -.4, 'C', -1.16 - wide * .5, .1, -1.2 - wide, len * .5, -1.08 - wide - (flare || 0), len];
  const t = [];
  hemN(c, -1.08 - wide - (flare || 0), len, 1.08 + wide + (flare || 0), len, tips, .16 + (wave || 0) * .05, 0, seed, 'bk');
  c.push('C', 1.2 + wide, len * .5, 1.16 + wide * .5, .1, 1.04, -.4, 'C', .92, -1.06, -.92, -1.06, -1.04, -.4, 'Z');
  return c;
}
const fringeRow = (n, u0, u1, v, curl, seed, jv) => Array.from({ length: n }, (_, i) => { const t = n === 1 ? .5 : i / (n - 1); return [u0 + (u1 - u0) * t, v + jit(seed, 'fr' + i, jv || 0), curl]; });
/* every hairstyle */
function hairDef(S, st, seed) {
  const k = st <= 2 ? .72 : 1;
  switch (S) {
    case 0: return { front: { vol: .05, wide: .02, sv: -.16, inner: .96, sideTips: 1, fringe: fringeRow(6, -.78, .72, -.5, .6, seed, .06), val: -.7 }, back: backN(.12, -.02, 4, seed), strands: 6 };
    case 1: return { front: { vol: .12, wide: .06, sv: .3, inner: .9, sideTips: 2, sideCurl: .4, fringe: [[-.84, -.3, -.4], [-.58, -.36, .2], [-.28, -.3, .8], [.04, -.22, 1], [.38, -.12, 1], [.7, .02, .8]], val: -.66 }, back: backN(.95 * k, .04, 5, seed), part: -.5, strands: 8 };
    case 2: return { front: { vol: .08, wide: .06, sv: .3, inner: .8, drop: 1.85 * k, flare: .16, din: .08, dropTips: 3, fringe: [[-.72, -.1, -.6], [-.5, -.32, -.6], [-.22, -.5, -.4], [.22, -.5, .4, .42], [.5, -.32, .6], [.72, -.1, .6]], val: -.8, cut: .2 }, back: backN(2.3 * k, .14, 7, seed), part: 0, strands: 8 };
    case 3: return { front: { vol: .03, wide: 0, sv: -.08, inner: .96, sideTips: 1, fringe: [[-.62, -.42, -.3], [-.3, -.34, .2], [.06, -.38, .4], [.42, -.46, .5]], val: -.74 }, back: backN(.05, -.04, 3, seed), side: [[-.95, -.2, -1.0, .4, .16, -.04, .02], [.95, -.2, 1.0, .36, .16, .04, -.02]],
      tail: { root: [.42, -1.08], ctrl: [1.3, -1.5, 1.75, -.2], tip: [1.38, 1.7 * k], w: .3 }, strands: 6, combed: true };
    case 4: return { front: { vol: .06, wide: .03, sv: .18, inner: .92, sideTips: 1, fringe: [[-.8, -.1, -.6], [-.5, -.34, -.5], [-.18, -.48, -.3], [.2, -.48, .3, .4], [.52, -.34, .5], [.8, -.1, .6]], val: -.8, cut: .2 }, back: backN(.85 * k, .02, 5, seed), braid: { from: [.98, .12], to: [1.06, 2.0 * k], w: .62 }, part: 0, strands: 7 };
    case 5: return { front: { vol: .2, wide: .14, sv: .36, inner: .9, sideTips: 3, sideCurl: .6, fringe: [[-.86, -.28, -.8], [-.62, -.22, .6], [-.38, -.32, -.5], [-.12, -.2, .7], [.14, -.3, -.6], [.4, -.18, .8], [.66, -.26, -.4], [.86, -.12, .6]], val: -.6 }, back: backN(1.05 * k, .12, 7, seed, .06, 1), fly: 3, strands: 9 };
    case 6: return { front: { vol: .14, wide: .2, sv: .92, inner: .84, sideTips: 0, sideRise: -.06, round: true, fringe: fringeRow(8, -.82, .82, -.28, 0, seed, .02), val: -.38 }, back: ['M', -1.1, -.4, 'C', -1.32, .2, -1.3, .66, -1.2, .88, 'Q', -1.14, 1.0, -.98, .98, 'L', .98, .98, 'Q', 1.14, 1.0, 1.2, .88, 'C', 1.3, .66, 1.32, .2, 1.1, -.4, 'C', .92, -1.04, -.92, -1.04, -1.1, -.4, 'Z'], strands: 8, blunt: true };
    case 7: return { front: { vol: .1, wide: .02, sv: -.14, inner: .96, sideTips: 0, hairline: -.58, peak: .06 }, back: backN(.1, -.02, 4, seed), combed: true, strands: 0, lock: [.1, -.7, .3, -.28, .16] };
    case 8: return { front: { vol: .18, wide: .16, sv: .3, inner: .8, drop: 1.8 * k, flare: .3, din: .12, dropTips: 3, sideCurl: .8, wave: 1, fringe: [[-.74, -.04, -.6], [-.56, -.24, -.8], [-.3, -.46, -.6], [.08, -.44, .6, .38], [.42, -.22, .9], [.7, -.02, .8]], val: -.8, cut: .2 }, back: backN(2.2 * k, .34, 9, seed, .1, 3), part: -.3, strands: 9, wavy: true };
    case 9: return { front: { vol: .07, wide: .03, sv: .36, inner: .92, sideTips: 1, fringe: fringeRow(7, -.8, .8, -.26, 0, seed, .05), val: -.6 }, back: backN(.6, 0, 4, seed),
      tails: [{ root: [-.82, -.8], ctrl: [-1.7, -1.05, -1.95, .2], tip: [-1.5, 1.9 * k], w: .3 }, { root: [.82, -.8], ctrl: [1.7, -1.05, 1.95, .2], tip: [1.5, 1.9 * k], w: .3 }], strands: 7 };
    case 10: return { front: { vol: .03, wide: 0, sv: -.06, inner: .96, sideTips: 1, fringe: [[-.7, -.36, -.6], [-.36, -.44, .4], [.02, -.4, .7], [.42, -.34, .8]], val: -.72 }, back: backN(.05, -.04, 3, seed), side: [[-.96, -.3, -1.02, .64, .1, -.08, .06], [.96, -.3, 1.02, .6, .1, .08, -.06]], bun: [0, -1.1, .44], strands: 6, combed: true };
    case 11: return { front: { vol: .07, wide: .05, sv: .58, inner: .9, sideTips: 0, fringe: fringeRow(8, -.84, .84, -.27, 0, seed, .015), val: -.36 }, back: backN(2.3 * k, .14, 0, seed), side: [], strands: 8, blunt: true };
    case 12: return { front: { vol: .22, wide: .2, sv: .72, inner: .9, sideTips: 4, sideCurl: .9, fringe: [[-.84, -.2, -.6], [-.56, -.3, .5], [-.28, -.22, -.5], [0, -.32, .5], [.3, -.2, -.6], [.58, -.3, .6], [.84, -.18, .5]], val: -.58 }, back: backN(1.5 * k, .28, 8, seed, .18, 2), fly: 2, strands: 9 };
    case 13: return { front: { vol: .1, wide: .06, sv: -.12, inner: .96, sideTips: 1, spikes: [[-.9, -1.2, -.66, -.98], [-.52, -1.44, -.32, -1.06], [-.06, -1.5, .14, -1.08], [.42, -1.42, .58, -1.0], [.86, -1.2, .96, -.82]], fringe: [[-.62, -.36, -.6], [-.24, -.3, .4], [.14, -.36, .7], [.52, -.32, .9]], val: -.68 }, back: backN(.16, 0, 4, seed), strands: 6 };
  }
  return hairDef(0, st, seed);
}

/* ---------- the painter ---------- */
function portrait(o) {
  const race = RACE[o.race] || RACE.human;
  const lk = Object.assign({ style: 0, face: 0, brow: 0, eye: 0, mark: 'none', beard: 'none' }, o.look || randLook(o.race || 'human', o.sex));
  const age = o.age || 0, id = 'pg' + (++_pg), mini = !!o.mini, male = o.sex !== 'f', fem = !male;
  const coming = race.coming || 15;
  const st = age < 2 ? 0 : age < coming * .4 ? 1 : age < coming * .76 ? 2 : age < coming ? 3 : 4;
  const B = o.beauty == null ? .5 : o.beauty;            // 0 plain … 1 breathtaking
  const AG = clamp(o.aging || 0, 0, 1);                   // 0 young adult … 1 the end of a natural life
  const elder = AG >= .62 || !!o.elder;
  const dwarf = o.race === 'dwarf', half = o.race === 'halfling';
  const seed = o.seed || o.label || 'x';
  const hs = (k) => (hashStr(seed + k) % 1000) / 1000;
  const cx = 60;
  const hw = [22, 21, 19.5, 18.5, 18][st] * (dwarf ? 1.08 : 1) * (half ? 1.04 : 1) * (fem && st >= 3 ? .97 : 1);
  const hh = [21, 22.5, 23.5, 24, 24.5][st] * (half ? .96 : 1);
  const cy = [76, 72, 68, 66, 64][st];
  const m = (u, v) => `${R1(cx + u * hw)} ${R1(cy + v * hh)}`;
  const X = (u) => cx + u * hw, Y = (v) => cy + v * hh;
  // colors: hair greys with age, skin dulls a little with age and less beauty
  const gray = clamp((AG - .42) / .4, 0, 1) * (o.ageless ? 0 : 1);
  let hair = lk.hair || '#3b2a20'; if (gray) hair = mixHex(hair, '#d9d7d2', gray * .85);
  let skin = lk.skin || '#e8c0a1'; skin = mixHex(skin, '#c9b8a8', AG * .12);
  const skinL = shade(skin, .1), skinD = shade(skin, -.14), skinDD = shade(skin, -.3), lineC = shade(skin, -.64);
  const hairD = shade(hair, -.42), hairDD = shade(hair, -.6), hairL = shade(hair, .3 + B * .12), hairM = shade(hair, -.12);
  const garb = o.garb || 'tunic'; const gcol = o.cloth || (GARB_COL[garb] || GARB_COL.tunic)[hashStr(o.label || 'x') % (GARB_COL[garb] || GARB_COL.tunic).length];
  const S = st === 0 ? -1 : (lk.style || 0) % HAIR_STYLES.length;
  const H = S >= 0 ? hairDef(S, st, seed) : null;
  const P = [];
  // defs: background, garment, hair, skin, iris, soft blur
  P.push(`<defs><radialGradient id="${id}b" cx="50%" cy="34%" r="78%"><stop offset="0" stop-color="var(--pt-bg1)"/><stop offset="1" stop-color="var(--pt-bg2)"/></radialGradient>
    <linearGradient id="${id}g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${shade(gcol, .14)}"/><stop offset="1" stop-color="${shade(gcol, -.38)}"/></linearGradient>
    <linearGradient id="${id}h" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${R1(Y(-1.1))}" y2="${R1(Y(2.4))}"><stop offset="0" stop-color="${hairL}"/><stop offset=".22" stop-color="${hair}"/><stop offset=".6" stop-color="${hairM}"/><stop offset="1" stop-color="${hairD}"/></linearGradient>
    <linearGradient id="${id}hb" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${R1(Y(-1))}" y2="${R1(Y(2.4))}"><stop offset="0" stop-color="${hairM}"/><stop offset="1" stop-color="${hairDD}"/></linearGradient>
    <radialGradient id="${id}s" cx="38%" cy="34%" r="80%"><stop offset="0" stop-color="${skinL}"/><stop offset=".55" stop-color="${skin}"/><stop offset="1" stop-color="${skinD}"/></radialGradient>
    <linearGradient id="${id}n" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${skinDD}"/><stop offset="1" stop-color="${skinD}"/></linearGradient>
    ${mini ? '' : `<filter id="${id}bl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4"/></filter>`}
    <clipPath id="${id}c">${mini ? `<circle cx="${cx}" cy="${cy - 2}" r="34"/>` : '<rect width="120" height="150"/>'}</clipPath>${o.glow ? `<radialGradient id="${id}gl"><stop offset="0" stop-color="${o.glow}" stop-opacity=".55"/><stop offset=".6" stop-color="${o.glow}" stop-opacity=".16"/><stop offset="1" stop-color="${o.glow}" stop-opacity="0"/></radialGradient>` : ''}</defs>`);
  P.push(`<g clip-path="url(#${id}c)"><rect x="-10" y="-10" width="140" height="170" fill="url(#${id}b)"/>`);
  if (!mini) P.push(`<path d="M18 150 V66 a42 42 0 0 1 84 0 V150" fill="var(--pt-arch)" opacity=".55"/>`);
  // radiance: a warm light behind a beautiful face
  if (!mini && B >= .68 && !o.dead) P.push(`<radialGradient id="${id}rd" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9b8" stop-opacity="${R1((B - .6) * .9 * 100) / 100}"/><stop offset=".55" stop-color="#ffd98a" stop-opacity="${R1((B - .6) * .35 * 100) / 100}"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient><ellipse cx="${cx}" cy="${R1(Y(-.1))}" rx="${R1(hw * 2.1)}" ry="${R1(hh * 2)}" fill="url(#${id}rd)"/>`);
  if (o.glow && !mini) P.push(`<ellipse class="fxglow" cx="${cx}" cy="${cy + 10}" rx="54" ry="62" fill="url(#${id}gl)"/>`);
  // feathered wings rising behind the shoulders
  if (race.wings && st >= 1) {
    const wy = cy + hh + (st === 0 ? 2 : 10), k = st <= 2 ? .8 : 1;
    const wing = (s2) => { const x = (d) => R1(cx + s2 * d * k), y = (d) => R1(wy + d * k); return `M${x(12)} ${y(4)} C${x(18)} ${y(-22)} ${x(26)} ${y(-44)} ${x(36)} ${y(-52)} C${x(37)} ${y(-44)} ${x(39)} ${y(-38)} ${x(42)} ${y(-34)} Q${x(37)} ${y(-31)} ${x(40)} ${y(-25)} Q${x(35)} ${y(-23)} ${x(38)} ${y(-16)} Q${x(32)} ${y(-14)} ${x(34)} ${y(-7)} Q${x(27)} ${y(-6)} ${x(26)} ${y(2)} Z`; };
    const quill = (s2) => { const x = (d) => R1(cx + s2 * d * k), y = (d) => R1(wy + d * k); return `M${x(16)} ${y(-6)} Q${x(25)} ${y(-28)} ${x(35)} ${y(-48)} M${x(22)} ${y(-4)} Q${x(28)} ${y(-18)} ${x(37)} ${y(-30)} M${x(24)} ${y(0)} Q${x(28)} ${y(-8)} ${x(34)} ${y(-14)}`; };
    P.push(`<g><path d="${wing(-1)} ${wing(1)}" fill="#f1ede4" stroke="#c9c1ae" stroke-width=".7" stroke-linejoin="round"/><path d="${quill(-1)} ${quill(1)}" fill="none" stroke="#cfc6b2" stroke-width=".6" opacity=".8"/></g>`);
  }
  // ----- hair behind everything
  if (H) {
    if (H.tail) P.push(tailSvg(H.tail, m, X, Y, hw, id, hairD, hairDD, hairL, B, seed, mini));
    if (H.tails) for (const t of H.tails) P.push(tailSvg(t, m, X, Y, hw, id, hairD, hairDD, hairL, B, seed, mini));
    if (H.bun) { const [bu, bv, br] = H.bun; P.push(`<ellipse cx="${R1(X(bu))}" cy="${R1(Y(bv))}" rx="${R1(br * hw)}" ry="${R1(br * hw * .9)}" fill="url(#${id}h)"/><path d="M${R1(X(bu - br * .7))} ${R1(Y(bv))} Q${R1(X(bu))} ${R1(Y(bv - br * .9))} ${R1(X(bu + br * .7))} ${R1(Y(bv))}" fill="none" stroke="${hairL}" stroke-width="1.4" opacity=".5"/><path d="M${R1(X(bu - br * .5))} ${R1(Y(bv + br * .3))} Q${R1(X(bu))} ${R1(Y(bv - br * .2))} ${R1(X(bu + br * .55))} ${R1(Y(bv + br * .35))}" fill="none" stroke="${hairD}" stroke-width=".8" opacity=".6"/>${!mini ? `<path d="M${R1(X(bu + br * .5))} ${R1(Y(bv - br * .6))} L${R1(X(bu + br * 1.4))} ${R1(Y(bv - br * 1.3))}" stroke="#c9a86a" stroke-width="1.3" stroke-linecap="round"/><circle cx="${R1(X(bu + br * 1.45))}" cy="${R1(Y(bv - br * 1.35))}" r="1.5" fill="#e6c56f"/>` : ''}`); }
    if (H.back) { const bd = npath(m, H.back); P.push(`<path d="${bd}" fill="url(#${id}hb)" stroke="${hairDD}" stroke-width=".5" stroke-opacity=".55"/>`); if (!mini) P.push(`<clipPath id="${id}bc"><path d="${bd}"/></clipPath><g clip-path="url(#${id}bc)" fill="none" stroke="${hairDD}" stroke-width=".7" opacity=".4">${[-1.3, -1.1, -.9, .9, 1.1, 1.3].map((u, i) => `<path d="M${m(u * .8, -.4)} Q${m(u * 1.05, .6)} ${m(u, 2.4)}"/>`).join('')}</g>`); }
  }
  // ----- weapon behind the shoulders
  const shY = cy + hh + (st === 0 ? 2 : 10), sw = [30, 34, 38, 42, 46][st] * (dwarf ? 1.08 : 1) * (fem && st >= 3 ? .92 : 1);
  if (o.weapon === 'sword' && st >= 3 && !mini) { const hx = cx + sw * .78, hy = shY - 22; P.push(`<g><path d="M${cx - sw * .9} 156 L${hx - 3} ${hy + 9}" stroke="#aeb6c2" stroke-width="4.2" stroke-linecap="round"/><path d="M${cx - sw * .9} 156 L${hx - 3} ${hy + 9}" stroke="#e6ebf1" stroke-width="1.2" opacity=".7"/><path d="M${hx - 9} ${hy + 4} L${hx + 4} ${hy + 14}" stroke="#b8924d" stroke-width="3" stroke-linecap="round"/><path d="M${hx - 1} ${hy + 8} L${hx + 6} ${hy - 1}" stroke="#4a3322" stroke-width="3.2" stroke-linecap="round"/><circle cx="${hx + 7}" cy="${hy - 2.5}" r="2.4" fill="#d6b45a" stroke="#6b5222" stroke-width=".6"/></g>`); }
  if (o.weapon === 'staff' && st >= 3 && !mini) { const sx = cx - sw * .82, ty = cy - hh * .9; P.push(`<g><path d="M${sx + 4} 156 L${sx} ${ty + 6}" stroke="#6b4a2c" stroke-width="3.4" stroke-linecap="round"/><path d="M${sx + 4} 156 L${sx} ${ty + 6}" stroke="#9a7247" stroke-width="1" opacity=".6"/><path d="M${sx - 5} ${ty + 8} Q${sx} ${ty - 2} ${sx + 5} ${ty + 8}" fill="none" stroke="#6b4a2c" stroke-width="2"/><circle cx="${sx}" cy="${ty}" r="9" fill="#9ad4ff" opacity=".22"/><path d="M${sx} ${ty - 7} L${sx + 4.4} ${ty} L${sx} ${ty + 7} L${sx - 4.4} ${ty} Z" fill="#8fd0ff" stroke="#e6f6ff" stroke-width=".6"/></g>`); }
  // ----- body and clothes
  P.push(bodySvg(o, { cx, cy, hh, hw, shY, sw, st, garb, gcol, id, skin, skinD, skinDD, fem }));
  // ----- ears behind the head
  const ey = cy + hh * (st <= 1 ? .1 : .04);
  if (o.race === 'elf') P.push(`<path d="M${R1(cx - hw + 2)} ${R1(ey + 2)} L ${R1(cx - hw - 18)} ${R1(ey - 16)} Q ${R1(cx - hw - 6)} ${R1(ey - 4)} ${R1(cx - hw + 1)} ${R1(ey + 10)} Z M${R1(cx + hw - 2)} ${R1(ey + 2)} L ${R1(cx + hw + 18)} ${R1(ey - 16)} Q ${R1(cx + hw + 6)} ${R1(ey - 4)} ${R1(cx + hw - 1)} ${R1(ey + 10)} Z" fill="${skin}" stroke="${skinDD}" stroke-width=".8"/><path d="M${R1(cx - hw - 3)} ${R1(ey - 1)} L ${R1(cx - hw - 13)} ${R1(ey - 11)} M${R1(cx + hw + 3)} ${R1(ey - 1)} L ${R1(cx + hw + 13)} ${R1(ey - 11)}" stroke="${skinDD}" stroke-width=".7" opacity=".5"/>`);
  else if (race.fins) P.push(`<path d="M${R1(cx - hw + 2)} ${R1(ey - 6)} Q ${R1(cx - hw - 15)} ${R1(ey - 6)} ${R1(cx - hw - 8)} ${R1(ey + 13)} Q ${R1(cx - hw - 1)} ${R1(ey + 7)} ${R1(cx - hw + 2)} ${R1(ey + 7)} Z M${R1(cx + hw - 2)} ${R1(ey - 6)} Q ${R1(cx + hw + 15)} ${R1(ey - 6)} ${R1(cx + hw + 8)} ${R1(ey + 13)} Q ${R1(cx + hw + 1)} ${R1(ey + 7)} ${R1(cx + hw - 2)} ${R1(ey + 7)} Z" fill="${shade(lk.hair || '#4a8fb0', .2)}" stroke="${hairD}" stroke-width=".7"/>`);
  else if (race.ears !== 'beast' && !(S >= 0 && HIDES_EARS.has(S))) P.push(`<path d="M${R1(cx - hw + 1.5)} ${R1(ey - 4)} C ${R1(cx - hw - 5.5)} ${R1(ey - 6)}, ${R1(cx - hw - 5)} ${R1(ey + 9)}, ${R1(cx - hw + 1.5)} ${R1(ey + 9)} Z M${R1(cx + hw - 1.5)} ${R1(ey - 4)} C ${R1(cx + hw + 5.5)} ${R1(ey - 6)}, ${R1(cx + hw + 5)} ${R1(ey + 9)}, ${R1(cx + hw - 1.5)} ${R1(ey + 9)} Z" fill="${skinD}"/><path d="M${R1(cx - hw - .5)} ${R1(ey - 1)} q -2.6 2.5 0 6 M${R1(cx + hw + .5)} ${R1(ey - 1)} q 2.6 2.5 0 6" fill="none" stroke="${skinDD}" stroke-width=".7" opacity=".6"/>`);
  // ----- the face
  P.push(faceSvg(o, lk, { cx, cy, hw, hh, st, ey, id, skin, skinL, skinD, skinDD, lineC, hair, hairD, hairL, B, AG, fem, male, mini, elder, dwarf, hs, m, X, Y }));
  // ----- hair in front
  if (S === -1) P.push(`<path d="M${cx - 6} ${R1(Y(-.86))} q 4 -7 7 -1 M${cx + 1} ${R1(Y(-.9))} q 4 -8 8 -1 M${cx - 10} ${R1(Y(-.78))} q 2 -5 5 -2" fill="none" stroke="${hairD}" stroke-width="1.6" stroke-linecap="round"/>`);
  else P.push(frontHairSvg(H, { m, X, Y, hw, hh, id, hair, hairD, hairDD, hairL, B, st, mini, hs, seed }));
  if (H && H.braid) P.push(braidSvg(H.braid, X, Y, hw, id, hairD, hairL, hairDD));
  // circlet, race features over the hair, hats
  const top = Y(-.98), hl = Y(-.44);
  if (o.circlet && st >= 2) {
    const yy = hl - 3, g1 = '#e2bf6a', g2 = '#8a6526';
    P.push(`<path d="M${R1(cx - hw * .95)} ${R1(yy + 4)} Q${cx} ${R1(yy - 5)} ${R1(cx + hw * .95)} ${R1(yy + 4)}" fill="none" stroke="${g2}" stroke-width="2.6"/><path d="M${R1(cx - hw * .95)} ${R1(yy + 4)} Q${cx} ${R1(yy - 5)} ${R1(cx + hw * .95)} ${R1(yy + 4)}" fill="none" stroke="${g1}" stroke-width="1.4"/>`);
    if (o.circlet >= 2) P.push(`<path d="M${cx - 9} ${R1(yy - 1)} L${cx - 6} ${R1(yy - 9)} L${cx - 3} ${R1(yy - 2)} L${cx} ${R1(yy - 12)} L${cx + 3} ${R1(yy - 2)} L${cx + 6} ${R1(yy - 9)} L${cx + 9} ${R1(yy - 1)} Z" fill="${g1}" stroke="${g2}" stroke-width=".7"/>`);
    P.push(`<path d="M${cx} ${R1(yy - 4.6)} l2.6 2.6 l-2.6 2.6 l-2.6 -2.6 Z" fill="${o.circlet >= 2 ? '#c4302e' : '#5fa8e0'}" stroke="#fff" stroke-width=".4"/>`);
  }
  if (race.ears === 'beast') P.push(`<path d="M${R1(cx - hw + 1)} ${R1(top + 12)} L ${R1(cx - hw + 2)} ${R1(top - 12)} L ${R1(cx - hw * .2)} ${R1(top + 2)} Z M${R1(cx + hw - 1)} ${R1(top + 12)} L ${R1(cx + hw - 2)} ${R1(top - 12)} L ${R1(cx + hw * .2)} ${R1(top + 2)} Z" fill="url(#${id}h)"/><path d="M${R1(cx - hw + 5)} ${R1(top + 5)} L ${R1(cx - hw + 5.5)} ${R1(top - 5)} L ${R1(cx - hw * .42)} ${R1(top + 3)} Z M${R1(cx + hw - 5)} ${R1(top + 5)} L ${R1(cx + hw - 5.5)} ${R1(top - 5)} L ${R1(cx + hw * .42)} ${R1(top + 3)} Z" fill="#d9a29a" opacity=".55"/>`);
  if (race.horns && st >= 1) { const hc = o.race === 'dragon' ? '#e6dcc6' : '#2b2530', hd = o.race === 'dragon' ? '#a89b80' : '#141016'; P.push(`<path d="M${R1(cx - hw * .55)} ${R1(top + 7)} C ${R1(cx - hw * 1.25)} ${R1(top - 2)}, ${R1(cx - hw * 1.05)} ${R1(top - 12)}, ${R1(cx - hw * .6)} ${R1(top - 14)} C ${R1(cx - hw * .85)} ${R1(top - 8)}, ${R1(cx - hw * .7)} ${R1(top - 3)}, ${R1(cx - hw * .25)} ${R1(top + 4)} Z M${R1(cx + hw * .55)} ${R1(top + 7)} C ${R1(cx + hw * 1.25)} ${R1(top - 2)}, ${R1(cx + hw * 1.05)} ${R1(top - 12)}, ${R1(cx + hw * .6)} ${R1(top - 14)} C ${R1(cx + hw * .85)} ${R1(top - 8)}, ${R1(cx + hw * .7)} ${R1(top - 3)}, ${R1(cx + hw * .25)} ${R1(top + 4)} Z" fill="${hc}" stroke="${hd}" stroke-width=".8"/>`); }
  if (race.gem) P.push(`<path d="M${cx} ${R1(hl - 4)} l 3.6 3.8 l -3.6 3.8 l -3.6 -3.8 Z" fill="#c4302e" stroke="#ffb3a8" stroke-width=".6"/><path d="M${cx - 1.2} ${R1(hl - 1.4)} l 1.2 -1.3" stroke="#fff" stroke-width=".7" opacity=".7"/>`);
  if (o.hat && st >= 2) P.push(`<path d="M${R1(cx - hw - 14)} ${R1(top + 8)} Q ${cx} ${R1(top - 2)} ${R1(cx + hw + 14)} ${R1(top + 8)} Q ${cx} ${R1(top + 2)} ${R1(cx - hw - 14)} ${R1(top + 8)} Z" fill="#2c2a3a"/><path d="M${R1(cx - hw * .75)} ${R1(top + 4)} C ${R1(cx - hw * .5)} ${R1(top - 16)}, ${cx + 2} ${R1(top - 34)}, ${R1(cx + hw * 1.1)} ${R1(top - 30)} C ${R1(cx + hw * .3)} ${R1(top - 22)}, ${R1(cx + hw * .6)} ${R1(top - 8)}, ${R1(cx + hw * .8)} ${R1(top + 4)} Z" fill="#34324a"/><path d="M${R1(cx - hw * .7)} ${R1(top + 1)} Q ${cx} ${R1(top - 4)} ${R1(cx + hw * .78)} ${R1(top + 1)}" stroke="#7a5aa8" stroke-width="2" fill="none"/>`);
  if (!mini && B >= .8 && !o.dead && st >= 2) {
    const sp = (x, y, r, op) => `<path d="M${R1(x)} ${R1(y - r)} Q${R1(x + r * .16)} ${R1(y - r * .16)} ${R1(x + r)} ${R1(y)} Q${R1(x + r * .16)} ${R1(y + r * .16)} ${R1(x)} ${R1(y + r)} Q${R1(x - r * .16)} ${R1(y + r * .16)} ${R1(x - r)} ${R1(y)} Q${R1(x - r * .16)} ${R1(y - r * .16)} ${R1(x)} ${R1(y - r)}Z" fill="#fff8e2" opacity="${op}"/>`;
    const pts = [[-1.55, -.75, 3.2], [1.5, -.95, 2.2], [1.7, .25, 2.6], [-1.75, .45, 1.8], [1.25, -1.45, 1.5]].slice(0, B >= .93 ? 5 : B >= .87 ? 4 : 3);
    P.push(`<g class="sparkle">${pts.map(([u, v, r], i) => sp(X(u), Y(v), r * (.8 + B * .3), R1((.55 + (i % 2) * .2) * 100) / 100)).join('')}</g>`);
  }
  P.push('</g>');
  if (o.ring) P.push(`<circle cx="${cx}" cy="${cy - 2}" r="33" fill="none" stroke="${o.ring}" stroke-width="2"/>`);
  const vb = mini ? `${cx - 34} ${cy - 36} 68 68` : o.crop === 'full' ? '12 14 96 120' : o.crop === 'close' ? '25 26 70 87.5' : '20 21 80 100';
  return `<svg class="portrait${o.dead ? ' dead' : ''}${mini ? ' mini' : ''}" viewBox="${vb}" role="img" aria-label="${esc(o.label || 'Portrait')}">${P.join('')}</svg>`;
}
/* a lock of hair along a cubic centre line (head units): narrow at the root, fullest a third of the way, tapering to split tips */
function ribbonD(m, P, wRoot, wMax, tips, seed) {
  const N = 18, Lp = [], Rp = [], at = (t) => { const a = 1 - t; return [a * a * a * P[0][0] + 3 * a * a * t * P[1][0] + 3 * a * t * t * P[2][0] + t * t * t * P[3][0], a * a * a * P[0][1] + 3 * a * a * t * P[1][1] + 3 * a * t * t * P[2][1] + t * t * t * P[3][1]]; };
  const end = tips > 1 ? .84 : 1;
  for (let i = 0; i <= N; i++) {
    const t = end * i / N, p = at(t), q = at(Math.min(1, t + .01)), du = q[0] - p[0], dv = q[1] - p[1], len = Math.hypot(du, dv) || 1;
    const w = t < .3 ? wRoot + (wMax - wRoot) * Math.sin(t / .3 * Math.PI / 2) : wMax * Math.max(0, 1 - (t - .3) / .72) ** .8;
    Lp.push([p[0] - dv / len * w, p[1] + du / len * w]); Rp.push([p[0] + dv / len * w, p[1] - du / len * w]);
  }
  let d = 'M' + Lp.map(p => m(p[0], p[1])).join(' L');
  if (tips > 1) {
    const l = Lp[N], r = Rp[N];
    for (let k = 0; k < tips; k++) {
      const f0 = k / tips, f1 = (k + 1) / tips, fm = (f0 + f1) / 2, tp = at(1), dd = .1 + jit(seed, 'tp' + k, .08);
      const bx = l[0] + (r[0] - l[0]) * fm, byy = l[1] + (r[1] - l[1]) * fm, ex = l[0] + (r[0] - l[0]) * f1, eyy = l[1] + (r[1] - l[1]) * f1;
      d += ` L${m(bx + (tp[0] - bx) * .8, byy + (tp[1] - byy) * .8 + dd)}`;
      if (k < tips - 1) d += ` L${m(ex + (tp[0] - ex) * .3, eyy + (tp[1] - eyy) * .3)}`;
    }
  }
  return d + ' L' + Rp.reverse().map(p => m(p[0], p[1])).join(' L') + 'Z';
}
/* a ponytail or twin tail: gathered at a tie, full, with strands and a split tip */
function tailSvg(t, m, X, Y, hw, id, hairD, hairDD, hairL, B, seed, mini) {
  const [ru, rv] = t.root, [c1u, c1v, c2u, c2v] = t.ctrl, [tu, tv] = t.tip, P = [[ru, rv], [c1u, c1v], [c2u, c2v], [tu, tv]];
  const d = ribbonD(m, P, t.w * .32, t.w, 3, seed);
  const out = [`<path d="${d}" fill="url(#${id}h)"/>`, `<path d="${d}" fill="${hairDD}" opacity=".18"/>`];
  if (!mini) {
    const off = (k) => P.map(([u, v], i) => [u + (i ? k * t.w * (i === 3 ? .1 : .6) : k * t.w * .1), v]);
    out.push(`<clipPath id="${id}tc${ru > 0 ? 'r' : 'l'}"><path d="${d}"/></clipPath><g clip-path="url(#${id}tc${ru > 0 ? 'r' : 'l'})"><path d="${ribbonD(m, off(.45), .01, t.w * .14, 1, seed)}" fill="${hairDD}" opacity=".4"/><path d="${ribbonD(m, off(-.35), .01, t.w * .12, 1, seed)}" fill="${hairDD}" opacity=".32"/><path d="${ribbonD(m, off(-.05), .01, t.w * .16, 1, seed)}" fill="${hairL}" opacity="${R1((.25 + B * .35) * 100) / 100}"/></g>`);
  }
  if (t.tie !== false) out.push(`<ellipse cx="${R1(X(ru))}" cy="${R1(Y(rv + .04))}" rx="${R1(hw * t.w * .4)}" ry="${R1(hw * .07)}" fill="${t.tieC || '#8a3a34'}" transform="rotate(${ru > 0 ? 28 : -28} ${R1(X(ru))} ${R1(Y(rv + .04))})"/>`);
  return out.join('');
}
/* a braid over the shoulder: three strands woven into alternating leaves that narrow toward a tied tuft */
function braidSvg(b, X, Y, hw, id, hairD, hairL, hairDD) {
  const [fu, fv] = b.from, [tu, tv] = b.to, n = 8, out = [];
  const x0 = X(fu), y0 = Y(fv), x1 = X(tu), y1 = Y(tv), h = (y1 - y0) / n;
  const leaf = (ax, ay, bx, by, wd) => { const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, nx = -dy / l * wd, ny = dx / l * wd; return `M${R1(ax)} ${R1(ay)} Q${R1(mx + nx)} ${R1(my + ny)} ${R1(bx)} ${R1(by)} Q${R1(mx - nx)} ${R1(my - ny)} ${R1(ax)} ${R1(ay)}Z`; };
  for (let i = 0; i < n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t + Math.sin(t * 3.1) * 1.8, y = y0 + (y1 - y0) * t, w = b.w * hw * (1 - t * .4);
    for (const [ax, ay, bx, by] of [[x - w * .5, y, x + w * .2, y + h * 1.2], [x + w * .5, y + h * .5, x - w * .2, y + h * 1.7]]) {
      const d = leaf(ax, ay, bx, by, w * .27);
      out.push(`<path d="${d}" fill="url(#${id}h)" stroke="${hairDD}" stroke-width=".55" stroke-opacity=".7"/><path d="M${R1(ax + (bx - ax) * .25)} ${R1(ay + (by - ay) * .25)} L${R1(ax + (bx - ax) * .6)} ${R1(ay + (by - ay) * .6)}" stroke="${hairL}" stroke-width=".9" stroke-linecap="round" opacity=".55"/>`);
    }
  }
  const ex = x1 + Math.sin(3.1) * 1.8, ey = y1 + h * .9;
  out.push(`<path d="M${R1(ex - 2.4)} ${R1(ey + 1)} L${R1(ex - 3.6)} ${R1(ey + 8)} L${R1(ex - 1)} ${R1(ey + 5.6)} L${R1(ex)} ${R1(ey + 9)} L${R1(ex + 1.2)} ${R1(ey + 5.6)} L${R1(ex + 3.6)} ${R1(ey + 8)} L${R1(ex + 2.4)} ${R1(ey + 1)} Z" fill="url(#${id}h)" stroke="${hairDD}" stroke-width=".5" stroke-opacity=".6"/><rect x="${R1(ex - 3)}" y="${R1(ey - 1)}" width="6" height="2.6" rx="1.1" fill="#8a3a34"/>`);
  return out.join('');
}
/* front hair: silhouette, depth, strands, sheen, flyaways; plus long side locks */
function sideLockD(X, Y, l, hw) {
  const [u0, v0, u1, v1, w, b1, b2] = l, x0 = X(u0), y0 = Y(v0), x1 = X(u1), y1 = Y(v1), W = w * hw, dy = y1 - y0;
  const s = Math.sign(u0) || 1;
  return `M${R1(x0 - W / 2)} ${R1(y0)} C${R1(x0 - W * .5 + b1 * hw)} ${R1(y0 + dy * .35)} ${R1(x1 - W * .4 + b2 * hw)} ${R1(y0 + dy * .7)} ${R1(x1)} ${R1(y1)} C${R1(x1 + W * .45 + b2 * hw)} ${R1(y0 + dy * .66)} ${R1(x0 + W * .55 + b1 * hw)} ${R1(y0 + dy * .3)} ${R1(x0 + W / 2)} ${R1(y0)}Z`;
}
const HIDES_EARS = new Set([1, 2, 4, 5, 6, 8, 9, 11, 12]);
/* a tapered stroke along a quadratic in head units, w0 wide at the start and w1 at the end (fractions of the head width) */
function taperD(m, hw, p0, p1, p2, w0, w1) {
  const N = 6, L = [], Rr = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), cc = t * t;
    const u = a * p0[0] + b * p1[0] + cc * p2[0], v = a * p0[1] + b * p1[1] + cc * p2[1];
    const du = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]), dv = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    const len = Math.hypot(du, dv) || 1, w = (w0 + (w1 - w0) * t) / 2;
    L.push([u - dv / len * w, v + du / len * w]); Rr.push([u + dv / len * w, v - du / len * w]);
  }
  return 'M' + L.map(p => m(p[0], p[1])).join(' L') + ' L' + Rr.reverse().map(p => m(p[0], p[1])).join(' L') + 'Z';
}
function frontHairSvg(H, c) {
  const { m, X, Y, hw, id, hair, hairD, hairDD, hairL, B, st, mini, hs, seed } = c;
  const out = [], fN = frontN(H.front, seed), fD = npath(m, fN), F = H.front;
  const sides = (H.side || []).map(l => sideLockD(X, Y, l, hw));
  // shadow the hair casts on the forehead and cheeks
  if (!mini) out.push(`<path d="${fD}" fill="${hairDD}" opacity=".34" transform="translate(.6 1.8)" filter="url(#${id}bl)"/>`);
  for (const d of sides) out.push(`<path d="${d}" fill="url(#${id}h)"/>`);
  out.push(`<path d="${fD}" fill="url(#${id}h)"/>`);
  out.push(`<clipPath id="${id}hc"><path d="${fD}"/>${sides.map(d => `<path d="${d}"/>`).join('')}</clipPath><g clip-path="url(#${id}hc)">`);
  const pu = H.part == null ? 0 : H.part, n = mini ? 0 : (H.strands || 6), sv = F.sv == null ? -.1 : F.sv;
  if (n) {
    // locks part at every cut in the fringe: dark separations run from each cut up toward the part
    const dk = [], lt = [];
    for (const [u, v] of fN.valleys) dk.push(taperD(m, hw, [u, v + .03], [u * .9 + pu * .1, (v - .95) / 2], [pu + (u - pu) * .4, -.98], .09, 0));
    // light runs down the middle of each lock
    fN.tips.forEach(([u, v], i) => { if (i % 2 === 0 || B > .55) lt.push(taperD(m, hw, [u * .96, v - .1], [u * .9 + pu * .1, (v - .9) / 2], [pu + (u - pu) * .5, -.9], .07, 0)); });
    // the side panels and long curtains
    for (const s of [-1, 1]) {
      const iu = (F.inner || .93) * s, ou = (1.02 + (F.wide || .04)) * s;
      dk.push(taperD(m, hw, [s * .5, -.94], [s * 1.0, -.66], [(iu + ou) / 2 + s * .02, sv + (F.drop ? .1 : -.06)], 0, .08));
      if (F.drop) {
        const ob = (1.04 + (F.wide || .04) + (F.flare || 0)) * s, ib = ((F.inner || .9) + (F.din || 0)) * s;
        dk.push(taperD(m, hw, [(iu + ou) / 2, sv - .1], [(iu + ou) / 2 + s * .04, (sv + F.drop) / 2], [(ib + ob) / 2, F.drop - .02], .02, .1));
        dk.push(taperD(m, hw, [iu + s * .04, sv + .2], [iu + s * .06, (sv + F.drop) / 2 + .2], [ib + s * .08, F.drop - .1], .04, .06));
        lt.push(taperD(m, hw, [ou - s * .07, sv - .2], [ou - s * .02, (sv + F.drop) / 2], [ob - s * .12, F.drop - .2], .06, 0));
      }
    }
    out.push(`<g fill="${hairDD}" opacity=".42">${dk.map(d => `<path d="${d}"/>`).join('')}</g><g fill="${hairL}" opacity="${R1((.18 + B * .3) * 100) / 100}">${lt.map(d => `<path d="${d}"/>`).join('')}</g>`);
  }
  if (H.combed) out.push(`<g fill="${hairD}" opacity=".5">${[-.7, -.42, -.14, .14, .42, .7].map(u => `<path d="${taperD(m, hw, [u * .94, -.5], [u * 1.02, -.84], [u * .7, -1.04], .06, 0)}"/>`).join('')}</g>`);
  if (H.part != null && !H.combed) out.push(`<path d="${taperD(m, hw, [H.part, -1.04], [H.part + .02, -.9], [H.part * .9, -.72], .06, .02)}" fill="${hairDD}" opacity=".55"/>`);
  // the angel ring: a band of light around the crown with a toothed lower edge, brighter on lustrous hair
  if (!mini || B > .5) {
    const N = 14, up = [], lo = [];
    for (let i = 0; i <= N; i++) {
      const u = -.86 + 1.72 * i / N, q = (u / .86) ** 2, vt = -.86 + .4 * q - (F.vol || 0) * .4;
      up.push(m(u, vt)); lo.push(m(u * .98, vt + (.15 - q * .06) * (.7 + B * .5) + (i % 2 ? .07 : 0)));
    }
    out.push(`<path d="M${up.join(' L')} L${lo.reverse().join(' L')}Z" fill="${hairL}" opacity="${R1((.3 + B * .45) * 100) / 100}"/>`);
    if (!mini && B > .4) out.push(`<g fill="#fff" opacity="${R1(Math.min(.85, (B - .3) * .95) * 100) / 100}"><path d="${taperD(m, hw, [-.62, -.62], [-.4, -.78], [-.16, -.82], .05, .02)}"/><path d="${taperD(m, hw, [.18, -.82], [.36, -.8], [.5, -.72], .04, .01)}"/></g>`);
  }
  out.push('</g>');
  // a fine ink line around the hair, the way a cel painter would finish it
  out.push(`<path d="${fD}" fill="none" stroke="${hairDD}" stroke-width="${mini ? .7 : .5}" stroke-linejoin="round" opacity=".62"/>${sides.map(d => `<path d="${d}" fill="none" stroke="${hairDD}" stroke-width=".45" opacity=".5"/>`).join('')}`);
  if (H.lock) { const [u0, v0, u1, v1, w] = H.lock; out.push(`<path d="${lockD(X(u0), Y(v0), X(u1), Y(v1), w * hw, w * hw * .8)}" fill="url(#${id}h)"/>`); }
  // flyaways: more on untamed styles and plainer looks
  const fly = mini ? 0 : Math.round((H.fly || 0) * (1.2 - B * .6) + Math.max(0, .55 - B) * 6);
  for (let i = 0; i < fly; i++) { const u = (hs('fy' + i) - .5) * 1.7, v = -1.0 - (H.front.vol || 0) + hs('fv' + i) * .12; out.push(`<path d="M${m(u, v + .04)} q ${R1((hs('fx' + i) - .5) * 6)} ${R1(-2 - hs('fz' + i) * 3)} ${R1((hs('fw' + i) - .5) * 7)} ${R1(-1.5 - hs('fq' + i) * 2)}" fill="none" stroke="${hair}" stroke-width=".4" opacity=".6"/>`); }
  return out.join('');
}

/* the face: shape, light, eyes, brows, nose, lips, age, marks and scars */
function faceSvg(o, lk, c) {
  const { cx, cy, hw, hh, st, ey, id, skin, skinL, skinD, skinDD, lineC, hair, hairD, B, AG, fem, male, mini, elder, dwarf, hs, X, Y } = c;
  const out = [], adult = st >= 3;
  // face shape: beauty refines the jaw (a V-line for women, a defined jaw for men)
  const F = [{ jw: .78, jy: .6, cw: .3 }, { jw: .9, jy: .7, cw: .44 }, { jw: .62, jy: .55, cw: .18 }, { jw: .88, jy: .6, cw: .42 }][(lk.face || 0) % 4];
  const kidR = st <= 2 ? .08 : 0;
  const plain = adult ? Math.max(0, .4 - B) : 0;
  const jw = F.jw + kidR - (fem && adult ? .06 + B * .06 : 0) + (male && adult ? .04 + B * .03 : 0) + plain * .22 + (AG > .6 ? (AG - .6) * .1 : 0);
  const jy = F.jy + (male && adult ? B * .04 : 0);
  const cw = F.cw + kidR - (fem && adult ? .05 + B * .04 : 0) + (male && adult ? .06 : 0) + plain * .2;
  const face = `M${R1(cx - hw)} ${R1(cy - hh * .1)} C ${R1(cx - hw)} ${R1(cy - hh * 1.06)}, ${R1(cx + hw)} ${R1(cy - hh * 1.06)}, ${R1(cx + hw)} ${R1(cy - hh * .1)} C ${R1(cx + hw * 1.01)} ${R1(cy + hh * .3)}, ${R1(cx + hw * jw)} ${R1(cy + hh * jy)}, ${R1(cx + hw * cw)} ${R1(cy + hh * .93)} Q ${cx} ${R1(cy + hh * 1.05)}, ${R1(cx - hw * cw)} ${R1(cy + hh * .93)} C ${R1(cx - hw * jw)} ${R1(cy + hh * jy)}, ${R1(cx - hw * 1.01)} ${R1(cy + hh * .3)}, ${R1(cx - hw)} ${R1(cy - hh * .1)} Z`;
  out.push(`<path d="${face}" fill="url(#${id}s)" stroke="${shade(skin, -.42)}" stroke-width="${mini ? .6 : .5}" stroke-opacity=".5"/>`);
  out.push(`<clipPath id="${id}fc"><path d="${face}"/></clipPath><g clip-path="url(#${id}fc)">`);
  // shadow side, cheekbones and jaw contour (light falls from the upper left)
  out.push(`<path d="M${R1(cx + hw * .55)} ${R1(cy - hh)} C ${R1(cx + hw * 1.1)} ${R1(cy - hh * .2)}, ${R1(cx + hw * .9)} ${R1(cy + hh * .8)}, ${R1(cx + hw * .2)} ${R1(cy + hh * 1.1)} L ${R1(cx + hw * 1.4)} ${R1(cy + hh * 1.2)} L ${R1(cx + hw * 1.4)} ${R1(cy - hh)} Z" fill="${skinDD}" opacity=".22"${mini ? '' : ` filter="url(#${id}bl)"`}/>`);
  if (adult && !mini) {
    out.push(`<ellipse cx="${R1(cx - hw * .52)}" cy="${R1(ey + hh * .2)}" rx="${R1(hw * .26)}" ry="${R1(hh * .07)}" fill="${skinL}" opacity="${R1((.25 + B * .35) * 100) / 100}" filter="url(#${id}bl)" transform="rotate(-12 ${R1(cx - hw * .52)} ${R1(ey + hh * .2)})"/><ellipse cx="${R1(cx + hw * .55)}" cy="${R1(ey + hh * .22)}" rx="${R1(hw * .2)}" ry="${R1(hh * .06)}" fill="${skinL}" opacity="${R1((.12 + B * .2) * 100) / 100}" filter="url(#${id}bl)" transform="rotate(12 ${R1(cx + hw * .55)} ${R1(ey + hh * .22)})"/>`);
    out.push(`<path d="M${R1(cx - hw * .84)} ${R1(cy + hh * .36)} Q ${R1(cx - hw * .62)} ${R1(cy + hh * .5)} ${R1(cx - hw * .5)} ${R1(cy + hh * .44)} M${R1(cx + hw * .84)} ${R1(cy + hh * .36)} Q ${R1(cx + hw * .62)} ${R1(cy + hh * .5)} ${R1(cx + hw * .5)} ${R1(cy + hh * .44)}" fill="none" stroke="${skinDD}" stroke-width="2.4" opacity="${R1((male ? .12 + B * .12 : .06 + B * .08) * 100) / 100}" filter="url(#${id}bl)"/>`);
    out.push(`<ellipse cx="${cx}" cy="${R1(cy + hh * .88)}" rx="${R1(hw * .2)}" ry="${R1(hh * .05)}" fill="${skinL}" opacity=".35" filter="url(#${id}bl)"/><ellipse cx="${R1(cx - hw * .1)}" cy="${R1(cy - hh * .62)}" rx="${R1(hw * .45)}" ry="${R1(hh * .12)}" fill="${skinL}" opacity="${R1((.2 + B * .25) * 100) / 100}" filter="url(#${id}bl)"/>`);
  }
  // a plain face: uneven ruddiness and duller skin
  if (plain && !mini) out.push(`<g fill="#c4685a" opacity="${R1(plain * .5 * 100) / 100}" filter="url(#${id}bl)"><ellipse cx="${R1(cx - hw * .5)}" cy="${R1(ey + hh * .42)}" rx="${R1(hw * .22)}" ry="${R1(hh * .12)}"/><ellipse cx="${R1(cx + hw * .58)}" cy="${R1(ey + hh * .38)}" rx="${R1(hw * .16)}" ry="${R1(hh * .1)}"/><ellipse cx="${cx}" cy="${R1(cy + hh * .4)}" rx="${R1(hw * .12)}" ry="${R1(hh * .08)}"/></g>`);
  // blush: children, and adults who glow
  const blush = st <= 2 ? .22 : fem ? .1 + B * .16 : .03 + B * .04;
  if (!mini || st <= 2) out.push(`<ellipse cx="${R1(cx - hw * .55)}" cy="${R1(ey + hh * .36)}" rx="${R1(hw * .2)}" ry="${R1(hh * .08)}" fill="#e0706a" opacity="${R1(blush * 100) / 100}"${mini ? '' : ` filter="url(#${id}bl)"`}/><ellipse cx="${R1(cx + hw * .55)}" cy="${R1(ey + hh * .36)}" rx="${R1(hw * .2)}" ry="${R1(hh * .08)}" fill="#e0706a" opacity="${R1(blush * 100) / 100}"${mini ? '' : ` filter="url(#${id}bl)"`}/>`);
  out.push('</g>');
  // eyes: beauty brightens and enlarges them; age and plainness weigh the lids down; men's are narrower
  const ex = hw * .41 * (fem ? 1.02 : 1);
  const er = [4.6, 5.1, 4.9, 4.6, 4.4][st] * (.86 + B * .26) * (fem && adult ? 1.04 : 1) * (male && adult ? .95 : 1);
  const ES = [{ u: .95, l: .55 }, { u: 1.12, l: .85 }, { u: .62, l: .38 }, { u: .72, l: .5 }][(lk.eye || 0) % 4];
  const lidDrop = (1 - B) * .12 + AG * .12;
  let eyeC = lk.eyes || '#5b3a24'; if (B < .45) eyeC = mixHex(eyeC, '#6e6862', (.45 - B) * .7);
  const eyeL = shade(eyeC, .38 + B * .1), eyeD = shade(eyeC, -.52);
  const asym = Math.max(0, .5 - B) * .9;
  const lost = o.patch;
  // a point on a quadratic, and the piece of a quadratic between two t values
  const qp = (P, t) => { const a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c2 = t * t; return [a * P[0][0] + b * P[1][0] + c2 * P[2][0], a * P[0][1] + b * P[1][1] + c2 * P[2][1]]; };
  const qsub = (P, t0, t1, dy) => { const A = qp(P, t0), C = qp(P, t1), mx = (1 - t0) * (1 - t1), my2 = (1 - t0) * t1 + t0 * (1 - t1), nx = t0 * t1; const Bc = [mx * P[0][0] + my2 * P[1][0] + nx * P[2][0], mx * P[0][1] + my2 * P[1][1] + nx * P[2][1]]; return `M${R1(A[0])} ${R1(A[1] + dy)} Q${R1(Bc[0])} ${R1(Bc[1] + dy)} ${R1(C[0])} ${R1(C[1] + dy)}`; };
  if (!mini) out.push(`<linearGradient id="${id}ir" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${eyeD}"/><stop offset=".42" stop-color="${eyeC}"/><stop offset="1" stop-color="${eyeL}"/></linearGradient>`);
  if (o.dead) out.push(`<path d="M${R1(cx - ex - er)} ${R1(ey)} q ${R1(er)} ${R1(er * .55)} ${R1(er * 2)} 0 M${R1(cx + ex - er)} ${R1(ey)} q ${R1(er)} ${R1(er * .55)} ${R1(er * 2)} 0" fill="none" stroke="${lineC}" stroke-width="1.3" stroke-linecap="round"/>`);
  else for (const s of [-1, 1]) {
    if (lost && s === lost) continue;
    const x = cx + s * ex, e = er * (s > 0 ? 1 : 1 - asym * .08), y = ey + (s > 0 ? asym * .5 : 0), eid = id + 'e' + (s > 0 ? 'r' : 'l');
    const up = ES.u * (1 - lidDrop) * (male && adult ? .84 : 1), lo = ES.l * (male && adult ? .9 : 1);
    const tilt = (adult ? (fem ? .1 + B * .16 : .02 + B * .08) : .02) * e - (B < .25 ? (.25 - B) * .5 : 0);
    // corners and the arc of the upper lid; the outer corner lifts a little with beauty
    const ix = x - s * e, iy = y + e * .06, ox = x + s * e, oy = y - tilt, tx = x - s * e * .12, ty = y - e * up * 1.42;
    const LID = [[ix, iy], [tx, ty], [ox, oy]], LOW = [[ox, oy], [x + s * e * .1, y + e * lo * 1.25], [ix, iy]];
    const white = `M${R1(ix)} ${R1(iy)} Q${R1(tx)} ${R1(ty)} ${R1(ox)} ${R1(oy)} Q${R1(LOW[1][0])} ${R1(LOW[1][1])} ${R1(ix)} ${R1(iy)}Z`;
    out.push(`<clipPath id="${eid}"><path d="${white}"/></clipPath><path d="${white}" fill="#f7f3ec"/>`);
    // iris: darker under the lid, lighter below, a ring, the pupil, and catchlights that multiply with beauty
    const irx = x + s * e * .06, iry = y - e * .02, ir = e * ((male && adult ? .62 : .67) + B * .04);
    out.push(`<g clip-path="url(#${eid})"><circle cx="${R1(irx)}" cy="${R1(iry)}" r="${R1(ir)}" fill="${mini ? eyeC : `url(#${id}ir)`}"/><circle cx="${R1(irx)}" cy="${R1(iry)}" r="${R1(ir)}" fill="none" stroke="${eyeD}" stroke-width="${R1(.45 + B * .4)}"/><ellipse cx="${R1(irx)}" cy="${R1(iry + e * .02)}" rx="${R1(ir * .4)}" ry="${R1(ir * .47)}" fill="#14100e"/>`
      + `${mini ? '' : `<path d="M${R1(irx - ir * .7)} ${R1(iry + ir * .35)} Q${R1(irx)} ${R1(iry + ir * .95)} ${R1(irx + ir * .7)} ${R1(iry + ir * .35)}" fill="none" stroke="${eyeL}" stroke-width="${R1(ir * .26)}" opacity="${R1((.3 + B * .45) * 100) / 100}"/>`}`
      + `<path d="${qsub(LID, 0, 1, e * .3)}" fill="none" stroke="${shade(skin, -.45)}" stroke-width="${R1(e * .55)}" opacity=".26"/>`
      + `<ellipse cx="${R1(irx - ir * .36)}" cy="${R1(iry - ir * .4)}" rx="${R1(ir * (.18 + B * .17))}" ry="${R1(ir * (.13 + B * .11))}" fill="#fff" opacity="${R1((.7 + B * .3) * 100) / 100}" transform="rotate(-20 ${R1(irx - ir * .36)} ${R1(iry - ir * .4)})"/>${B > .3 ? `<circle cx="${R1(irx + ir * .4)}" cy="${R1(iry + ir * .32)}" r="${R1(ir * (.06 + B * .07))}" fill="#fff" opacity=".85"/>` : ''}${B > .72 && !mini ? `<circle cx="${R1(irx + ir * .1)}" cy="${R1(iry - ir * .55)}" r="${R1(ir * .07)}" fill="#fff" opacity=".7"/>` : ''}</g>`);
    // the upper lid: a filled line that thickens toward the outer corner and flicks up into a wing on a beautiful woman
    const th = (adult ? .95 : .8) + (fem ? .4 + B * .55 : .2 + B * .3), wing = fem && adult ? .9 + B * 1.9 : B > .55 ? .6 : 0;
    const lid = `M${R1(ix - s * .2)} ${R1(iy + .1)} Q${R1(tx)} ${R1(ty)} ${R1(ox)} ${R1(oy)}${wing ? ` L${R1(ox + s * wing)} ${R1(oy - wing * .62)} L${R1(ox - s * .6)} ${R1(oy - th * .9)}` : ` L${R1(ox)} ${R1(oy - th * .8)}`} Q${R1(tx)} ${R1(ty - th * 1.3)} ${R1(ix - s * .1)} ${R1(iy - th * .3)}Z`;
    out.push(`<path d="${lid}" fill="${lineC}"/>`);
    // lashes sit on the lid itself
    if (fem && st >= 2 && !mini) {
      const nL = B > .6 ? 3 : 2, lash = [];
      for (let i = 0; i < nL; i++) { const t = .68 + i * (.3 / nL), [px, py] = qp(LID, t), ln = (1.1 + B * 1.2) * (.75 + i * .2); lash.push(`M${R1(px - s * .35)} ${R1(py - th * .5)} L${R1(px + s * ln * .6)} ${R1(py - th * .55 - ln)} L${R1(px + s * .45)} ${R1(py - th * .35)}Z`); }
      out.push(`<path d="${lash.join(' ')}" fill="${lineC}"/>`);
    }
    // lower lash line hugging the outer half of the lower lid, then the crease above the lid
    out.push(`<path d="${qsub(LOW, .02, .5, .3)}" fill="none" stroke="${lineC}" stroke-width="${R1(.42 + (fem ? .1 : 0))}" opacity="${R1((fem ? .45 : .3) * 100) / 100}" stroke-linecap="round"/>`);
    if (st >= 3) out.push(`<path d="${qsub(LID, .22, .9, -(th + 1.1 + (lk.eye === 3 ? -.3 : 0)))}" fill="none" stroke="${lineC}" stroke-width=".45" opacity="${lk.eye === 3 || AG > .5 ? .45 : .22}" stroke-linecap="round"/>`);
    if (fem && adult && B > .5 && !mini) out.push(`<path d="${qsub(LID, .1, 1, -(th * .8 + .9))}" fill="none" stroke="${mixHex(eyeC, '#7a4a5a', .5)}" stroke-width="2.1" opacity="${R1((B - .45) * .55 * 100) / 100}" filter="url(#${id}bl)"/>`);
    const bags = Math.max(AG - .45, 0) * 1.2 + Math.max(0, .45 - B) * .9;
    if (bags > .12 && adult) out.push(`<path d="${qsub(LOW, .15, .85, 1.3 + bags)}" fill="none" stroke="${skinDD}" stroke-width=".7" opacity="${R1(Math.min(.55, bags) * 100) / 100}" stroke-linecap="round"/>`);
  }
  if (lost) { const x = cx + lost * ex; out.push(`<path d="M${R1(cx - hw * 1.02)} ${R1(ey - er * 2.6)} L ${R1(cx + hw * 1.02)} ${R1(ey - er * (lost > 0 ? 1.6 : 3.4))}" stroke="#2a2420" stroke-width="1.1"/><ellipse cx="${R1(x)}" cy="${R1(ey)}" rx="${R1(er * 1.45)}" ry="${R1(er * 1.15)}" fill="#2a2420" stroke="#4a3f36" stroke-width=".6"/><path d="M${R1(x - er * .6)} ${R1(ey - er * .4)} q ${R1(er * .6)} -1 ${R1(er * 1.1)} 0" stroke="#6a5a4c" stroke-width=".6" fill="none"/>`); }
  // brows: arched and fine on a beautiful woman, straight and strong on a handsome man, heavy and low when plain
  const by = ey - er * (st <= 2 ? 2.0 : fem ? 2.2 - (1 - B) * .15 : 1.9 - (1 - B) * .15), bw = er * 1.38;
  const BR0 = [[-.6, -1.2, -.5], [-.3, -.4, -.2], [-.2, -1.8, -.1], [-1, -.8, .4]][(lk.brow || 0) % 4];
  const arch = fem ? 1 + B * .4 : .55, BR = [BR0[0], BR0[1] * arch, BR0[2]];
  const bt = (st <= 1 ? 1.2 : fem ? 1.25 + (1 - B) * .75 : 2 + (1 - B) * .6) * (lk.brow === 3 ? 1.3 : 1);
  const browC = AG > .55 ? mixHex(hairD, '#bdbdbd', Math.min(.7, (AG - .55) * 2)) : hairD;
  for (const s of [-1, 1]) {
    const yy = by + (s > 0 ? asym * .7 : 0);
    const x0 = cx + s * (ex - bw * (.8 + (1 - B) * .16)), x1 = cx + s * (ex + bw * (fem ? 1 : .95)), xm = cx + s * (ex + bw * .05);
    out.push(`<path d="M${R1(x0)} ${R1(yy + BR[0] + bt * .55)} Q ${R1(xm)} ${R1(yy + BR[1] - 1.2 - bt * .3)} ${R1(x1)} ${R1(yy + BR[2] + 1)} Q ${R1(xm)} ${R1(yy + BR[1] - 1.2 + bt * .45)} ${R1(x0)} ${R1(yy + BR[0] + bt * 1.3)} Z" fill="${browC}"${st === 0 ? ' opacity=".3"' : st === 1 ? ' opacity=".7"' : ''}/>`);
    if (!mini && B < .35 && adult) out.push(`<path d="M${R1(x0 + s * 1.2)} ${R1(yy + BR[0] + bt * .3)} l${R1(s * 1.4)} -1.1 M${R1(x0 + s * 3)} ${R1(yy + BR[0] + bt * .1)} l${R1(s * 1.3)} -1.2" stroke="${browC}" stroke-width=".5" opacity=".7"/>`);
  }
  // nose: small and fine with beauty, broader and rounder when plain; men's longer
  const ny = cy + hh * (st <= 1 ? .36 : male && adult ? .42 : .4), nz = (st <= 1 ? .8 : 1) * (1.24 - B * .36) * (male ? 1.06 : .92) * (dwarf ? 1.2 : 1);
  if (st >= 1) {
    if (!mini && adult) out.push(`<path d="M${R1(cx + 1.6)} ${R1(ey + er * .2)} Q ${R1(cx + 2.8 * nz)} ${R1(ny - 5)} ${R1(cx + 2.8 * nz)} ${R1(ny - 1.4)}" fill="none" stroke="${skinDD}" stroke-width="${male ? 1.5 : 1.1}" opacity="${male ? .38 : .28}" filter="url(#${id}bl)"/><path d="M${R1(cx - .6)} ${R1(ey + er * .5)} L ${R1(cx - .4)} ${R1(ny - 3.2)}" stroke="${skinL}" stroke-width="1" opacity="${R1((.25 + B * .5) * 100) / 100}" stroke-linecap="round"/>`);
    if (!mini && B < .4 && st >= 2) out.push(`<ellipse cx="${cx}" cy="${R1(ny - .2)}" rx="${R1(2.3 * nz)}" ry="${R1(1.6 * nz)}" fill="${skinDD}" opacity="${R1((.4 - B) * .5 * 100) / 100}" filter="url(#${id}bl)"/>`);
    out.push(`<path d="M${R1(cx - 2.5 * nz)} ${R1(ny - .3)} Q ${R1(cx - 1.7 * nz)} ${R1(ny + 1.5 * nz)} ${R1(cx)} ${R1(ny + 1.1 * nz)} Q ${R1(cx + 1.7 * nz)} ${R1(ny + 1.5 * nz)} ${R1(cx + 2.5 * nz)} ${R1(ny - .3)}" fill="none" stroke="${skinDD}" stroke-width=".9" stroke-linecap="round" opacity=".6"/><ellipse cx="${R1(cx - .2)}" cy="${R1(ny - 1.1)}" rx="${R1(1.6 * nz)}" ry="${R1(1 * nz)}" fill="#fff" opacity="${R1((.06 + B * .22) * 100) / 100}"/>`);
  } else out.push(`<ellipse cx="${cx}" cy="${R1(ny)}" rx="2" ry="1.2" fill="${skinD}" opacity=".7"/>`);
  // lips: fuller, warmer and glossier with beauty; a smile that grows with it (a confident one on a handsome man)
  const my = cy + hh * (st <= 1 ? .6 : .64), mw = (st <= 1 ? 3.6 : 4.6) * (fem ? .92 : 1.06) * (1 + (.5 - B) * .1);
  const full = (fem ? .72 + B * .55 : .72 + B * .22) * (st <= 2 ? .8 : 1) * (AG > .6 ? .82 : 1);
  const lip = mixHex(skin, fem && adult ? '#c4485a' : '#a4524c', fem && adult ? .2 + B * .36 : .16 + B * .08);
  if (st === 0) out.push(`<ellipse cx="${cx}" cy="${R1(my)}" rx="2.2" ry="1.4" fill="${lip}"/>`);
  else {
    const sm = -.25 + B * 1.3, smR = sm + (male && adult && B > .6 ? .5 : 0);
    if (fem && adult) out.push(`<path d="M${R1(cx - mw * .92)} ${R1(my - sm * .5)} Q${R1(cx - mw * .45)} ${R1(my - 1.6 * full)} ${R1(cx - .2)} ${R1(my - 1.0 * full)} L${cx} ${R1(my - .8 * full)} L${R1(cx + .2)} ${R1(my - 1.0 * full)} Q${R1(cx + mw * .45)} ${R1(my - 1.6 * full)} ${R1(cx + mw * .92)} ${R1(my - smR * .5)} Q${cx} ${R1(my + .3)} ${R1(cx - mw * .92)} ${R1(my - sm * .5)}Z" fill="${shade(lip, -.14)}"/>`);
    out.push(`<path d="M${R1(cx - mw * .74)} ${R1(my + .2)} Q${cx} ${R1(my + 2.7 * full)} ${R1(cx + mw * .74)} ${R1(my + .2)} Q${cx} ${R1(my + .8)} ${R1(cx - mw * .74)} ${R1(my + .2)}Z" fill="${lip}" opacity="${fem && adult ? 1 : .5}"/>`);
    out.push(`<path d="M${R1(cx - mw)} ${R1(my - sm * .55)} Q${R1(cx - mw * .45)} ${R1(my + .45)} ${cx} ${R1(my + .25)} Q${R1(cx + mw * .45)} ${R1(my + .45)} ${R1(cx + mw)} ${R1(my - smR * .55)}" fill="none" stroke="${shade(lip, -.55)}" stroke-width="${fem ? .8 : .9}" stroke-linecap="round"/>`);
    if (!mini && fem && adult) out.push(`<ellipse cx="${R1(cx - mw * .12)}" cy="${R1(my + .95 * full)}" rx="${R1(mw * .28)}" ry="${R1(.32 * full)}" fill="#fff" opacity="${R1((.08 + B * .4) * 100) / 100}"/>`);
    if (!mini) out.push(`<path d="M${R1(cx - mw * .45)} ${R1(my + 3.4 * full)} Q${cx} ${R1(my + 4.1 * full)} ${R1(cx + mw * .45)} ${R1(my + 3.4 * full)}" fill="none" stroke="${skinDD}" stroke-width=".8" opacity="${male ? .26 : .14}" stroke-linecap="round" filter="url(#${id}bl)"/>`);
  }
  // age: lines deepen gradually
  if (adult && AG > .38) {
    const a = Math.min(1, (AG - .38) * 1.8);
    out.push(`<g fill="none" stroke="${skinDD}" stroke-linecap="round" opacity="${R1((.18 + a * .4) * 100) / 100}" stroke-width=".7"><path d="M${R1(cx - ex - er - 1.5)} ${R1(ey + .5)} l -2.6 1.6 M${R1(cx - ex - er - 1.5)} ${R1(ey + 2)} l -2.4 2.2 M${R1(cx + ex + er + 1.5)} ${R1(ey + .5)} l 2.6 1.6 M${R1(cx + ex + er + 1.5)} ${R1(ey + 2)} l 2.4 2.2"/>${a > .3 ? `<path d="M${R1(cx - 8)} ${R1(cy - hh * .54)} q 8 -2 16 0 M${R1(cx - 6)} ${R1(cy - hh * .44)} q 6 -1.5 12 0"/>` : ''}${a > .45 ? `<path d="M${R1(cx - 4.5)} ${R1(ny + 1.5)} q -3.5 4.5 -2.6 9 M${R1(cx + 4.5)} ${R1(ny + 1.5)} q 3.5 4.5 2.6 9"/>` : ''}${a > .7 ? `<path d="M${R1(cx - hw * .7)} ${R1(cy + hh * .66)} q 2 4 5 6 M${R1(cx + hw * .7)} ${R1(cy + hh * .66)} q -2 4 -5 6"/>` : ''}</g>`);
  }
  // blemishes for the plain, freckles and marks, and battle scars
  if (adult && B < .32 && !mini) for (let i = 0; i < 2 + Math.round((.32 - B) * 14); i++) out.push(`<circle cx="${R1(cx + (hs('bl' + i) - .5) * hw * 1.5)}" cy="${R1(ey + hh * (.18 + hs('bv' + i) * .5))}" r="${R1(.5 + hs('br' + i) * .4)}" fill="${i % 2 ? '#b0584c' : skinDD}" opacity=".5"/>`);
  if (lk.mark === 'freckles' && st >= 1) out.push(`<g fill="${shade(skin, -.38)}" opacity=".5">${[[-9, 3], [-6, 5], [-11, 6], [-4, 2.5], [-8, 7.5], [9, 3], [6, 5], [11, 6], [4, 2.5], [8, 7.5], [0, 3.5]].map(([dx, dy]) => `<circle cx="${R1(cx + dx)}" cy="${R1(ey + er + dy)}" r=".65"/>`).join('')}</g>`);
  if (lk.mark === 'mole' && st >= 2) out.push(`<circle cx="${R1(cx + mw + 3)}" cy="${R1(my - 2.4)}" r=".95" fill="${shade(skin, -.6)}"/>`);
  if (lk.mark === 'paint' && st >= 2 && ['beastfolk', 'superd', 'demonkin', 'dragon', 'seafolk'].includes(o.race)) out.push(`<g stroke="${o.race === 'superd' ? '#2a2a2a' : '#7a2a24'}" stroke-width="1.4" stroke-linecap="round" opacity=".75"><path d="M${R1(cx - ex - 4)} ${R1(ey + er + 3)} l 6 1.4 M${R1(cx - ex - 3)} ${R1(ey + er + 6)} l 5 1.2 M${R1(cx + ex + 4)} ${R1(ey + er + 3)} l -6 1.4 M${R1(cx + ex + 3)} ${R1(ey + er + 6)} l -5 1.2"/></g>`);
  const scars = (o.scars || []).slice(0, 4).concat(lk.mark === 'scar' && st >= 2 ? [{ t: 'brow', s: -1 }] : []);
  const scarC = mixHex(skin, '#f4e6da', .55);
  for (const sc of scars) {
    const s = sc.s || 1, x = cx + s * ex;
    const d = sc.t === 'brow' ? `M${R1(x - s * 4)} ${R1(by - 5)} L ${R1(x + s * 3)} ${R1(ey + er + 7)}` : sc.t === 'cheek' ? `M${R1(cx + s * hw * .3)} ${R1(ey + er + 3)} L ${R1(cx + s * hw * .82)} ${R1(ey + er + 10)}` : sc.t === 'lip' ? `M${R1(cx + s * mw * .4)} ${R1(my - 4)} L ${R1(cx + s * mw * .5)} ${R1(my + 4)}` : sc.t === 'nose' ? `M${R1(cx - 4)} ${R1(ny - 6)} L ${R1(cx + 4)} ${R1(ny - 3)}` : `M${R1(cx + s * hw * .5)} ${R1(cy - hh * .6)} L ${R1(cx + s * hw * .1)} ${R1(cy - hh * .3)}`;
    out.push(`<path d="${d}" stroke="${scarC}" stroke-width="1.7" stroke-linecap="round"/><path d="${d}" stroke="${skinDD}" stroke-width=".5" opacity=".55" stroke-dasharray="1.4 1.1"/>`);
  }
  // facial hair
  const beard = dwarf && male && st >= 4 ? 'beard' : (male && st >= 4 ? lk.beard : 'none');
  const bc = AG > .5 ? mixHex(hairD, '#cfcfcf', Math.min(.8, (AG - .5) * 2)) : hairD;
  if (beard === 'stubble') out.push(`<path d="M${R1(cx - hw * .84)} ${R1(cy + hh * .28)} C ${R1(cx - hw * .72)} ${R1(cy + hh * .86)}, ${R1(cx - hw * .3)} ${R1(cy + hh * 1.02)}, ${cx} ${R1(cy + hh * 1.03)} C ${R1(cx + hw * .3)} ${R1(cy + hh * 1.02)}, ${R1(cx + hw * .72)} ${R1(cy + hh * .86)}, ${R1(cx + hw * .84)} ${R1(cy + hh * .28)} C ${R1(cx + hw * .5)} ${R1(cy + hh * .64)}, ${R1(cx - hw * .5)} ${R1(cy + hh * .64)}, ${R1(cx - hw * .84)} ${R1(cy + hh * .28)} Z" fill="${bc}" opacity=".24"/>`);
  if (beard === 'beard') out.push(`<path d="M${R1(cx - hw * .97)} ${R1(cy + hh * .08)} C ${R1(cx - hw * .97)} ${R1(cy + hh * (dwarf ? 1.6 : 1.2))}, ${R1(cx - hw * .3)} ${R1(cy + hh * (dwarf ? 1.9 : 1.34))}, ${cx} ${R1(cy + hh * (dwarf ? 1.95 : 1.36))} C ${R1(cx + hw * .3)} ${R1(cy + hh * (dwarf ? 1.9 : 1.34))}, ${R1(cx + hw * .97)} ${R1(cy + hh * (dwarf ? 1.6 : 1.2))}, ${R1(cx + hw * .97)} ${R1(cy + hh * .08)} C ${R1(cx + hw * .7)} ${R1(cy + hh * .62)}, ${R1(cx + mw + 2)} ${R1(my - 3)}, ${cx} ${R1(my - 3.5)} C ${R1(cx - mw - 2)} ${R1(my - 3)}, ${R1(cx - hw * .7)} ${R1(cy + hh * .62)}, ${R1(cx - hw * .97)} ${R1(cy + hh * .08)} Z" fill="${bc}"/><g fill="none" stroke="${shade(bc, -.35)}" stroke-width=".6" opacity=".6">${[-.6, -.3, 0, .3, .6].map(u => `<path d="M${R1(cx + u * hw)} ${R1(cy + hh * .9)} q ${R1(u * 2)} 4 ${R1(u * 1)} 8"/>`).join('')}</g><path d="M${R1(cx - mw * .86)} ${R1(my + .2)} Q ${cx} ${R1(my + 2.8)} ${R1(cx + mw * .86)} ${R1(my + .2)}" fill="${lip}" opacity=".75"/>`);
  if (beard === 'mustache' || beard === 'beard') out.push(`<path d="M${R1(cx - mw - 2)} ${R1(my + 1)} C ${R1(cx - mw)} ${R1(my - 4.2)}, ${R1(cx - 2)} ${R1(my - 4.6)}, ${cx} ${R1(my - 2.6)} C ${R1(cx + 2)} ${R1(my - 4.6)}, ${R1(cx + mw)} ${R1(my - 4.2)}, ${R1(cx + mw + 2)} ${R1(my + 1)} C ${R1(cx + mw - 2)} ${R1(my - 1)}, ${R1(cx + 2)} ${R1(my - 1.4)}, ${cx} ${R1(my - .7)} C ${R1(cx - 2)} ${R1(my - 1.4)}, ${R1(cx - mw + 2)} ${R1(my - 1)}, ${R1(cx - mw - 2)} ${R1(my + 1)} Z" fill="${bc}"/>`);
  return out.join('');
}

/* shoulders, neck and clothes */
function bodySvg(o, c) {
  const { cx, cy, hh, hw, shY, sw, st, garb, gcol, id, skin, skinD, skinDD, fem } = c;
  const out = [];
  if (garb === 'swaddle' || st === 0) {
    out.push(`<path d="M${cx - 40} 152 C ${cx - 40} ${R1(shY + 8)}, ${cx - 24} ${R1(shY - 6)}, ${cx} ${R1(shY - 6)} C ${cx + 24} ${R1(shY - 6)}, ${cx + 40} ${R1(shY + 8)}, ${cx + 40} 152 Z" fill="url(#${id}g)"/><path d="M${cx - 30} ${R1(shY + 6)} Q ${cx} ${R1(shY + 22)} ${cx + 30} ${R1(shY + 4)}" fill="none" stroke="${shade(gcol, -.25)}" stroke-width="1.4"/>`);
    return out.join('');
  }
  const nw = fem ? 6.4 : 7.6;
  out.push(`<path d="M${R1(cx - sw - 6)} 152 C ${R1(cx - sw - 4)} ${R1(shY + 12)}, ${R1(cx - sw * .55)} ${R1(shY)}, ${cx - 9} ${R1(shY - 2)} L ${cx + 9} ${R1(shY - 2)} C ${R1(cx + sw * .55)} ${R1(shY)}, ${R1(cx + sw + 4)} ${R1(shY + 12)}, ${R1(cx + sw + 6)} 152 Z" fill="url(#${id}g)"/>`);
  // neck with the jaw's shadow and collarbones
  out.push(`<path d="M${R1(cx - nw)} ${R1(cy + hh * .62)} L ${R1(cx - nw - 1)} ${R1(shY + 1)} Q ${cx} ${R1(shY + 6)} ${R1(cx + nw + 1)} ${R1(shY + 1)} L ${R1(cx + nw)} ${R1(cy + hh * .62)} Z" fill="${skinD}"/><path d="M${R1(cx - nw - .5)} ${R1(cy + hh * .7)} Q ${cx} ${R1(cy + hh + 6)} ${R1(cx + nw + .5)} ${R1(cy + hh * .7)} L ${R1(cx + nw)} ${R1(cy + hh * .95)} Q ${cx} ${R1(cy + hh + 9)} ${R1(cx - nw)} ${R1(cy + hh * .95)} Z" fill="${skinDD}" opacity=".5"/>`);
  if (st >= 3) out.push(`<path d="M${R1(cx - nw - 1)} ${R1(shY + 2.6)} q -5 1.2 -9 .6 M${R1(cx + nw + 1)} ${R1(shY + 2.6)} q 5 1.2 9 .6" fill="none" stroke="${skinDD}" stroke-width=".7" opacity=".4"/>`);
  const trim = shade(gcol, .35), dark = shade(gcol, -.45), fold = shade(gcol, -.22);
  // fabric folds
  out.push(`<path d="M${R1(cx - sw * .7)} ${R1(shY + 10)} q 3 14 1 28 M${R1(cx + sw * .62)} ${R1(shY + 12)} q -2 12 0 26" fill="none" stroke="${fold}" stroke-width="1.2" opacity=".55"/>`);
  if (garb === 'tunic') out.push(`<path d="M${cx - 10} ${R1(shY - 1)} L ${cx} ${R1(shY + 13)} L ${cx + 10} ${R1(shY - 1)}" fill="${skinD}" stroke="${dark}" stroke-width="1.2"/><path d="M${cx - 3} ${R1(shY + 5)} l 6 2 M${cx - 3} ${R1(shY + 9)} l 6 -2" stroke="${trim}" stroke-width=".9"/>`);
  else if (garb === 'doublet') out.push(`<path d="M${cx - 11} ${R1(shY - 2)} L ${cx - 9} ${R1(shY - 7)} L ${cx} ${R1(shY + 2)} L ${cx + 9} ${R1(shY - 7)} L ${cx + 11} ${R1(shY - 2)} L ${cx} ${R1(shY + 8)} Z" fill="${shade(gcol, .2)}"/><path d="M${cx} ${R1(shY + 8)} V 152" stroke="${dark}" stroke-width="1"/>${[14, 22, 30, 38].map(d => `<circle cx="${cx + 2.5}" cy="${R1(shY + d)}" r="1.2" fill="${trim}"/>`).join('')}`);
  else if (garb === 'armor') out.push(`<path d="M${R1(cx - sw - 2)} ${R1(shY + 18)} C ${R1(cx - sw)} ${R1(shY + 2)}, ${R1(cx - sw * .5)} ${R1(shY - 2)}, ${cx - 14} ${R1(shY + 2)} L ${cx - 16} ${R1(shY + 20)} Z M${R1(cx + sw + 2)} ${R1(shY + 18)} C ${R1(cx + sw)} ${R1(shY + 2)}, ${R1(cx + sw * .5)} ${R1(shY - 2)}, ${cx + 14} ${R1(shY + 2)} L ${cx + 16} ${R1(shY + 20)} Z" fill="${shade('#8a929c', -.05)}" stroke="#4a5058" stroke-width="1"/><path d="M${R1(cx - sw * .9)} ${R1(shY + 8)} q ${R1(sw * .3)} -6 ${R1(sw * .5)} -3 M${R1(cx + sw * .9)} ${R1(shY + 8)} q ${R1(-sw * .3)} -6 ${R1(-sw * .5)} -3" stroke="#d4dae2" stroke-width="1" opacity=".6" fill="none"/><path d="M${cx - 12} ${R1(shY)} Q ${cx} ${R1(shY + 8)} ${cx + 12} ${R1(shY)}" fill="none" stroke="#3a3f46" stroke-width="2.2"/><path d="M${cx - 18} ${R1(shY + 26)} L ${cx + 18} ${R1(shY + 40)}" stroke="#5a4130" stroke-width="3"/>`);
  else if (garb === 'robe') out.push(`<path d="M${cx - 15} ${R1(shY - 1)} C ${cx - 19} ${R1(shY - 6)}, ${cx - 14} ${R1(shY - 11)}, ${cx - 8} ${R1(shY - 8)} L ${cx} ${R1(shY + 6)} L ${cx + 8} ${R1(shY - 8)} C ${cx + 14} ${R1(shY - 11)}, ${cx + 19} ${R1(shY - 6)}, ${cx + 15} ${R1(shY - 1)} L ${cx} ${R1(shY + 18)} Z" fill="${shade(gcol, -.32)}" stroke="${shade(gcol, .25)}" stroke-width=".8"/><path d="M${R1(cx - sw * .62)} ${R1(shY + 6)} Q ${R1(cx - sw * .3)} ${R1(shY + 30)} ${cx - 4} ${R1(shY + 44)} M${R1(cx + sw * .62)} ${R1(shY + 6)} Q ${R1(cx + sw * .3)} ${R1(shY + 30)} ${cx + 4} ${R1(shY + 44)}" fill="none" stroke="${shade(gcol, .3)}" stroke-width="1.1" opacity=".7"/><circle cx="${cx}" cy="${R1(shY + 10)}" r="2.5" fill="#c9a86a" stroke="#6b5222" stroke-width=".6"/>`);
  else if (garb === 'coat' || garb === 'mantle') out.push(`<path d="M${cx - 12} ${R1(shY - 4)} L ${cx} ${R1(shY + 18)} L ${cx + 12} ${R1(shY - 4)} L ${cx + 18} ${R1(shY + 2)} L ${cx} ${R1(shY + 34)} L ${cx - 18} ${R1(shY + 2)} Z" fill="${shade(gcol, -.25)}" stroke="#c9a86a" stroke-width="1"/><path d="M${cx - 5} ${R1(shY + 1)} Q ${cx} ${R1(shY + 6)} ${cx + 5} ${R1(shY + 1)} L ${cx + 3} ${R1(shY + 12)} L ${cx - 3} ${R1(shY + 12)} Z" fill="#efe9dc"/>${garb === 'mantle' ? `<path d="M${R1(cx - sw - 6)} ${R1(shY + 16)} C ${R1(cx - sw)} ${R1(shY + 2)}, ${cx - 20} ${R1(shY - 2)}, ${cx - 12} ${R1(shY - 4)} L ${cx - 16} ${R1(shY + 10)} Z M${R1(cx + sw + 6)} ${R1(shY + 16)} C ${R1(cx + sw)} ${R1(shY + 2)}, ${cx + 20} ${R1(shY - 2)}, ${cx + 12} ${R1(shY - 4)} L ${cx + 16} ${R1(shY + 10)} Z" fill="#f2efe8"/>${[-30, -22, 22, 30].map(dx => `<circle cx="${cx + dx}" cy="${R1(shY + 9)}" r=".9" fill="#2a2a2a"/>`).join('')}<path d="M${cx - 16} ${R1(shY + 14)} Q ${cx} ${R1(shY + 30)} ${cx + 16} ${R1(shY + 14)}" fill="none" stroke="#d6b45a" stroke-width="1.6" stroke-dasharray="2 1.5"/>` : ''}`);
  else if (garb === 'cloak') out.push(`<path d="M${R1(cx - sw - 6)} 152 C ${R1(cx - sw - 2)} ${R1(shY + 8)}, ${cx - 20} ${R1(shY - 3)}, ${cx - 9} ${R1(shY - 2)} L ${cx - 14} 152 Z M${R1(cx + sw + 6)} 152 C ${R1(cx + sw + 2)} ${R1(shY + 8)}, ${cx + 20} ${R1(shY - 3)}, ${cx + 9} ${R1(shY - 2)} L ${cx + 14} 152 Z" fill="${shade(gcol, -.22)}"/><path d="M${cx - 9} ${R1(shY - 1)} L ${cx} ${R1(shY + 10)} L ${cx + 9} ${R1(shY - 1)}" fill="${shade('#5a4a3a', .1)}"/><circle cx="${cx - 12}" cy="${R1(shY + 3)}" r="2.6" fill="#b8924d" stroke="#5a4122" stroke-width=".7"/>`);
  else if (garb === 'priest') out.push(`<path d="M${cx - 8} ${R1(shY - 2)} L ${cx} ${R1(shY + 10)} L ${cx + 8} ${R1(shY - 2)}" fill="#bfb6a2"/><path d="M${cx} ${R1(shY + 14)} v 14 M${cx - 5} ${R1(shY + 19)} h 10" stroke="#b8924d" stroke-width="2"/>`);
  return out.join('');
}

/* ---------- who gets painted how ---------- */
function lifeAging(L) {
  if (mods(L).ageless) return 0;
  const adultAt = Math.max(15, (RACE[L.race] || RACE.human).coming), span = Math.max(adultAt + 20, effLifespan(L));
  return clamp((L.age - adultAt) / (span - adultAt), 0, 1);
}
function lifePortrait(L, extra) {
  const ageless = !!mods(L).ageless;
  const aging = lifeAging(L);
  const mg = bestMagic(L), sw = bestSword(L), g = L.gear || {};
  const weapon = L.age < 13 ? null : (g.staff || (mg >= 2 && mg >= sw)) ? 'staff' : (g.weapon || sw >= 2) ? 'sword' : null;
  const circlet = L.age >= 10 ? (L.family.cls >= 4 ? 2 : L.family.cls >= 3 ? 1 : 0) : 0;
  const glow = !L.alive ? null : L.aura.stage >= 3 ? '#e6c56f' : L.mana.cap >= 2500 ? '#80c3d8' : null;
  const patch = (L.injuries || []).includes('a lost eye') ? (L.flags.patchSide || 1) : 0;
  return portrait(Object.assign({ look: L.look, race: L.race, sex: L.sex, age: L.age, aging, ageless, beauty: beautyOf(L.st.looks), scars: L.scars || [], patch, dead: !L.alive, label: L.name + L.sur, seed: L.id, garb: garbFor(L), weapon, circlet, glow }, extra || {}));
}
function npcPortrait(p, mini) {
  const j = (p.job || '').toLowerCase(), rc = RACE[p.race] || RACE.human;
  const circlet = /princess|prince|queen|king|empress|royal/.test(j) ? 2 : /noble|lord|lady|heir/.test(j) ? 1 : 0;
  const weapon = p.age < 13 || !p.skill ? null : MAGIC_ID[p.skill.k] ? 'staff' : 'sword';
  const adultAt = Math.max(15, rc.coming), span = Math.max(adultAt + 20, rc.life[0]);
  const aging = p.canon && p.age > 200 ? .3 : clamp((p.age - adultAt) / (span - adultAt), 0, 1);
  return portrait({ look: p.look, race: p.race, sex: p.sex, age: p.age, aging, beauty: beautyOf(npcLooks(p)), scars: p.scars || [], dead: !p.alive, label: p.name + (p.sur || ''), seed: p.id || p.name, garb: npcGarb(p), mini: mini !== false, crop: 'close', hat: p.name === 'Roxy', circlet, weapon: p.name === 'Roxy' ? 'staff' : weapon });
}

/* ---------- describing a face in words ---------- */
const LOOK_LINES = [[17, 'Heads turn and conversations stop when you walk into a room.'], [14, 'People look twice, then a third time.'], [11, 'Easy on the eyes, and you know it.'], [8, 'A pleasant face that people warm to.'], [5, 'An ordinary, friendly face.'], [3, 'Not anyone’s first glance, but a face people trust.'], [-99, 'Your charm will have to come from somewhere else.']];
const KID_LINES = [[13, 'An adorable child. Strangers slip you sweets.'], [8, 'A bright-eyed, rosy-cheeked child.'], [-99, 'A scruffy little thing, all elbows and knees.']];
const isKid = (L) => L.age < Math.max(15, (RACE[L.race] || RACE.human).coming) * .76;
function looksWord(L) { const v = Math.round(L.st.looks); return isKid(L) ? (v >= 13 ? 'Adorable' : v >= 8 ? 'Cute' : 'Scruffy') : beautyWord(v, L.sex); }
function appearanceOf(L) {
  const lk = L.look || {}, v = Math.round(L.st.looks), kid = isKid(L), AG = lifeAging(L), from = L.lookFrom || {};
  const kin = (k) => from[k] === 'mother' ? ' · your mother’s' : from[k] === 'father' ? ' · your father’s' : from[k] === 'both' ? ' · between your parents’' : '';
  const gray = clamp((AG - .42) / .4, 0, 1);
  const hairC = colorWord(lk.hair, 'hair');
  const rows = [];
  rows.push(['Hair', L.age < 2 ? `A wisp of ${hairC} hair` : `${HAIR_STYLES[lk.style || 0]}, ${gray > .7 ? 'silver-white' : gray > .2 ? hairC + ' going silver' : hairC}${kin('hair')}`]);
  const patch = (L.injuries || []).includes('a lost eye');
  rows.push(['Eyes', `${cap1(colorWord(lk.eyes, 'eyes'))}, ${EYE_SHAPES[lk.eye || 0].toLowerCase()}${kin('eyes')}${patch ? '. You wear a patch over the one you lost' : ''}`]);
  rows.push(['Face', `${FACE_SHAPES[lk.face || 0]}, ${BROW_SHAPES[lk.brow || 0].toLowerCase()} brows, ${colorWord(lk.skin, 'skin')} skin${kin('face')}`]);
  const marks = [];
  if (lk.mark && lk.mark !== 'none' && !(lk.mark === 'paint' && !PAINT_RACES.includes(L.race))) marks.push(MARK_NAMES[lk.mark]);
  if (L.sex === 'm' && !kid && L.age >= 18 && lk.beard && lk.beard !== 'none') marks.push(BEARD_NAMES[lk.beard]);
  for (const sc of (L.scars || [])) marks.push(`A scar ${SCAR_WORDS[sc.t] || ''}${sc.a != null ? ` (age ${sc.a})` : ''}`);
  if (marks.length) rows.push(['Marks', marks.join(' · ')]);
  if (!kid) rows.push(['Age', mods(L).ageless ? 'The years leave no trace on you' : AG > .62 ? 'Silver hair and deep lines earned over a long life' : AG > .38 ? 'The first lines around the eyes' : AG > .15 ? 'In your prime' : 'Young and fresh-faced']);
  return { word: looksWord(L), line: (kid ? KID_LINES : LOOK_LINES).find(([t]) => v >= t)[1], rows, v };
}
const barberCost = (L) => L.age < 15 ? 0 : L.family.cls >= 3 ? 40 : 15;
/* the frame around a portrait shines a little for the beautiful */
const lookTier = (L) => isKid(L) ? '' : L.st.looks >= 17 ? ' radiant' : L.st.looks >= 14 ? ' striking' : '';
