/* ===================== ENGINE: YEARS, DEATH, LEGACY ===================== */
const EVT = Object.fromEntries(EVENTS.map(e => [e.id, e]));

/* repeatable events rest for a few years after firing */
const EVENT_CD = { bard_song: 8, old_friend: 6, figurine_order: 6, retire: 5, job_conflict: 3, job_praise: 2, merchant_guard: 3, noble_insult: 6, investment: 3, bandits: 2, tavern_brawl: 3, beggar: 3,
  holy_knights: 4, claim_jumpers: 3, admirer: 4, spirit: 8, guild_rescue: 3, festival: 2, found_coins: 2, misfortune: 3, family_woe: 4, plague: 5, hardship: 3, magic_accident: 4, war: 3, assassin: 5,
  demon_prejudice: 4, mangod: 2, school_prize: 2, chores: 2, black_sails: 4, royal_tournament: 4, refugees: 5, mercenary_contract: 3, grimoire_auction: 8, exam_week: 2, elder_reflection: 5, anniversary: 1,
  fever: 2, sibling_born: 2, student_door: 6, child_spell: 1, child_leaves: 1, rival_returns: 3,
  /* the most common everyday scenes rest longer so a life never feels like reruns */
  market_day: 6, midwinter_feast: 6, square_trouble: 7, storm_road: 7, wandering_duelist: 6, noble_ball: 4, stranger_map: 9, wrecked_caravan: 8 };
Object.assign(EVENT_CD, { job_conflict: 5, merchant_guard: 5, tavern_brawl: 5, claim_jumpers: 5, beggar: 5, bandits: 4, investment: 4 });
for (const id in EVENT_CD) if (EVT[id]) EVT[id].cd = EVENT_CD[id];
/* long-lived races: adult event windows stretch across the whole lifespan */
function evAge(L) {
  const adult = Math.max(18, (RACE[L.race] || RACE.human).coming);
  if (L.age < adult) return L.age;
  const span = Math.max(52, (L.lifespan || 70) - adult);
  return 18 + (L.age - adult) * 52 / span;
}
function ageLo(L, ages) { return ages[0] >= 18 ? evAge(L) : L.age; }
function ageHi(L, ages) { return ages[1] >= 18 ? evAge(L) : L.age; }
function inAges(L, ages) { return ageLo(L, ages) >= ages[0] && ageHi(L, ages) <= ages[1]; }
function effLifespan(L) { return Math.round((L.lifespan || 70) * (1 + 0.05 * Math.max(0, bestRankAll(L) - 3) + 0.02 * (L.aura ? L.aura.stage : 0))); }
function eventWeight(L, e) {
  if (e.milestone || e.isArc) return 0;
  if (!inAges(L, e.ages)) return 0;
  if (e.once && L.flags['ev_' + e.id]) return 0;
  if (e.cd && L.flags['cd_' + e.id] !== undefined && L.age - L.flags['cd_' + e.id] < e.cd) return 0;
  let w = e.w;
  if (e.wkey) w *= evtMul(L, e.wkey);
  if (e.wfn) w *= e.wfn(L);
  if (w <= 0) return 0;
  try { if (!e.cond(L)) return 0; } catch (err) { return 0; }
  return w;
}
function fireEvent(L, e, forced) {
  let out;
  try { out = e.fire(L); } catch (err) { console.error('event', e.id, err); return false; }
  if (!out) return false;
  L.flags['ev_' + e.id] = 1; if (e.cd) L.flags['cd_' + e.id] = L.age;
  const fresh = discoverL(L, 'ev', e.id);
  if (typeof out === 'string') { log(L, out, 'event', titleCase(e.title)); return true; }
  if (fresh) out.fresh = 1;
  out.id = e.id; out.icon = out.icon || e.icon; out.title = titleCase(out.title || e.title);
  if (e.arc) { out.arc = e.arc; out.ch = e.ch; }
  out.kind = out.kind || e.kind || (e.milestone ? 'Milestone' : 'Event');
  L.queue.push(out);
  return true;
}
/* ---------- STORY ARCS ---------- */
const ARC_EVS = EVENTS.filter(e => e.isArc);
function arcNext(L, a) {
  const s = (L.arc && L.arc[a.id]) || 0;
  if (s < 0 || s >= 99) return null;
  return ARC_EVS.find(e => e.arc === a.id && e.ch === s + 1) || null;
}
function runArcs(L) {
  if (!L.arc) L.arc = {}; if (!L.arcYear) L.arcYear = {};
  const ready = [];
  for (const a of ARCS) {
    let e = arcNext(L, a), guard = 0;
    while (e && e.skip && guard++ < 4) { let sk = false; try { sk = e.skip(L); } catch (x) {} if (!sk) break; L.arc[a.id] = e.ch; e = arcNext(L, a); }
    if (!e) continue;
    const s = L.arc[a.id] || 0;
    if (s > 0 && ageHi(L, e.ages) > e.ages[1]) { L.arc[a.id] = -1; log(L, `${a.name}: that chapter of your life closes, unfinished.`, 'quiet'); continue; }
    if (L.arcYear[a.id] === L.age || !inAges(L, e.ages)) continue;
    let ok = false; try { ok = e.cond(L); } catch (x) { ok = false; }
    if (ok) ready.push({ e, started: s > 0 ? 1 : 0 });
  }
  if (!ready.length) return false;
  ready.sort((x, y) => y.started - x.started);
  return fireEvent(L, ready[0].e);
}
function arcStatus(L, a) {
  const s = (L.arc && L.arc[a.id]) || 0;
  return { stage: s, done: s >= 99, closed: s < 0, next: s >= 0 && s < 99 ? a.chapters[s] : null };
}

