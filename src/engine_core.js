/* ===================== ENGINE: CORE ===================== */
const R = {
  f: () => Math.random(),
  i: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: (a) => a[Math.floor(Math.random() * a.length)],
  chance: (p) => Math.random() < p,
  gauss: () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); },
  w: (items, wf) => { let tot = 0; const ws = items.map(x => { const w = Math.max(0, wf(x)); tot += w; return w; }); if (tot <= 0) return null; let r = Math.random() * tot; for (let k = 0; k < items.length; k++) { r -= ws[k]; if (r <= 0) return items[k]; } return items[items.length - 1]; },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const SMALL_WORDS = new Set(['a','an','the','and','or','of','to','in','on','at','by','for','with','from','as','but','nor']);
const titleCase = (s) => String(s || '').split(' ').map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase())) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- META (persistent across lives) ---------- */
function newMeta() {
  return {
    v: 1, lp: 0, upg: {}, ach: {}, hall: [], lives: 0, heirloom: null, lastBorn: [], disc: { ev: {}, town: {}, npc: {}, arc: {}, paid: 0 },
    settings: { theme: 'auto', accent: 'gold', font: 'serif', size: 'm', speed: 'normal', anim: true, confirmAge: false, autosave: true, adminLock: false },
    world: { year: 417, seven: SEVEN_POWERS.map(s => ({ ...s })), gods: { ...GOD_HOLDERS }, families: {}, legends: [] },
    lastSlot: 1, savedAt: 0,
  };
}
let META = newMeta();
let ACH_HOOK = null; // UI sets this for toasts

/* ---------- MODIFIERS ---------- */
const FLAG_KEYS = ['auraNone','revive','noDeath','fly','tools','gravity','seePot','earlyRead','earlyAura','noOver','noStylePenalty','dragonBlood','eyeStrain','overflow','shadow','noBetray','foresee','ageless','curseRes','reqCut'];
const MULT_KEYS = ['evt'];
const UPG_FX = {
  born_mage: { manaPot: .25 }, arcane_blood: { manaPot: .30, xp: { magic: .15 } }, calm_mind: { stress: -.25 },
  iron_const: { regen: 5 }, legacy_boost: { lp: .25 },
  long_childhood: { manaWin: 1 }, longevity: { life: .10 }, quick_study: { xp: { all: .10 } }, guild_patron: { quest: 5, questGold: .15 },
};
for (const u of UPGRADES) if (u.fx) UPG_FX[u.id] = u.fx;
let _modCache = { key: '', M: null };
function mods(L) {
  const gear = L.gear || {};
  const key = L.id + '|' + L.traits.join(',') + '|' + L.earned.join(',') + '|' + JSON.stringify(META.upg) + '|' + Object.values(gear).join(',') + '|' + (L.cheats ? JSON.stringify(L.cheats) : '') + '|' + L.season + '|' + Object.keys(L.works || {}).join(',') + '|' + (typeof activeWorld === 'function' ? activeWorld(L).map(m => m.id).join(',') : '');
  if (_modCache.key === key) return _modCache.M;
  const M = { xp: {}, st: {}, evt: {} };
  const fxs = [...L.traits, ...L.earned].map(id => TRAIT[id] && TRAIT[id].fx).filter(Boolean);
  if (SEASON[L.season]) fxs.push(SEASON[L.season].fx);
  for (const k in gear) if (gear[k] && ITEM[gear[k]]) fxs.push(ITEM[gear[k]].fx || {});
  for (const w in L.works || {}) if (WORK[w] && WORK[w].fx) fxs.push(WORK[w].fx);
  if (typeof activeWorld === 'function') for (const m of activeWorld(L)) fxs.push(WN[m.id].fx);
  for (const k in UPG_FX) { const n = Math.min(5, +META.upg[k] || 0); for (let i = 0; i < n; i++) fxs.push(UPG_FX[k]); }
  for (const fx of fxs) {
    for (const k in fx) {
      const v = fx[k];
      if (k === 'xp' || k === 'st') { for (const s in v) M[k][s] = (M[k][s] || 0) + v[s]; }
      else if (k === 'evt') { for (const s in v) M.evt[s] = (M.evt[s] === undefined ? 1 : M.evt[s]) * v[s]; }
      else if (FLAG_KEYS.includes(k)) { M[k] = Math.max(M[k] || 0, v); }
      else M[k] = (M[k] || 0) + v;
    }
  }
  M.ap = (M.ap || 0) + (META.upg.extra_activity || 0);
  M.sp = (M.sp || 0) + (META.upg.social_butterfly || 0);
  if (L.cheats && L.cheats.sureSocial) { M.interview = (M.interview || 0) + 2; M.party = (M.party || 0) + 2; M.romance = (M.romance || 0) + 2; }
  _modCache = { key, M };
  return M;
}
const XP_PATH = {
  fire: ['magic','attack','fire'], water: ['magic','attack','water'], earth: ['magic','attack','earth'], wind: ['magic','attack','wind'],
  heal: ['magic','holy','heal'], barrier: ['magic','holy','barrier'], detox: ['magic','holy','detox'], summon: ['magic','summon'], gravity: ['magic','gravity'],
  sg: ['sword','sg'], wg: ['sword','wg'], ng: ['sword','ng'], fund: ['sword'], aura: ['aura'], study: ['study'], body: ['body'],
  social: ['social'], work: ['work'], craft: ['craft'],
};
function xpMult(L, k) {
  const M = mods(L); let s = (k === 'social') ? 0 : (M.xp.all || 0);
  for (const p of (XP_PATH[k] || [k])) s += M.xp[p] || 0;
  return Math.max(0.1, 1 + s) * ((L.cheats && L.cheats.xp) || 1);
}
function pct(L, k) { return mods(L)[k] || 0; }
function evtMul(L, k) { const v = mods(L).evt[k]; return v === undefined ? 1 : v; }
function hasFlag(L, k) { return !!mods(L)[k]; }

