/* ===================== ENGINE: BIRTH ===================== */
function tagWeights(d) {
  const w = {};
  const add = (tags) => { if (!tags) return; for (const k in tags) w[k] = (w[k] || 1) * tags[k]; };
  add((RACE[d.race] || {}).tags); add((BG[d.bg] || {}).tags); add((SEASON[d.season] || {}).tags); add((OMEN[d.omen] || {}).tags);
  return w;
}
function birthLuck(d) { return ((OMEN[d.omen] || {}).luck || 0) + 0.25 * (META.upg.rarity_luck || 0); }
function tierOdds(d) {
  const luck = birthLuck(d); const om = OMEN[d.omen] || {};
  return TIERS.map((t, i) => {
    let w = t.weight * Math.pow(1 + luck, t.id === 'admin' ? 3 : i);
    if (om.tierMult && om.tierMult[t.id]) w *= om.tierMult[t.id];
    return w;
  });
}
function rollTier(d) { const ws = tierOdds(d); const idx = R.w(TIERS.map((_, i) => i), i => ws[i]); return TIERS[idx].id; }
function traitAllowed(t, picks) {
  if (picks.includes(t.id)) return false;
  const aBoost = (x) => (x.fx.auraGrow || 0) > 0 || x.fx.earlyAura || (x.fx.xp && x.fx.xp.aura > 0);
  if (t.id === 'aura_incompat' && picks.some(id => aBoost(TRAIT[id]))) return false;
  if (aBoost(t) && picks.includes('aura_incompat')) return false;
  return true;
}
function rollTraitIn(tier, d, picks) {
  const tw = tagWeights(d); const om = OMEN[d.omen] || {};
  const cands = TRAITS.filter(t => t.tier === tier && traitAllowed(t, picks));
  const t = R.w(cands, x => { let w = 1; for (const g of x.tags) w *= (tw[g] || 1); if (om.boost && om.boost[x.id]) w *= om.boost[x.id]; return w; });
  return t ? t.id : null;
}
/* Rolls the 3 born traits. chosen = traits the player picked (Fate Chooser). Returns {traits, sources} */
function rollBornTraits(d, chosen, forPlayer) {
  const picks = [], src = {};
  const inheritMul = META.upg.bloodline_memory ? 2 : 1;
  for (const id of (chosen || [])) if (picks.length < 2 && TRAIT[id] && traitAllowed(TRAIT[id], picks)) { picks.push(id); src[id] = 'chosen'; }
  for (const par of (d.parents || [])) for (const id of (par.traits || [])) {
    const t = TRAIT[id]; if (!t || picks.length >= 3) continue;
    if (R.chance(Math.min(.9, TIERS[TIER_IDX[t.tier]].inherit * inheritMul)) && traitAllowed(t, picks)) { picks.push(id); src[id] = 'from ' + (par.role === 'mother' ? 'your mother' : 'your father'); }
  }
  if (forPlayer && META.upg.heirloom && META.heirloom && TRAIT[META.heirloom] && picks.length < 3 && R.chance(.5) && traitAllowed(TRAIT[META.heirloom], picks)) { picks.push(META.heirloom); src[META.heirloom] = 'heirloom'; }
  const tb = ((BG[d.bg] || {}).ex || {}).traitBoost || {};
  for (const id in tb) if (picks.length < 3 && R.chance(tb[id]) && traitAllowed(TRAIT[id], picks)) { picks.push(id); src[id] = 'bloodline'; }
  let guard = 0;
  while (picks.length < 3 && guard++ < 50) { const id = rollTraitIn(rollTier(d), d, picks); if (id) { picks.push(id); src[id] = src[id] || 'fate'; } }
  // Legacy Shop guarantees: at least one trait of a minimum tier
  const minT = !forPlayer ? -1 : META.upg.fated_legend ? 4 : META.upg.fated_epic ? 3 : META.upg.fated_rare ? 2 : -1;
  if (minT >= 0 && !picks.some(id => TIER_IDX[TRAIT[id].tier] >= minT)) {
    let idx = -1; for (let i = picks.length - 1; i >= 0; i--) if (src[picks[i]] === 'fate') { idx = i; break; }
    if (idx >= 0) {
      const rest = picks.filter((_, i) => i !== idx);
      const tier = R.chance(.2) && minT < 5 ? TIERS[minT + 1].id : TIERS[minT].id;
      const id = rollTraitIn(tier, d, rest) || rollTraitIn(TIERS[minT].id, d, rest);
      if (id) { delete src[picks[idx]]; picks[idx] = id; src[id] = 'fate'; }
    }
  }
  return { traits: picks, sources: src };
}
function rollParentTraits(d) {
  const out = []; const n = R.chance(.45) ? 2 : 1; const dd = Object.assign({}, d, { omen: 'clear' });
  for (let k = 0; k < n; k++) { const tier = R.w(TIERS.slice(0, 6), t => t.weight).id; const id = rollTraitIn(tier, dd, out); if (id) out.push(id); }
  return out;
}

