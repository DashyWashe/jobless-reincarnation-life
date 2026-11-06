const fs = require('fs');
const src = ['data_traits','data_world','data_lore','engine_core','engine_birth','engine_actions','events','events_arcs','events_more','events_ages','events_legacy','engine_world','engine_year'].map(f => fs.readFileSync(__dirname + '/../src/' + f + '.js', 'utf8')).join('\n');
eval(src + `
global.__api = { JOB, newDraft, buildLife, ageUp, resolveCard, actMana, actMagic, actSword, actAura, actBody, actStudy, actRest, actCraft, actHealPoor, trialInfo, actTrial, actSocial, SOCIAL, actMeet, actApply, jobReqs, actWorkHard, actPromo, promoInfo, actEnroll, schoolStatus, actHireTutor, tutorStatus, actRegister, guildStatus, actQuest, actTravel, travelInfo, finalizeLife, buildHeir, magicBlock, swordBlock, auraBlock, manaBlock, craftBlock, healBlock, spendAP, spendSP, power, META, EVENTS, fireEvent, chooseStyle, R, MAGIC, STYLES, SCHOOLS, TOWNS, bestRankAll, RANKS, mods, setMeta: (m)=>{META=m}, getMeta: ()=>META, ARCS, ACTIVITIES, actActivity, activityBlock, ITEMS, itemBlock, buyItem, checkGoals, GOALS, apFor, wellness, WORKS, workBlock, actFund, lifeScore, spendPlan, PLAN_OPTS };
`);
const A = global.__api;
let stats = { lives: 0, ages: [], ranks: {}, errors: 0, events: {}, earned: {}, deaths: {}, arcs: {}, goals: 0, apmax: {}, works: {}, vows: {} };
function opts_(L) {
  const opts = [];
  if (!A.manaBlock(L)) opts.push(() => A.actMana(L, Math.random() < .4));
  for (const m of A.MAGIC) if (!A.magicBlock(L, m.id)) opts.push(() => A.actMagic(L, m.id));
  if (!A.swordBlock(L, null)) opts.push(() => A.actSword(L, L.sword.styleChosen ? A.R.pick(['sg','wg','ng']) : null));
  if (!A.auraBlock(L)) opts.push(() => A.actAura(L));
  opts.push(() => A.actBody(L), () => A.actStudy(L), () => A.actRest(L));
  if (!A.craftBlock(L)) opts.push(() => A.actCraft(L));
  if (!A.healBlock(L)) opts.push(() => A.actHealPoor(L));
  for (const k of ['fire','water','sg','wg','ng']) { const t = A.trialInfo(L, k); if (t && t.ready && !t.reason) opts.push(() => A.actTrial(L, k)); }
  if (L.quests.length) opts.push(() => A.actQuest(L, L.quests[0].id));
  if (L.job) opts.push(() => A.actWorkHard(L), () => { const p = A.promoInfo(L); if (p && p.ok) A.actPromo(L); });
  if (L.age >= 16 && Math.random() < .05) opts.push(() => A.actTravel(L, A.R.pick(A.TOWNS).id));
  if (L.flags.displaced && Math.random() < .25) opts.push(() => A.actTravel(L, Math.random() < .5 ? 'zant' : L.flags.displaced));
  if ((L.arc.labyrinth || 0) >= 1 && L.town !== 'rapan' && Math.random() < .5) opts.push(() => A.actTravel(L, 'rapan'));
  for (const a of A.ACTIVITIES) if (!A.activityBlock(L, a.id) && Math.random() < .25) opts.push(() => A.actActivity(L, a.id));
  return opts;
}
function act(L) {
  if (L.plan && L.plan.length) { const r = A.spendPlan(L); stats.planActs = (stats.planActs || 0) + r.n; }
  if (L.age >= 18 && L.ap > 0 && Math.random() < .25) { const w = A.WORKS.find(w => !A.workBlock(L, w.id)); if (w) { A.spendAP(L); A.actFund(L, w.id); stats.works[w.id] = (stats.works[w.id] || 0) + 1; } }
  while (L.ap > 0 && L.alive) { const opts = opts_(L); A.spendAP(L); A.R.pick(opts)(); if (L.hp <= 0) break; }
  // non-AP actions
  if (!L.job && L.jobBoard.length) { const j = L.jobBoard.find(id => A.jobReqs(L, A.JOB[id]).every(x => x.ok)); if (j) A.actApply(L, j); }
  if (!L.edu.school) { const s = A.SCHOOLS.find(s => A.schoolStatus(L, s).ok); if (s && Math.random() < .5) A.actEnroll(L, s.id); }
  if (A.tutorStatus(L).ok && Math.random() < .3) A.actHireTutor(L, A.R.pick(['water','fire','sg']));
  if (A.guildStatus(L).ok) A.actRegister(L);
  if (Math.random() < .3) { const it = A.R.pick(A.ITEMS); if (!A.itemBlock(L, it.id)) A.buyItem(L, it.id); }
  while (L.sp > 0) {
    A.spendSP(L);
    if (Math.random() < .2) { A.actMeet(L, L.age >= 18 && Math.random() < .5 ? 'love' : (L.guild.reg ? 'adventurer' : 'friend')); continue; }
    const ps = L.people.filter(p => p.alive);
    if (!ps.length) continue;
    const p = A.R.pick(ps);
    const acts = A.SOCIAL.filter(s => s.cond(L, p));
    if (acts.length) { const s = A.R.pick(acts); const r = A.actSocial(L, p.id, s.id); if (s.id === 'intimate' || s.id === 'date' || s.id === 'propose') { if (L.age < 18 || p.age < 18) throw new Error('ROMANCE AGE VIOLATION ' + L.age + ' ' + p.age); } }
  }
}