/* ---------- RANKS ---------- */
function rankOfXp(xp) { let r = 0; for (let i = 0; i < RANK_XP.length; i++) if (xp >= RANK_XP[i] && (i === 0 || xp > 0)) r = i; return r; }
function skillXp(L, k) { if (STYLE[k]) return L.sword[k] || 0; if (k === 'aura') return 0; return L.magic[k] || 0; }
function rankOf(L, k) { return L.ranks[k] || 0; }
function bestSword(L) { return Math.max(rankOf(L,'sg'), rankOf(L,'wg'), rankOf(L,'ng')); }
function bestAttack(L) { return Math.max(rankOf(L,'fire'), rankOf(L,'water'), rankOf(L,'earth'), rankOf(L,'wind')); }
function bestMagic(L) { return Math.max(...MAGIC.map(m => rankOf(L, m.id))); }
function bestRankAll(L) { return Math.max(bestSword(L), bestMagic(L)); }
function bestSkillName(L) {
  let best = null, bv = -1;
  for (const m of MAGIC) { const v = skillXp(L, m.id); if (v > bv) { bv = v; best = m.id; } }
  for (const s of STYLES) { const v = skillXp(L, s.id); if (v > bv) { bv = v; best = s.id; } }
  return best;
}
const MANA_GATE = { 4: 600, 5: 1500, 6: 4000, 7: 10000 };

/* ---------- POWER ---------- */
function partyPower(L) { return L.people.filter(p => p.alive && p.role === 'party').reduce((a, p) => a + (p.power || 10), 0); }
function power(L) {
  const M = mods(L);
  let p = 8 + bestSword(L) * 13 + bestAttack(L) * 11 + Math.max(rankOf(L,'heal'), rankOf(L,'barrier')) * 3 + rankOf(L,'gravity') * 6 + rankOf(L,'summon') * 4
    + L.aura.stage * 9 + (L.st.str + L.st.agi) * 0.8 + Math.min(25, L.mana.cap / 400) + (L.mana.chantless ? 6 : 0) + (M.quest || 0);
  p += partyPower(L) * 0.4 * (1 + (M.party || 0));
  for (const k in (L.gear || {})) if (L.gear[k] && ITEM[L.gear[k]]) p += ITEM[L.gear[k]].power || 0;
  p -= (L.injuries || []).length * 5;
  if (L.dragonAwake) p += 25;
  if (L.age < 10) p *= 0.5; else if (L.age < 14) p *= 0.8;
  if (L.age > 60) p *= Math.max(0.5, 1 - (L.age - 60) * 0.015);
  return Math.max(1, Math.round(p));
}
function fameTier(f) { return f >= 1000 ? 5 : f >= 400 ? 4 : f >= 150 ? 3 : f >= 60 ? 2 : f >= 20 ? 1 : 0; }
const FAME_NAMES = ['Unknown','Locally known','Regional fame','Royal attention','International fame','Living legend'];