function resolveCard(L, key) {
  const c = L.queue[0]; if (!c) return null;
  const ch = (c.choices || []).find(x => x.k === key);
  if (!ch || ch.disabled) return null;
  const e = EVT[c.id];
  L.queue.shift();
  let res = '';
  L._buf = [];
  try { res = (c.data && c.data.pick && e.resolve2) ? e.resolve2(L, key, c.data) : (e.resolve ? e.resolve(L, key, c.data || {}) : ''); }
  catch (err) { console.error('resolve', c.id, err); res = ''; }
  const buf = L._buf; delete L._buf;
  let text = res, next = null;
  if (res && typeof res === 'object') { text = res.text; next = res.next; }
  if (text) log(L, text, 'event', titleCase(c.title));
  for (const en of buf) L.log.push(en);
  if (L.log.length > 260) L.log.splice(0, L.log.length - 260);
  if (next) { next.id = c.id; next.title = titleCase(next.title || c.title); next.arc = c.arc; next.ch = c.ch; next.kind = c.kind; L.queue.unshift(next); }
  return { text, title: c.title, next: !!next };
}

/* ---------- YEAR END ---------- */
function yearEnd(L) {
  const M = mods(L);
  const notes = [];
  // job
  if (L.job) {
    const j = JOB[L.job.id]; const pay = salary(L); money(L, pay); L.job.yrs++;
    L.job.perf = clamp(L.job.perf + R.i(-12, 6), 0, 100); jobXp(L, j, 30); fame(L, j.fame);
    if (j.risk && R.chance(j.risk)) { const d = hurt(L, R.i(8, 20), 'an accident at work'); notes.push(`You are hurt on the job (−${d} health).`); }
    if (L.job.perf < 15 && R.chance(.5)) { notes.push(`You are fired from your job as ${j.ladder[L.job.lvl]}.`); L.job = null; stress(L, 12); }
  }
  // school
  if (L.edu.school) {
    const s = SCHOOL[L.edu.school];
    const cost = L.edu.free ? 0 : s.cost;
    const payer = L.age < 15 ? 'family' : 'self';
    if (payer === 'family' ? L.family.funds < cost : L.gold < cost) { notes.push(`You can no longer afford ${s.name} and have to leave.`); L.edu.school = null; }
    else {
      if (payer === 'family') L.family.funds -= cost; else money(L, -cost);
      for (const k in s.xp) {
        const v = s.xp[k];
        if (k === 'study') { L.read = clamp(L.read + v * 0.35 * xpMult(L, 'study'), 0, 100); grow(L, 'int', v / 60 * xpMult(L, 'study')); }
        else if (k === 'social') grow(L, 'cha', v / 40);
        else if (k === 'body') { grow(L, 'str', v / 50); grow(L, 'agi', v / 50); }
        else if (k === 'craft') L.craft = (L.craft || 0) + v;
        else if (k === 'work') grow(L, 'int', v / 80);
        else addSkillXp(L, k === 'magic' ? (L.edu.focus || bestElement(L)) : k, v, false);
      }
      L.edu.yrs++;
      if (s.years && L.edu.yrs >= s.years) {
        L.edu.done.push(s.id); notes.push(`You graduate from ${s.name}!`); L.edu.school = null; mile(L, 'grad', `Graduated from ${s.name}`);
        unlock(L, 'graduate');
        if (s.id === 'ranoa') { earn(L, 'ranoa_grad'); unlock(L, 'ranoa_grad'); fame(L, 15); }
        if (s.id === 'military') fame(L, 5);
      } else if (L.age + 1 > s.age[1]) { notes.push(`You age out of ${s.name}.`); L.edu.done.push(s.id); L.edu.school = null; }
    }
  }
  // tutors upkeep
  for (const p of L.people.filter(p => p.alive && p.role === 'mentor' && p.tutor)) {
    if (L.age >= 14) { p.role = 'friend'; p.tutor = false; p.wasTutor = true; notes.push(`${p.name}’s tutoring ends. You part as friends.`); continue; }
    if (L.family.funds >= 40) L.family.funds -= 40; else { p.role = 'friend'; p.tutor = false; p.wasTutor = true; notes.push(`Your family can’t keep paying ${p.name}, who leaves with a sad wave.`); }
  }
  // legacy stipends
  if ((M.stipend || 0) > 0 && L.age >= 15) { money(L, M.stipend); notes.push(`Your stipend arrives: ${fmt(M.stipend)} gold.`); }
  // family funds
  L.family.funds = Math.max(0, L.family.funds + [6, 25, 80, 300, 1500, 9000][L.family.wealth] * (L.people.some(p => p.alive && !p.lost && ['mother','father'].includes(p.role)) ? 1 : 0.3));
  // body & mind
  stress(L, -8 - ({ room: 1, cottage: 3, townhouse: 5, manor: 8 }[L.gear && L.gear.home] || 0));
  if (L.stress >= 85) { const d = hurt(L, 8, 'exhaustion'); notes.push(`Stress is wearing you down (−${d} health). Rest helps.`); }
  heal(L, 4 + (M.regen || 0));
  if (M.overflow && !L.mana.casted && L.age >= 3) { const d = hurt(L, 10, 'mana sickness'); notes.push(`Unused mana sours in your veins (−${d} health).`); }
  if (L.injuries.length && R.chance(0.05 * (1 + (M.recover || 0)) + (rankOf(L, 'heal') >= 4 ? 0.3 : 0))) { const inj = L.injuries.shift(); notes.push(`Your ${inj.replace(/^a |^an |^two /, '')} finally heals.`); }
  L.mana.casted = false;
  // guild
  if (L.guild.reg) while (L.guild.rank < 6 && L.guild.pts >= GUILD_PTS[L.guild.rank + 1] && power(L) >= QUEST_DANGER[L.guild.rank + 1] * 0.75) {
    L.guild.rank++; fame(L, [0, 1, 3, 6, 12, 25, 60][L.guild.rank]); notes.push(`The guild promotes you to ${GUILD_RANKS[L.guild.rank]} rank.`);
    if (L.guild.rank === 6) unlock(L, 'guild_s');
  }
  for (const h of YEAR_HOOKS) { try { h(L, notes); } catch (err) { console.error('year hook', err); } }
  if (L.vow === 'poverty' && L.gold > 300) { const g = Math.round(L.gold - 300); L.gold = 300; fame(L, Math.min(30, g / 150)); L.given = (L.given || 0) + g; notes.push(`True to your vow, you give ${fmt(g)} gold to people who need it more.`); }
  if (L.vow === 'humility' && L.fame > 59) L.fame = 59;
  if (L.vow && L.age >= 59) unlock(L, 'vow_kept');
  notes.forEach(n => log(L, n));
}

