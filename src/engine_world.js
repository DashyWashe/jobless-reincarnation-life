/* ===================== A LIVING WORLD: letters from the people you know, and word from afar ===================== */
const shuffled = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const adultOf = (p) => Math.max(18, (RACE[p.race] || RACE.human).coming);
const lifeOf = (p) => (RACE[p.race] || RACE.human).life[0];
const kidWord = (p) => p.sex === 'f' ? 'daughter' : 'son';
function whoIs(L, p) {
  const nm = p.name;
  switch (p.role) {
    case 'mother': return `your mother ${nm}`;
    case 'father': return `your father ${nm}`;
    case 'guardian': return `your guardian ${nm}`;
    case 'spouse': return `your ${p.sex === 'f' ? 'wife' : 'husband'} ${nm}`;
    case 'partner': return `your partner ${nm}`;
    case 'sibling': return `your ${p.sex === 'f' ? 'sister' : 'brother'} ${nm}`;
    case 'twin': return `your twin ${nm}`;
    case 'child': return `your ${kidWord(p)} ${nm}`;
    case 'grandchild': return `your grand${kidWord(p)} ${nm}`;
    case 'descendant': return `${nm}, one of your descendants`;
    case 'mentor': return `your old teacher ${nm}`;
    case 'student': return `your student ${nm}`;
    case 'rival': return `your rival ${nm}`;
    case 'party': return `${nm}, from your old party`;
    case 'friend': return `your friend ${nm}`;
    default: return nm;
  }
}
const SPOUSE_KIND = ['a blacksmith', 'a merchant', 'a guard captain', 'a baker', 'an innkeeper', 'a scribe', 'a sailor', 'a farmer', 'a healer', 'an adventurer', 'a carpenter', 'a minor noble', 'a hunter', 'a schoolteacher', 'a mage from Ranoa', 'a musician'];
const WED_DETAIL = ['It rained all day and nobody minded.', 'Half the guild came, and the tavern ran out of ale by noon.', 'They danced until the musicians gave up.', 'The cake collapsed. They ate it anyway.', 'The vows were short. The speeches were not.', 'There is a drawing of the ceremony in the letter. It is not a good drawing.'];
const NEW_JOBS = [['Master of a small trading house', 'master of a small trading house'], ['Captain of the town watch', 'captain of the town watch'], ['Head cook at a famous inn', 'head cook at a famous inn'], ['Bookshop owner', 'the owner of a bookshop'], ['Guild clerk', 'a clerk at the Adventurer Guild'], ['Royal courier', 'a royal courier'], ['Master carpenter', 'a master carpenter'], ['Temple healer', 'a healer at a temple'], ['Caravan leader', 'a caravan leader'], ['Village schoolteacher', 'a teacher at a village school'], ['Shipwright', 'a shipwright'], ['Steward of a noble house', 'steward of a noble house']];
const BABY_DETAIL = ['They swear the baby already has your stubborn chin, somehow.', 'The baby screams at everyone except the family cat.', 'They want you to visit before the baby learns to walk.', 'There is a tiny handprint in ink at the bottom of the page.'];
const ADVENTURE = ['cleared a nest of wyverns from a mountain pass', 'escorted a caravan across the Begaritt desert', 'mapped a new floor of a Rapan labyrinth', 'drove a pack of terror wolves away from a farming town', 'recovered a stolen relic for the church of Millis'];

