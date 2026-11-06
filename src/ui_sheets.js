/* ===================== UI: MODALS ===================== */
function openSheet(type, o) { tipHide(); UI.sheet = Object.assign({ type }, o || {}); renderSheet(); }
function closeSheet() { if (UI.sheet && (UI.sheet.type === 'event')) return; UI.sheet = null; renderSheet(); }
function renderSheet() {
  const host = $('#sheet');
  if (UI.screen === 'game' && UI.L && UI.L.queue.length && (!UI.sheet || (UI.sheet.type !== 'event' && UI.sheet.type !== 'eventresult'))) UI.sheet = { type: 'event' };
  const s = UI.sheet;
  if (!s) { host.innerHTML = ''; host.className = ''; document.body.classList.remove('locked'); return; }
  const fn = SHEETS[s.type]; if (!fn) { UI.sheet = null; host.innerHTML = ''; return; }
  const story = s.type === 'event' || s.type === 'eventresult';
  let inner = ''; try { inner = fn(s); } catch (e) { console.error(e); inner = `<p class="why">Something went wrong: ${esc(e.message)}</p>`; }
  host.className = 'open' + (story ? ' story' : '') + (s.type === 'page' ? ' wide' : '');
  host.innerHTML = `<div class="scrim" ${story ? '' : 'data-a="close"'}></div><div class="modal m-${s.type}" role="dialog" aria-modal="true">${story ? '' : `<button class="icon-btn modal-x" data-a="close" aria-label="Close">${icon('close')}</button>`}<div class="modal-body" id="modalbody">${inner}</div></div>`;
  document.body.classList.add('locked');
  if (s.type === 'event') { typewriter(); if (UI._evSnd !== (UI.L && UI.L.queue[0] && UI.L.queue[0].id + ':' + UI.L.age)) { UI._evSnd = UI.L && UI.L.queue[0] && UI.L.queue[0].id + ':' + UI.L.age; sfx('event'); } }
  if (s.type === 'eventresult') sfx('choice');
  const first = host.querySelector(story ? '.choice:not([disabled])' : '.modal-x'); if (first && !story) first.focus({ preventScroll: true });
}
function typewriter() {
  const el = $('.ev-text'); if (!el) return;
  const full = el.dataset.full; const speed = META.settings.speed;
  const ch = $('.ev-choices');
  if (RM() || speed === 'instant') { el.textContent = full; ch && ch.classList.add('show'); return; }
  const cps = speed === 'fast' ? 160 : 75; let i = 0; el.textContent = '';
  const t0 = performance.now();
  const step = (t) => { i = Math.floor((t - t0) / 1000 * cps); el.textContent = full.slice(0, i); if (i < full.length && !el.dataset.skip) requestAnimationFrame(step); else { el.textContent = full; ch && ch.classList.add('show'); } };
  requestAnimationFrame(step);
}
function evKicker(c) {
  if (c.arc && ARC[c.arc]) return `${ARC[c.arc].name} · Chapter ${ROMANS[c.ch] || c.ch}`;
  return c.kind || 'Event';
}
const SHEETS = {
  event() {
    const L = UI.L, c = L.queue[0];
    return `<article class="ev${c.arc ? ' is-arc' : ''}"><div class="ev-frame">
      <div class="ev-scene">${evScene(c)}<header class="ev-head"><span class="ev-kicker">${esc(evKicker(c))}</span><span class="ev-when">Age ${L.age} · Year ${L.year} · ${esc(TOWN[L.town].name)}</span></header>${c.fresh ? `<span class="ev-new" data-tip="term:compendium">${icon('globe')}New to your Compendium</span>` : ''}
      <div class="ev-emblem">${icon(c.icon || 'scroll')}</div></div>
      <h2 class="ev-title">${esc(c.title)}</h2><div class="orn"><i></i></div>
      <p class="ev-text" data-full="${esc(c.text)}" data-a="skiptype">${esc(c.text)}</p>
      <ol class="ev-choices">${c.choices.map((ch, i) => `<li><button class="choice" data-a="choose" data-k="${esc(ch.k)}" ${ch.disabled ? 'disabled' : ''}><span class="ch-n">${ROMANS[i + 1]}</span><span class="ch-t"><b>${ch.disabled ? icon('lock') : ''}${esc(ch.t)}</b>${ch.sub ? `<small>${esc(ch.sub)}</small>` : ''}${ch.disabled && ch.hint ? `<small class="req">${esc(ch.hint)}</small>` : ''}</span><kbd>${i + 1}</kbd></button></li>`).join('')}</ol>
    </div></article>`;
  },
  eventresult(s) {
    return `<article class="ev result"><div class="ev-frame">
      <div class="ev-scene short">${evScene(s.scene || {})}<header class="ev-head"><span class="ev-kicker">${esc(s.kicker || 'Outcome')}</span><span class="ev-when">Age ${UI.L.age} · Year ${UI.L.year}</span></header>
      <div class="ev-emblem">${icon((s.scene && s.scene.icon) || 'scroll')}</div></div>
      <h2 class="ev-title">${esc(s.title)}</h2><div class="orn"><i></i></div>
      <p class="ev-res">${esc(s.text || 'Life goes on.')}</p>
      ${s.tags && s.tags.length ? `<div class="tags">${s.tags.map(t => `<span class="tag ${t.c || ''}">${esc(t.t)}</span>`).join('')}</div>` : ''}
      <div class="ev-go"><button class="btn primary" data-a="evcontinue"><span>Continue</span><kbd>Enter</kbd></button></div>
    </div></article>`;
  },
  profile() {
    const L = UI.L, ap = appearanceOf(L);
    return `<div class="prof"><div class="prof-side"><div class="pframe big${lookTier(L)}">${lifePortrait(L, { crop: 'close' })}</div>
      <div class="looks-card"><p class="looks-word">${ap.v >= 14 && !isKid(L) ? icon('sparkle') : ''}${esc(ap.word)}</p><p class="looks-line">${esc(ap.line)}</p>
      <dl class="looks-dl">${ap.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${L.alive && L.age >= 4 ? btn('Visit the barber', 'sheet', { data: { type: 'barber' }, icon: 'mirror', cls: 'small' }) : ''}</div></div><div class="prof-main">
      <p class="eyebrow">${lifeStage(L)}</p><h2>${esc(L.name)} ${esc(L.sur)}</h2>${L.epithet ? `<p class="cc-epi">“${esc(L.epithet)}”</p>` : ''}
      <dl class="kv cols"><div><dt>Born</dt><dd>Year ${L.year - L.age}, ${TOWN[L.home].name}</dd></div><div><dt>Season</dt><dd data-tip="season:${L.season}">${SEASON[L.season].name}</dd></div><div><dt>Omen</dt><dd data-tip="omen:${L.omen}">${OMEN[L.omen].name}</dd></div><div><dt>Birth order</dt><dd data-tip="order:${L.order}">${BORDER[L.order].name}</dd></div>
        <div><dt>Family</dt><dd data-tip="bg:${L.bg}">${esc(BG[L.bg].name)}</dd></div><div><dt>Generation</dt><dd>${L.gen}</dd></div><div><dt>Mana potential</dt><dd>${L.mana.revealed ? potGrade(L.mana.pot) : 'Hidden'}</dd></div><div><dt>Aura</dt><dd>${L.aura.compat <= 0 ? (L.aura.known ? 'None' : 'Unknown') : (L.aura.stage || L.mana.revealed ? potGrade(L.aura.compat) : 'Unknown')}</dd></div></dl>
      <p class="lbl">Born traits</p><div class="chips">${L.traits.map(id => traitChip(id, { src: L.traitSrc[id] && L.traitSrc[id] !== 'fate' ? L.traitSrc[id] : '' })).join('')}</div>
      <p class="lbl">Earned traits</p><div class="chips">${L.earned.length ? L.earned.map(id => traitChip(id)).join('') : '<span class="muted">None yet. Great deeds earn traits.</span>'}</div>
      ${L.injuries.length ? `<p class="lbl">Lasting injuries</p><p class="muted">${L.injuries.map(esc).join(', ')}</p>` : ''}${L.flags.pet ? `<p class="muted">Companion: ${esc(L.flags.pet)}</p>` : ''}</div></div>`;
  },
  barber() {
    const L = UI.L, cost = barberCost(L), cur = L.look.style || 0;
    if (L.age < 4) return `<p class="eyebrow">Appearance</p><h2>The Barber’s Chair</h2><p class="muted">There is barely enough hair on your head to cut. Come back when you are a little older.</p>`;
    const cards = HAIR_STYLES.map((n, i) => `<button class="stylecard${cur === i ? ' on' : ''}" data-a="barber" data-v="${i}"${cur === i ? ' aria-current="true"' : ''}>${lifePortrait(L, { look: Object.assign({}, L.look, { style: i }), crop: 'close' })}<span>${n}</span></button>`).join('');
    const beard = L.sex === 'm' && L.age >= 18 ? `<p class="lbl">Facial hair <small class="muted">free</small></p><div class="segs wrap">${Object.entries(BEARD_NAMES).map(([k, n]) => `<button class="${(L.look.beard || 'none') === k ? 'on' : ''}" data-a="beard" data-v="${k}">${n}</button>`).join('')}</div>` : '';
    return `<p class="eyebrow">Appearance</p><h2>The Barber’s Chair</h2><p class="muted">${cost ? `A new cut costs ${cost} gold. You have ${fmt(L.gold)}.` : 'Your family takes care of your hair while you are young. Pick any style.'} Your coloring, face and scars stay with you.</p>${beard}<p class="lbl">Hairstyle</p><div class="stylecards barber">${cards}</div>`;
  },
  person(s) {
    const L = UI.L; const p = person(L, s.id); if (!p) return '<p>They are gone.</p>';
    UI.open['p.' + p.id] = true;
    return `<div class="stack">${personAcc(L, p)}</div>`;
  },
  trait(s) {
    const html = tipHtml('trait:' + s.id);
    return html.replace('<div class="tt">', '<div class="tt inline big">');
  },
  page(s) {
    const P = PAGES[s.id]; if (!P) return '';
    const L = UI.L || null;
    let body = ''; try { body = P.render(L); } catch (e) { body = `<p class="muted">Begin a life to see this page.</p>`; }
    const lede = typeof P.lede === 'function' ? (L ? P.lede(L) : '') : P.lede;
    return `<div class="page in-modal"><header class="page-head"><p class="eyebrow">${esc(P.group || '')}</p><h1>${esc(P.title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}<div class="orn"><i></i></div></header><div class="stack">${body}</div></div>`;
  },
  slots() {
    return `<h2 class="m-title">Saved Lives</h2><div class="stack">${[1, 2, 3].map(n => { const L = SLOTS[n];
      return `<div class="row slot">${L ? `<span class="pmini">${lifePortrait(L, { mini: true })}</span><span class="r-main"><b>${esc(L.name)} ${esc(L.sur)}</b><small>${L.alive ? 'Age ' + L.age : 'Died at ' + L.age} · ${RACE[L.race].name} · ${esc(TOWN[L.town].name)} · Year ${L.year}</small></span><span class="r-side">${L.alive ? btn('Play', 'continue', { data: { slot: n }, cls: 'small primary' }) : ''}${btn('Delete', 'confirm', { data: { c: 'delslot', slot: n }, cls: 'small ghost' })}</span>` : `<span class="r-main"><b>Empty slot ${ROMANS[n]}</b><small>Room for one more life</small></span>`}</div>`; }).join('')}</div>`;
  },
  pickslot() {
    return `<h2 class="m-title">Choose a Save Slot</h2><p class="muted">All three slots hold a life. Choose one to replace.</p><div class="stack">${[1, 2, 3].map(n => { const L = SLOTS[n];
      return `<button class="row pick" data-a="useslot" data-slot="${n}">${L ? `<span class="pmini">${lifePortrait(L, { mini: true })}</span><span class="r-main"><b>Replace ${esc(L.name)} ${esc(L.sur)}</b><small>${L.alive ? 'Age ' + L.age : 'Died at ' + L.age}</small></span>` : `<span class="r-main"><b>Slot ${ROMANS[n]}</b></span>`}</button>`; }).join('')}</div>`;
  },
  export() {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify({ meta: META, slots: SLOTS }))));
    return `<h2 class="m-title">Export Save Code</h2><p class="muted">Copy this code and paste it into Import on another device.</p><textarea id="exportcode" readonly rows="7">${code}</textarea><div class="btn-row">${btn('Copy code', 'copycode', { icon: 'scroll', cls: 'primary' })}</div>`;
  },
  import() {
    return `<h2 class="m-title">Import Save Code</h2><p class="muted">Paste a save code. This replaces your Legacy Points, achievements, and all three saved lives.</p><textarea id="importcode" rows="7" placeholder="Paste the code here"></textarea><div class="btn-row">${btn('Import', 'doimport', { cls: 'primary' })}</div><p class="why" id="importerr" hidden></p>`;
  },
  plan() {
    const L = UI.L; if (!L) return '';
    const pl = (L.plan || []).slice(0, 3); while (pl.length < 3) pl.push('');
    const grps = [...new Set(PLAN_OPTS.map(o => o.grp))];
    const sel = (i) => `<label class="field"><span>Focus ${i + 1}</span><select data-a2="planset" data-i="${i}" aria-label="Focus ${i + 1}"><option value="">None</option>${grps.map(g => `<optgroup label="${esc(g)}">${PLAN_OPTS.filter(o => o.grp === g).map(o => { let b = null; try { b = o.block(L); } catch (e) {} return `<option value="${o.id}"${pl[i] === o.id ? ' selected' : ''}>${esc(o.name)}${b ? ' (not yet)' : ''}</option>`; }).join('')}</optgroup>`).join('')}</select></label>`;
    const best = bestElement(L), presets = [['Mage', ['mana', 'm_' + best, 'study']], ['Warrior', ['sword', 'aura', 'body']], ['Scholar', ['study', 'study', 'rest']], ['Balanced', ['m_' + best, 'sword', 'rest']], ['Calm years', ['rest', 'study', 'explore']]];
    const live = planList(L).map(id => { let b = null; try { b = PLAN_OPT[id].block(L); } catch (e) {} return b ? `<li>${icon('lock')}<span><b>${esc(PLAN_OPT[id].name)}</b> is skipped for now: ${esc(b)}</span></li>` : ''; }).join('');
    return `<h2 class="m-title">${icon('target')}Year Plan</h2>
      <p class="muted">Pick up to three focuses. Unused actions are shared between them in turn, so choosing one twice gives it twice the time. Rank trials, quests, and big choices are always left to you.</p>
      <div class="plan-pre"><small>Quick picks</small>${presets.map(([n, ids]) => `<button class="chip" data-a="planpreset" data-v="${ids.join(',')}">${esc(n)}</button>`).join('')}</div>
      <div class="adgrid plan-sel">${[0, 1, 2].map(sel).join('')}</div>
      ${live ? `<ul class="plan-skip">${live}</ul>` : ''}
      <div class="toggles">${`<button class="toggle${L.planAuto !== false ? ' on' : ''}" data-a="planauto" role="switch" aria-checked="${L.planAuto !== false}"><span><b>Use my plan when I age up</b><small>Actions you have not spent go to your plan before the year ends</small></span><i></i></button>`}</div>
      <div class="btn-row">${btn(L.ap > 0 ? `Spend ${L.ap} action${L.ap === 1 ? '' : 's'} now` : 'No actions left this year', 'planspend', { cls: 'primary', disabled: !planList(L).length || L.ap <= 0 })}${btn('Clear plan', 'planclear', { cls: 'ghost', disabled: !planList(L).length })}${btn('Done', 'close', { cls: 'ghost' })}</div>`;
  },
  confirm(s) {
    return `<h2 class="m-title">${esc(s.title)}</h2><p class="muted">${esc(s.text)}</p><div class="btn-row">${btn(s.yes || 'Confirm', 'yes', { cls: s.danger ? 'danger' : 'primary' })}${btn('Cancel', 'close', { cls: 'ghost' })}</div>`;
  },
  pickchosen(s) {
    const d = UI.draft; const f = s.f || 'legendary';
    return `<h2 class="m-title">Choose Two Traits</h2><p class="muted">Fate Chooser: your picks fill two slots and the third is rolled. Chosen: ${d.chosen.map(id => esc(TRAIT[id].name)).join(', ') || 'none'}.</p>
      <div class="segs wrap">${TIERS.map(t => `<button class="${f === t.id ? 'on' : ''}" data-a="chosenf" data-v="${t.id}">${t.name}</button>`).join('')}</div>
      <div class="stack">${TRAITS.filter(t => t.tier === f).map(t => `<button class="row pick tier-${t.tier}${d.chosen.includes(t.id) ? ' on' : ''}" data-a="choosetrait" data-id="${t.id}"><span class="r-main"><b data-tip="trait:${t.id}">${esc(t.name)}</b><small>${esc(t.up)}${t.down && t.down !== 'None' ? ' · ' + esc(t.down) : ''}</small></span></button>`).join('')}</div>
      <div class="btn-row">${btn('Clear picks', 'clearchosen', { cls: 'ghost' })}${btn('Done', 'close', { cls: 'primary' })}</div>`;
  },
};
