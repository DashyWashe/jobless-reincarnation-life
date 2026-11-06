/* ===================== UI: SCREENS ===================== */
const SCROLLERS = ['navscroll', 'cscroll', 'sidechar', 'logscroll'];
function render() {
  const app = $('#app');
  const keep = {};
  for (const id of SCROLLERS) { const el = document.getElementById(id); if (el) keep[id] = el.scrollTop; }
  tipHide();
  const s = UI.screen;
  document.body.dataset.screen = s;
  if (s === 'title') app.innerHTML = titleScreen();
  else if (s === 'create') app.innerHTML = createScreen();
  else if (s === 'game') app.innerHTML = gameScreen();
  else if (s === 'dead') app.innerHTML = deathScreen();
  for (const id of SCROLLERS) { const el = document.getElementById(id); if (!el) continue; if (UI.resetScroll[id]) el.scrollTop = 0; else if (keep[id] !== undefined) el.scrollTop = keep[id]; }
  UI.resetScroll = {};
  for (const m of document.querySelectorAll('.wmap')) if (m.scrollWidth > m.clientWidth + 4) { const h = m.querySelector('.wm-town.sel .wm-dot') || m.querySelector('.wm-town.here .wm-dot'); if (h) { const svg = m.querySelector('svg'); const k = svg.getBoundingClientRect().width / 1000; m.scrollLeft = Math.max(0, (+h.getAttribute('cx')) * k - m.clientWidth / 2); } }
  renderSheet();
  if (s === 'title') startSky(); else stopSky();
  sndMood();
  if (s === 'dead') countUp();
  if (UI.lastResult && s === 'game') { const f = $('#flash'); if (f && UI.flashLive) { flash(UI.lastResult.msg, UI.lastResult.tags); } }
  UI.flashLive = false;
}
function crest(size) {
  return `<svg class="crest-svg" viewBox="0 0 48 48" width="${size || 28}" height="${size || 28}" aria-hidden="true"><path d="M24 3 41 10v13c0 10-7.3 18.2-17 22-9.7-3.8-17-12-17-22V10z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M24 9 36 14v9c0 7-5.1 12.8-12 15.6C17.1 35.8 12 30 12 23v-9z" fill="none" stroke="currentColor" stroke-width=".9" opacity=".55"/><path d="M24 14v20M17 20l7 4 7-4M19 29h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="24" cy="14" r="1.8" fill="currentColor"/></svg>`;
}

/* ---------- TITLE ---------- */
function titleScreen() {
  const last = SLOTS[META.lastSlot] && SLOTS[META.lastSlot].alive ? SLOTS[META.lastSlot] : [1, 2, 3].map(s => SLOTS[s]).find(x => x && x.alive);
  const lastSlot = last ? +Object.keys(SLOTS).find(k => SLOTS[k] === last) : null;
  const item = (a, ic, t, sub, data, cls) => `<button class="tm${cls ? ' ' + cls : ''}" data-a="${a}"${Object.entries(data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('')}>${icon(ic)}<span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}</span>${icon('chev', 'tm-chev')}</button>`;
  const sOn = sndOn();
  return `<section class="title">
    <canvas id="sky" aria-hidden="true"></canvas><div class="title-vignette" aria-hidden="true"></div>
    <button class="title-snd${sOn ? ' on' : ''}" data-a="sndtoggle" aria-pressed="${sOn}" title="${sOn ? 'Turn music and sound off' : 'Turn on music and sound'}">${icon(sOn ? 'sound' : 'mute')}<span>${sOn ? 'Music on' : 'Music off'}</span></button>
    <div class="title-inner">
      <div class="title-crest">${crest(56)}</div>
      <p class="title-eyebrow">A life in the Six-Faced World</p>
      <h1 class="logo"><span>Jobless</span><span>Reincarnation</span></h1>
      <div class="orn" aria-hidden="true"><i></i></div>
      <nav class="title-menu">
        ${last ? item('continue', 'scroll', 'Continue', `${esc(last.name)} ${esc(last.sur)} · age ${last.age} · ${esc(TOWN[last.town].name)}`, { slot: lastSlot }, 'primary') : ''}
        ${item('newlife', 'sparkle', 'Begin a New Life', 'Be born into the world', null, last ? '' : 'primary')}
        ${item('sheet', 'book', 'Saved Lives', `${[1, 2, 3].filter(s => SLOTS[s]).length} of 3 slots in use`, { type: 'slots' })}
        ${item('pagemodal', 'star', 'Legacy Shop', `${fmt(META.lp)} Legacy Points`, { id: 'shop' })}
        ${item('pagemodal', 'trophy', 'Achievements', `${Object.keys(META.ach).length} of ${ACHIEVEMENTS.length}`, { id: 'achievements' })}
        ${item('pagemodal', 'skull', 'Hall of Lives', `${META.hall.length} remembered`, { id: 'hall' })}
        <div class="tm-row">${item('pagemodal', 'globe', 'Compendium', '', { id: 'compendium' }, 'half')}${item('pagemodal', 'gem', 'Trait Codex', '', { id: 'codex' }, 'half')}${item('pagemodal', 'gear', 'Settings', '', { id: 'settings' }, 'half')}${item('pagemodal', 'bolt', 'Admin', '', { id: 'admin' }, 'half')}</div>
      </nav>
      <p class="title-foot"><span>${fmt(META.lp)} Legacy Points</span><span>${META.lives} ${META.lives === 1 ? 'life' : 'lives'} lived</span><span>${discTotal()} of ${discMax()} discovered</span><span id="cloudtag">${cloudLabel()}</span></p>
      <p class="title-legal">An unofficial fan work inspired by Mushoku Tensei. Not affiliated with its creators or publishers.</p>
    </div>
  </section>`;
}
UI.cloudChanged = () => { const el = $('#cloudtag'); if (el) el.textContent = cloudLabel(); const s = $('.tb-save'); if (s) s.dataset.state = Store.cloud; };