/* ---------- NPCs ---------- */
function ageNPCs(L) {
  for (const p of L.people) {
    if (!p.alive) continue;
    p.age++;
    if (!p.canon && (p.age === 13 || p.age === 18 || p.age === 60)) p.bio = genBio(p);
    const rc = RACE[p.race] || RACE.human;
    let dp = p.age > rc.life[0] ? 0.08 + (p.age - rc.life[0]) / (rc.life[1] - rc.life[0] + 1) * 0.35 : (p.age > 45 ? 0.004 : 0.001);
    if (p.canon) dp *= 0.2;
    if (R.chance(dp)) {
      p.alive = false; p.diedAt = L.age;
      const close = ['mother','father','spouse','partner','child','twin','sibling','guardian','mentor'].includes(p.role) || p.op >= 50;
      log(L, `${p.name} ${p.sur || ''} dies at ${p.age}.`.replace('  ', ' '), close ? 'bad' : '');
      if (close) stress(L, (p.role === 'spouse' || p.role === 'child' ? 35 : 22) * (1 + pct(L, 'grief')));
      if (['mother','father'].includes(p.role) && L.age >= 15) {
        const heirs = 1 + L.people.filter(s => s.alive && ['sibling','twin'].includes(s.role)).length;
        const living = L.people.filter(x => x.alive && ['mother','father'].includes(x.role)).length;
        const share = Math.round(L.family.funds * (living ? 0.5 : 1) / heirs);
        if (share > 0) { money(L, share); L.family.funds -= share; log(L, `You inherit ${fmt(share)} gold.`, 'good'); }
      }
      if (p.id === L.partner) L.partner = null;
      if (p.id === L.spouse) L.spouse = null;
    }
  }
  if (L.flags.pregnant && L.age >= L.flags.pregnant.due) {
    const other = person(L, L.flags.pregnant.with);
    L.flags.pregnant = 0;
    if (other) addChild(L, other, false);
  }
  if (L.people.length > 60) { L.people = L.people.filter(p => p.alive || ['mother','father','spouse','child'].includes(p.role)).slice(-60); }
}
function naturalGrowth(L) {
  const M = mods(L); const rc = RACE[L.race];
  const adultAge = Math.min(18, rc.coming + 3);
  if (L.age <= adultAge) {
    for (const s of ['str','agi','int']) L.st[s] += rnd(0.3, 0.6) * (s === 'int' ? 1 : 1);
    L.st.cha += rnd(0.1, 0.35);
  }
  const lifeFrac = L.age / Math.max(40, effLifespan(L));
  if (lifeFrac > 0.62 && !M.ageless && !(L.cheats && L.cheats.noOld)) { L.st.str = Math.max(0, L.st.str - 0.25); L.st.agi = Math.max(0, L.st.agi - 0.25); L.st.looks = Math.max(0, L.st.looks - 0.08); }
  for (const s in L.st) L.st[s] = Math.round(L.st[s] * 100) / 100;
}