/* ---------- NAMES & PEOPLE ---------- */
function rname(race, sex) { const n = NAMES[race] || NAMES.human; return R.pick(sex === 'f' ? n.f : n.m); }
function rsurname(race) { const n = NAMES[race] || NAMES.human; return R.pick(n.s); }
const PERSONALITY = ['kind','proud','shy','cheerful','stern','curious','greedy','loyal','playful','serious','gentle','hot-tempered','witty','dreamy'];
const LIKES = ['talk','gift','time','train'];
let _pid = 0;
function npc(L, o) {
  const race = o.race || L.race;
  const sex = o.sex || (R.chance(.5) ? 'm' : 'f');
  const p = Object.assign({
    id: 'p' + (Date.now() % 100000) + '_' + (++_pid) + R.i(10, 99), name: rname(race, sex), sur: o.sur || rsurname(race), sex, race, age: 0, role: 'other',
    op: R.i(5, 30), tags: [R.pick(PERSONALITY), R.pick(PERSONALITY)].filter((v, i, a) => a.indexOf(v) === i), likes: R.pick(LIKES),
    alive: true, traits: [], job: '', skill: null, canon: false, met: L.age, look: null, power: 0,
  }, o);
  if (!p.look) p.look = randLook(race, p.sex);
  if (!p.bio) p.bio = genBio(p);
  if (!p.mem) p.mem = [];
  L.people.push(p);
  return p;
}
function person(L, id) { return L.people.find(p => p.id === id); }
const MARKS = ['none','none','none','freckles','scar','mole','paint'];
const BEARDS = ['none','none','stubble','beard','mustache'];
const PAINT_RACES = ['beastfolk','superd','demonkin','dragon','seafolk'];
/* hairstyle odds by sex, in HAIR_STYLES order */
const STYLE_W = { f: [1, 3, 5, 4, 3, 2, 3, .5, 4, 2, 3, 3, 2, .5], m: [5, 4, 1.5, 1.5, .5, 4, 1, 3, 1, .2, .8, .4, 3, 3] };
function randLook(race, sex) {
  const r = RACE[race] || RACE.human; let mark = R.pick(MARKS); if (mark === 'paint' && !PAINT_RACES.includes(race)) mark = 'none';
  const w = STYLE_W[sex === 'f' || sex === 'm' ? sex : R.pick(['f', 'm'])];
  return { hair: R.pick(r.hair), eyes: R.pick(r.eyes), skin: R.pick(r.skin), style: R.w(w.map((_, i) => i), i => w[i]), face: R.i(0, 3), brow: R.i(0, 3), eye: R.i(0, 3), mark, beard: sex === 'f' ? 'none' : R.pick(BEARDS) };
}
function mixHex(a, b, t) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = [16, 8, 0].map(s => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t)); return '#' + c.map(x => x.toString(16).padStart(2, '0')).join(''); }
const hashStr = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); };
/* ---------- APPEARANCE: words for colors, genetics, scars ---------- */
function hsl(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1)); let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360; return [h, s, l];
}
function colorWord(hex, kind) {
  const [h, s, l] = hsl(hex || '#555555');
  if (kind === 'skin') {
    if (s > .12 && (h < 12 || h > 50)) return h >= 80 && h < 190 ? 'grey-green' : h >= 190 && h < 255 ? 'pale blue' : h >= 255 && h < 330 ? 'violet' : 'rose';
    return l > .86 ? 'porcelain' : l > .78 ? 'fair' : l > .68 ? 'light' : l > .56 ? 'olive' : l > .44 ? 'tan' : l > .32 ? 'brown' : 'deep brown';
  }
  if (kind !== 'eyes' && l > .88) return h >= 40 && h < 62 && s > .55 ? 'platinum blonde' : 'white';
  if (s < .14 || (kind === 'hair' && s < .2 && l > .6)) return l < .16 ? 'black' : l < .38 ? (kind === 'eyes' ? 'dark grey' : 'ash-dark') : l < .7 ? (kind === 'eyes' ? 'grey' : 'silver-grey') : kind === 'eyes' ? 'pale grey' : l < .86 ? 'silver' : 'white';
  if (kind === 'eyes') return h < 18 || h >= 340 ? 'crimson' : h < 32 ? (l < .3 ? 'dark brown' : 'brown') : h < 58 ? (s > .5 ? 'amber' : 'hazel') : h < 75 ? 'gold' : h < 165 ? (l > .5 ? 'jade' : 'green') : h < 200 ? 'teal' : h < 255 ? (l > .55 ? 'sky-blue' : 'blue') : h < 300 ? 'violet' : 'rose';
  if (h < 14 || h >= 345) return l < .38 ? 'auburn' : l < .55 ? 'crimson' : 'rose-red';
  if (h < 34) return l < .14 ? 'near-black' : l < .3 ? 'dark brown' : l < .42 ? (s > .5 ? 'copper' : 'brown') : s > .55 ? 'copper' : 'chestnut';
  if (h < 58) return l < .3 ? 'brown' : l < .55 ? 'golden' : l < .78 ? 'blonde' : 'platinum blonde';
  if (h < 165) return l < .3 ? 'forest green' : 'green';
  if (h < 200) return 'teal';
  if (h < 260) return l < .3 ? 'midnight blue' : l > .62 ? 'sky-blue' : 'blue';
  if (h < 300) return l < .35 ? 'plum' : 'violet';
  return 'pink';
}
/* how good-looking someone else is: their own stat if they have one, otherwise fate (canon faces are striking) */
const npcLooks = (p) => p.looks != null ? p.looks : p.canon ? 13 + (hashStr(p.name) % 5) : 4 + (hashStr(p.id || p.name) % 11);
/* genetics: a child's look drawn from the base (a chosen or random look) and up to two parents; k is how strongly blood wins */
function inheritLook(base, parents, k) {
  const look = Object.assign({}, base), from = {};
  const ps = (parents || []).filter(p => p && p.look);
  if (!ps.length) return { look, from };
  const one = () => R.pick(ps);
  if (R.chance(.5 * k)) { const p = one(); look.eyes = p.look.eyes; from.eyes = p; }
  if (R.chance(.42 * k)) { const p = one(); look.hair = p.look.hair; from.hair = p; }
  else if (ps.length > 1 && R.chance(.25 * k)) { look.hair = mixHex(ps[0].look.hair, ps[1].look.hair, (.3 + R.f() * .4)); from.hair = 'both'; }
  const skin = ps.length > 1 ? mixHex(ps[0].look.skin, ps[1].look.skin, (.3 + R.f() * .4)) : ps[0].look.skin;
  look.skin = mixHex(look.skin, skin, (.25 + R.f() * .3) * k);
  if (R.chance(.35 * k)) { const p = one(); look.face = p.look.face; from.face = p; }
  if (R.chance(.3 * k)) { const p = one(); look.eye = p.look.eye; from.eye = p; }
  if (R.chance(.25 * k)) { const p = one(); look.brow = p.look.brow; }
  if (look.mark === 'none' && R.chance(.05)) { look.mark = R.pick(['freckles', 'mole']); from.mark = 1; }
  if (look.mark === 'none' && ps.some(p => p.look.mark === 'freckles') && R.chance(.4 * k)) { look.mark = 'freckles'; from.mark = ps.find(p => p.look.mark === 'freckles'); }
  return { look, from };
}
/* the line a birth log gets: "your mother's green eyes and dark hair, and your father's square face" */
function inheritNote(from, look, kin) {
  const groups = new Map(), extra = [];
  const add = (p, txt) => { if (p === 'both') return extra.push(txt); const k = kin(p); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(txt); };
  if (from.eyes) add(from.eyes, `${colorWord(look.eyes, 'eyes')} eyes`);
  if (from.hair) add(from.hair, from.hair === 'both' ? `hair the shade between your parents’` : `${colorWord(look.hair, 'hair')} hair`);
  if (from.face) add(from.face, `${(['oval', 'square', 'heart-shaped', 'round'])[look.face || 0]} face`);
  if (from.mark && from.mark !== 1) add(from.mark, 'freckles');
  const and = (xs) => xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
  const parts = [...groups.entries()].map(([k, xs]) => `${k}’s ${and(xs)}`).concat(extra);
  if (!parts.length) return '';
  return parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + (parts.length > 2 ? ',' : '') + (groups.size > 1 || extra.length ? ', and ' : ' and ') + parts[parts.length - 1];
}
/* scars: up to three marks a life leaves on the face */
const SCAR_SPOTS = ['brow', 'cheek', 'lip', 'nose', 'forehead'];
const SCAR_WORDS = { brow: 'through the brow', cheek: 'across the cheek', lip: 'through the lip', nose: 'across the bridge of the nose', forehead: 'along the hairline' };
function addScar(L, t, s) {
  L.scars = L.scars || [];
  if (L.scars.length >= 3) return null;
  t = t || R.pick(SCAR_SPOTS.filter(x => !L.scars.some(q => q.t === x)));
  if (!t) return null;
  const sc = { t, s: s || (R.chance(.5) ? -1 : 1), a: L.age };
  L.scars.push(sc);
  if (typeof mile === 'function') mile(L, 'scar', `Earned a scar ${SCAR_WORDS[t]}`);
  return sc;
}
function isFamily(p) { return ['mother','father','sibling','twin','child','grandchild','descendant','guardian'].includes(p.role); }
function romanceAge(L, p) { const rc = RACE[p.race] || RACE.human; return Math.max(18, rc.coming); }
function canRomance(L, p) {
  if (L.vow === 'solitude') return false;
  const my = Math.max(18, (RACE[L.race] || RACE.human).coming);
  return L.age >= my && p.alive && !isFamily(p) && !p.canon && !p.noRomance && p.age >= romanceAge(L, p) && Math.abs(p.age - L.age) <= 15 + (RACE[p.race].life[0] > 150 ? 200 : 0);
}