/* ---------- DRAFT (what the New Life screen edits) ---------- */
function bgAllowedFor(race) { return BACKGROUNDS.filter(b => !b.races || b.races.includes(race)); }
function townsFor(race, bg) {
  const b = BG[bg];
  let list = TOWNS;
  if (b && b.towns) { const f = TOWNS.filter(t => b.towns.some(tag => t.tags.includes(tag) || (tag === 'city' && t.size >= 3) || (tag === 'capital' && t.size >= 4) || t.id === tag)); if (f.length) list = f; }
  return list;
}
function pickTown(race, bg) {
  const list = townsFor(race, bg); const pref = (RACE[race] || RACE.human).birth || {};
  return R.w(list, t => (pref[t.id] || 0.15)).id;
}
function pickBg(race) { return R.w(bgAllowedFor(race), b => TIERS[TIER_IDX[b.tier]].weight * (b.races ? 3 : 1)).id; }
function rollParents(d) {
  const b = BG[d.bg]; const race = d.race;
  if (b.ex.orphan) return [];
  const old = d.order === 'late';
  const sur = d.sur;
  const mk = (role, sex) => ({ role, sex, race, name: rname(race, sex), sur, age: old ? R.i(38, 48) : R.i(18, 36), job: '', traits: [], look: randLook(race, sex), looks: R.i(3, 15) });
  const m = mk('mother', 'f'), f = mk('father', 'm');
  const jobs = b.jobs.length ? b.jobs : ['Laborer','Laborer'];
  f.job = jobs[0]; m.job = jobs[1] || jobs[0];
  const gendered = /\b(king|queen|lord|lady|count|countess|priestess)\b/i.test(f.job + ' ' + m.job);
  if (!gendered && R.chance(.5)) { const t = f.job; f.job = m.job; m.job = t; }
  m.traits = rollParentTraits(d); f.traits = rollParentTraits(d);
  return [m, f];
}
function rollFate(d) {
  d.season = R.pick(SEASONS).id;
  d.omen = R.w(OMENS, o => o.weight * (o.weight < 5 ? 1 + (META.upg.star_watcher || 0) : 1)).id;
  d.order = R.w(BIRTH_ORDERS, o => o.weight).id;
  d.parents = rollParents(d);
  const r = rollBornTraits(d, d.chosen, true);
  d.traits = r.traits; d.sources = r.sources;
  return d;
}
function newDraft(lock) {
  lock = lock || {};
  const d = {};
  d.sex = lock.sex || (R.chance(.5) ? 'm' : 'f');
  d.race = lock.race || R.w(RACES, r => r.weight).id;
  d.bg = (lock.bg && (!BG[lock.bg].races || BG[lock.bg].races.includes(d.race))) ? lock.bg : pickBg(d.race);
  d.town = lock.town || pickTown(d.race, d.bg);
  d.name = lock.name || rname(d.race, d.sex);
  d.sur = lock.sur || rsurname(d.race);
  d.look = lock.look || randLook(d.race, d.sex);
  d.chosen = lock.chosen || [];
  d.rerolls = 3 + (META.upg.second_glance || 0);
  d.bonus = { str: 0, agi: 0, int: 0, cha: 0, looks: 0, luck: 0 };
  rollFate(d);
  return d;
}

