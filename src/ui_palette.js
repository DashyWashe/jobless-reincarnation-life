/* ===================== QUICK JUMP (Ctrl/Cmd + K, or /) ===================== */
const PAL = { open: false, q: '', sel: 0, items: [], shown: [] };
const ROLE_PAGE = (p) => ['mother', 'father', 'guardian', 'sibling', 'twin', 'spouse', 'partner', 'child', 'grandchild', 'descendant'].includes(p.role) ? 'family' : ['mentor', 'student', 'party'].includes(p.role) ? 'mentors' : 'relations';
function palIndex() {
  const L = UI.screen === 'game' ? UI.L : null, out = [];
  const add = (o) => out.push(o);
  if (L) {
    for (const n of NAV_FLAT) add({ k: 'Page', label: n.name, sub: n.g, icon: n.icon, run: () => goPage(n.id) });
    add({ k: 'Action', label: L.queue.length ? 'Open the waiting decision' : 'Age up', sub: L.queue.length ? L.queue[0].title : `Year ${L.year} → ${L.year + 1}`, icon: 'hourglass', run: () => H.age() });
    const acts = [['Rest', 'rest', 'leaf', {}], ['Explore', 'explore', 'map', {}], ['Practice mana safely', 'mana', 'drop', { push: '0' }], ['Train your body', 'body', 'fist', {}], ['Study', 'study', 'book', {}], ['Train Battle Aura', 'aura', 'flame', {}]];
    for (const [label, a, ic, d] of acts) add({ k: 'Action', label, sub: L.ap > 0 ? `Costs 1 action (${L.ap} left)` : 'No actions left this year', icon: ic, run: () => H[a](d), off: L.ap <= 0 });
    add({ k: 'Action', label: 'Save and exit', sub: cloudLabel(), icon: 'door', run: () => H.savequit() });
    if (L.age >= 16) add({ k: 'Action', label: 'Patronage', kw: 'fund donate build works gold', sub: `${Object.keys(L.works || {}).length} of ${WORKS.length} great works funded`, icon: 'castle', run: () => palGo('market', 'mkt.works') });
    add({ k: 'Action', label: 'Year plan', kw: 'auto plan focus routine train spend', sub: planList(L).length ? planList(L).map(id => PLAN_OPT[id].name).join(' · ') : 'Choose what your unused actions go to', icon: 'target', run: () => openSheet('plan') });
    add({ k: 'Action', label: 'Life chart', kw: 'stats numbers graph history power gold fame', sub: 'Your life in numbers, in the Journal', icon: 'chart', run: () => palGo('journal', 'jr.chart') });
    for (const p of L.people.filter(p => p.alive || ['mother', 'father', 'spouse', 'child'].includes(p.role))) {
      add({ k: 'Person', kw: `${ROLE_NAMES[p.role] || ''} ${p.role}`, label: `${p.name} ${p.sur || ''}`.trim(), sub: `${ROLE_NAMES[p.role] || p.role} · ${p.alive ? 'age ' + p.age : 'remembered'} · ${relLabel(p)}`, icon: 'user', run: () => palOpenPerson(p) });
    }
    for (const m of MAGIC) add({ k: 'Skill', label: m.name + ' magic', sub: `${RANKS[rankOf(L, m.id)]} · Magic`, icon: 'wand', run: () => palGo('magic', 'magic.' + (m.group === 'attack' ? 'attack' : ['heal', 'barrier', 'detox'].includes(m.id) ? 'holy' : 'special')) });
    for (const st of STYLES) add({ k: 'Skill', label: st.name, sub: `${RANKS[rankOf(L, st.id)]} · Swordsmanship`, icon: 'sword', run: () => palGo('sword') });
    add({ k: 'Skill', label: 'Battle Aura', sub: AURA_STAGES[L.aura.stage], icon: 'flame', run: () => palGo('aura') });
    add({ k: 'Skill', label: 'Mana capacity', sub: fmt(L.mana.cap), icon: 'drop', run: () => palGo('mana') });
    for (const a of ARCS) { const s = arcStatus(L, a); add({ k: 'Story', label: a.name, sub: s.done ? 'Complete' : s.closed ? 'Closed' : s.stage ? `Chapter ${ROMANS[s.stage + 1]} next` : 'Not begun', icon: 'flag', run: () => palGo('arcs', 'arc.' + a.id) }); }
    for (const g of GOALS) add({ k: 'Goal', label: g.name, sub: (L.goalsDone || []).includes(g.id) ? 'Complete' : g.desc, icon: 'target', run: () => palGo('goals', 'goals.' + g.grp) });
    for (const t of TOWNS) add({ k: 'Place', label: t.name, sub: `${t.realm} · ${CONT[t.cont].name}${t.id === L.town ? ' · you are here' : ''}`, icon: 'map', run: () => palGo('travel') });
  } else {
    if (UI.screen === 'title') {
      add({ k: 'Action', label: 'Begin a New Life', sub: 'Be born into the world', icon: 'sparkle', run: () => H.newlife() });
      for (const s of [1, 2, 3]) if (SLOTS[s] && SLOTS[s].alive) add({ k: 'Action', label: `Continue as ${SLOTS[s].name} ${SLOTS[s].sur}`, sub: `Age ${SLOTS[s].age} · slot ${s}`, icon: 'scroll', run: () => H.continue({ slot: String(s) }) });
    }
    for (const id of NOLIFE_PAGES) if (PAGES[id]) add({ k: 'Page', label: PAGES[id].title, sub: 'Opens in a window', icon: (NAV_OF[id] || {}).icon || 'scroll', run: () => openSheet('page', { id }) });
  }
  add({ k: 'Setting', label: sndOn() ? 'Turn music off' : 'Turn music on', kw: 'sound audio music mute volume', sub: 'Music and Sound', icon: sndOn() ? 'mute' : 'sound', run: () => H.sndtoggle() });
  for (const [k, label] of [['theme', 'Theme and accent'], ['size', 'Text size'], ['weight', 'Text weight'], ['fps', 'Frame rate'], ['tips', 'Hover explanations'], ['speed', 'Event text speed']]) add({ k: 'Setting', label, sub: 'Settings', icon: 'gear', run: () => L ? palGo('settings', k === 'fps' ? 'set.perf' : ['tips'].includes(k) ? 'set.play' : ['size', 'weight', 'speed'].includes(k) ? 'set.read' : 'set.look') : openSheet('page', { id: 'settings' }) });
  return out;
}
function palGo(page, accId) { if (accId) UI.open[accId] = true; goPage(page); if (accId) setTimeout(() => { const el = $(`[data-acc="${accId}"]`); if (el) el.scrollIntoView({ block: 'start', behavior: RM() ? 'auto' : 'smooth' }); }, 40); }
function palOpenPerson(p) {
  const pg = ROLE_PAGE(p); UI.open['p.' + p.id] = true; goPage(pg);
  setTimeout(() => { const el = $(`[data-acc="p.${p.id}"]`); if (el) { el.scrollIntoView({ block: 'center', behavior: RM() ? 'auto' : 'smooth' }); el.classList.add('pulse-hl'); setTimeout(() => el.classList.remove('pulse-hl'), 1600); } }, 40);
}
function palScore(item, q) {
  if (!q) return 1;
  const t = item.label.toLowerCase(), s = (item.sub || '').toLowerCase(), k = item.k.toLowerCase();
  if (t === q) return 100; if (t.startsWith(q)) return 80;
  if (t.split(/[\s’']+/).some(w => w.startsWith(q))) return 65;
  if ((item.kw || '').toLowerCase().split(/\s+/).some(w => w && w.startsWith(q))) return 60;
  if (t.includes(q)) return 50; if (k.startsWith(q)) return 30; if (s.includes(q)) return 22;
  let i = 0; for (const ch of t) { if (ch === q[i]) i++; if (i === q.length) return 12; }
  return 0;
}
function palFilter() {
  const q = PAL.q.trim().toLowerCase();
  let list;
  if (!q) {
    const rec = (UI.recent || []).filter(id => PAGES[id]).map(id => PAL.items.find(x => x.k === 'Page' && x.label === (NAV_OF[id] || {}).name)).filter(Boolean);
    const acts = PAL.items.filter(x => x.k === 'Action').slice(0, 4);
    list = [...rec.map(x => Object.assign({}, x, { grp: 'Recent' })), ...acts.map(x => Object.assign({}, x, { grp: 'Actions' })), ...PAL.items.filter(x => x.k === 'Page' && !rec.includes(x)).map(x => Object.assign({}, x, { grp: 'Pages' }))];
  } else {
    list = PAL.items.map(x => ({ x, s: palScore(x, q) })).filter(o => o.s > 0).sort((a, b) => b.s - a.s || a.x.label.length - b.x.label.length).slice(0, 14).map(o => Object.assign({}, o.x, { grp: o.x.k }));
  }
  PAL.shown = list; PAL.sel = Math.min(PAL.sel, Math.max(0, list.length - 1));
}
function palRender() {
  const host = $('#palette'); if (!host) return;
  palFilter();
  let lastG = null;
  const rows = PAL.shown.map((it, i) => { const head = it.grp !== lastG ? `<li class="pal-g">${esc(it.grp)}</li>` : ''; lastG = it.grp;
    return `${head}<li><button class="pal-row${i === PAL.sel ? ' on' : ''}${it.off ? ' off' : ''}" data-pal="${i}">${icon(it.icon)}<span><b>${esc(it.label)}</b><small>${esc(it.sub || '')}</small></span><em>${esc(it.k)}</em></button></li>`; }).join('');
  $('#pal-list').innerHTML = rows || '<li class="pal-empty">Nothing matches. Try a page, a person’s name, a skill, or a town.</li>';
  const on = host.querySelector('.pal-row.on'); if (on) on.scrollIntoView({ block: 'nearest' });
}
function openPalette() {
  if (PAL.open) return;
  tipHide(); PAL.open = true; PAL.q = ''; PAL.sel = 0; PAL.items = palIndex();
  const host = document.createElement('div'); host.id = 'palette'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true'); host.setAttribute('aria-label', 'Quick jump');
  host.innerHTML = `<div class="pal-scrim" data-palx="1"></div><div class="pal-box"><label class="pal-in">${icon('search')}<input id="pal-q" type="text" autocomplete="off" spellcheck="false" placeholder="Jump to a page, person, skill, story, or town" aria-label="Search"><kbd>Esc</kbd></label><ul class="pal-list" id="pal-list" role="listbox"></ul><p class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Ctrl</kbd><kbd>K</kbd> or <kbd>/</kbd> anytime</span></p></div>`;
  document.body.appendChild(host);
  palRender();
  const inp = $('#pal-q'); inp.focus();
  inp.addEventListener('input', () => { PAL.q = inp.value; PAL.sel = 0; palRender(); });
  host.addEventListener('click', (e) => { if (e.target.closest('[data-palx]')) return closePalette(); const r = e.target.closest('[data-pal]'); if (r) palRun(+r.dataset.pal); });
  host.addEventListener('mousemove', (e) => { const r = e.target.closest('[data-pal]'); if (r && +r.dataset.pal !== PAL.sel) { PAL.sel = +r.dataset.pal; host.querySelectorAll('.pal-row').forEach((b, i) => b.classList.toggle('on', i === PAL.sel)); } });
}
function closePalette() { PAL.open = false; const h = $('#palette'); if (h) h.remove(); }
function palRun(i) { const it = PAL.shown[i]; if (!it) return; closePalette(); try { it.run(); } catch (err) { console.error(err); } }
function palKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); closePalette(); return true; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = PAL.shown.length; if (!n) return true; PAL.sel = (PAL.sel + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; palRender(); return true; }
  if (e.key === 'Enter') { e.preventDefault(); palRun(PAL.sel); return true; }
  return false;
}