/* ---------- AGE UP ---------- */
function ageUp(L) {
  if (!L.alive) return { dead: true };
  if (L.queue.length) return { blocked: true };
  try { milestones(L); } catch (err) { console.error('milestones', err); }
  yearEnd(L);
  L.age++; L.year++; META.world.year = Math.max(META.world.year, L.year);
  naturalGrowth(L);
  ageNPCs(L);
  try { npcNews(L); worldTick(L); } catch (err) { console.error('world', err); }
  if (!L.epithet && L.fame >= 60 && L.age >= 12) giveEpithet(L);
  discoverL(L, 'town', L.town);
  // achievements by state
  if (L.gold >= 10000) unlock(L, 'rich'); if (L.gold >= 1000000) unlock(L, 'tycoon');
  if (fameTier(L.fame) >= 4) unlock(L, 'famous'); if (fameTier(L.fame) >= 5) unlock(L, 'legend');
  if (L.age >= 100) unlock(L, 'centenarian'); if (L.age >= 1000) unlock(L, 'millennium');
  // milestones
  for (const e of EVENTS) if (e.milestone && !L.flags['ev_' + e.id] && L.age >= e.ages[0] && L.age <= e.ages[1]) { let ok = false; try { ok = e.cond(L); } catch (x) {} if (ok) fireEvent(L, e); }
  // story arcs: at most one chapter a year
  const arcFired = runArcs(L);
  // random events: one or two a year, and a quiet year gets a second chance at a story
  const evf = (L.cheats && L.cheats.evf) || 'normal';
  let n = arcFired ? (R.chance(.6) ? 1 : 0) : 1 + (R.chance(.5) ? 1 : 0);
  if (evf === 'more') n += 1; else if (evf === 'max') n = 3; else if (evf === 'quiet') n = 0;
  const pickEv = () => { const pool = EVENTS.map(e => ({ e, w: eventWeight(L, e) })).filter(x => x.w > 0); const pk = R.w(pool, x => x.w); if (pk) fireEvent(L, pk.e); };
  for (let k = 0; k < n; k++) pickEv();
  if (!L.queue.length && evf !== 'quiet' && R.chance(.45)) pickEv();
  if (!L.queue.length && R.chance(.25)) log(L, quietYear(L), 'quiet');
  checkGoals(L);
  // death
  const dead = deathCheck(L);
  recordHist(L, dead);
  resetPoints(L);
  refreshBoards(L);
  return { dead };
}
function quietYear(L) {
  if (L.age < 6) return R.pick(['You spend the year growing like a weed.', 'A quiet year of naps, meals, and endless questions.', 'You learn the names of every bird in the yard.']);
  if (L.age < 15) return R.pick(['A quiet year. You grow taller.', 'Nothing much happens, and that is fine.', 'You spend long summer days by the river.']);
  return R.pick(['The year passes quietly.', 'A steady, ordinary year.', 'The seasons turn without much fuss.']);
}
function deathCheck(L) {
  const M = mods(L);
  if (L.god || M.noDeath) { if (L.hp <= 0) L.hp = 1; return false; }
  let dying = L.hp <= 0;
  const span = effLifespan(L);
  if (!dying && L.age >= span - 8 && !(L.cheats && L.cheats.noOld)) {
    const p = L.age >= span + 12 ? 1 : clamp(0.04 + (L.age - (span - 8)) * 0.045, 0, 0.95);
    if (R.chance(p)) { dying = true; L.deathCause = L.deathCause || 'old age'; }
  }
  if (!dying) { L.deathCause = ''; return false; }
  if (M.revive && !L.revived) {
    L.revived = true; L.hp = Math.round(maxHp(L) * 0.6); L.deathCause = '';
    const phx = L.traits.includes('phoenix_soul') || L.earned.includes('phoenix_soul');
    log(L, phx ? 'Your heart stops. Then golden fire races through you, and you breathe again. Your Phoenix Soul has spent its one rebirth.' : 'Your heart stops. Somewhere very far away, something old and kind refuses to let you go, and you breathe again. Your guardian spirit has spent its one gift.', 'big');
    if (phx) unlock(L, 'phoenix'); return false;
  }
  L.alive = false;
  log(L, `You die at age ${L.age}${L.deathCause ? ', ' + L.deathCause : ''}.`, 'big');
  return true;
}
function endLife(L, cause) { L.alive = false; L.deathCause = cause || 'chose to end the journey'; log(L, `Your story ends at age ${L.age}.`, 'big'); }