/* ---------- BUILD A LIFE FROM A DRAFT ---------- */
function buildLife(d, heirOf) {
  const race = RACE[d.race], b = BG[d.bg];
  const wealth0 = META.upg.old_money && !heirOf ? Math.max(b.wealth, Math.min(4, b.wealth + 1)) : b.wealth;
  const L = {
    id: 'L' + Date.now().toString(36) + R.i(100, 999), v: 1,
    name: d.name, sur: d.sur, sex: d.sex, race: d.race, bg: d.bg, town: d.town, home: d.town, season: d.season, omen: d.omen, order: d.order,
    look: d.look, age: 0, year: META.world.year, alive: true, traits: d.traits.slice(0, 3), earned: [], traitSrc: d.sources || {},
    st: { str: 0, agi: 0, int: 0, cha: 0, looks: 0, luck: 0 }, hp: 100, stress: 5, gold: 0, fame: 0,
    family: { wealth: wealth0, funds: ([8, 40, 150, 600, 3000, 20000][wealth0] * (d.omen === 'harvest_moon' ? 1.5 : 1) + 100 * (META.upg.birth_purse || 0)) * (META.upg.family_fortune ? 2 : 1), cls: b.cls },
    mana: { pot: 1, cap: 15, ctrl: 0, eff: 10, chant: 0, chantless: false, revealed: false, over: 0, casted: false },
    magic: {}, sword: { fund: 0, sg: 0, wg: 0, ng: 0, primary: null, styleChosen: false }, ranks: {},
    aura: { compat: 1, cap: 0, stage: 0, ctrl: 0, known: false },
    read: 0, edu: { school: null, yrs: 0, done: [] }, job: null, jobBoard: [], guild: { reg: false, rank: 0, pts: 0 }, quests: [],
    people: [], log: [], flags: {}, cnt: {}, injuries: [], visited: [CONT_OF(d.town)], achLife: [], queue: [], pending: null,
    ap: 1, sp: 1, trials: {}, epithet: '', manGod: 0, manGodNo: 0, deathCause: '', revived: false, gen: heirOf ? (heirOf.gen || 1) + 1 : 1,
    lifespan: 0, children: 0, lineage: heirOf ? heirOf.lineage : null,
    gear: {}, arc: {}, arcYear: {}, goalsDone: [], towns: [d.town], apMax: 1, well: 0, pinned: [],
  };
  L.lineage = L.lineage || L.id;
  L.vow = d.vow && VOW[d.vow] ? d.vow : null;
  const M = mods(L);
  // stats
  const base = { str: R.i(2, 4), agi: R.i(2, 4), int: R.i(2, 4), cha: R.i(3, 6), looks: R.i(4, 12), luck: R.i(2, 10) };
  for (const s in base) L.st[s] = Math.max(0, base[s] + (race.st[s] || 0) + (M.st[s] || 0) + (d.bonus ? d.bonus[s] || 0 : 0));
  if (META.upg.blade_prodigy) { L.st.str += 2; L.st.agi += 2; }
  // genetics: the look chosen at creation is a starting point; your parents' blood has the last word
  const blood = (d.parents || []).filter(p => p.look);
  if (blood.length && !heirOf) {
    const g = inheritLook(d.look, blood, .65);
    L.look = g.look; L.lookBase = d.look; L.lookFrom = {};
    for (const k in g.from) L.lookFrom[k] = g.from[k] === 'both' ? 'both' : g.from[k] === 1 ? 'fate' : g.from[k].role;
    const avg = blood.reduce((a, p) => a + (p.looks == null ? 9 : p.looks), 0) / blood.length;
    const gl = Math.round((avg - 9) * .3);
    if (gl) L.st.looks = Math.max(0, L.st.looks + gl);
    L.flags.bloodLooks = gl;
  }
  L.hp = maxHp(L);
  // lifespan (hidden)
  L.lifespan = Math.round(R.i(race.life[0], race.life[1]) * Math.max(0.3, 1 + (M.life || 0)));
  // mana
  let pot = race.pot * Math.exp(R.gauss() * 0.35) * (1 + (M.manaPot || 0)) * (1 + (b.ex.manaBoost || 0));
  if (L.traits.includes('admin_mana')) pot *= 1;
  L.mana.pot = Math.round(pot * 100) / 100;
  L.mana.cap = Math.round(15 * pot);
  L.mana.eff = clamp(10 + (M.manaEff || 0) * 100, 0, 100);
  L.mana.revealed = !!(M.seePot || META.upg.born_mage);
  // aura
  if (M.auraNone) L.aura.compat = 0;
  else if (R.chance(race.auraNone)) L.aura.compat = 0;
  else L.aura.compat = Math.round(race.aura * Math.exp(R.gauss() * 0.3) * 100) / 100;
  // sword preset
  if (b.ex.style) L.sword.preset = b.ex.style;
  if (b.ex.fameStart) L.fame = L.vow === 'humility' ? Math.min(59, b.ex.fameStart) : b.ex.fameStart;
  if (b.ex.books || M.earlyRead) L.flags.books = 1;
  if (b.ex.noble) L.flags.noble = b.ex.noble;
  // family
  for (const pr of (d.parents || [])) {
    const p = npc(L, { role: pr.role, sex: pr.sex, race: pr.race, name: pr.name, sur: pr.sur, age: pr.age, job: pr.job, traits: pr.traits, op: R.i(55, 80), look: pr.look, looks: pr.looks, met: 0 });
    if (b.ex.swordTutor && pr.role === 'father') p.skill = { k: b.ex.style || 'wg', r: b.ex.style ? 4 : 3 };
    if (b.ex.magicStart && pr.role === 'mother') p.skill = { k: b.ex.magicStart === 'heal' ? 'heal' : R.pick(['fire','water','earth','wind']), r: b.id === 'archmage_heir' ? 5 : 3 };
    if (b.id === 'seven_child' && pr.role === 'father') { p.skill = { k: R.pick(['sg','wg','ng']), r: 6 }; p.job = 'One of the Seven Great Powers'; }
  }
  if (b.ex.orphan) npc(L, { role: 'guardian', name: 'Matron ' + rname('human','f'), sex: 'f', race: 'human', age: R.i(45, 60), job: 'Orphanage Matron', op: R.i(30, 55), met: 0 });
  const o = d.order;
  const sib = (age, role) => npc(L, { role: role || 'sibling', age, sur: d.sur, op: R.i(20, 60), met: 0 });
  if (o === 'middle') { sib(R.i(2, 6)); L.flags.youngerSib = 1; }
  if (o === 'youngest') { for (let k = 0; k < R.i(1, 3); k++) sib(R.i(2, 9)); }
  if (o === 'late') { for (let k = 0; k < R.i(1, 2); k++) sib(R.i(12, 20)); }
  if (o === 'twin') sib(0, 'twin');
  if (o === 'first') L.flags.youngerSib = 1;
  // log the birth
  const town = TOWN[d.town];
  log(L, `You are born${heirOf ? '' : ''} in ${town.name} (${town.realm}) on ${/^[aeiou]/i.test(SEASON[d.season].name) ? 'an' : 'a'} ${SEASON[d.season].name.toLowerCase()} day under ${OMEN[d.omen].name === 'Clear Skies' ? 'clear skies' : 'a ' + OMEN[d.omen].name}.`, 'big');
  const par = L.people.filter(p => p.role === 'mother' || p.role === 'father');
  if (par.length) log(L, `Your parents: ${par.map(p => p.name + ' (' + p.job.toLowerCase() + ')').join(' and ')}. ${b.name}.`);
  else log(L, `You never knew your parents. You are raised in an orphanage.`);
  if (L.lookFrom && Object.keys(L.lookFrom).length) {
    const kin = (role) => role === 'mother' ? 'your mother' : role === 'father' ? 'your father' : 'your family';
    const fromP = {}; for (const k in L.lookFrom) fromP[k] = L.lookFrom[k] === 'both' ? 'both' : L.lookFrom[k] === 'fate' ? 1 : { role: L.lookFrom[k] };
    const note = inheritNote(fromP, L.look, (p) => kin(p.role));
    if (note) log(L, `The midwife laughs: you have ${note}.`);
  }
  if (L.flags.bloodLooks >= 2) log(L, 'Your parents are a handsome pair, and it shows already.');
  else if (L.flags.bloodLooks <= -2) log(L, 'Nobody would call your parents beautiful. You take after them.');
  for (const id of L.traits) log(L, `Born with ${TRAIT[id].name} (${TIERS[TIER_IDX[TRAIT[id].tier]].name}).`, 'trait');
  // achievements at birth
  if (b.id === 'royal') unlock(L, 'royal_birth');
  if (L.traits.some(id => TRAIT[id].tier === 'mythic')) unlock(L, 'mythic_birth');
  if (L.traits.some(id => TRAIT[id].tier === 'admin') && !(d.chosen || []).some(c => TRAIT[c] && TRAIT[c].tier === 'admin') && !d.adminForged) unlock(L, 'admin_birth');
  if (L.traits.filter(id => TIER_IDX[TRAIT[id].tier] >= 4).length >= 3) unlock(L, 'fate_fav');
  resetPoints(L);
  refreshBoards(L);
  recordHist(L, true); discover('town', L.town);
  if (!heirOf) { const pa = L.people.filter(p => ['mother', 'father', 'guardian'].includes(p.role)); mile(L, 'birth', `Born in ${TOWN[L.town].name}${pa.length ? ` to ${pa.map(p => p.name).join(' and ')}` : ''}`, 0); }
  return L;
}
function CONT_OF(town) { return (TOWN[town] || TOWN.buena).cont; }
function apBase(L) { return L.age <= 5 ? 1 : L.age <= 10 ? 2 : L.age <= 14 ? 3 : 6; }
/* Healthy, low-stress years grant 1 to 3 extra actions */
function wellness(L) {
  const ws = META.upg.wellspring ? 1 : 0;
  const hp = L.hp / maxHp(L) + ws * 0.08, s = L.stress - ws * 10;
  let b = 0;
  if (hp >= 0.6 && s <= 40) b = 1;
  if (hp >= 0.8 && s <= 25) b = 2;
  if (hp >= 0.92 && s <= 10) b = 3;
  return Math.min(b, L.age <= 5 ? 1 : L.age <= 14 ? 2 : 3);
}
function apFor(L) {
  const M = mods(L);
  return apBase(L) + wellness(L) + (M.ap || 0) + (L.age <= 10 ? (M.apEarly || 0) : 0);
}
function spFor(L) { const M = mods(L); return Math.max(1, (L.age < 2 ? 1 : L.age < 15 ? 2 : 3) + (M.sp || 0) - (L.vow === 'hermit' ? 1 : 0)); }
function resetPoints(L) { L.well = wellness(L); L.ap = apFor(L); L.apMax = L.ap; L.sp = spFor(L); L.spMax = L.sp; L.mana.over = 0; }