/* ---------- CREATE ---------- */
const CSTEPS = [['identity', 'Identity'], ['bloodline', 'Bloodline'], ['appearance', 'Appearance'], ['family', 'Family'], ['birthplace', 'Birthplace'], ['fate', 'Fate & Traits'], ['perks', 'Vows & Perks']];
function upgList() { return UPGRADES.filter(u => META.upg[u.id]).map(u => u.name + (u.max > 1 ? ' ' + ROMANS[META.upg[u.id]] : '')).join(', '); }
function influence(d) {
  const tw = tagWeights(d);
  const lean = Object.entries(tw).filter(([k, v]) => v >= 1.3).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} +${Math.round((v - 1) * 100)}%`);
  const odds = tierOdds(d); const tot = odds.reduce((a, b) => a + b, 0);
  return { lean, luck: Math.round(birthLuck(d) * 100), odds: odds.map(o => o / tot * 100) };
}
function createScreen() {
  const d = UI.draft; const race = RACE[d.race]; const b = BG[d.bg]; const town = TOWN[d.town];
  const inf = influence(d);
  const sw = (list, key, cur) => list.map(c => `<button class="swatch${cur === c ? ' on' : ''}" style="--c:${c}" data-a="look" data-k="${key}" data-v="${c}" aria-label="${key} ${c}"></button>`).join('');
  const optRow = (key, names, cur) => `<div class="segs wrap">${names.map((n, i) => `<button class="${(cur || 0) === i ? 'on' : ''}" data-a="look" data-k="${key}" data-v="${i}">${n}</button>`).join('')}</div>`;
  const optRowS = (key, map, cur) => `<div class="segs wrap">${Object.entries(map).map(([k, n]) => `<button class="${(cur || 'none') === k ? 'on' : ''}" data-a="lookS" data-k="${key}" data-v="${k}">${n}</button>`).join('')}</div>`;
  const bonusLeft = 10 - Object.values(d.bonus).reduce((a, x) => a + x, 0);
  const adult = Object.assign({}, d.look);
  const styleCards = HAIR_STYLES.map((n, i) => `<button class="stylecard${(d.look.style || 0) === i ? ' on' : ''}" data-a="look" data-k="style" data-v="${i}">${portrait({ look: Object.assign({}, adult, { style: i }), race: d.race, sex: d.sex, age: 24, crop: 'close', garb: 'tunic', label: n, seed: d.name + i })}<span>${n}</span></button>`).join('');
  const towns = townsFor(d.race, d.bg);
  const steps = {
    identity: `<div class="form2"><div class="field-row"><label class="field"><span>Given name</span><input id="f-name" value="${esc(d.name)}" maxlength="18" autocomplete="off"></label><button class="icon-btn" data-a="rollname" aria-label="Random given name">${icon('dice')}</button></div>
      <div class="field-row"><label class="field"><span>Family name</span><input id="f-sur" value="${esc(d.sur)}" maxlength="18" autocomplete="off"></label><button class="icon-btn" data-a="rollsur" aria-label="Random family name">${icon('dice')}</button></div></div>
      <p class="lbl">Sex</p><div class="segs">${[['m', 'Male'], ['f', 'Female']].map(([k, n]) => `<button class="${d.sex === k ? 'on' : ''}" data-a="sex" data-v="${k}">${n}</button>`).join('')}</div>`,
    bloodline: `<div class="stack choose">${RACES.map(r => `<button class="row pick${d.race === r.id ? ' on' : ''}" data-a="race" data-v="${r.id}"><span class="r-main"><b data-tip="race:${r.id}">${r.name}</b><small>${esc(r.desc)}</small></span><span class="r-facts"><span>Lives ${r.life[0]}–${r.life[1]}</span><span>Adult at ${r.coming}</span><span>Mana ${mulTxt(r.pot)}</span><span>Aura ${mulTxt(r.aura)}</span></span></button>`).join('')}</div>`,
    appearance: `<div class="look-grid"><div><p class="lbl">Hair</p><div class="swatches">${sw(race.hair, 'hair', d.look.hair)}</div><p class="lbl">Eyes</p><div class="swatches">${sw(race.eyes, 'eyes', d.look.eyes)}</div><p class="lbl">Skin</p><div class="swatches">${sw(race.skin, 'skin', d.look.skin)}</div></div>
      <div><p class="lbl">Face</p>${optRow('face', FACE_SHAPES, d.look.face)}<p class="lbl">Brows</p>${optRow('brow', BROW_SHAPES, d.look.brow)}<p class="lbl">Eyes</p>${optRow('eye', EYE_SHAPES, d.look.eye)}<p class="lbl">Marks</p>${optRowS('mark', MARK_NAMES, d.look.mark)}${d.sex === 'm' ? `<p class="lbl">Facial hair <small class="muted">(adults)</small></p>${optRowS('beard', BEARD_NAMES, d.look.beard)}` : ''}</div></div>
      <p class="lbl">Hairstyle</p><div class="stylecards">${styleCards}</div>
      <p class="note">${icon('info')}This is your starting look. At birth your parents’ blood may shift your eyes, hair, skin and features, and their looks nudge your own. A lifetime adds the rest: age, scars, and whatever the barber does to you.</p>`,
    family: `<p class="muted">${bgAllowedFor(d.race).length} backgrounds are open to a ${race.name.toLowerCase()}. Rarer households start with more, and shape which traits you are born with.</p>
      ${TIERS.slice(0, 6).map(t => { const bs = bgAllowedFor(d.race).filter(x => x.tier === t.id); return bs.length ? `<h3 class="sect tier-${t.id}">${t.name}<small>${bs.length}</small></h3><div class="stack choose">${bs.map(x => `<button class="row pick tier-${x.tier}${d.bg === x.id ? ' on' : ''}" data-a="setbg" data-id="${x.id}"><span class="r-main"><b data-tip="bg:${x.id}">${esc(x.name)}</b><small>${esc(x.desc)}</small></span><span class="r-facts"><span>${WEALTH_NAMES[x.wealth]}</span><span>${CLASS_NAMES[x.cls]}</span></span></button>`).join('')}</div>` : ''; }).join('')}
      <h3 class="sect">Your parents</h3>${d.parents.length ? `<div class="stack">${d.parents.map(p => `<div class="row"><span class="pmini">${portrait({ look: p.look, race: p.race, sex: p.sex, age: p.age, mini: true, garb: b.cls >= 3 ? 'coat' : b.cls >= 1 ? 'doublet' : 'tunic', label: p.name })}</span><span class="r-main"><b>${esc(p.name)} ${esc(p.sur)}</b><small>${p.role === 'mother' ? 'Mother' : 'Father'} · ${esc(p.job)} · age ${p.age} · ${beautyWord(p.looks, p.sex).toLowerCase()}</small></span><span class="r-side">${p.traits.map(t => traitChip(t)).join('')}</span></div>`).join('')}</div>` : '<p class="empty">Unknown. You will be raised in an orphanage.</p>'}`,
    birthplace: `${towns.length < TOWNS.length ? `<p class="note">${icon('info')}Your family background limits where you can be born.</p>` : ''}${CONTINENTS.map(c => { const ts = towns.filter(t => t.cont === c.id); return ts.length ? `<h3 class="sect">${c.name}</h3><div class="stack choose">${ts.map(t => `<button class="row pick${d.town === t.id ? ' on' : ''}" data-a="settown" data-id="${t.id}"><span class="r-main"><b data-tip="town:${t.id}">${t.name}</b><small>${esc(t.realm)} · ${esc(t.note)}</small></span><span class="r-facts"><span>${SIZE_NAMES[t.size]}</span></span></button>`).join('')}</div>` : ''; }).join('')}`,
    fate: `<dl class="kv cols3"><div data-tip="season:${d.season}"><dt>Season</dt><dd>${SEASON[d.season].name}<small>${esc(SEASON[d.season].note)}</small></dd></div><div data-tip="omen:${d.omen}"><dt>Omen</dt><dd>${OMEN[d.omen].name}<small>${esc(OMEN[d.omen].note)}</small></dd></div><div data-tip="order:${d.order}"><dt>Birth order</dt><dd>${BORDER[d.order].name}<small>${esc(BORDER[d.order].note)}</small></dd></div></dl>
      <p class="lbl">Born traits <small class="muted">exactly three</small></p>
      <div class="tcards">${d.traits.map(id => { const t = TRAIT[id]; const lines = fxLines(t.fx || {}); return `<button class="tcard tier-${t.tier}" data-a="trait" data-id="${id}" data-tip="trait:${id}"><span class="tc-tier">${tierName(t.tier)}</span><b>${esc(t.name)}</b><p>${esc(TRAIT_LORE[id] || t.up)}</p><span class="mini-fx">${(lines.length ? lines.slice(0, 4) : [{ t: t.up, good: true }]).map(l => `<span class="${l.neutral ? 'n' : l.good ? 'g' : 'b'}">${esc(l.t)}</span>`).join('')}</span><small class="tc-src">${esc(d.sources[id] === 'fate' ? 'Rolled by fate' : 'Inherited ' + (d.sources[id] || ''))}</small></button>`; }).join('')}</div>
      <div class="btn-row">${btn('Re-roll fate', 'reroll', { icon: 'dice', disabled: d.rerolls <= 0, cost: d.rerolls > 900 ? 'Unlimited' : `${d.rerolls} left`, costIcon: false })}${META.upg.fate_chooser ? btn('Choose two traits', 'sheet', { data: { type: 'pickchosen' }, icon: 'gem' }) : ''}</div>
      <p class="lbl">Odds for each trait slot</p><table class="tbl odds"><tbody>${TIERS.map((t, i) => `<tr class="tier-${t.id}"><td data-tip="tier:${t.id}"><i class="gem"></i>${t.name}</td><td class="num">${inf.odds[i] < 0.1 ? inf.odds[i].toFixed(2) : inf.odds[i].toFixed(1)}%</td><td>${bar(inf.odds[i], 60, 'tierbar')}</td></tr>`).join('')}</tbody></table>
      <p class="note">${icon('info')}Rarity luck ${inf.luck ? '+' + inf.luck + '%' : 'none'}${inf.lean.length ? ' · Your birth leans toward ' + inf.lean.join(', ') : ''}. Re-rolling also re-rolls your season, omen, birth order, and parents.</p>`,
    perks: `<p class="lbl">A vow for this life <small class="muted">optional · a harder life for more Legacy Points</small></p><div class="vows">${[{ id: '', name: 'No vow', icon: 'sun', short: 'Live freely', lp: 0 }, ...VOWS].map(v => `<button class="vow${(d.vow || '') === v.id ? ' on' : ''}" data-a="vow" data-v="${v.id}"${v.id ? ` data-tip="vow:${v.id}"` : ''} aria-pressed="${(d.vow || '') === v.id}">${icon(v.icon)}<span><b>${esc(v.name)}</b><small>${esc(v.short)}</small></span>${v.lp ? `<em>+${Math.round(v.lp * 100)}% LP</em>` : ''}</button>`).join('')}</div>
      ${META.upg.chosen_start ? `<p class="lbl">Chosen Start <small class="muted">${bonusLeft} of 10 points left</small></p><div class="steppers">${['str', 'agi', 'int', 'cha', 'looks', 'luck'].map(s => `<div class="stepper"><span data-tip="stat:${s}">${STAT_FULL[s]}</span><button data-a="bonus" data-s="${s}" data-v="-1" ${d.bonus[s] <= 0 ? 'disabled' : ''} aria-label="Less">${icon('minus')}</button><b class="num">${d.bonus[s]}</b><button data-a="bonus" data-s="${s}" data-v="1" ${bonusLeft <= 0 ? 'disabled' : ''} aria-label="More">${icon('plus')}</button></div>`).join('')}</div>` : ''}
      ${upgList() ? `<p class="lbl">Active legacy perks</p><ul class="plain">${UPGRADES.filter(u => META.upg[u.id]).map(u => `<li><b data-tip="upg:${u.id}">${esc(u.name)}</b> <span class="muted">· ${esc(u.note)}</span></li>`).join('')}</ul>` : '<p class="muted">No legacy perks yet. Every life earns Legacy Points to spend in the Legacy Shop.</p>'}`,
  };
  const stepSum = { identity: `${esc(d.name)} ${esc(d.sur)}`, bloodline: race.name, appearance: HAIR_STYLES[d.look.style || 0], family: esc(b.name), birthplace: town.name, fate: d.traits.map(id => TRAIT[id].name).join(', '), perks: [d.vow && VOW[d.vow] ? VOW[d.vow].name : '', upgList() ? 'Perks active' : ''].filter(Boolean).join(' · ') || 'None' };
  const accs = CSTEPS.map(([id, n], i) => acc('cr.' + id, `<span class="stepn">${ROMANS[i + 1]}</span>${n}`, steps[id], { open: id === UI.cstepOpen || (UI.open['cr.' + id] === undefined && ['identity', 'bloodline', 'fate'].includes(id)), sum: stepSum[id] })).join('');
  const pa = UI.previewAge, page = pa === 'child' ? 7 : pa === 'adult' ? 26 : 70;
  return `<div class="shell create${UI.navOpen ? ' nav-open' : ''}${UI.sideOpen ? ' side-open' : ''}">
    <header class="topbar"><button class="tb-btn tb-nav" data-a="navtoggle" aria-label="Steps">${icon('menu')}</button><button class="tb-btn" data-a="totitle" aria-label="Back to title">${icon('back')}</button><div class="crest">${crest()}<span class="crest-t">A New Life</span></div>
      <div class="tb-right"><button class="btn small ghost" data-a="randomize">${icon('dice')}<span>Randomize all</span></button><button class="tb-btn tb-side" data-a="sidetoggle" aria-label="Preview">${icon('user')}</button></div></header>
    <nav class="nav"><button class="drawer-x" data-a="drawers" aria-label="Close steps">${icon('close')}</button><div class="nav-scroll" id="navscroll"><p class="nav-label">Creation</p>${CSTEPS.map(([id, n], i) => `<button class="nav-item" data-a="cstep" data-v="${id}"><span class="stepn">${ROMANS[i + 1]}</span><span>${n}<small>${stepSum[id]}</small></span></button>`).join('')}</div>
      <div class="nav-foot"><button class="agebtn" data-a="begin"><span class="ab-main"><b>Begin This Life</b><small>${esc(d.name)} ${esc(d.sur)}, ${race.name.toLowerCase()}</small></span></button></div></nav>
    <main class="center"><div class="center-scroll" id="cscroll"><div class="page">
      <header class="page-head"><p class="eyebrow">Creation</p><h1>A New Life</h1><p class="lede">Choose who you will be, or leave it to fate. Bloodline, family, and birthplace all shape the traits you are born with.</p><div class="orn"><i></i></div></header>
      <div class="stack">${accs}</div>
      <div class="create-go">${btn('Begin This Life', 'begin', { cls: 'primary big', icon: 'sparkle' })}</div>
    </div></div></main>
    <aside class="side"><button class="drawer-x" data-a="drawers" aria-label="Close preview">${icon('close')}</button><div class="side-char" id="sidechar"><section class="cc preview">
      <div class="pframe big">${portrait({ look: d.look, race: d.race, sex: d.sex, age: page, aging: pa === 'elder' ? .8 : 0, beauty: beautyOf(8 + (d.bonus.looks || 0) + (META.upg.fair_features || 0) + ((RACE[d.race] || RACE.human).st.looks || 0) + (d.parents.length ? Math.round((d.parents.reduce((a, p) => a + (p.looks == null ? 9 : p.looks), 0) / d.parents.length - 9) * .3) : 0)), crop: 'close', elder: pa === 'elder', garb: pa === 'child' ? (b.cls >= 3 ? 'coat' : b.cls >= 1 ? 'doublet' : 'tunic') : b.cls >= 4 ? 'mantle' : b.cls >= 3 ? 'coat' : b.cls >= 2 ? 'armor' : 'tunic', label: d.name })}</div>
      <div class="segs mini center">${[['child', 'Child'], ['adult', 'Adult'], ['elder', 'Elder']].map(([k, n]) => `<button class="${pa === k ? 'on' : ''}" data-a="previewage" data-v="${k}">${n}</button>`).join('')}</div>
      <h2 class="cc-name">${esc(d.name)} <span>${esc(d.sur)}</span></h2>
      <p class="cc-sub">${d.sex === 'f' ? 'Female' : 'Male'} · <span data-tip="race:${d.race}">${race.name}</span></p>
      <dl class="kv"><div><dt>Family</dt><dd data-tip="bg:${d.bg}">${esc(b.name)}</dd></div><div><dt>Birthplace</dt><dd data-tip="town:${d.town}">${town.name}</dd></div><div><dt>Realm</dt><dd>${esc(town.realm)}</dd></div><div><dt>Season</dt><dd>${SEASON[d.season].name}</dd></div><div><dt>Omen</dt><dd>${OMEN[d.omen].name}</dd></div></dl>
      <p class="lbl">Born traits</p><div class="chips">${d.traits.map(id => traitChip(id)).join('')}</div>
      <div class="cc-go">${btn('Begin This Life', 'begin', { cls: 'primary big', icon: 'sparkle' })}</div>
    </section></div></aside>
    <div class="drawer-scrim" data-a="drawers"></div>
    <div class="mbar"><button class="mb" data-a="navtoggle">${icon('menu')}<span>Steps</span></button><button class="mb age" data-a="begin"><b>Begin</b><small>This life</small></button><button class="mb" data-a="sidetoggle">${icon('user')}<span>Preview</span></button></div>
  </div>`;
}

/* ---------- GAME SHELL ---------- */
function navHtml(L) {
  const badge = (id) => {
    if (id === 'overview' && L.queue.length) return '<em class="nb alert">!</em>';
    if (id === 'magic' || id === 'sword') { const ks = id === 'magic' ? MAGIC.map(m => m.id) : STYLES.map(s => s.id); const n = ks.filter(k => { const t = trialInfo(L, k); return t && t.ready && !t.reason; }).length; return n ? `<em class="nb gold" title="Trials ready">${n}</em>` : ''; }
    if (id === 'mana' && manaPhase(L) < 3 && L.age >= 1) return '<em class="nb dot" title="Growth window open"></em>';
    if (id === 'guild' && L.guild.reg && L.quests.length && TOWN[L.town].tags.includes('guild')) return `<em class="nb">${L.quests.length}</em>`;
    if (id === 'work' && !L.job && L.age >= 15 && L.jobBoard.length) return `<em class="nb">${L.jobBoard.length}</em>`;
    if (id === 'arcs') { const n = ARCS.filter(a => { const s = (L.arc[a.id] || 0); return s > 0 && s < 99; }).length; return n ? `<em class="nb">${n}</em>` : ''; }
    if (id === 'goals') return `<em class="nb muted">${(L.goalsDone || []).length}/${GOALS.length}</em>`;
    return '';
  };
  return NAV.map(g => `<div class="nav-grp"><p class="nav-label">${g.g}</p>${g.items.map(([id, ic, n]) => `<button class="nav-item${UI.page === id ? ' on' : ''}" data-a="page" data-v="${id}"${UI.page === id ? ' aria-current="page"' : ''}>${icon(ic)}<span>${n}</span>${badge(id)}</button>`).join('')}</div>`).join('');
}
function ageBtnHtml(L) {
  const toPlan = L.planAuto !== false && planList(L).length;
  const left = !L.queue.length && L.ap > 0 ? `<em class="ab-left${toPlan ? ' plan' : ''}">${L.ap} action${L.ap === 1 ? '' : 's'} ${toPlan ? 'go to your plan' : 'unused'}</em>` : '';
  return `<button class="agebtn${L.queue.length ? ' alert' : ''}${left ? ' has-left' : ''}" data-a="age"><span class="ab-ic">${icon(L.queue.length ? 'scroll' : 'hourglass')}</span><span class="ab-main"><b>${L.queue.length ? 'Decision Pending' : 'Age Up'}</b><small>${L.queue.length ? esc(L.queue[0].title) : `Year ${L.year + 1} · age ${L.age + 1}`}</small>${left}</span><kbd>Space</kbd></button>`;
}
function charCard(L) {
  const M = mods(L);
  const skills = [...MAGIC.map(m => m.id), ...STYLES.map(s => s.id)].filter(k => skillXp(L, k) > 0).sort((a, b) => rankOf(L, b) - rankOf(L, a) || skillXp(L, b) - skillXp(L, a));
  const gear = SLOTS_GEAR.filter(([k]) => L.gear[k]);
  const spMax = L.spMax || spFor(L);
  return `<section class="cc">
    <div class="cc-top"><button class="pframe${lookTier(L)}" data-a="sheet" data-type="profile" aria-label="Profile and appearance">${lifePortrait(L, { crop: 'close' })}</button>
      <div class="cc-id"><p class="cc-stage" data-tip="term:stage">${lifeStage(L)}</p><h2 class="cc-name">${esc(L.name)} <span>${esc(L.sur)}</span></h2>${L.epithet ? `<p class="cc-epi">“${esc(L.epithet)}”</p>` : ''}
        <p class="cc-sub"><b class="num" id="agenum">Age ${L.age}</b> · <span data-tip="race:${L.race}">${RACE[L.race].name}</span> · ${L.sex === 'f' ? 'Female' : 'Male'}</p>
        <p class="cc-sub muted">${esc(BG[L.bg].name)}</p><p class="cc-looks${L.st.looks >= 14 && !isKid(L) ? ' hi' : ''}" data-tip="looks:me">${icon(L.st.looks >= 14 && !isKid(L) ? 'sparkle' : 'mirror')}${esc(looksWord(L))}</p>${L.vow && VOW[L.vow] ? `<p class="cc-vow" data-tip="vow:${L.vow}">${icon(VOW[L.vow].icon)}${esc(VOW[L.vow].name)}</p>` : ''}</div></div>
    <div class="cc-vitals"><div class="vit" data-tip="term:hp"><span><i class="st-ic sm hp">${icon('heart')}</i>Health</span>${bar(L.hp, maxHp(L), 'hp')}<b class="st-v num">${whole(L.hp)}<i>/${whole(maxHp(L))}</i></b></div>
      <div class="vit" data-tip="term:stress"><span><i class="st-ic sm stress">${icon('storm')}</i>Stress</span>${bar(L.stress, 100, 'stress')}<b class="st-v num">${whole(L.stress)}</b></div></div>
    <div class="cc-points"><div data-tip="term:ap"><small>${icon('hourglass')}Actions</small>${pips(L.ap, L.apMax || L.ap, 'ap')}<b class="num">${L.ap}/${L.apMax || L.ap}</b></div><div data-tip="term:sp"><small>${icon('people')}Social</small>${pips(L.sp, spMax, 'sp')}<b class="num">${L.sp}/${spMax}</b></div></div>
    <dl class="cc-quick"><div data-tip="term:power"><dt>${icon('bolt')}Power</dt><dd class="st-v num">${whole(power(L))}</dd></div><div><dt>${icon('coin')}Gold</dt><dd class="st-v num">${whole(L.gold)}</dd></div><div data-tip="term:fame"><dt>${icon('star')}Fame</dt><dd>${FAME_NAMES[fameTier(L.fame)]}</dd></div></dl>
    ${acc('cc.attr', 'Attributes', `<div class="st-grid">${['str', 'agi', 'int', 'cha', 'looks', 'luck'].map(k => statRow(k, STAT_FULL[k], whole(L.st[k]), 'stat:' + k)).join('')}${statRow('read', 'Reading', whole(L.read), 'term:reading')}${statRow('mana', 'Mana', whole(L.mana.cap), 'mana:cap')}</div>`, { open: true, cls: 'mini' })}
    ${acc('cc.mastery', 'Mastery', `<ul class="mastery">${skills.length ? skills.slice(0, 8).map(k => `<li><span data-tip="skill:${k}">${STYLE[k] ? STYLE[k].name : MAGIC_ID[k].name + ' Magic'}</span>${rankBadge(rankOf(L, k), k)}</li>`).join('') : '<li class="muted">Nothing trained yet.</li>'}<li><span data-tip="aura:${L.aura.stage}">Battle Aura</span><b class="sm">${L.aura.stage ? AURA_STAGES[L.aura.stage] : (L.aura.known && L.aura.compat <= 0 ? 'None' : 'Unawakened')}</b></li>${L.mana.chantless ? '<li><span data-tip="mana:chant">Chantless casting</span><b class="sm ok">Yes</b></li>' : ''}</ul>`, { open: true, cls: 'mini' })}
    ${acc('cc.traits', `Traits <small>${L.traits.length + L.earned.length}</small>`, `<div class="chips">${L.traits.map(id => traitChip(id)).join('')}</div>${L.earned.length ? `<p class="lbl">Earned</p><div class="chips">${L.earned.map(id => traitChip(id)).join('')}</div>` : ''}`, { open: true, cls: 'mini' })}
    ${gear.length ? acc('cc.gear', 'Equipment', `<ul class="mastery">${gear.map(([k, n]) => `<li><span class="muted">${n}</span><b class="sm" data-tip="item:${L.gear[k]}">${esc(ITEM[L.gear[k]].name)}</b></li>`).join('')}</ul>`, { open: false, cls: 'mini' }) : ''}
  </section>`;
}
function gameScreen() {
  const L = UI.L; const town = TOWN[L.town];
  const pg = PAGES[UI.page] ? UI.page : 'overview'; const P = PAGES[pg];
  const lede = typeof P.lede === 'function' ? P.lede(L) : P.lede;
  let body = ''; try { body = P.render(L); } catch (e) { console.error(e); body = `<p class="why">This page hit an error: ${esc(e.message)}</p>`; }
  const sf = UI.sideLogF || 'all';
  return `<div class="shell game${UI.navOpen ? ' nav-open' : ''}${UI.sideOpen ? ' side-open' : ''}">
    <header class="topbar">
      <button class="tb-btn tb-nav" data-a="navtoggle" aria-label="Open menu">${icon('menu')}</button>
      <div class="crest">${crest()}<span class="crest-t">Jobless Reincarnation</span></div>
      <nav class="crumbs" aria-label="Location"><span>${CONT[town.cont].name}</span><i>›</i>${town.realm !== CONT[town.cont].name ? `<span>${esc(town.realm)}</span><i>›</i>` : ''}<b data-tip="town:${town.id}">${town.name}</b></nav>
      <div class="tb-life"><b>${esc(L.name)}</b><small>Age ${L.age}</small></div>
      <div class="tb-right">
        <button class="tb-search" data-a="palette" aria-label="Quick jump (Ctrl K)">${icon('search')}<span>Search</span><kbd>Ctrl K</kbd></button>
        <span class="tb-date" data-tip="term:date">Year ${L.year}<small>${SEASON[L.season].name}</small></span>
        <span class="tb-gold">${icon('coin')}<b class="num">${fmt(L.gold)}</b></span>
        <button class="tb-snd" data-a="sndtoggle" aria-pressed="${sndOn()}" aria-label="${sndOn() ? 'Turn music and sound off' : 'Turn on music and sound'}" title="${sndOn() ? 'Music and sound on' : 'Music and sound off'}">${icon(sndOn() ? 'sound' : 'mute')}</button>
        <span class="tb-save" data-state="${Store.cloud}" title="${esc(cloudLabel())}">${icon(Store.cloud === 'on' ? 'cloud' : 'bookmark')}</span>
        <button class="tb-btn tb-side" data-a="sidetoggle" aria-label="Character and story">${icon('user')}</button>
      </div>
    </header>
    <nav class="nav" aria-label="Pages"><button class="drawer-x" data-a="drawers" aria-label="Close menu">${icon('close')}</button><div class="nav-scroll" id="navscroll">${navHtml(L)}</div>
      <div class="nav-foot">${ageBtnHtml(L)}<div class="nav-sub"><button data-a="savequit" title="Save your life and return to the title screen">${icon('door')}<span>Save and exit</span></button><button data-a="confirm" data-c="endlife" title="End this life now">${icon('hourglass')}<span>End life</span></button></div></div></nav>
    <main class="center"><div class="center-scroll" id="cscroll"><div class="page p-${pg}">
      <header class="page-head"><span class="ph-mark" aria-hidden="true">${icon((NAV_OF[pg] || {}).icon || 'scroll')}</span><p class="eyebrow">${esc(P.group || '')}</p><h1>${esc(P.title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}<div class="orn"><i></i></div></header>
      <div class="stack">${body}</div>
    </div></div></main>
    <aside class="side" aria-label="Character and story"><button class="drawer-x" data-a="drawers" aria-label="Close panel">${icon('close')}</button>
      <div class="side-char" id="sidechar">${charCard(L)}</div>
      <div class="side-story"><header class="story-head"><h3>${icon('quill')}Chronicle</h3><div class="segs mini">${[['all', 'All'], ['story', 'Story'], ['deeds', 'Deeds']].map(([k, n]) => `<button class="${sf === k ? 'on' : ''}" data-a="sidelogf" data-v="${k}">${n}</button>`).join('')}</div></header>
        <div class="story-scroll" id="logscroll">${logHtml(L, sf, 160)}</div></div>
    </aside>
    <div class="drawer-scrim" data-a="drawers"></div>
    <div class="mbar"><button class="mb" data-a="navtoggle">${icon('menu')}<span>Menu</span></button>${ageBtnHtml(L).replace('class="agebtn', 'class="mb age agebtn')}<button class="mb" data-a="sidetoggle">${icon('user')}<span>Character</span></button></div>
    <div id="flash" role="status" aria-live="polite" data-a="dismissflash"></div>
  </div>`;
}

/* ---------- DEATH ---------- */
function deathScreen() {
  const L = UI.L; const sc = L.final || lifeScore(L);
  const kids = L.people.filter(p => p.alive && p.role === 'child');
  const br = bestRankAll(L);
  const born = L.year - L.age;
  return `<section class="death"><div class="death-inner">
    <div class="tomb"><div class="pframe big">${lifePortrait(L, { crop: 'close' })}</div>
      <p class="eyebrow">Here lies</p><h1>${esc(L.name)}${L.epithet ? ` <em>“${esc(L.epithet)}”</em>` : ''} ${esc(L.sur)}</h1>
      <p class="tomb-dates">Year ${born} – Year ${L.year} · ${L.age} years</p>
      <p class="muted">${RACE[L.race].name} · ${esc(cap1(L.deathCause || 'old age'))}</p>
      <div class="orn"><i></i></div><p class="epitaph">${esc(epitaph(L))}</p></div>
    <div class="death-grid">
      <section class="card"><header class="card-h"><h3>${icon('gem')}Legacy earned</h3><b class="num big gold-t" id="lpcount" data-to="${sc.total}">0</b></header>
        <table class="tbl"><tbody>${sc.rows.map(r => `<tr><td>${esc(r[0])}</td><td class="num">+${r[1]}</td></tr>`).join('')}${sc.mult > 1 ? `<tr><td>Legacy bonus</td><td class="num">${mulTxt(sc.mult)}</td></tr>` : ''}</tbody></table>
        <p class="note">Total Legacy Points: <b class="num">${fmt(META.lp)}</b></p></section>
      <section class="card"><header class="card-h"><h3>${icon('scroll')}A life in summary</h3></header>
        <dl class="kv cols"><div><dt>Best rank</dt><dd>${RANKS[br]}</dd></div><div><dt>Fame</dt><dd>${FAME_NAMES[fameTier(L.fame)]}</dd></div><div><dt>Gold</dt><dd class="num">${fmt(L.gold)}</dd></div><div><dt>Children</dt><dd class="num">${L.people.filter(p => p.role === 'child').length}</dd></div><div><dt>Goals</dt><dd class="num">${(L.goalsDone || []).length} of ${GOALS.length}</dd></div><div><dt>Stories completed</dt><dd class="num">${ARCS.filter(a => (L.arc[a.id] || 0) >= 99).length}</dd></div></dl>
        <div class="chips">${L.traits.map(id => traitChip(id)).join('')}${L.earned.map(id => traitChip(id)).join('')}</div>
        ${L.achLife.length ? `<p class="lbl">Achievements this life</p><div class="chips">${L.achLife.map(a => `<span class="tagc on" data-tip="ach:${a}">${esc(ACH[a].name)}</span>`).join('')}</div>` : ''}</section>
      ${L.mile && L.mile.length ? `<section class="card wide"><header class="card-h"><h3>${icon('feather')}Memories</h3><span class="muted sm">${L.mile.length} moments, by age</span></header>${memoriesHtml(L)}</section>` : ''}
      ${L.hist && L.hist.a.length > 2 ? `<section class="card wide"><header class="card-h"><h3>${icon('chart')}A life in numbers</h3>${L.discN ? `<span class="muted sm" data-tip="term:compendium">${icon('globe')} ${L.discN} new to your Compendium</span>` : ''}</header>${lifeStats(L)}</section>` : ''}
      ${META.upg.heirloom ? `<section class="card"><header class="card-h"><h3>${icon('gem')}Heirloom trait</h3></header><p class="muted">Choose a born trait for your next birth to carry (50% chance).</p><div class="chips">${L.traits.map(id => `<button class="tchip tier-${TRAIT[id].tier}${META.heirloom === id ? ' on' : ''}" data-a="heirloom" data-id="${id}" data-tip="trait:${id}"><i class="gem"></i><span>${esc(TRAIT[id].name)}</span></button>`).join('')}</div></section>` : ''}
      <section class="card wide"><header class="card-h"><h3>${icon('sparkle')}What comes next</h3></header>
        ${kids.length ? `<p class="muted">Continue the story as one of your children. They inherit most of your estate.</p><div class="stack">${kids.map(c => `<button class="row pick" data-a="heir" data-id="${c.id}"><span class="pmini">${npcPortrait(c)}</span><span class="r-main"><b>${esc(c.name)} ${esc(L.sur)}</b><small>Age ${c.age} · ${(c.traits || []).map(t => TRAIT[t].name).join(', ') || 'No notable traits'}</small></span>${icon('chev')}</button>`).join('')}</div>` : ''}
        <div class="btn-row">${btn('Begin a new life', 'newlife', { cls: 'primary', icon: 'sparkle' })}${btn('Legacy Shop', 'pagemodal', { data: { id: 'shop' }, icon: 'star' })}${btn('Title screen', 'totitle', { cls: 'ghost' })}</div></section>
    </div></div></section>`;
}
function epitaph(L) {
  if (L.epithet) return `Known across the land as ${L.epithet}.`;
  if (ARCS.filter(a => (L.arc[a.id] || 0) >= 99).length >= 4) return 'Their story became one the world still tells.';
  if (bestRankAll(L) >= 5) return 'One of the strongest of their age.';
  if (L.people.filter(p => p.role === 'child').length >= 3) return 'Loved by a big, loud family.';
  if (L.job && JOB[L.job.id]) return `A ${JOB[L.job.id].ladder[L.job.lvl].toLowerCase()} who did honest work.`;
  if (L.age < 15) return 'Gone too soon.';
  return 'They lived, and that mattered.';
}
function countUp() {
  const el = $('#lpcount'); if (!el) return;
  const to = +el.dataset.to; if (RM() || UI.countedFor === (UI.L && UI.L.id)) { el.textContent = fmt(to); return; }
  UI.countedFor = UI.L && UI.L.id;
  const t0 = performance.now(); const dur = 1300;
  const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