/* one possible update for one person, or null */
function newsFor(L, p) {
  const ad = adultOf(p), opts = [];
  const famCore = ['mother', 'father', 'guardian'].includes(p.role);
  if (!famCore && p.role !== 'ex' && !p.wed && p.age >= ad + 2 && p.age <= Math.min(80, lifeOf(p) * .6)) opts.push(['wed', 3]);
  if (p.wed && p.role !== 'child' && p.age >= ad && p.age <= Math.min(46, lifeOf(p) * .5) && (p.kids || 0) < 4 && L.age - (p.lastKid ?? -99) >= 2) opts.push(['baby', 3]);
  if (p.skill && p.skill.r >= 1 && p.skill.r < 6 && p.age >= 14) opts.push(['rank', 2]);
  if (!famCore && p.age >= 18 && p.age <= 65 && p.role !== 'student') opts.push(['job', 1.6]);
  if (['friend', 'other', 'rival', 'party', 'student'].includes(p.role) && !p.away && p.age >= 16) opts.push(['move', .8]);
  if (p.away) opts.push(['home', 1.8]);
  if (p.skill && ['party', 'friend', 'rival'].includes(p.role) && p.age >= 16 && p.age <= 70) opts.push(['adventure', 1.2]);
  if (p.age >= 55 && p.age < lifeOf(p) * 1.1) opts.push(['ill', .6]);
  const pick = R.w(opts, o => o[1]); if (!pick) return null;
  const who = whoIs(L, p), Who = cap1(who), they = heShe(p), They = cap1(they), their = hisHer(p);
  let act = '', tail = '', short = '';
  switch (pick[0]) {
    case 'wed': { const sp = R.pick(SPOUSE_KIND); p.wed = { a: L.age, w: sp }; act = `married ${sp}`; short = `Married ${sp}`; tail = R.pick(WED_DETAIL); break; }
    case 'baby': { p.kids = (p.kids || 0) + 1; p.lastKid = L.age; const d = R.chance(.5) ? 'daughter' : 'son'; const au = L.sex === 'f' ? 'aunt' : 'uncle';
      act = `had a ${d}`; short = `Had a ${d}`; tail = `${p.role === 'sibling' || p.role === 'twin' ? `You are an ${au}${p.kids > 1 ? ' again' : ' for the first time'}. ` : ''}${R.pick(BABY_DETAIL)}`; break; }
    case 'rank': { p.skill.r++; const nm = STYLE[p.skill.k] ? STYLE[p.skill.k].name : MAGIC_ID[p.skill.k] ? MAGIC_ID[p.skill.k].name + ' magic' : 'their art';
      act = `passed the ${RANKS[p.skill.r]} trial in ${nm}`; short = `Reached ${RANKS[p.skill.r]} in ${nm}`; tail = p.mem && p.mem.length ? `${They} says the years with you helped.` : ''; break; }
    case 'job': { const j = R.pick(NEW_JOBS.filter(x => x[0] !== p.job)); p.job = j[0]; act = `is now ${j[1]}`; short = `Became ${j[1]}`; tail = R.pick([`${They} sounds proud and tired.`, `${They} promises to visit when things settle down.`, 'Most of the letter is about paperwork.']); break; }
    case 'move': { const t = R.pick(TOWNS.filter(x => x.id !== L.town)); p.away = t.id; act = `has moved to ${t.name}, on the ${CONT[t.cont].name}`; short = `Moved to ${t.name}`; tail = R.pick(['The food there takes getting used to.', 'The weather there takes getting used to.', 'The people there take some getting used to.', 'The beer there is an acquired taste.']); break; }
    case 'home': { const from = TOWN[p.away]; p.away = null; act = `is coming home${from ? ` from ${from.name}` : ''}`; short = `Came home${from ? ` from ${from.name}` : ''}`; tail = 'Expect stories, and a terrible new hat.'; break; }
    case 'adventure': { p.power = (p.power || 10) + 4; const a = R.pick(ADVENTURE); act = `and ${their} companions ${a}`; short = cap1(a); tail = 'The story will grow a little every time you hear it.'; break; }
    case 'ill': act = 'has been ill this winter but is on the mend'; short = 'Fell ill, then recovered'; tail = `${They} asks you not to worry, which means you should.`; break;
  }
  if (!act) return null;
  const letter = p.role !== 'rival';
  const t = letter ? `${They} writes that ${they} ${act}. ${tail}` : `${Who} ${act}. ${tail}`;
  return { k: pick[0], s: short, t: t.trim(), h: letter ? `A letter from ${who}` : `News of ${p.name}` };
}
/* each year a letter or two arrives from the people who matter to you */
function npcNews(L) {
  if (L.age < 8) return;
  const close = L.people.filter(p => p.alive && !p.lost && !p.canon && p.id !== L.spouse && p.id !== L.partner && (p.op >= 25 || ['sibling', 'twin', 'child', 'grandchild', 'mentor', 'student', 'party', 'rival'].includes(p.role)));
  let sent = 0; const cap = close.length >= 8 ? 2 : 1;
  for (const p of shuffled(close)) {
    if (sent >= cap) break;
    if (!R.chance(p.role === 'rival' ? .03 : .055)) continue;
    const n = newsFor(L, p); if (!n) continue;
    sent++;
    (p.news || (p.news = [])).push({ a: L.age, t: n.s });
    if (p.news.length > 8) p.news.shift();
    log(L, n.t, 'letter', n.h);
    if ((n.k === 'wed' || n.k === 'baby') && p.op >= 45 && !L.flags.invite) L.flags.invite = { k: n.k, pid: p.id, a: L.age };
  }
}