/* ---------- LEGACY ---------- */
function lifeScore(L) {
  const M = mods(L);
  const rows = [];
  rows.push(['Years lived', Math.min(L.age, 150)]);
  const br = bestRankAll(L); const rb = [0, 0, 0, 5, 20, 50, 120, 300][br]; if (rb) rows.push([`Highest rank: ${RANKS[br]}`, rb]);
  const mg = Math.min(200, Math.floor(L.gold / 500)); if (mg) rows.push(['Wealth', mg]);
  const ft = fameTier(L.fame) * 30; if (ft) rows.push([`Fame: ${FAME_NAMES[fameTier(L.fame)]}`, ft]);
  const kids = L.people.filter(p => p.role === 'child').length * 10; if (kids) rows.push(['Children', kids]);
  const ach = L.achLife.length * 15; if (ach) rows.push(['Achievements', ach]);
  const er = L.earned.length * 10; if (er) rows.push(['Earned traits', er]);
  if (L.guild.rank >= 3) rows.push([`Guild rank ${GUILD_RANKS[L.guild.rank]}`, L.guild.rank * 8]);
  const wk = Object.keys(L.works || {}).reduce((a, id) => a + ((WORK[id] || {}).lp || 0), 0); if (wk) rows.push([`Works of patronage (${Object.keys(L.works).length})`, wk]);
  const base = rows.reduce((a, r) => a + r[1], 0);
  const mult = 1 + (M.lp || 0) + (L.vow && VOW[L.vow] ? VOW[L.vow].lp : 0);
  return { rows, base, mult, total: Math.round(base * mult) };
}
function deathPhrase(c) {
  if (!c || c === 'old age') return 'Died of old age';
  if (/^(killed|struck|assassinated|slain|lost|taken)/i.test(c)) return cap1(c);
  if (/^(a|an|the) /i.test(c)) return 'Fell to ' + c;
  return 'Died of ' + c;
}
function finalizeLife(L) {
  if (L.finalized) return L.final;
  try { milestones(L); mile(L, 'death', deathPhrase(L.deathCause)); } catch (err) { console.error('milestones', err); }
  const sc = lifeScore(L);
  META.lp += sc.total; META.lives++;
  if (META.lives >= 10) unlock(L, 'ten_lives');
  if (L.gen >= 5) unlock(L, 'dynasty');
  const hi = (L.mile || []).filter(m => ['love', 'rank', 'arc', 'epithet', 'work', 'child'].includes(m.k)).slice(-4).map(m => m.t);
  META.hall.unshift({ id: L.id, lin: L.lineage, hi, name: L.name, sur: L.sur, epithet: L.epithet, age: L.age, race: L.race, bg: L.bg, cause: L.deathCause || 'old age', best: bestRankAll(L), bestSkill: bestSkillName(L),
    fame: Math.round(L.fame), lp: sc.total, gen: L.gen, traits: L.traits.slice(), earned: L.earned.slice(), year: L.year, look: L.look, sex: L.sex, looks: Math.round(L.st.looks), scars: (L.scars || []).slice(0, 3) });
  if (META.hall.length > 60) META.hall.length = 60;
  META.world.families[L.sur] = (META.world.families[L.sur] || 0) + Math.round(L.fame);
  if (L.fame >= 400) META.world.legends.unshift({ name: L.name + ' ' + L.sur, epithet: L.epithet, year: L.year });
  META.lastBorn = L.traits.slice();
  META.world.year = Math.max(META.world.year, L.year) + R.i(1, 6);
  L.finalized = true; L.final = sc;
  return sc;
}
function buildHeir(L, cid) {
  const c = person(L, cid);
  const d = { name: c.name, sur: L.sur, sex: c.sex, race: c.race, bg: L.bg, town: L.town, look: c.look || randLook(c.race, c.sex), season: R.pick(SEASONS).id, omen: 'clear', order: 'first', parents: [], traits: (c.traits || []).slice(0, 3), sources: {}, bonus: {} };
  d.traits.forEach(t => d.sources[t] = 'inherited');
  const H = buildLife(d, L);
  if (c.looks != null) H.st.looks = Math.max(0, Math.round(c.looks + ((RACE[c.race] || RACE.human).st.looks || 0) * .5));
  if (c.scars) H.scars = c.scars.slice();
  H.log = [];
  const yrs = c.age;
  for (let k = 0; k < yrs; k++) { H.age++; naturalGrowth(H); }
  H.year = L.year;
  H.people = [];
  npc(H, { role: L.sex === 'f' ? 'mother' : 'father', name: L.name, sur: L.sur, sex: L.sex, race: L.race, age: L.age, alive: false, op: 70, look: L.look, looks: Math.round(L.st.looks), scars: (L.scars || []).slice(), traits: L.traits, job: L.job ? JOB[L.job.id].ladder[L.job.lvl] : '' });
  const sp = L.spouse && person(L, L.spouse);
  if (sp && sp.alive) npc(H, { role: sp.sex === 'f' ? 'mother' : 'father', name: sp.name, sur: sp.sur, sex: sp.sex, race: sp.race, age: sp.age, op: sp.op, look: sp.look, looks: sp.looks, traits: sp.traits, skill: sp.skill });
  L.people.filter(p => p.role === 'child' && p.id !== cid).forEach(p => npc(H, { role: 'sibling', name: p.name, sur: p.sur, sex: p.sex, race: p.race, age: p.age, alive: p.alive, op: p.op, look: p.look, looks: p.looks, traits: p.traits }));
  const estate = Math.round(L.gold * (META.upg.estate_keeper ? 1 : 0.85));
  if (H.age >= 15) money(H, estate); else H.family.funds += estate;
  H.family.wealth = L.gold > 20000 ? 5 : L.gold > 3000 ? 4 : L.gold > 600 ? 3 : L.gold > 150 ? 2 : L.gold > 30 ? 1 : 0;
  H.family.cls = Math.max(L.family.cls, L.fame >= 400 ? 2 : 0);
  H.fame = L.fame * (META.upg.storied_name ? 0.40 : 0.15);
  if (L.flags.legacyTech && (L.magic[L.flags.legacyTech] || L.sword[L.flags.legacyTech])) {
    const k = L.flags.legacyTech, gain = Math.round(((STYLE[k] ? L.sword[k] : L.magic[k]) || 0) * 0.10);
    if (gain > 0) { if (STYLE[k]) { if (!H.sword.styleChosen && H.age >= styleAge()) chooseStyle(H, k); H.sword[k] = (H.sword[k] || 0) + gain; } else H.magic[k] = (H.magic[k] || 0) + gain; autoRank(H, k, true); H._teach2 = `The last lesson lives on in you: +${fmt(gain)} ${STYLE[k] ? STYLE[k].name : MAGIC_ID[k].name + ' magic'} XP.`; }
  }
  if (META.upg.family_teachings) {
    let best = null, bv = 0;
    for (const m of MAGIC) { const v = L.magic[m.id] || 0; if (v > bv) { bv = v; best = m.id; } }
    for (const st of STYLES) { const v = L.sword[st.id] || 0; if (v > bv) { bv = v; best = st.id; } }
    if (best && bv > 0) {
      const gain = Math.round(bv * 0.15);
      if (STYLE[best]) { if (!H.sword.styleChosen && H.age >= styleAge()) chooseStyle(H, best); H.sword[best] = (H.sword[best] || 0) + gain; } else H.magic[best] = (H.magic[best] || 0) + gain;
      autoRank(H, best, true);
      H._teach = `Your parent’s lessons live in your hands: +${fmt(gain)} ${STYLE[best] ? STYLE[best].name : MAGIC_ID[best].name + ' magic'} XP.`;
    }
  }
  H.visited = [CONT_OF(H.town)];
  log(H, `You carry on as ${c.name}, ${c.sex === 'f' ? 'daughter' : 'son'} of ${L.name}${L.epithet ? ' “' + L.epithet + '”' : ''}. ${estate ? 'The estate passes to you: ' + fmt(estate) + ' gold.' : ''}`, 'big');
  for (const id of H.traits) log(H, `Born with ${TRAIT[id].name} (${TIERS[TIER_IDX[TRAIT[id].tier]].name}).`, 'trait');
  recordHist(H, true);
  mile(H, 'birth', `Carried the ${L.sur} name forward after ${L.name}’s death`);
  if (H._teach) { log(H, H._teach, 'good'); delete H._teach; }
  if (H._teach2) { log(H, H._teach2, 'good'); delete H._teach2; }
  unlock(H, 'heir');
  resetPoints(H); refreshBoards(H);
  return H;
}