for (let i = 0; i < 300; i++) {
  try {
    const d = A.newDraft(); if (Math.random() < .4) d.vow = A.R.pick(['poverty', 'humility', 'solitude', 'hermit']);
    let L = A.buildLife(d);
    if (Math.random() < .35) L.plan = [0, 1, 2].map(() => A.R.pick(A.PLAN_OPTS).id);
    let years = 0, gens = 0;
    const resolveAll = () => { let guard = 0; while (L.queue.length && guard++ < 10) { const c = L.queue[0]; const ch = c.choices.filter(x => !x.disabled); const r = A.resolveCard(L, (ch.length ? A.R.pick(ch) : c.choices[0]).k); if (!r) { L.queue.shift(); } stats.events[c.id] = (stats.events[c.id] || 0) + 1; } };
    while (years < 400) {
      resolveAll();
      act(L);
      // resolve events
      resolveAll();
      if (L.hp <= 0 || !L.alive) { /* death occurs in ageUp */ }
      const res = A.ageUp(L);
      years++;
      if (res.dead) {
        A.finalizeLife(L); stats.lives++; stats.scars = (stats.scars || 0) + (L.scars || []).length; stats.scarred = (stats.scarred || 0) + ((L.scars || []).length ? 1 : 0); stats.patch = (stats.patch || 0) + (L.flags.patchSide ? 1 : 0); stats.inherit = (stats.inherit || 0) + (L.lookFrom && Object.keys(L.lookFrom).length ? 1 : 0); stats.looksSum = (stats.looksSum || 0) + L.st.looks; stats.kidsLooked = (stats.kidsLooked || 0) + L.people.filter(p => p.role === 'child' && p.looks != null).length; stats.letters = (stats.letters || 0) + L.log.filter(e => e.k === 'letter').length; stats.world = (stats.world || 0) + L.log.filter(e => e.k === 'world').length; stats.years = (stats.years || 0) + L.age; stats.ages.push(L.age); const br = A.RANKS[A.bestRankAll(L)]; stats.ranks[br] = (stats.ranks[br] || 0) + 1;
        L.earned.forEach(e => stats.earned[e] = (stats.earned[e] || 0) + 1);
        for (const a of A.ARCS) { const v = L.arc[a.id] || 0; const key = a.id + ':' + (v >= 99 ? 'done' : v < 0 ? 'closed' : v); stats.arcs[key] = (stats.arcs[key] || 0) + 1; }
        stats.goals += (L.goalsDone || []).length;
        const cause = (L.deathCause || 'old age').split('(')[0].trim(); stats.deaths[cause] = (stats.deaths[cause] || 0) + 1;
        const kids = L.people.filter(p => p.role === 'child' && p.alive);
        if (kids.length && gens < 2) { L = A.buildHeir(L, kids[0].id); gens++; continue; }
        break;
      }
      const sp = L.spouse && L.people.find(p => p.id === L.spouse), pt = L.partner && L.people.find(p => p.id === L.partner);
      for (const x of [sp, pt]) if (x && (x.age < 18 || L.age < 18 || x.canon || x.noRomance)) throw new Error('ROMANCE VIOLATION ' + L.age + ' ' + x.name + ' ' + x.age);
      if (L.vow === 'solitude' && (sp || pt)) throw new Error('VOW VIOLATION solitude');
      if (L.vow === 'humility' && L.fame > 59.5) throw new Error('VOW VIOLATION humility ' + L.fame);
      if (L.vow) stats.vows[L.vow] = (stats.vows[L.vow] || 0) + 1;
      stats.apmax[L.apMax] = (stats.apmax[L.apMax] || 0) + 1;
      if (JSON.stringify(L).length > 250000) throw new Error('life too big ' + JSON.stringify(L).length);
    }
  } catch (e) { stats.errors++; if (stats.errors < 6) console.log("ERR", e.stack.split("\n").slice(0, 3).join(" | ")); }
}
const ages = stats.ages.sort((a, b) => a - b);
console.log('looks: scarred lives', stats.scarred, 'scars', stats.scars, 'eye patches', stats.patch, 'inherited features', stats.inherit, 'avg final looks', (stats.looksSum / stats.lives).toFixed(1), 'children with inherited looks', stats.kidsLooked);
console.log('lives', stats.lives, 'errors', stats.errors, 'median age', ages[Math.floor(ages.length / 2)], 'p10', ages[Math.floor(ages.length * .1)], 'p90', ages[Math.floor(ages.length * .9)]);
console.log('best ranks', stats.ranks);
console.log('deaths', stats.deaths);
console.log('earned', stats.earned);
console.log("events fired (cards)", Object.keys(stats.events).length, JSON.stringify(Object.entries(stats.events).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>k+":"+(v/stats.lives).toFixed(1))));
console.log('arcs', JSON.stringify(Object.fromEntries(Object.entries(stats.arcs).filter(([k]) => !k.endsWith(':0')).sort())));
console.log('avg goals per life', (stats.goals / Math.max(1, stats.lives)).toFixed(1), 'apMax dist', JSON.stringify(stats.apmax));
console.log('META lp', A.getMeta().lp, 'ach', Object.keys(A.getMeta().ach).length);
{ const D = A.getMeta().disc || {}; const n = (k) => Object.keys(D[k] || {}).length; console.log('disc', 'ev', n('ev'), 'town', n('town'), 'npc', n('npc'), 'arc', n('arc'), 'paid', D.paid); }
console.log('works funded', JSON.stringify(stats.works));
console.log('legacy events', ['deja_vu','ancestor_portrait','well_festival','scholar_visit','statue_mustache','library_grimoire','patron_plea','sky_seed'].map(id => id + ':' + (stats.events[id] || 0)).join(' '));
console.log('vow-years', JSON.stringify(stats.vows));
console.log('plan actions spent', stats.planActs);
console.log('letters per 100 yrs', (stats.letters / stats.years * 100).toFixed(1), 'world news per 100 yrs', (stats.world / stats.years * 100).toFixed(1), '(log is capped at 260 entries)');