/* ---------- word from afar: world headlines, some of which change the world for a few years ---------- */
const WORLD_NEWS = [
  { id: 'harvest', w: 1, dur: 2, fx: { income: .10 }, eff: 'Wages +10%', t: 'A bumper harvest across the Central Continent. Markets overflow and every employer is hiring.' },
  { id: 'war', w: .9, dur: 3, fx: { questGold: .25, injury: .10 }, eff: 'Guild rewards +25% · Injuries +10%', t: 'War flares again in the Conflict Zone. The guilds pay well for anyone who can hold a blade.' },
  { id: 'comet', w: .7, dur: 1, fx: { xp: { magic: .12 } }, eff: 'Magic XP +12%', t: 'A blue comet crosses the night sky for a month. Mages everywhere swear their spells come easier.' },
  { id: 'tourney', w: .8, dur: 1, fx: { xp: { sword: .10 } }, eff: 'Sword XP +10%', t: 'The Sword Sanctum announces an open tournament. Every training yard in the world fills up overnight.' },
  { id: 'plague', w: .5, dur: 2, fx: { sick: .5, stress: .06 }, eff: 'Illness more likely · Stress taken +6%', t: 'A coughing sickness spreads along the trade roads. Healers are worked off their feet.' },
  { id: 'peace', w: .8, dur: 2, fx: { stress: -.10 }, eff: 'Stress taken −10%', t: 'The great kingdoms sign a peace that might even last. Festivals break out in every capital.' },
  { id: 'surge', w: .9, dur: 2, fx: { questGold: .20, loot: .15 }, eff: 'Guild rewards +20% · Loot +15%', t: 'Monster numbers surge across the continents. Adventurer Guilds raise every bounty.' },
  { id: 'famine', w: .5, dur: 2, fx: { income: -.10, stress: .05 }, eff: 'Wages −10% · Stress taken +5%', t: 'Blight ruins the wheat in the south. Bread doubles in price and tempers run short.' },
  { id: 'scholars', w: .7, dur: 2, fx: { xp: { study: .15 } }, eff: 'Study XP +15%', t: 'Ranoa University opens its libraries to the public for the first time in a century.' },
  { id: 'eclipse', w: .6, dur: 1, fx: { auraGrow: .10 }, eff: 'Battle Aura growth +10%', t: 'An eclipse leaves warriors restless. Old masters say Battle Aura burns brightest in such years.' },
  { id: 'sword_king', w: 1, t: 'A new Sword King was named in the north after a duel that lasted three days and ruined two courtyards.' },
  { id: 'demon_lords', w: 1, t: 'A Demon Lord woke from a long sleep on the Demon Continent and was promptly beaten by a different Demon Lord.' },
  { id: 'shirone_statue', w: .8, t: 'The King of Shirone unveiled a statue of himself. It is taller than the last one.' },
  { id: 'lost_fleet', w: .8, t: 'A merchant fleet vanished in the Ringus Sea. Sailors blame the Sea Folk; the Sea Folk blame the sailors.' },
  { id: 'saints_day', w: 1, t: 'Holy Knights parade through Millishion for the Saint’s Day. The whole city smells of incense for a week.' },
  { id: 'dragon_walk', w: .7, t: 'Travelers swear they saw the Dragon God crossing the Begaritt desert alone, on foot, in no hurry at all.' },
  { id: 'dwarf_bell', w: .7, t: 'Dwarven smiths in the north forged a bell so loud it cracked a mountainside. Or so the story goes.' },
  { id: 'twin_heirs', w: .7, t: 'The Beastfolk of the Great Forest celebrate twin heirs born to the Dedoldia clan.' },
  { id: 'new_labyrinth', w: .8, t: 'A new labyrinth opened beneath Rapan. Three parties went in. Two came out, both rich.' },
  { id: 'asura_ball', w: .8, t: 'Asura’s nobles held the grandest ball in a generation. Nobody can remember what it was for.' },
  { id: 'migurd_song', w: .5, t: 'A Migurd bard became famous in three kingdoms for songs no one else can hear. Audiences cry anyway.' },
  { id: 'legend_song', w: 2.2, cond: (L) => (META.world.legends || []).some(g => g.name !== `${L.name} ${L.sur}`), make: (L) => { const g = R.pick(META.world.legends.filter(x => x.name !== `${L.name} ${L.sur}`)); const kin = g.name.endsWith(' ' + L.sur); return `Bards in Ars still sing of ${g.name}${g.epithet ? `, “${g.epithet},”` : ''} who lived ${Math.max(1, L.year - g.year)} years ago.${kin ? ' They sing of your own family.' : ''} The songs get the details wrong, which is how you know they are popular.`; } },
  { id: 'family_name', w: 1.2, cond: (L) => (META.world.families[L.sur] || 0) >= 300 && L.gen >= 2, make: (L) => `In ${TOWN[L.town].name}, merchants still give a small discount to anyone named ${L.sur}. Your family’s name has outlived several of its owners.` },
  { id: 'laplace_peace', w: 1.5, cond: () => !!META.world.laplaceDone, make: () => 'Years after Laplace’s fall, ships from the Demon Continent dock openly in Millis. Children there have never known the war.' },
];
const WN = Object.fromEntries(WORLD_NEWS.map(n => [n.id, n]));
function activeWorld(L) { const y = L.year; return ((META.world || {}).mods || []).filter(m => m.from <= y && m.to >= y && WN[m.id] && WN[m.id].fx); }
function worldTick(L) {
  const W = META.world; if (!W.mods) W.mods = []; if (!W.news) W.news = []; if (!W.seen) W.seen = {};
  W.mods = W.mods.filter(m => m.to >= L.year - 1);
  if (L.age < 6 || !R.chance(.22)) return;
  const live = activeWorld(L).length;
  const pool = WORLD_NEWS.filter(n => (W.seen[n.id] == null || L.year - W.seen[n.id] >= 25) && (!n.fx || live < 2) && (!n.cond || n.cond(L)));
  const n = R.w(pool, x => x.w); if (!n) return;
  W.seen[n.id] = L.year;
  const text = n.make ? n.make(L) : n.t;
  if (n.fx) W.mods.push({ id: n.id, from: L.year, to: L.year + n.dur - 1 });
  W.news.unshift({ y: L.year, id: n.id, t: text }); if (W.news.length > 24) W.news.length = 24;
  log(L, text + (n.fx ? ` (${n.eff}, ${n.dur === 1 ? 'this year' : `for ${n.dur} years`}.)` : ''), 'world', 'Word from afar');
}

