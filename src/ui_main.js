/* ===================== UI: HANDLERS & BOOT ===================== */
function logOnce(L, msg, kind) { if (!msg) return; if (L.log.slice(-4).some(e => e.t === msg || msg.includes(e.t) || e.t.includes(msg))) return; log(L, msg, kind); }
function after(msg, tags) {
  const L = UI.L;
  if (L && L.alive && L.hp <= 0) { if (deathCheck(L)) return toDeath(); }
  if (L && !L.alive) return toDeath();
  saveGame(); UI.lastResult = { msg, tags: tags || [] }; UI.flashLive = !!(msg || (tags && tags.length)); render();
  const lc = UI.lastClick; if (tags && tags.length && lc && Date.now() - lc.t < 2000) floatChips(tags, lc.x, lc.y);
}
function toDeath() {
  const L = UI.L; sfx('death');
  finalizeLife(L); UI.screen = 'dead'; UI.sheet = null; UI.navOpen = UI.sideOpen = false;
  UI.forceSave = true; saveGame(); saveMeta(); render(); window.scrollTo(0, 0);
}
function doAction(fn) {
  const L = UI.L; if (!L || !L.alive) return;
  if (!spendAP(L)) { flash('No actions left this year. Age up to continue.'); return; }
  sfx('tap');
  const before = snap(L);
  const msg = fn(L);
  logOnce(L, msg, 'act'); checkGoals(L);
  const tags = diffTags(before, L);
  if (L.queue.length) { UI.evSnap = before; saveGame(); render(); return; }
  after(msg, tags);
}
function act(fn, kind) {
  const L = UI.L; const before = L ? snap(L) : null;
  const msg = fn(L);
  if (L) { logOnce(L, msg, kind || 'act'); checkGoals(L); }
  after(msg, L ? diffTags(before, L) : []);
}
function yearBanner(L) {
  if (RM()) return;
  const el = document.createElement('div'); el.className = 'yearbanner'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<small>Year ${L.year} · ${esc(SEASON[L.season].name)}</small><b>Age ${L.age}</b><span>${esc(lifeStage(L))}</span>`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 1700);
}
/* spend unused actions on the Year Plan; returns false when an event or death interrupts */
function runPlan(quiet) {
  const L = UI.L; if (!L || !planList(L).length || L.ap <= 0) return true;
  const before = snap(L);
  const r = spendPlan(L);
  if (r.n) { log(L, `Year plan: ${planSummary(r.done)}.`, 'act'); checkGoals(L); }
  if (L.hp <= 0 && deathCheck(L)) { toDeath(); return false; }
  if (!L.alive) { toDeath(); return false; }
  const tags = diffTags(before, L);
  if (L.queue.length) { UI.evSnap = before; saveGame(); render(); return false; }
  if (!quiet) after(r.n ? `You follow your plan: ${planSummary(r.done)}.` : 'Nothing in your plan is open to you yet.', tags);
  else if (r.n) { UI.planTags = tags; UI.planMsg = `Your plan used ${r.n} action${r.n === 1 ? '' : 's'}: ${planSummary(r.done)}.`; }
  return true;
}
function doAge() {
  const L = UI.L;
  if (L.queue.length) { openSheet('event'); return; }
  if (L.planAuto !== false && planList(L).length && L.ap > 0) { if (!runPlan(true)) return; }
  const res = ageUp(L);
  if (res.dead) return toDeath();
  sfx('age');
  saveGame(); render(); if (!L.queue.length) yearBanner(L);
  if (!L.queue.length) flash(`${UI.planMsg ? UI.planMsg + ' ' : ''}Age ${L.age}. ${L.ap} action${L.ap === 1 ? '' : 's'} and ${L.sp} social point${L.sp === 1 ? '' : 's'} this year${L.well ? `, including +${L.well} for good health and a calm mind` : ''}.`, UI.planTags || []);
  UI.planMsg = null; UI.planTags = null;
}
function startLife(slot) {
  const L = buildLife(UI.draft);
  UI.L = L; UI.slot = slot; UI.screen = 'game'; UI.page = 'overview'; UI.sheet = null; UI.draft = null; UI.navOpen = UI.sideOpen = false; UI.resetScroll = { cscroll: 1, logscroll: 1, sidechar: 1 };
  META.lastSlot = slot; UI.forceSave = true; checkGoals(L); saveGame(); render(); window.scrollTo(0, 0);
}
function freeSlot() { for (const s of [1, 2, 3]) if (!SLOTS[s] || !SLOTS[s].alive) return s; return null; }
function newLifeFlow() {
  UI.draft = newDraft(); if (META.unlimitedRerolls) UI.draft.rerolls = 999;
  UI.screen = 'create'; UI.sheet = null; UI.navOpen = UI.sideOpen = false; UI.cstepOpen = null; UI.resetScroll = { cscroll: 1 }; render(); window.scrollTo(0, 0);
}
function confirmBox(c, extra) {
  const map = {
    quit: { title: 'Quit your job?', text: 'You lose your position and your progress toward promotion.', yes: 'Quit', danger: 1, run: () => act(L => quitJob(L)) },
    leaveschool: { title: 'Leave school?', text: 'You lose this school’s yearly training. You can enroll somewhere else afterward.', yes: 'Leave', danger: 1, run: () => act(L => leaveSchool(L)) },
    endlife: { title: 'End this life?', text: 'Your story ends here and you move to the legacy screen.', yes: 'End this life', danger: 1, run: () => { endLife(UI.L); toDeath(); } },
    delslot: { title: 'Delete this saved life?', text: 'This cannot be undone.', yes: 'Delete', danger: 1, run: () => { const n = +extra.slot; SLOTS[n] = null; Store.remove('slot' + n); UI.sheet = { type: 'slots' }; render(); } },
    reset: { title: 'Reset all data?', text: 'This erases Legacy Points, achievements, the Hall of Lives, and every saved life on this device and your account.', yes: 'Erase everything', danger: 1, run: () => { META = newMeta(); migrateSettings(); for (const s of [1, 2, 3]) { SLOTS[s] = null; Store.remove('slot' + s); } saveMeta(); applySettings(); UI.L = null; UI.screen = 'title'; UI.sheet = null; render(); } },
    age: { title: 'Age up?', text: UI.L && UI.L.planAuto !== false && planList(UI.L).length && UI.L.ap > 0 ? 'Unused actions go to your Year Plan. Unused social points are lost.' : 'Unused actions and social points are lost.', yes: 'Age up', run: () => { UI.sheet = null; doAge(); } },
  };
  const m = map[c]; if (!m) return;
  UI.confirmRun = m.run; openSheet('confirm', m);
}
function goPage(v) { if (!PAGES[v]) return; if (UI.page !== v) sfx('page'); UI.page = v; UI.navOpen = false; UI.sheet = null; UI.resetScroll.cscroll = 1; UI.recent = [v, ...(UI.recent || []).filter(x => x !== v)].slice(0, 5); render(); }
const H = {
  close: () => closeSheet(),
  sheet: (d) => openSheet(d.type, { id: d.id }),
  pagemodal: (d) => openSheet('page', { id: d.id }),
  page: (d) => goPage(d.v),
  acc: (d, el) => {
    const sec = el.closest('.acc'); if (!sec) return;
    const open = !sec.classList.contains('is-open');
    UI.open[d.id] = open; savePrefs();
    sec.classList.toggle('is-open', open); el.setAttribute('aria-expanded', String(open));
    const body = sec.querySelector(':scope > .acc-body'); if (body) { if (open && body.dataset.lazy) { body.innerHTML = lazyBody(body.dataset.lazy); delete body.dataset.lazy; } body.hidden = !open; }
  },
  palette: () => openPalette(),
  maptown: (d) => { UI.mapSel = d.v; render(); },
  guidedone: () => { META.settings.guideDone = true; saveMeta(); render(); },
  newsdone: () => { META.newsSeen = NEWS_VER; saveMeta(); render(); },
  guideshow: () => { META.settings.guideDone = false; saveMeta(); UI.page = 'overview'; render(); },
  navtoggle: () => { UI.navOpen = !UI.navOpen; UI.sideOpen = false; const s = $('.shell'); if (s) { s.classList.toggle('nav-open', UI.navOpen); s.classList.remove('side-open'); } },
  sidetoggle: () => { UI.sideOpen = !UI.sideOpen; UI.navOpen = false; const s = $('.shell'); if (s) { s.classList.toggle('side-open', UI.sideOpen); s.classList.remove('nav-open'); } },
  drawers: () => { UI.navOpen = UI.sideOpen = false; const s = $('.shell'); if (s) s.classList.remove('nav-open', 'side-open'); },
  dismissflash: () => { const f = $('#flash'); if (f) f.classList.remove('show'); },
  continue: (d) => { const n = +d.slot; const L = SLOTS[n]; if (!L) return; UI.L = L; UI.slot = n; UI.screen = 'game'; UI.page = 'overview'; UI.sheet = null; META.lastSlot = n; UI.resetScroll = { cscroll: 1, logscroll: 1 }; render(); window.scrollTo(0, 0); },
  newlife: () => newLifeFlow(),
  totitle: () => { UI.screen = 'title'; UI.sheet = null; UI.draft = null; render(); },
  savequit: () => { UI.forceSave = true; saveGame(); UI.screen = 'title'; UI.sheet = null; UI.navOpen = UI.sideOpen = false; render(); toast('save', 'Saved', cloudLabel()); },
  // creation
  randomize: () => { const r = UI.draft.rerolls; UI.draft = newDraft(); UI.draft.rerolls = META.unlimitedRerolls ? 999 : r; render(); },
  rollname: () => { UI.draft.name = rname(UI.draft.race, UI.draft.sex); render(); },
  rollsur: () => { UI.draft.sur = rsurname(UI.draft.race); UI.draft.parents.forEach(p => p.sur = UI.draft.sur); render(); },
  sex: (d) => { UI.draft.sex = d.v; render(); },
  race: (d) => { const dr = UI.draft; if (dr.race === d.v) return; dr.race = d.v; if (BG[dr.bg].races && !BG[dr.bg].races.includes(d.v)) dr.bg = pickBg(d.v); dr.town = pickTown(d.v, dr.bg); const k = dr.look; dr.look = Object.assign(randLook(d.v, dr.sex), { style: k.style, face: k.face, brow: k.brow, eye: k.eye, mark: k.mark, beard: k.beard }); dr.name = rname(d.v, dr.sex); dr.sur = rsurname(d.v); dr.parents.forEach(p => { p.race = d.v; p.name = rname(d.v, p.sex); p.sur = dr.sur; p.look = randLook(d.v, p.sex); }); render(); },
  look: (d) => { UI.draft.look[d.k] = ['style', 'face', 'brow', 'eye'].includes(d.k) ? +d.v : d.v; render(); },
  lookS: (d) => { UI.draft.look[d.k] = d.v; render(); },
  setbg: (d) => { const dr = UI.draft; const old = BG[dr.bg]; dr.bg = d.id; const nb = BG[d.id]; if (!townsFor(dr.race, d.id).some(t => t.id === dr.town)) dr.town = pickTown(dr.race, d.id); if (!!old.ex.orphan !== !!nb.ex.orphan) dr.parents = rollParents(dr); else { const jobs = nb.jobs.length ? nb.jobs : ['Laborer', 'Laborer']; dr.parents.forEach((p, i) => p.job = jobs[i] || jobs[0]); } render(); },
  settown: (d) => { UI.draft.town = d.id; render(); },
  reroll: () => { const dr = UI.draft; if (dr.rerolls <= 0) return; dr.rerolls--; rollFate(dr); UI.open['cr.fate'] = true; render(); if (!RM()) $$('.tcard').forEach((el, i) => { el.style.animationDelay = (i * 90) + 'ms'; el.classList.add('flip'); }); },
  bonus: (d) => { const dr = UI.draft; const left = 10 - Object.values(dr.bonus).reduce((a, x) => a + x, 0); const v = +d.v; if (v > 0 && left <= 0) return; dr.bonus[d.s] = Math.max(0, dr.bonus[d.s] + v); render(); },
  chosenf: (d) => openSheet('pickchosen', { f: d.v }),
  choosetrait: (d) => { const dr = UI.draft; if (dr.chosen.includes(d.id)) dr.chosen = dr.chosen.filter(x => x !== d.id); else { if (dr.chosen.length >= 2) dr.chosen.shift(); dr.chosen.push(d.id); } const r = rollBornTraits(dr, dr.chosen, true); dr.traits = r.traits; dr.sources = r.sources; render(); openSheet('pickchosen', { f: TRAIT[d.id].tier }); },
  clearchosen: () => { const dr = UI.draft; dr.chosen = []; const r = rollBornTraits(dr, [], true); dr.traits = r.traits; dr.sources = r.sources; render(); openSheet('pickchosen', { f: 'legendary' }); },
  cstep: (d) => { UI.open['cr.' + d.v] = true; UI.navOpen = false; render(); const el = document.querySelector(`[data-acc="cr.${d.v}"]`); if (el) el.scrollIntoView({ behavior: RM() ? 'auto' : 'smooth', block: 'start' }); },
  previewage: (d) => { UI.previewAge = d.v; savePrefs(); render(); },
  begin: () => { const s = freeSlot(); if (s) startLife(s); else openSheet('pickslot'); },
  useslot: (d) => startLife(+d.slot),
  // game actions
  age: () => { if (UI.L.queue.length) return openSheet('event'); if (META.settings.confirmAge) return confirmBox('age'); doAge(); },
  mana: (d) => doAction(L => actMana(L, d.push === '1')),
  magic: (d) => doAction(L => actMagic(L, d.k)),
  sword: (d) => doAction(L => actSword(L, d.k || null)),
  aura: () => doAction(L => actAura(L)),
  body: () => doAction(L => actBody(L)),
  study: () => doAction(L => actStudy(L)),
  rest: () => doAction(L => actRest(L)),
  explore: () => doAction(L => actExplore(L)),
  activity: (d) => doAction(L => actActivity(L, d.id)),
  trial: (d) => doAction(L => actTrial(L, d.k)),
  workhard: () => doAction(L => actWorkHard(L)),
  promo: () => doAction(L => actPromo(L)),
  quest: (d) => doAction(L => actQuest(L, d.id)),
  travel: (d) => doAction(L => actTravel(L, d.id)),
  buyitem: (d) => act(L => buyItem(L, d.id), 'good'),
  fund: (d) => { const b = workBlock(UI.L, d.id); if (b) return flash(b); doAction(L => actFund(L, d.id)); },
  sellitem: (d) => act(L => sellItem(L, d.slot)),
  apply: (d) => act(L => { if (L.job) quitJob(L); return actApply(L, d.id); }),
  enroll: (d) => act(L => actEnroll(L, d.id)),
  focus: (d) => { UI.L.edu.focus = d.v; after(); },
  tutor: (d) => act(L => actHireTutor(L, d.k)),
  register: () => act(L => actRegister(L)),
  meet: (d) => { const L = UI.L; if (!spendSP(L)) return flash('No social points left this year.'); act(L => actMeet(L, d.k), 'social'); },
  social: (d) => { const L = UI.L; if (!spendSP(L)) return flash('No social points left this year.'); UI.open['p.' + d.id] = true; act(L => actSocial(L, d.id, d.act), 'social'); },
  confirm: (d) => confirmBox(d.c, d),
  yes: () => { const f = UI.confirmRun; UI.confirmRun = null; UI.sheet = null; if (f) f(); },
  trait: (d) => openSheet('trait', { id: d.id }),
  codexf: (d) => { UI.codexF = d.v; render(); },
  logf: (d) => { UI.logF = d.v; savePrefs(); render(); },
  lcm: (d) => { UI.lcM = d.v; savePrefs(); render(); },
  plan: () => openSheet('plan'),
  sndtoggle: () => { const on = sndOn(); META.settings.music = on ? 'off' : 'med'; META.settings.sfx = on ? 'off' : 'med'; saveMeta(); sndApply(); render(); if (!on) setTimeout(() => sfx('choice'), 80); },
  pagex: (d) => palGo(d.v, d.acc),
  planspend: () => { UI.sheet = null; renderSheet(); runPlan(false); },
  planpreset: (d) => { const L = UI.L; L.plan = d.v.split(',').filter(id => PLAN_OPT[id]); if (L.planAuto === undefined) L.planAuto = true; saveGame(); renderSheet(); render(); },
  planclear: () => { UI.L.plan = []; saveGame(); renderSheet(); render(); },
  planauto: () => { const L = UI.L; L.planAuto = L.planAuto === false; saveGame(); renderSheet(); render(); },
  barber: (d) => {
    const L = UI.L, i = +d.v, cost = barberCost(L);
    if ((L.look.style || 0) === i) return closeSheet();
    if (L.gold < cost) return flash(`A new cut costs ${cost} gold.`);
    if (cost) money(L, -cost);
    L.look = Object.assign({}, L.look, { style: i });
    log(L, cost ? `A trip to the barber: you walk out with a new look (${HAIR_STYLES[i].toLowerCase()}).` : `A new haircut at the kitchen table (${HAIR_STYLES[i].toLowerCase()}).`);
    saveGame(); UI.sheet = null; renderSheet(); render(); toast('note', 'A new look', HAIR_STYLES[i]); sfx('choice');
  },
  beard: (d) => { const L = UI.L; L.look = Object.assign({}, L.look, { beard: d.v }); saveGame(); renderSheet(); render(); },
  vow: (d) => { if (!UI.draft) return; UI.draft.vow = d.v || null; UI.cstepOpen = 'perks'; render(); },
  jumpacc: (d) => { UI.open[d.v] = true; savePrefs(); render(); setTimeout(() => { const el = $(`[data-acc="${d.v}"]`); if (el) { el.scrollIntoView({ block: 'start', behavior: RM() ? 'auto' : 'smooth' }); el.classList.add('pulse-hl'); setTimeout(() => el.classList.remove('pulse-hl'), 1400); } }, 40); },
  sidelogf: (d) => { UI.sideLogF = d.v; UI.resetScroll.logscroll = 1; render(); },
  skiptype: (d, el) => { el.dataset.skip = '1'; },
  choose: (d) => {
    const L = UI.L; const c = L.queue[0]; if (!c) return; const kicker = evKicker(c); const sceneOf = { kind: c.kind, arc: c.arc, milestone: c.milestone, icon: c.icon };
    const before = UI.evSnap || snap(L);
    const r = resolveCard(L, d.k); if (!r) return;
    checkGoals(L);
    if (L.hp <= 0 && deathCheck(L)) { UI.evSnap = null; return toDeath(); }
    if (r.next) { UI.evSnap = before; UI.sheet = { type: 'event' }; saveGame(); render(); return; }
    UI.evSnap = null;
    UI.sheet = { type: 'eventresult', title: r.title, text: r.text, tags: diffTags(before, L), kicker, scene: sceneOf };
    saveGame(); render();
  },
  evcontinue: () => { const L = UI.L; UI.sheet = L.queue.length ? { type: 'event' } : null; render(); if (!UI.sheet) flash(L.ap ? `${L.ap} action${L.ap === 1 ? '' : 's'} left this year.` : 'All actions spent. Age up when you are ready.'); },
  heir: (d) => { const H2 = buildHeir(UI.L, d.id); UI.L = H2; UI.screen = 'game'; UI.page = 'overview'; UI.sheet = null; UI.forceSave = true; UI.resetScroll = { cscroll: 1, logscroll: 1 }; saveGame(); render(); window.scrollTo(0, 0); },
  heirloom: (d) => { META.heirloom = d.id; saveMeta(); render(); },
  buy: (d) => { const u = UPG[d.id]; const lv = META.upg[u.id] || 0, cost = upgCost(u, lv); if (META.lp < cost || lv >= u.max) return; META.lp -= cost; META.upg[u.id] = lv + 1; _modCache.key = ''; saveMeta(); toast('note', u.name + (u.max > 1 ? ' ' + ROMANS[lv + 1] : ''), `−${fmt(cost)} LP · unlocked for every life to come`); if (UI.L) saveGame(); render(); },
  shopf: (d) => { UI.shopF = d.v; render(); },
  set: (d) => { META.settings[d.k] = d.v; applySettings(); saveMeta(); render(); if (d.k === 'fps' || d.k === 'theme') { if (UI.screen === 'title') startSky(); } if (d.k === 'music' || d.k === 'sfx') { sndApply(); if (d.k === 'sfx') setTimeout(() => sfx('choice'), 60); } },
  settog: (d) => { META.settings[d.k] = !META.settings[d.k]; applySettings(); saveMeta(); render(); if (d.k === 'anim' && UI.screen === 'title') startSky(); },
  copycode: () => { const ta = $('#exportcode'); const done = () => toast('note', 'Copied', 'Paste it into Import on your other device.'); try { navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); }); } catch (e) { ta.select(); } },
  doimport: () => { const v = ($('#importcode').value || '').trim(); const err = $('#importerr');
    try { const o = JSON.parse(decodeURIComponent(escape(atob(v)))); if (!o.meta || !o.slots) throw 0; META = Object.assign(newMeta(), o.meta); migrateSettings(); for (const s of [1, 2, 3]) { SLOTS[s] = o.slots[s] || null; if (SLOTS[s]) Store.save('slot' + s, SLOTS[s]); else Store.remove('slot' + s); } saveMeta(); applySettings(); UI.L = null; UI.screen = 'title'; UI.sheet = null; render(); toast('note', 'Save imported', 'Your lives and legacy are loaded.'); }
    catch (e) { err.hidden = false; err.textContent = 'That code did not work. Copy the whole code from Export and try again.'; } },
  // admin
  adtf: (d) => { UI.adminTF = d.v; render(); },
  adstats: () => { const L = UI.L; const g = (id) => { const el = $('#ad-' + id); return el ? +el.value : 0; };
    ['str', 'agi', 'int', 'cha', 'looks', 'luck'].forEach(k => L.st[k] = Math.max(0, g(k))); L.hp = clamp(g('hp'), 1, maxHp(L)); L.stress = clamp(g('stress'), 0, 100); L.gold = Math.max(0, g('gold')); L.fame = Math.max(0, g('fame'));
    L.mana.cap = Math.max(0, g('mcap')); L.mana.ctrl = clamp(g('mctrl'), 0, 100); L.aura.cap = Math.max(0, g('acap')); L.aura.ctrl = clamp(g('actrl'), 0, 100); L.read = clamp(g('read'), 0, 100); L.ap = Math.max(0, g('ap')); L.apMax = Math.max(L.apMax || 0, L.ap); L.sp = Math.max(0, g('sp')); L.spMax = Math.max(L.spMax || 0, L.sp); L.family.funds = Math.max(0, g('funds'));
    if (L.aura.compat <= 0 && L.aura.cap > 0) L.aura.compat = 1; auraStageCheck(L); L.admin = true; saveGame(); render(); toast('note', 'Stats applied', ''); },
  adreveal: () => { const L = UI.L; L.mana.revealed = true; L.aura.known = true; L.admin = true; saveGame(); render(); toast('note', 'Potential revealed', `Mana ${potGrade(L.mana.pot)} · Aura ${L.aura.compat > 0 ? potGrade(L.aura.compat) : 'none'} · Lifespan about ${L.lifespan}`); },
  adgod: () => { UI.L.god = !UI.L.god; UI.L.admin = true; saveGame(); render(); },
  adchant: () => { const L = UI.L; L.mana.chant = 100; L.mana.chantless = true; earn(L, 'silent_caster'); unlock(L, 'chantless'); L.admin = true; saveGame(); render(); },
  adstyle: () => { const L = UI.L; L.flags.ev_style_choice = 0; fireEvent(L, EVT.style_choice); L.admin = true; UI.sheet = { type: 'event' }; saveGame(); render(); },
  adrm: (d) => { const L = UI.L; L.traits = L.traits.filter(x => x !== d.id); L.earned = L.earned.filter(x => x !== d.id); L.admin = true; saveGame(); render(); },
  adadd: (d) => { const L = UI.L; const t = TRAIT[d.id]; if (t.tier === 'earned') L.earned.push(d.id); else if (L.traits.length < 3) L.traits.push(d.id); else if (!L.earned.includes(d.id)) { toast('note', 'Born traits are full', 'Remove one first. It was added as an earned trait instead.'); L.earned.push(d.id); } L.admin = true; saveGame(); render(); },
  adskip: (d) => { const L = UI.L; L.admin = true; const clear = () => { let g = 0; while (L.queue.length && g++ < 10) { const c = L.queue[0]; const ch = c.choices.find(x => !x.disabled) || c.choices[0]; if (!resolveCard(L, ch.k)) L.queue.shift(); } }; for (let k = 0; k < +d.n && L.alive; k++) { clear(); const r = ageUp(L); if (r.dead) return toDeath(); } clear(); if (L.hp <= 0 && deathCheck(L)) return toDeath(); checkGoals(L); saveGame(); render(); toast('note', `Skipped to age ${L.age}`, ''); },
  adage: () => { const L = UI.L; const v = clamp(+$('#ad-age').value || 0, 0, 5000); L.age = v; L.admin = true; L.queue = []; resetPoints(L); refreshBoards(L); log(L, `Time bends. You are now ${v}.`, 'big'); saveGame(); render(); },
  adrefill: () => { const L = UI.L; resetPoints(L); L.admin = true; saveGame(); render(); },
  adheal: () => { const L = UI.L; L.hp = maxHp(L); L.stress = 0; L.injuries = []; L.admin = true; saveGame(); render(); },
  adgold: (d) => { if (!UI.L) return; money(UI.L, +d.n); UI.L.admin = true; saveGame(); render(); },
  adlp: (d) => { META.lp += +d.n; saveMeta(); render(); },
  adupg: () => { UPGRADES.forEach(u => META.upg[u.id] = u.max); _modCache.key = ''; saveMeta(); if (UI.L) { resetPoints(UI.L); saveGame(); } render(); toast('note', 'Every legacy perk unlocked', ''); },
  adrerolls: () => { META.unlimitedRerolls = true; if (UI.draft) UI.draft.rerolls = 999; saveMeta(); render(); toast('note', 'Unlimited fate re-rolls', 'Applies to every new life.'); },
  adfire: (d) => { const L = UI.L; const e = EVT[d.id]; L.admin = true; const before = L.queue.length; const ok = fireEvent(L, e); if (!ok) { toast('note', 'Nothing happened', 'This event needs different circumstances.'); return; } UI.sheet = L.queue.length > before ? { type: 'event' } : null; if (!UI.sheet) flash(L.log[L.log.length - 1].t); saveGame(); render(); },
};
const H2 = {
  planset: (el) => { const L = UI.L; const pl = (L.plan || []).slice(0, 3); while (pl.length < 3) pl.push(''); pl[+el.dataset.i] = PLAN_OPT[el.value] ? el.value : ''; L.plan = pl.filter(Boolean); if (L.planAuto === undefined) L.planAuto = true; saveGame(); renderSheet(); render(); },
  adrank: (el) => { const L = UI.L; const k = el.dataset.k; const r = +el.value; if (STYLE[k]) { if (!L.sword.styleChosen) chooseStyle(L, k); L.sword[k] = RANK_XP[r]; } else L.magic[k] = RANK_XP[r]; L.ranks[k] = r; L.admin = true; saveGame(); render(); },
  adaura: (el) => { const L = UI.L; const s = +el.value; if (L.aura.compat <= 0) L.aura.compat = 1; L.aura.cap = Math.max(L.aura.cap, AURA_CAP[s]); L.aura.ctrl = Math.max(L.aura.ctrl, s >= 6 ? 80 : s >= 5 ? 50 : 0); L.aura.stage = s; L.aura.known = true; L.admin = true; saveGame(); render(); },
  adguild: (el) => { const L = UI.L; L.guild.reg = true; L.guild.rank = +el.value; L.guild.pts = Math.max(L.guild.pts, GUILD_PTS[+el.value]); L.admin = true; refreshBoards(L); saveGame(); render(); },
  adarc: (el) => { const L = UI.L; const a = ARC[el.dataset.k]; const v = +el.value; L.arc[a.id] = v >= a.chapters.length ? 99 : v; L.arcYear[a.id] = -1; L.admin = true; saveGame(); render(); toast('note', a.name, v >= a.chapters.length ? 'Marked complete' : v ? `Set after chapter ${ROMANS[v]}` : 'Reset'); },
};

Object.assign(H, HA); Object.assign(H2, HA2);
/* ---------- input wiring ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) {
    if (!HOVER.matches) { const t = e.target.closest('[data-tip]'); if (t && !e.target.closest('#tip')) { if (Tip.target === t) tipHide(); else tipShow(t); return; } }
    if (!e.target.closest('#tip')) tipHide();
    return;
  }
  const fn = H[el.dataset.a]; if (!fn) return;
  const rr = el.getBoundingClientRect(); UI.lastClick = { x: e.clientX || rr.left + rr.width / 2, y: e.clientY || rr.top, t: Date.now() };
  e.preventDefault(); tipHide(); fn(el.dataset, el);
});
document.addEventListener('pointermove', (e) => { const p = e.target.closest && e.target.closest('.lc-plot'); if (p) lcMove(p, e); else lcHide(); }, { passive: true });
document.addEventListener('pointerdown', (e) => { const p = e.target.closest && e.target.closest('.lc-plot'); if (p) lcMove(p, e); });
document.addEventListener('change', (e) => { const el = e.target.closest('[data-a2]'); if (el && H2[el.dataset.a2]) H2[el.dataset.a2](el); });
document.addEventListener('input', (e) => {
  if (!UI.draft) return;
  if (e.target.id === 'f-name') { UI.draft.name = e.target.value.slice(0, 18); $$('.cc-name').forEach(n => n.innerHTML = `${esc(UI.draft.name)} <span>${esc(UI.draft.sur)}</span>`); }
  if (e.target.id === 'f-sur') { UI.draft.sur = e.target.value.slice(0, 18); UI.draft.parents.forEach(p => p.sur = UI.draft.sur); $$('.cc-name').forEach(n => n.innerHTML = `${esc(UI.draft.name)} <span>${esc(UI.draft.sur)}</span>`); }
});
document.addEventListener('mouseover', (e) => {
  if (!HOVER.matches) return;
  const t = e.target.closest('[data-tip]');
  if (t === Tip.target) return;
  clearTimeout(Tip.timer);
  if (!t) { if (Tip.target && !e.target.closest('#tip')) tipHide(); return; }
  Tip.timer = setTimeout(() => tipShow(t), 140);
});
document.addEventListener('mouseout', (e) => { const t = e.target.closest('[data-tip]'); if (!t) return; const to = e.relatedTarget; if (to && t.contains(to)) return; clearTimeout(Tip.timer); if (Tip.target === t) tipHide(); });
document.addEventListener('focusin', (e) => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t && e.target.matches && e.target.matches(':focus-visible')) tipShow(t); });
document.addEventListener('focusout', () => tipHide());
document.addEventListener('scroll', () => { if (Tip.target) { const el = Tip.el || $('#tip'); if (el) { el.classList.remove('show'); el.hidden = true; } Tip.target = null; } }, true);
document.addEventListener('keydown', (e) => {
  if (PAL.open) { palKey(e); return; }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (!(UI.sheet && (UI.sheet.type === 'event' || UI.sheet.type === 'eventresult'))) openPalette(); return; }
  if (e.key === '/' && !(e.target.closest && e.target.closest('input, textarea, select')) && !UI.sheet) { e.preventDefault(); openPalette(); return; }
  if (e.key === 'Escape') { tipHide(); if (UI.navOpen || UI.sideOpen) { H.drawers(); return; } closeSheet(); return; }
  if (e.target.closest && e.target.closest('input, textarea, select')) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (UI.screen !== 'game' || !UI.L) return;
  const s = UI.sheet;
  if (s && s.type === 'event') { const n = parseInt(e.key, 10); if (n >= 1 && n <= 9) { const b = $$('.m-event .choice')[n - 1]; if (b && !b.disabled) { e.preventDefault(); b.click(); } } else if (e.key === ' ' || e.key === 'Enter') { const t = $('.ev-text'); if (t && !$('.ev-choices.show')) { e.preventDefault(); t.dataset.skip = '1'; } } return; }
  if (s && s.type === 'eventresult') { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); H.evcontinue(); } return; }
  if (s) return;
  const ae = document.activeElement;
  const onButton = ae && ae !== document.body && ae.matches && ae.matches('button, a, [tabindex]');
  if ((e.key === 'Enter' || e.key === ' ') && ae && ae.dataset && ae.dataset.a && ae.tagName !== 'BUTTON' && ae.tagName !== 'A') { e.preventDefault(); ae.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
  if ((e.key === ' ' || e.key === 'Enter') && !onButton) { e.preventDefault(); H.age(); return; }
  if (e.key === '[' || e.key === ']') { const i = NAV_FLAT.findIndex(n => n.id === UI.page); const j = (i + (e.key === ']' ? 1 : -1) + NAV_FLAT.length) % NAV_FLAT.length; e.preventDefault(); goPage(NAV_FLAT[j].id); return; }
  if (e.key === 'j' || e.key === 'J') { e.preventDefault(); goPage('journal'); return; }
});
window.addEventListener('resize', () => { tipHide(); if (window.innerWidth >= 1280 && (UI.navOpen || UI.sideOpen)) H.drawers(); });

/* ---------- TITLE SKY ---------- */
let SKY = null;
function stopSky() { if (SKY) { cancelAnimationFrame(SKY.raf); SKY = null; } }
function startSky() {
  stopSky();
  const cv = $('#sky'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const col = (n, d) => css.getPropertyValue(n).trim() || d;
  const C = { s1: col('--sky1', '#2e3a58'), s2: col('--sky2', '#85748f'), s3: col('--sky3', '#e6aa80'), m1: col('--mtn1', '#262c3c'), m2: col('--mtn2', '#3e4763'), m3: col('--mtn3', '#626b8b'), acc: col('--gold', '#d6b674'), mana: col('--mana', '#80c3d8'), star: col('--star', '#fff4de') };
  const hex = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mixA = (a, b, t) => { const A = hex(a), B = hex(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t)); };
  const mix = (a, b, t) => `rgb(${mixA(a, b, t).join(',')})`;
  const rgba = (arr, a) => `rgba(${arr.join(',')},${a})`;
  let W = 0, Hh = 0, dpr = 1;
  const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 0.3, r: Math.random() * 0.9 + 0.3, p: Math.random() * 6.28, s: 0.3 + Math.random() }));
  const clouds = Array.from({ length: 10 }, () => ({ x: Math.random() * 1.6 - 0.3, y: 0.1 + Math.random() * 0.48, w: 0.14 + Math.random() * 0.24, h: 0.014 + Math.random() * 0.026, v: 0.0016 + Math.random() * 0.0036, a: 0.16 + Math.random() * 0.2, p: Math.random() * 6.28 }));
  clouds.forEach(c => { c.col = mixA('#c8bdd0', '#ffd4b0', Math.min(1, c.y / 0.55)); c.shade = mixA(C.s2, C.s1, 0.35); });
  /* each cloud is pre-painted once from soft radial puffs, so edges stay feathered in every browser */
  const paintCloud = (c) => {
    const w = Math.max(60, Math.round(c.w * W)), h = Math.max(14, Math.round(c.h * Hh));
    const oc = document.createElement('canvas'); oc.width = Math.round(w * 1.5); oc.height = Math.round(h * 5); const x = oc.getContext('2d');
    const puff = (px, py, rx, ry, colr, a) => { x.save(); x.translate(px, py); x.scale(1, ry / rx); const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, rgba(colr, a)); g.addColorStop(0.55, rgba(colr, a * 0.55)); g.addColorStop(1, rgba(colr, 0)); x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, 6.28); x.fill(); x.restore(); };
    const cx = oc.width / 2, cy = oc.height / 2;
    for (let k = 0; k < 7; k++) { const t = k / 6 - 0.5; const rx = w * (0.2 + 0.06 * Math.sin(k * 1.9 + c.p)), ry = h * (1.1 + 0.4 * Math.cos(k * 2.3 + c.p)); puff(cx + t * w * 0.95, cy - ry * 0.25 + Math.sin(k + c.p) * h * 0.2, rx, ry, c.shade, 0.55); }
    for (let k = 0; k < 7; k++) { const t = k / 6 - 0.5; const rx = w * (0.19 + 0.05 * Math.cos(k * 1.3 + c.p)), ry = h * (0.8 + 0.3 * Math.sin(k * 2.1 + c.p)); puff(cx + t * w * 0.9, cy + ry * 0.3, rx, ry, c.col, 0.85); }
    c.spr = oc;
  };
  const motes = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), v: 0.00025 + Math.random() * 0.0006, r: Math.random() * 1.5 + 0.6, p: Math.random() * 6.28, gold: Math.random() < 0.6 }));
  const flock = { x: -0.15, y: 0.3, v: 0.022, wait: 3 };
  const birds = [[0, 0], [-0.018, -0.012], [-0.018, 0.012], [-0.036, -0.022], [-0.036, 0.024]];
  const resize = () => { const r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); clouds.forEach(paintCloud); };
  resize(); window.addEventListener('resize', resize);
  const ridge = (base, amp, seed, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, Hh); for (let x = 0; x <= W; x += 5) { const t = x / W; const y = base - amp * (0.55 * Math.sin(t * 7 + seed) + 0.3 * Math.sin(t * 17 + seed * 2) + 0.15 * Math.sin(t * 37 + seed * 3)); ctx.lineTo(x, Hh * y); } ctx.lineTo(W, Hh); ctx.closePath(); ctx.fill(); };
  const haze = (y0, y1, a) => { const g = ctx.createLinearGradient(0, Hh * y0, 0, Hh * y1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, C.s3); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(0, Hh * y0, W, Hh * (y1 - y0)); ctx.globalAlpha = 1; };
  let last = 0, lastDraw = -1e9;
  const draw = (t) => {
    if (!SKY) return;
    const fps = FPS();
    if (fps > 0 && fps < 1000 && t - lastDraw < 1000 / fps - 2) { SKY.raf = requestAnimationFrame(draw); return; }
    lastDraw = t;
    const T = t / 1000, dt = Math.min(0.1, last ? T - last : 0.016); last = T;
    const wide = W > 900;
    // dusk sky: cool high, warm low
    const g = ctx.createLinearGradient(0, 0, 0, Hh * 0.74); g.addColorStop(0, C.s1); g.addColorStop(0.55, C.s2); g.addColorStop(1, C.s3);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
    // first evening stars, faint
    for (const st of stars) { ctx.globalAlpha = 0.06 + 0.26 * Math.abs(Math.sin(st.p + T * st.s * 0.5)) * (1 - st.y / 0.3); ctx.fillStyle = C.star; ctx.beginPath(); ctx.arc(st.x * W, st.y * Hh, st.r, 0, 6.28); ctx.fill(); }
    ctx.globalAlpha = 1;
    // low sun with a soft glow and slow rays
    const sx = W * (wide ? 0.69 : 0.64), sy = Hh * 0.655, sr = clamp(W * 0.036, 24, 54);
    const glow = ctx.createRadialGradient(sx, sy, sr * 0.4, sx, sy, sr * 11); glow.addColorStop(0, 'rgba(255,222,176,.55)'); glow.addColorStop(0.35, 'rgba(255,200,150,.18)'); glow.addColorStop(1, 'rgba(255,200,150,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, Hh);
    ctx.save(); ctx.translate(sx, sy);
    for (let k = 0; k < 9; k++) { const ang = -Math.PI / 2 + (k - 4) * 0.2 + Math.sin(T * 0.07 + k) * 0.03; ctx.globalAlpha = 0.016 + 0.008 * Math.sin(T * 0.3 + k * 1.3); ctx.fillStyle = '#ffe2bb'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang - 0.035) * Hh, Math.sin(ang - 0.035) * Hh); ctx.lineTo(Math.cos(ang + 0.035) * Hh, Math.sin(ang + 0.035) * Hh); ctx.closePath(); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1;
    const disc = ctx.createRadialGradient(sx, sy - sr * 0.2, sr * 0.1, sx, sy, sr); disc.addColorStop(0, 'rgba(255,248,230,1)'); disc.addColorStop(1, 'rgba(255,214,168,.95)');
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.28); ctx.fill();
    // drifting clouds, lit from below
    for (const c of clouds) {
      if (FPS() > 0) c.x += c.v * dt * 0.6; if (c.x > 1.35) { c.x = -0.35; c.y = 0.1 + Math.random() * 0.48; }
      if (!c.spr) continue;
      ctx.globalAlpha = Math.min(1, c.a * 1.6); ctx.drawImage(c.spr, c.x * W - c.spr.width / 2, c.y * Hh - c.spr.height / 2);
    }
    ctx.globalAlpha = 1;
    // the floating fortress, far off in the haze
    const ix = W * (wide ? 0.84 : 0.8), iy = Hh * (wide ? 0.34 : 0.3) + Math.sin(T * 0.45) * 4, iw = Math.min(W * (wide ? 0.11 : 0.2), wide ? 160 : 96);
    ctx.fillStyle = mix(C.m3, C.s2, 0.35); ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(ix - iw / 2, iy); ctx.lineTo(ix + iw / 2, iy); ctx.lineTo(ix + iw * 0.18, iy + iw * 0.35); ctx.lineTo(ix, iy + iw * 0.62); ctx.lineTo(ix - iw * 0.22, iy + iw * 0.3); ctx.closePath(); ctx.fill();
    const tw = iw * 0.08;
    [[-0.28, 0.32], [-0.1, 0.5], [0.08, 0.62], [0.26, 0.38]].forEach(([dx, h]) => { const x = ix + iw * dx; ctx.fillRect(x - tw / 2, iy - iw * h, tw, iw * h); ctx.beginPath(); ctx.moveTo(x - tw * 0.8, iy - iw * h); ctx.lineTo(x, iy - iw * h - tw * 2); ctx.lineTo(x + tw * 0.8, iy - iw * h); ctx.closePath(); ctx.fill(); });
    ctx.fillRect(ix - iw * 0.3, iy - iw * 0.18, iw * 0.6, iw * 0.18);
    ctx.fillStyle = '#ffd99a'; [[-0.1, 0.38], [0.08, 0.48], [0.26, 0.28], [-0.28, 0.22]].forEach(([dx, h], i) => { ctx.globalAlpha = 0.55 + 0.35 * Math.abs(Math.sin(T * 0.6 + i)); ctx.fillRect(ix + iw * dx - 1.2, iy - iw * h, 2.4, 3.5); });
    ctx.globalAlpha = 1;
    // a small flock crossing now and then
    if (flock.wait > 0) flock.wait -= dt; else {
      if (FPS() > 0) flock.x += flock.v * dt; if (flock.x > 1.15) { flock.x = -0.12; flock.y = 0.2 + Math.random() * 0.18; flock.wait = 8 + Math.random() * 10; }
      ctx.strokeStyle = 'rgba(52, 48, 66, .62)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      birds.forEach(([dx, dy], i) => { const bx = (flock.x + dx) * W, by = (flock.y + dy) * Hh + Math.sin(T * 1.3 + i) * 2, sz = wide ? 6 : 4.5, f = Math.sin(T * 7 + i * 1.7) * sz * 0.5;
        ctx.beginPath(); ctx.moveTo(bx - sz, by - f); ctx.quadraticCurveTo(bx - sz * 0.4, by - sz * 0.2, bx, by); ctx.quadraticCurveTo(bx + sz * 0.4, by - sz * 0.2, bx + sz, by - f); ctx.stroke(); });
    }
    // mountains with atmospheric haze between the ranges
    ridge(0.74, 0.1, 1.3, C.m3); haze(0.68, 0.86, 0.22);
    ridge(0.84, 0.07, 4.1, C.m2); haze(0.8, 0.95, 0.14);
    ridge(0.94, 0.05, 2.2, C.m1);
    // rising motes of mana and light
    for (const m of motes) { if (FPS() > 0) m.y -= m.v * dt * 60; if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); } const x = (m.x + Math.sin(T * 0.4 + m.p) * 0.01) * W; ctx.globalAlpha = 0.16 + 0.36 * Math.abs(Math.sin(T + m.p)); ctx.fillStyle = m.gold ? '#ffe2a6' : C.mana; ctx.beginPath(); ctx.arc(x, m.y * Hh, m.r, 0, 6.28); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (SKY && FPS() > 0) SKY.raf = requestAnimationFrame(draw);
  };
  SKY = { raf: 0 };
  if (FPS() <= 0) draw(4000); else SKY.raf = requestAnimationFrame(draw);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSky(); else if (UI.screen === 'title') startSky(); });

/* ---------- BOOT ---------- */
const sndWake = () => { if (sndOn()) sndApply(); document.removeEventListener('pointerdown', sndWake, true); document.removeEventListener('keydown', sndWake, true); };
document.addEventListener('pointerdown', sndWake, true); document.addEventListener('keydown', sndWake, true);
function boot(snapD) {
  Store.loadLocal(); loadPrefs(); migrateSettings();
  if (snapD && snapD.meta) { META = snapD.meta; migrateSettings(); for (const s of [1, 2, 3]) SLOTS[s] = snapD.slots[s]; Object.assign(UI, snapD.ui || {}); if (UI.slot && SLOTS[UI.slot] && (UI.screen === 'game' || UI.screen === 'dead')) UI.L = SLOTS[UI.slot]; else if (UI.screen === 'game') UI.screen = 'title'; if (UI.screen === 'create' && !UI.draft) UI.screen = 'title'; }
  for (const s of [1, 2, 3]) if (SLOTS[s]) upgradeLife(SLOTS[s]);
  if (!META.lives && ![1, 2, 3].some(s => SLOTS[s]) && !META.newsSeen) META.newsSeen = NEWS_VER; // brand-new players get the guide instead
  applySettings();
  render();
  Store.initCloud();
}
/* older saves: fill fields added in later versions */
function upgradeLife(L) {
  if (!L.arc) L.arc = {}; if (!L.arcYear) L.arcYear = {}; if (!L.goalsDone) L.goalsDone = []; if (!L.gear) L.gear = {}; if (!L.towns) L.towns = [L.town]; if (!L.cnt) L.cnt = {};
  if (L.apMax === undefined) L.apMax = L.ap; if (L.spMax === undefined) L.spMax = L.sp; if (L.well === undefined) L.well = 0;
  for (const p of L.people || []) { if (!p.mem) p.mem = []; if (!p.bio) p.bio = genBio(p); }
  if (!L.hist) { L.hist = null; recordHist(L, true); }
  discBackfill(L);
}
try { window.claude && window.claude.hot && window.claude.hot.snapshot && window.claude.hot.snapshot(() => ({ meta: META, slots: SLOTS, ui: { screen: UI.screen, page: UI.page, slot: UI.slot, draft: UI.draft, open: UI.open } })); } catch (e) {}
const _hot = window.claude && window.claude.hot;
if (_hot && _hot.ready) _hot.ready(boot); else boot(_hot && _hot.data);
