/* ===================== LEGACY VIEWS: World Compendium, life chart, dynasties ===================== */
const NOTABLE_INFO = {
  Roxy: { full: 'Roxy Migurdia', t: 'A Migurd water mage who travels as a tutor.', where: 'in A Tutor from Afar' },
  Ghislaine: { full: 'Ghislaine Dedoldia', t: 'A Beastfolk Sword King who guards a noble house.', where: 'in The Boreas Household' },
  Ruijerd: { full: 'Ruijerd Superdia', t: 'The last Superd warrior. Feared by all, kinder than most.', where: 'in The Displacement Incident' },
  Zanoba: { full: 'Zanoba Shirone', t: 'A prince of Shirone with monstrous strength and a love of figurines.', where: 'at Ranoa University of Magic' },
  Cliff: { full: 'Cliff Grimoire', t: 'A proud young priest and a genius with spells.', where: 'at Ranoa University of Magic' },
  Linia: { full: 'Linia Dedoldia', t: 'A Beastfolk princess who rules the university’s back halls.', where: 'at Ranoa University of Magic' },
  Pursena: { full: 'Pursena Adoldia', t: 'Linia’s partner in mischief, with a nose for meat.', where: 'at Ranoa University of Magic' },
  Nanahoshi: { full: 'Nanahoshi Shizuka', t: 'The Silent Seven Star, a girl from another world.', where: 'at Ranoa University of Magic' },
  Ariel: { full: 'Ariel Anemoi Asura', t: 'A princess of Asura who plays for the throne.', where: 'at Ranoa University of Magic' },
  Orsted: { full: 'Orsted, the Dragon God', t: 'The strongest being in the world, and the Man-God’s enemy.', where: 'in The Man-God’s Game' },
  Badigadi: { full: 'Badigadi', t: 'The laughing Immortal Demon King.', where: 'on the Demon Continent' },
  Reida: { full: 'Reida Reya', t: 'The Water God, master of Water God Style.', where: 'at the Water God dojo in Ars' },
};
const EV_GROUPS = [['any', 'Any age', 'sun'], ['child', 'Infancy and childhood', 'leaf'], ['youth', 'Youth', 'feather'], ['adult', 'Adulthood', 'sword'], ['elder', 'Elder years', 'hourglass'], ['long', 'The long life', 'star']];
function evGroup(e) { const [a, b] = e.ages || [0, 9999]; if (a <= 1 && b >= 500) return 'any'; return a < 10 ? 'child' : a < 18 ? 'youth' : a < 60 ? 'adult' : a < 200 ? 'elder' : 'long'; }
function discCounts() {
  const D = META.disc || {};
  const n = (k) => Object.keys(D[k] || {}).length;
  return { ev: n('ev'), town: n('town'), npc: n('npc'), arc: n('arc'), tot: discMax() };
}
function compendiumPage() {
  const D = META.disc || { ev: {}, town: {}, npc: {}, arc: {} }, c = discCounts(), got = discTotal();
  const next = (Math.floor(got / 10) + 1) * 10, paid = D.paid || 0;
  const ring = (v, max, lab, ic) => `<div class="cp-stat"><span class="cp-ring" style="--p:${(max ? v / max * 100 : 0).toFixed(1)}">${icon(ic)}</span><span><b class="num">${v}<i>/${max}</i></b><small>${lab}</small></span></div>`;
  const head = `<div class="cp-head"><div class="cp-total"><small>Discovered across all your lives</small><b class="num">${got}<i> of ${c.tot}</i></b>${bar(got, c.tot, 'cp')}<p>${got >= c.tot ? 'You have seen everything this world holds. For now.' : `${next - got} more until the next reward of <b>${discReward(paid + 1)} Legacy Points</b>. Each reward is bigger than the last.`}${paid ? ` Earned so far: <b>${fmt(Array.from({ length: paid }, (_, i) => discReward(i + 1)).reduce((a, b) => a + b, 0))} LP</b>.` : ''}</p></div>
    <div class="cp-stats">${ring(c.town, TOWNS.length, 'Places', 'map')}${ring(c.npc, NOTABLES.length, 'Notable people', 'user')}${ring(c.arc, ARCS.length, 'Stories finished', 'flag')}${ring(c.ev, EVENTS.length, 'Events', 'scroll')}</div></div>`;
  const places = CONTINENTS.map(ct => { const ts = TOWNS.filter(t => t.cont === ct.id); const k = ts.filter(t => D.town && D.town[t.id]).length;
    return `<div class="cp-cont"><h4>${esc(ct.name)} <small>${k} of ${ts.length}</small></h4><div class="cp-chips">${ts.map(t => D.town && D.town[t.id] ? `<span class="cp-chip on" data-tip="town:${t.id}">${icon('map')}<b>${esc(t.name)}</b><small>${esc(t.realm)}</small></span>` : `<span class="cp-chip"><i>?</i><b>Unvisited</b><small>${esc(SIZE_NAMES[t.size] || 'Place')}</small></span>`).join('')}</div></div>`; }).join('');
  const met = NOTABLES.filter(n => D.npc && D.npc[n]), unmet = {};
  for (const n of NOTABLES) if (!(D.npc && D.npc[n])) { const w = (NOTABLE_INFO[n] || {}).where || 'somewhere in the world'; (unmet[w] = unmet[w] || []).push(n); }
  const people = `<div class="cp-people">${met.map(n => { const f = NOTABLE_INFO[n] || { full: n, t: '' };
    return `<div class="cp-person on"><span class="cp-av">${esc(n[0])}</span><div><b>${esc(f.full)}</b><small>${esc(f.t)}</small></div></div>`; }).join('')}${Object.entries(unmet).map(([w, ns]) => `<div class="cp-person"><span class="cp-av">${ns.length > 1 ? '×' + ns.length : '?'}</span><div><b>${ns.length > 1 ? `${ns.length} people not yet met` : 'Not yet met'}</b><small>${ns.length > 1 ? 'They appear' : 'Appears'} ${esc(w)}.</small></div></div>`).join('')}</div>`;
  const stories = `<div class="stack">${ARCS.map(a => { const chs = EVENTS.filter(e => e.isArc && e.arc === a.id).sort((x, y) => x.ch - y.ch), n = Math.max(a.chapters.length, chs.length), seen = Array.from({ length: n }, (_, i) => !!(chs[i] && D.ev && D.ev[chs[i].id])); const any = seen.some(Boolean), done = D.arc && D.arc[a.id];
    return `<div class="cp-arc${done ? ' done' : ''}"><span class="cp-arc-ic">${icon(done ? 'check' : 'flag')}</span><div><b${any ? ` data-tip="arc:${a.id}"` : ''}>${any ? esc(a.name) : 'An untold story'}</b><small>${any ? esc(a.blurb) : `${n} chapters wait to be found.`}</small></div><span class="cp-pips" aria-label="${seen.filter(Boolean).length} of ${n} chapters seen">${seen.map(s => `<i class="${s ? 'on' : ''}"></i>`).join('')}</span></div>`; }).join('')}</div>`;
  const evs = EVENTS.filter(e => !e.isArc);
  const groups = EV_GROUPS.map(([g, name, ic]) => { const list = evs.filter(e => evGroup(e) === g); if (!list.length) return '';
    const seen = list.filter(e => D.ev && D.ev[e.id]).map(e => titleCase(e.title)).filter((t, i, a) => a.indexOf(t) === i).sort(), hid = list.filter(e => !(D.ev && D.ev[e.id])).length;
    return acc('cp.ev.' + g, name, `<div class="cp-evs">${seen.map(t => `<span>${esc(t)}</span>`).join('')}${hid ? `<span class="hid">${hid} still hidden</span>` : ''}</div>`, { icon: ic, sum: `${list.length - hid} of ${list.length}`, cls: 'sub' }); }).join('');
  return `${head}
    ${acc('cp.places', 'Places', places, { open: true, icon: 'map', sum: `${c.town} of ${TOWNS.length}` })}
    ${acc('cp.people', 'Notable People', people, { open: true, icon: 'user', sum: `${c.npc} of ${NOTABLES.length}` })}
    ${acc('cp.arcs', 'Stories', stories, { open: false, icon: 'flag', sum: `${c.arc} finished` })}
    ${acc('cp.events', 'Events', `<p class="muted">Every event you have lived through in any life. Hidden ones wait in other places, ages, and choices.</p>${groups}`, { open: false, icon: 'scroll', sum: `${c.ev} of ${EVENTS.length}`, cls: 'hub' })}`;
}
PAGES.compendium = { title: 'World Compendium', lede: 'Everything you have seen of this world, across every life. Every ten discoveries earn Legacy Points, and each reward grows.', group: 'Legacy', render() { return compendiumPage(); } };