/* ---------- MEMORIES: the milestones of a life, gathered as they happen ---------- */
function mile(L, k, t, a) {
  if (!L.mile) L.mile = [];
  const age = a == null ? L.age : a;
  if (L.mile.some(m => m.t === t && m.a === age)) return;
  L.mile.push({ a: age, k, t });
  if (L.mile.length > 90) L.mile.splice(1, L.mile.length - 90);
}
const MS_CLOSE = ['mother', 'father', 'guardian', 'spouse', 'partner', 'child', 'twin', 'sibling', 'grandchild'];
const skillName = (k) => !k ? 'their craft' : STYLE[k] ? STYLE[k].name : MAGIC_ID[k] ? MAGIC_ID[k].name + ' magic' : k;
function bestRankKey(L) { let best = null, br = -1, bx = -1; for (const k of [...MAGIC.map(m => m.id), ...STYLES.map(s => s.id)]) { const r = rankOf(L, k), x = skillXp(L, k); if (r > br || (r === br && x > bx)) { br = r; bx = x; best = k; } } return best; }
const FAME_MILE = ['', '', 'Became famous across the region', 'Caught the attention of royalty', 'Became famous across the world', 'Became a living legend'];
/* compares this year with the last and records what changed; called before each birthday and at death */
function milestones(L) {
  const S = L._ms || (L._ms = { sp: L.spouse || null, best: bestRankAll(L), aura: L.aura.stage, arcs: ARCS.filter(a => L.arc[a.id] === 99).map(a => a.id), epi: L.epithet || '', works: Object.keys(L.works || {}), vis: (L.visited || []).slice(), job: !!L.job, guild: L.guild.rank, fame: fameTier(L.fame), grand: L.people.some(p => p.role === 'grandchild') });
  const age = L.age;
  if (L.spouse && L.spouse !== S.sp) { const p = person(L, L.spouse); if (p) mile(L, 'love', `Married ${p.name}${p.sur && p.sur !== L.sur ? ' ' + p.sur : ''}`); }
  for (const p of L.people) {
    if (p.role === 'child' && !p.mileB) { p.mileB = 1; mile(L, 'child', p.adopted ? `Welcomed ${p.name} into the family` : `${p.name} was born`, Math.max(0, age - p.age)); }
    if (!p.alive && !p.mileD && p.diedAt != null && (MS_CLOSE.includes(p.role) || p.op >= 75)) { p.mileD = 1; mile(L, 'loss', `Lost ${whoIs(L, p)}`, p.diedAt); }
  }
  const grand = L.people.some(p => p.role === 'grandchild');
  if (grand && !S.grand) mile(L, 'child', 'Became a grandparent');
  const best = bestRankAll(L);
  if (best > S.best) mile(L, 'rank', `Reached ${RANKS[best]} in ${skillName(bestRankKey(L))}`);
  if (L.aura.stage > S.aura && L.aura.stage >= 2) mile(L, 'aura', `Battle Aura: ${AURA_STAGES[L.aura.stage]}`);
  for (const a of ARCS) if (L.arc[a.id] === 99 && !S.arcs.includes(a.id)) mile(L, 'arc', `Lived the story of ${a.name}`, L.arcYear && L.arcYear[a.id] >= 0 ? L.arcYear[a.id] : age);
  if (L.epithet && L.epithet !== S.epi) mile(L, 'epithet', `Became known as “${L.epithet}”`);
  for (const w of Object.keys(L.works || {})) if (!S.works.includes(w) && WORK[w]) mile(L, 'work', `Funded ${workLc(WORK[w])}`, L.works[w]);
  for (const c of L.visited || []) if (!S.vis.includes(c) && CONT[c]) mile(L, 'travel', `First steps on the ${CONT[c].name}`);
  if (L.job && !S.job && !L.flags.firstJobMile) { L.flags.firstJobMile = 1; const j = JOB[L.job.id]; if (j) mile(L, 'job', `First job: ${j.ladder[L.job.lvl]}`); }
  if (L.guild.rank > S.guild && L.guild.rank >= 4) mile(L, 'guild', `Adventurer Guild rank ${GUILD_RANKS[L.guild.rank]}`);
  const ft = fameTier(L.fame); if (ft > S.fame && ft >= 2 && FAME_MILE[ft]) mile(L, 'fame', FAME_MILE[ft]);
  L._ms = { sp: L.spouse || null, best, aura: L.aura.stage, arcs: ARCS.filter(a => L.arc[a.id] === 99).map(a => a.id), epi: L.epithet || '', works: Object.keys(L.works || {}), vis: (L.visited || []).slice(), job: !!L.job, guild: L.guild.rank, fame: ft, grand };
}