/* ---------- LOG ---------- */
function log(L, text, kind, head) {
  const en = { a: L.age, t: text, k: kind || '', y: L.year, p: L.town }; if (head) en.h = head;
  if (L._buf) { L._buf.push(en); return; }
  L.log.push(en);
  if (L.log.length > 260) L.log.splice(0, L.log.length - 260);
}

/* ---------- ACHIEVEMENTS & EARNED TRAITS ---------- */
function unlock(L, id) {
  if (!ACH[id]) return;
  if (META.settings.adminLock && L.admin) return;
  if (!L.achLife.includes(id)) L.achLife.push(id);
  if (!META.ach[id]) {
    META.ach[id] = { at: Date.now(), who: L.name };
    const rw0 = RW[ACH[id].rw] || RW.s, lm = 1 + 0.25 * (META.upg.laurels || 0);
    const rw = { lp: Math.round(rw0.lp * lm), gold: Math.round(rw0.gold * lm), xp: Math.round(rw0.xp * lm) };
    META.lp += rw.lp; money(L, rw.gold); const xk = grantXp(L, rw.xp);
    log(L, `Achievement: ${ACH[id].name}. +${rw.lp} Legacy Points, +${rw.gold} gold, +${rw.xp} ${xk} XP.`, 'ach');
    if (ACH_HOOK) ACH_HOOK('ach', ACH[id].name, `+${rw.lp} LP \u00b7 +${rw.gold} gold \u00b7 +${rw.xp} XP`);
  }
}
/* ---------- DISCOVERIES: a cross-life compendium; every 10 new entries pays Legacy Points ---------- */
const NOTABLES = ['Roxy', 'Ghislaine', 'Ruijerd', 'Zanoba', 'Cliff', 'Linia', 'Pursena', 'Nanahoshi', 'Ariel', 'Orsted', 'Badigadi', 'Reida'];
function discTotal() { const D = META.disc || {}; return ['ev', 'town', 'npc', 'arc'].reduce((a, k) => a + Object.keys(D[k] || {}).length, 0); }
let DISC_QUIET = false;
function discover(kind, id) {
  if (!META.disc) META.disc = { ev: {}, town: {}, npc: {}, arc: {}, paid: 0 };
  const D = META.disc; if (!D[kind]) D[kind] = {};
  if (!id || D[kind][id]) return false;
  D[kind][id] = 1;
  if (!DISC_QUIET) discPay();
  return true;
}
/* the n-th reward of ten discoveries pays 10 + 5n: rarer finds pay more */
const discReward = (n) => 10 + 5 * n;
function discPay(lump) {
  const D = META.disc, due = Math.floor(discTotal() / 10);
  let lp = 0; while ((D.paid || 0) < due) { D.paid = (D.paid || 0) + 1; lp += discReward(D.paid); }
  if (!lp) return;
  META.lp += lp;
  if (ACH_HOOK) ACH_HOOK('disc', lump ? `${discTotal()} discoveries recorded` : `${due * 10} discoveries`, `+${lp} Legacy Points`);
}
const discMax = () => EVENTS.length + TOWNS.length + NOTABLES.length + ARCS.length;
/* discoveries made in admin-edited lives don't count when the admin lock is on */
const discoverL = (L, kind, id) => {
  if (META.settings.adminLock && L.admin) return false;
  const n = discover(kind, id); if (!n) return false;
  L.discN = (L.discN || 0) + 1;
  const t = discTotal(); if (t >= 100) unlock(L, 'world_scholar'); if (t >= discMax()) unlock(L, 'all_seen');
  return true;
};
/* fill the compendium from a life saved before it existed */
function discBackfill(L) {
  if (L.discFill) return; L.discFill = 1;
  DISC_QUIET = true;
  try {
    for (const k in L.flags || {}) if (k.startsWith('ev_')) discover('ev', k.slice(3));
    for (const t of L.towns || [L.town]) discover('town', t);
    for (const p of L.people || []) if (p.canon && NOTABLES.includes(p.name)) discover('npc', p.name);
    for (const a in L.arc || {}) if (L.arc[a] === 99) discover('arc', a);
  } finally { DISC_QUIET = false; }
  discPay(true);
}
/* ---------- LIFE HISTORY: one sample a year (thinner for very long lives) ---------- */
function recordHist(L, force) {
  const step = L.age < 120 ? 1 : L.age < 400 ? 5 : 10;
  if (!force && L.age % step) return;
  const H = L.hist || (L.hist = { a: [], p: [], g: [], f: [], m: [], au: [] });
  if (H.a.length && H.a[H.a.length - 1] === L.age) { H.a.pop(); H.p.pop(); H.g.pop(); H.f.pop(); H.m.pop(); H.au.pop(); }
  H.a.push(L.age); H.p.push(Math.round(power(L))); H.g.push(Math.round(L.gold)); H.f.push(Math.round(L.fame)); H.m.push(Math.round(L.mana.cap)); H.au.push(Math.round(L.aura.cap));
}
/* XP rewards go to your strongest discipline */
function grantXp(L, n) {
  if (!n) return '';
  let best = null, bv = 0;
  for (const m of MAGIC) { const v = L.magic[m.id] || 0; if (v > bv) { bv = v; best = m.id; } }
  for (const st of STYLES) { const v = L.sword[st.id] || 0; if (v > bv) { bv = v; best = st.id; } }
  if (!best) { if (L.age >= 4) { L.sword.fund += n; return 'sword fundamentals'; } L.read = clamp(L.read + n / 10, 0, 100); return 'learning'; }
  if (STYLE[best]) L.sword[best] += n; else L.magic[best] += n;
  autoRank(L, best, true);
  return STYLE[best] ? STYLE[best].name : MAGIC_ID[best].name + ' magic';
}
/* Goals: per-life objectives with one-time rewards */
function checkGoals(L) {
  if (!L.goalsDone) L.goalsDone = [];
  const done = [];
  for (const g of GOALS) {
    if (L.goalsDone.includes(g.id)) continue;
    let r; try { r = g.check(L); } catch (e) { continue; }
    if (r && r[0] >= r[1]) {
      L.goalsDone.push(g.id); done.push(g);
      const am = 1 + 0.25 * (META.upg.ambition || 0), rw = { gold: Math.round((g.rw.gold || 0) * am), lp: Math.round((g.rw.lp || 0) * am), xp: Math.round((g.rw.xp || 0) * am) }; if (rw.gold) money(L, rw.gold); if (rw.lp) META.lp += rw.lp; const xk = rw.xp ? grantXp(L, rw.xp) : '';
      const parts = [rw.lp ? `+${rw.lp} LP` : '', rw.gold ? `+${rw.gold} gold` : '', rw.xp ? `+${rw.xp} XP` : ''].filter(Boolean).join(' \u00b7 ');
      log(L, `Goal complete: ${g.name}. ${parts.replace(/ \u00b7 /g, ', ')}${xk ? ' (' + xk + ')' : ''}.`, 'goal');
      if (ACH_HOOK) ACH_HOOK('goal', g.name, parts);
    }
  }
  return done;
}
function earn(L, id, note) {
  if (L.earned.includes(id) || L.traits.includes(id)) return false;
  L.earned.push(id);
  log(L, 'Earned trait: ' + TRAIT[id].name + '. ' + (note || TRAIT[id].up), 'earn');
  if (ACH_HOOK) ACH_HOOK('trait', TRAIT[id].name, TRAIT[id].up, TRAIT[id].tier);
  return true;
}