/* ---------- life chart ---------- */
const HIST_M = [['p', 'Power', 'xp', 'Your combined strength'], ['g', 'Gold', 'gold', 'Gold in your purse'], ['f', 'Fame', 'love', 'What the world knows of you'], ['m', 'Mana', 'mana', 'Mana capacity'], ['au', 'Aura', 'aura', 'Battle Aura capacity']];
const fmtC = (n) => { const a = Math.abs(n); return a >= 1e6 ? (n / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M' : a >= 1e4 ? Math.round(n / 1e3) + 'K' : fmt(n); };
function niceTop(v) { if (v <= 0) return 4; const e = Math.pow(10, Math.floor(Math.log10(v))), f = v / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 4 ? 4 : f <= 5 ? 5 : f <= 8 ? 8 : 10) * e; }
function lifeChart(L, m) {
  const H = L.hist, M = HIST_M.find(x => x[0] === m) || HIST_M[0];
  if (!H || H.a.length < 2) return '<p class="empty">Your chart begins this year. Age up to watch it grow.</p>';
  const xs = H.a, ys = H[M[0]].map(v => Math.max(0, v || 0));
  const x0 = xs[0], x1 = Math.max(xs[xs.length - 1], x0 + 1), top = niceTop(Math.max(...ys) * 1.06);
  const X = (a) => (a - x0) / (x1 - x0) * 1000, Y = (v) => 300 - v / top * 300;
  const pts = xs.map((a, i) => `${X(a).toFixed(1)},${Y(ys[i]).toFixed(1)}`);
  const line = 'M' + pts.join('L'), area = `${line}L${X(xs[xs.length - 1]).toFixed(1)},300L${X(x0).toFixed(1)},300Z`;
  const yt = [0, .25, .5, .75, 1].map(f => f * top);
  const span = x1 - x0, step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find(s => span / s <= 6) || 1000;
  const xt = []; for (let a = Math.ceil(x0 / step) * step; a <= x1; a += step) xt.push(a);
  const li = ys.length - 1, lx = X(xs[li]) / 10, ly = Y(ys[li]) / 3;
  let pk = 0; ys.forEach((v, i) => { if (v > ys[pk]) pk = i; });
  const showPk = pk < li - 1 && ys[pk] > ys[li] * 1.12 && ys[pk] > 0;
  const arcs = ARCS.filter(a => L.arc[a.id] === 99 && L.arcYear && L.arcYear[a.id] != null && L.arcYear[a.id] >= x0 && L.arcYear[a.id] <= x1);
  const rows = []; const nRow = Math.min(12, xs.length); for (let k = 0; k < nRow; k++) { const i = Math.round(k * (xs.length - 1) / Math.max(1, nRow - 1)); if (!rows.includes(i)) rows.push(i); }
  return `<figure class="lc" style="--lc:var(--${M[2]})">
    <div class="lc-plot" data-x="${xs.join(',')}" data-y="${ys.join(',')}" data-lab="${M[1]}" data-x0="${x0}" data-x1="${x1}" data-top="${top}" role="img" aria-label="${esc(M[1])} over your life, from age ${x0} to ${xs[li]}. Now ${fmt(ys[li])}${showPk ? `, peak ${fmt(ys[pk])} at age ${xs[pk]}` : ''}.">
      <div class="lc-yt">${yt.map(v => `<span style="top:${(Y(v) / 3).toFixed(2)}%">${fmtC(v)}</span>`).join('')}</div>
      <div class="lc-area">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">${yt.map(v => `<line x1="0" x2="1000" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="${v ? 'g' : 'g0'}"/>`).join('')}<path d="${area}" class="fill"/><path d="${line}" class="ln"/></svg>
        ${showPk ? `<span class="lc-pk" style="left:${(X(xs[pk]) / 10).toFixed(2)}%;top:${(Y(ys[pk]) / 3).toFixed(2)}%"><em>Peak ${fmtC(ys[pk])}</em></span>` : ''}
        <span class="lc-end" style="left:${lx.toFixed(2)}%;top:${ly.toFixed(2)}%"><em>${fmtC(ys[li])}</em></span>
        ${arcs.map(a => `<span class="lc-arc" style="left:${(X(L.arcYear[a.id]) / 10).toFixed(2)}%" data-tip="arc:${a.id}" tabindex="0" aria-label="${esc(a.name)} finished at age ${L.arcYear[a.id]}"></span>`).join('')}
        <span class="lc-x" hidden></span><span class="lc-dot" hidden></span><span class="lc-tip" hidden></span>
      </div>
      <div class="lc-xt">${xt.map(a => `<span style="left:${(X(a) / 10).toFixed(2)}%">${a}</span>`).join('')}</div>
    </div>
    <figcaption>${esc(M[3])}, by age${arcs.length ? `. Diamonds mark finished stories` : ''}.</figcaption>
    <details class="lc-tbl"><summary>Show the numbers</summary><table class="tbl"><thead><tr><th>Age</th><th>${esc(M[1])}</th></tr></thead><tbody>${rows.map(i => `<tr><td class="num">${xs[i]}</td><td class="num">${fmt(ys[i])}</td></tr>`).join('')}</tbody></table></details>
  </figure>`;
}
function lifeStats(L) {
  const m = UI.lcM || 'p', H = L.hist || { a: [] }, last = H.a.length - 1;
  const cur = { p: power(L), g: L.gold, f: L.fame, m: L.mana.cap, au: L.aura.cap };
  const j = last >= 0 && H.a[last] === L.age ? last - 1 : last;
  const tabs = HIST_M.map(([k, name, col]) => { const prev = j >= 0 ? H[k][j] : null, d = prev == null ? 0 : Math.round(cur[k] - prev);
    return `<button class="lc-tab${m === k ? ' on' : ''}" data-a="lcm" data-v="${k}" style="--lc:var(--${col})" aria-pressed="${m === k}"><small>${icon({ p: 'bolt', g: 'coin', f: 'star', m: 'drop', au: 'flame' }[k])}${name}</small><b class="num">${fmtC(Math.round(cur[k]))}</b>${d ? `<em class="${d > 0 ? 'up' : 'dn'}">${d > 0 ? '+' : '−'}${fmtC(Math.abs(d))}</em>` : '<em>&nbsp;</em>'}</button>`; }).join('');
  return `<div class="lc-tabs" role="group" aria-label="Choose a measure">${tabs}</div>${lifeChart(L, m)}`;
}
/* crosshair + tooltip, one delegated listener */
function lcMove(plot, e) {
  const area = plot.querySelector('.lc-area'); if (!area) return;
  const r = area.getBoundingClientRect(); if (r.width <= 0) return;
  const xs = plot.dataset.x.split(',').map(Number), ys = plot.dataset.y.split(',').map(Number);
  const x0 = +plot.dataset.x0, x1 = +plot.dataset.x1, top = +plot.dataset.top;
  const age = x0 + clamp((e.clientX - r.left) / r.width, 0, 1) * (x1 - x0);
  let i = 0, best = 1e9; xs.forEach((a, k) => { const d = Math.abs(a - age); if (d < best) { best = d; i = k; } });
  const lx = (xs[i] - x0) / (x1 - x0) * 100, ly = 100 - ys[i] / top * 100;
  const cx = area.querySelector('.lc-x'), dot = area.querySelector('.lc-dot'), tip = area.querySelector('.lc-tip');
  cx.hidden = dot.hidden = tip.hidden = false;
  cx.style.left = dot.style.left = lx + '%'; dot.style.top = ly + '%';
  tip.innerHTML = `<b class="num">${fmt(ys[i])}</b><span>${esc(plot.dataset.lab)} at age ${xs[i]}</span>`;
  tip.style.left = lx + '%'; tip.classList.toggle('flip', lx > 70); tip.classList.toggle('low', ly < 30);
  LCV.on = plot;
}
const LCV = { on: null };
function lcHide() { if (!LCV.on) return; LCV.on.querySelectorAll('.lc-x,.lc-dot,.lc-tip').forEach(el => el.hidden = true); LCV.on = null; }

/* ---------- Hall of Lives: records and dynasties ---------- */
function hallLineages() {
  const H = META.hall.slice().reverse(), key = [];
  let auto = 0;
  H.forEach((h, i) => { const prev = H[i - 1];
    key.push(h.lin || (prev && !prev.lin && h.gen > 1 && prev.sur === h.sur && prev.gen === h.gen - 1 ? key[i - 1] : 'old' + (++auto))); });
  const map = new Map(); H.forEach((h, i) => { const k = key[i]; if (!map.has(k)) map.set(k, []); map.get(k).push(h); });
  return [...map.entries()].map(([k, list]) => ({ k, list })).filter(d => d.list.length >= 2 || (UI.L && UI.L.alive && UI.L.lineage === d.k)).reverse();
}
function hallPage() {
  const H = META.hall;
  if (!H.length) return '<p class="empty">No lives recorded yet. Your first will be remembered here.</p>';
  const by = (f) => H.reduce((a, h) => (f(h) > f(a) ? h : a), H[0]);
  const lg = by(h => h.age), bt = by(h => h.best), fm = by(h => h.fame || 0), lp = by(h => h.lp || 0);
  const rec = (ic, lab, v, who) => `<div class="hl-rec">${icon(ic)}<span><small>${lab}</small><b class="num">${v}</b><em>${esc(who)}</em></span></div>`;
  const records = `<div class="hl-recs">${rec('hourglass', 'Longest life', `${lg.age} years`, lg.name + ' ' + lg.sur)}${rec('crown', 'Highest rank', RANKS[bt.best], bt.name + ' ' + bt.sur)}${rec('star', 'Most famous', fmtC(fm.fame || 0), fm.name + ' ' + fm.sur)}${rec('gem', 'Richest legacy', fmt(lp.lp || 0) + ' LP', lp.name + ' ' + lp.sur)}</div>`;
  const dyn = hallLineages();
  const node = (h) => `<li><span class="pmini">${portrait({ look: h.look, race: h.race, sex: h.sex, age: Math.max(18, Math.min(h.age, 50)), beauty: beautyOf(h.looks), scars: h.scars || [], dead: true, mini: true, label: h.name })}</span><b>${esc(h.name)}</b><small>Gen ${h.gen} · ${h.age} yrs</small></li>`;
  const live = (k) => { const L = UI.L; if (!L || !L.alive || L.lineage !== k) return ''; return `<li class="alive"><span class="pmini">${portrait({ look: L.look, race: L.race, sex: L.sex, age: Math.max(1, Math.min(L.age, 50)), beauty: beautyOf(L.st.looks), scars: L.scars || [], mini: true, label: L.name })}</span><b>${esc(L.name)}</b><small>Living · age ${L.age}</small></li>`; };
  const dynasties = dyn.length ? dyn.map(d => { const yrs = d.list.reduce((a, h) => a + h.age, 0), best = d.list.reduce((a, h) => Math.max(a, h.best), 0), sur = d.list[d.list.length - 1].sur;
    return `<div class="dyn"><header>${icon('castle')}<b>House ${esc(sur)}</b><small>${d.list.length} generation${d.list.length === 1 ? '' : 's'} remembered · ${fmt(yrs)} years lived · best rank ${RANKS[best]}</small></header><div class="dyn-scroll"><ol class="dyn-chain">${d.list.map(node).join('')}${live(d.k)}</ol></div></div>`; }).join('')
    : '<p class="muted">When a life ends, you can continue as one of your adult children. Families you carry on for two or more generations appear here as a family tree.</p>';
  const lives = `<div class="stack">${H.map(h => `<div class="row hall"><span class="pmini">${portrait({ look: h.look, race: h.race, sex: h.sex, age: Math.max(18, Math.min(h.age, 50)), beauty: beautyOf(h.looks), scars: h.scars || [], dead: true, mini: true, label: h.name })}</span><div class="r-main"><b>${esc(h.name)}${h.epithet ? ` “${esc(h.epithet)}”` : ''} ${esc(h.sur)}</b><small>${RACE[h.race].name} · died at ${h.age}, ${esc(h.cause)} · Year ${h.year}</small><small>Best rank ${RANKS[h.best]}${h.bestSkill && h.best > 0 ? ' in ' + esc(skillName(h.bestSkill)) : ''} · Generation ${h.gen}</small>${h.hi && h.hi.length ? `<small class="hl-hi">${h.hi.map(t => esc(t)).join(' · ')}</small>` : ''}</div><div class="r-side"><span class="num gold-t">+${fmt(h.lp)} LP</span></div></div>`).join('')}</div>`;
  return `${records}${acc('hall.dyn', 'Dynasties', dynasties, { open: true, icon: 'castle', sum: dyn.length ? `${dyn.length} famil${dyn.length === 1 ? 'y' : 'ies'}` : '' })}${acc('hall.all', 'Every Life', lives, { open: true, icon: 'skull', sum: `${META.lives} lived` })}`;
}

/* ---------- a one-line look back at the year that just ended ---------- */
function yearReview(L) {
  const H = L.hist; if (!H || L.age < 1) return '';
  const n = H.a.length, i = H.a[n - 1] === L.age ? n - 1 : -1; if (i < 1) return '';
  const j = i - 1, span = H.a[i] - H.a[j];
  const items = [];
  for (const [k, name, col] of HIST_M) { const v = Math.round(H[k][i] - H[k][j]); if (v) items.push(`<span class="yr-c ${v > 0 ? 'up' : 'dn'}" style="--lc:var(--${col})"><small>${name}</small><b class="num">${v > 0 ? '+' : '−'}${fmtC(Math.abs(v))}</b></span>`); }
  const deeds = L.log.filter(e => e.a >= H.a[j] && e.a < H.a[i]), cnt = (...ks) => deeds.filter(e => ks.includes(e.k)).length;
  for (const [c, one, many, ic] of [[cnt('goal'), 'goal', 'goals', 'target'], [cnt('ach'), 'achievement', 'achievements', 'trophy'], [cnt('rank'), 'rank up', 'rank ups', 'crown'], [cnt('trait', 'earn'), 'new trait', 'new traits', 'gem']]) if (c) items.push(`<span class="yr-d">${icon(ic)}${c} ${c === 1 ? one : many}</span>`);
  if (!items.length) return '';
  return `<button class="yr" data-a="page" data-v="journal" data-tip="term:yearreview"><span class="yr-h">${icon('chart')}${span === 1 ? 'Last year' : `Last ${span} years`}</span>${items.join('')}</button>`;
}

/* ---------- the world around you ---------- */
function worldChips(L) { return activeWorld(L).map(m => { const n = WN[m.id], left = m.to - L.year + 1; return `<span class="wd-c" data-tip="world:${m.id}">${icon(n.fx.xp ? 'sparkle' : n.fx.stress < 0 ? 'sun' : n.fx.questGold ? 'shield' : 'globe')}<b>${esc(n.eff)}</b><small>${left <= 1 ? 'this year' : left + ' years'}</small></span>`; }).join(''); }
function worldStrip(L) {
  const a = activeWorld(L); if (!a.length) return '';
  return `<div class="wd"><span class="wd-h">${icon('globe')}In the world</span>${worldChips(L)}<button class="link" data-a="pagex" data-v="location" data-acc="loc.news">Word from afar ${icon('chev')}</button></div>`;
}
function worldNewsList(L) {
  const N = ((META.world || {}).news || []);
  const act = activeWorld(L);
  return `${act.length ? `<div class="wd in">${worldChips(L)}</div>` : ''}${N.length ? `<ol class="wnews">${N.slice(0, 12).map(n => `<li><span class="num">Year ${n.y}</span><p>${esc(n.t)}${WN[n.id] && WN[n.id].fx ? ` <em>${esc(WN[n.id].eff)}${(act.some(m => m.id === n.id)) ? ' · now' : ''}</em>` : ''}</p></li>`).join('')}</ol>` : '<p class="empty">No news has reached you yet. Travelers bring word every few years.</p>'}
    <p class="note">${icon('info')}<span>News travels between lives: the world keeps its own calendar, and legends of your past lives can turn up in the songs.</span></p>`;
}

/* ---------- memories timeline ---------- */
const MILE_IC = { birth: 'sun', love: 'heart', child: 'heart', loss: 'moon', scar: 'sword', rank: 'crown', aura: 'flame', arc: 'flag', epithet: 'star', work: 'castle', travel: 'ship', job: 'work', guild: 'shield', fame: 'star', grad: 'book2', death: 'hourglass' };
function memoriesHtml(L, max) {
  let M = (L.mile || []).slice().sort((a, b) => a.a - b.a);
  if (!M.length) return '<p class="empty">No milestones yet. They gather as your life unfolds.</p>';
  let hidden = 0;
  if (max && M.length > max) { hidden = M.length - max; M = [M[0], ...M.slice(-(max - 1))]; }
  let lastA = null;
  return `<ol class="mtl">${M.map((m, i) => { const showA = m.a !== lastA; lastA = m.a; return `${hidden && i === 1 ? `<li class="mtl-gap"><span>${hidden} earlier moment${hidden === 1 ? '' : 's'}</span></li>` : ''}<li class="mtl-i k-${m.k}"><span class="mtl-a">${showA ? `<b class="num">${m.a}</b>` : ''}</span><span class="mtl-dot">${icon(MILE_IC[m.k] || 'dot')}</span><span class="mtl-t">${esc(m.t)}</span></li>`; }).join('')}</ol>`;
}