/* ---------- STAT CHANGES ---------- */
function maxHp(L) { return Math.max(20, 100 + (pct(L,'maxHp') || 0) + (L.bonusHp || 0)); }
function hurt(L, n, cause) {
  const inj = Math.max(0.1, 1 + pct(L,'injury'));
  const dmg = Math.round(n * inj);
  L.hp = clamp(L.hp - dmg, -50, maxHp(L));
  if (dmg >= 18 && L.age >= 6 && L.hp > 0 && !/sick|ill|fever|hunger|lean|exhaust|mana|old wound|desert|surf|storm/i.test(cause || '') && R.chance(Math.min(.28, (dmg - 14) * .012))) { const sc = addScar(L); if (sc) log(L, `The wound from ${cause || 'the fight'} heals into a scar ${SCAR_WORDS[sc.t]}.`, 'bad'); }
  if (L.hp <= 0) L.deathCause = L.deathCause || cause || 'wounds';
  return dmg;
}
function heal(L, n) { L.hp = clamp(L.hp + n, -50, maxHp(L)); }
function stress(L, n) {
  if (L.cheats && L.cheats.noStress) { L.stress = 0; return; }
  if (n > 0) { let m = 1 + pct(L,'stress'); if (L.age < 15) m += pct(L,'stressChild'); n = n * Math.max(0.1, m); }
  L.stress = clamp(L.stress + n, 0, 100);
}
function money(L, n) { if (n > 0 && L.cheats && L.cheats.gold > 1) n *= L.cheats.gold; L.gold = Math.max(0, L.gold + Math.round(n)); }
function fame(L, n) { if (n > 0) n *= (1 + pct(L,'fame')); L.fame = Math.max(0, L.fame + n); if (L.vow === 'humility' && L.fame > 59) L.fame = 59; }
function relGain(L, p, n) {
  let m = 1 + pct(L,'rel');
  if (p.race === 'beastfolk') m += pct(L,'beastRel');
  if (p.race === 'human') m += pct(L,'humanRel');
  if (n > 0) n *= Math.max(0.1, m);
  p.op = clamp(Math.round(p.op + n), -100, 100);
}
function grow(L, s, n) {
  const v = L.st[s];
  let g = n * Math.max(0.12, 1 - Math.max(0, v - 10) / 22);
  if (s === 'agi') g *= Math.max(0.2, 1 + pct(L,'agiGrow'));
  L.st[s] = Math.round((v + g) * 100) / 100;
}
