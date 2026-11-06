/* ===================== UI: PAGES (center column) ===================== */
const ROLE_NAMES = { mother: 'Mother', father: 'Father', guardian: 'Guardian', sibling: 'Sibling', twin: 'Twin', friend: 'Friend', rival: 'Rival', mentor: 'Mentor', student: 'Student', partner: 'Partner', spouse: 'Spouse', ex: 'Former partner', child: 'Child', grandchild: 'Grandchild', descendant: 'Descendant', party: 'Party member', other: 'Acquaintance' };
const NAV = [
  { g: 'Chronicle', items: [['overview', 'compass', 'Overview'], ['journal', 'quill', 'Journal'], ['arcs', 'flag', 'Story Arcs'], ['goals', 'target', 'Goals'], ['achievements', 'trophy', 'Achievements']] },
  { g: 'Cultivation', items: [['mana', 'drop', 'Mana'], ['magic', 'wand', 'Magic'], ['sword', 'sword', 'Swordsmanship'], ['aura', 'flame', 'Battle Aura'], ['body', 'fist', 'Body & Mind']] },
  { g: 'Bonds', items: [['family', 'home', 'Family'], ['relations', 'people', 'Relationships'], ['mentors', 'hat', 'Mentors & Party']] },
  { g: 'Pursuits', items: [['work', 'work', 'Occupation'], ['school', 'book2', 'Education'], ['guild', 'shield', 'Adventurer Guild'], ['activities', 'sun', 'Activities'], ['market', 'coin', 'Market & Property']] },
  { g: 'The World', items: [['location', 'map', 'Location'], ['travel', 'ship', 'Travel'], ['powers', 'crown', 'Powers & Legends']] },
  { g: 'Legacy', items: [['codex', 'gem', 'Trait Codex'], ['compendium', 'globe', 'World Compendium'], ['shop', 'star', 'Legacy Shop'], ['hall', 'skull', 'Hall of Lives']] },
  { g: 'System', items: [['settings', 'gear', 'Settings'], ['admin', 'bolt', 'Admin Menu']] },
];
const NAV_FLAT = NAV.flatMap(g => g.items.map(i => ({ id: i[0], icon: i[1], name: i[2], g: g.g })));
const NAV_OF = Object.fromEntries(NAV_FLAT.map(n => [n.id, n]));
const NOLIFE_PAGES = ['achievements', 'codex', 'compendium', 'shop', 'hall', 'settings', 'admin'];

const ACH_CAT_IC = { Growth: 'leaf', Magic: 'wand', Swordsmanship: 'sword', Mastery: 'crown', Bonds: 'heart', Fortune: 'coin', Adventure: 'map', Story: 'flag', Legacy: 'castle' };
/* ---------- shared pieces ---------- */
function apStrip(L) {
  const spMax = L.spMax || spFor(L);
  return `<div class="apstrip"><span class="aps" data-tip="term:ap"><small>${icon('hourglass')}Actions</small>${pips(L.ap, L.apMax || L.ap, 'ap')}<b class="num">${L.ap}<i>/${L.apMax || L.ap}</i></b></span>
    <span class="aps" data-tip="term:sp"><small>${icon('people')}Social</small>${pips(L.sp, spMax, 'sp')}<b class="num">${L.sp}<i>/${spMax}</i></b></span>
    ${L.well ? `<span class="well" data-tip="term:wellness">${icon('leaf')}+${L.well} from wellness</span>` : ''}
    ${L.ap <= 0 ? `<span class="spent">${icon('hourglass')}All actions spent. Age up to begin a new year.</span>` : ''}${planStrip(L)}</div>`;
}
function planStrip(L) {
  const pl = planList(L);
  const lbl = pl.length ? pl.map(id => PLAN_OPT[id].name).join(' · ') : 'No plan yet';
  return `<span class="plan-s"><button class="plan-chip" data-a="plan" data-tip="term:plan">${icon('target')}<span><small>Year plan${pl.length && L.planAuto !== false ? ' · auto' : ''}</small><b>${esc(lbl)}</b></span></button>${pl.length && L.ap > 0 ? btn(`Spend ${L.ap} on plan`, 'planspend', { cls: 'small' }) : ''}</span>`;
}
function pendingBanner(L) { return L && L.queue.length ? `<button class="pending" data-a="age">${icon('alert')}<span><small>A decision awaits</small><b>${esc(L.queue[0].title)}</b></span><em>Open</em></button>` : ''; }
function skillRow(L, k) {
  const isS = !!STYLE[k];
  const nm = isS ? STYLE[k].name : MAGIC_ID[k].name + ' Magic';
  const xp = skillXp(L, k), r = rankOf(L, k);
  const lo = RANK_XP[r], hi = RANK_XP[Math.min(7, r + 1)];
  const blk = isS ? swordBlock(L, k) : magicBlock(L, k);
  const t = trialInfo(L, k);
  const mult = xpMult(L, k) * mentorMult(L, k) * schoolMult(L, k);
  const prim = isS && L.sword.primary === k;
  const ready = r >= 3 && r < 7 && xp >= hi;
  return `<div class="skill${blk ? ' locked' : ''}">
    <div class="skill-main">
      <div class="skill-name"><b data-tip="skill:${k}">${nm}</b>${prim ? '<span class="flag">Primary</span>' : ''}${rankBadge(r, k)}</div>
      <div class="skill-prog">${bar(r >= 7 ? 1 : Math.max(0, xp - lo), r >= 7 ? 1 : hi - lo, 'xp')}<span class="num">${r >= 7 ? 'Mastered' : xp <= 0 ? 'Not started' : `${fmt(xp)} / ${fmt(hi)} XP`}</span></div>
      <p class="skill-meta"><span data-tip="skill:${k}">Training speed ${mult >= 1 ? '+' : '−'}${Math.abs(Math.round((mult - 1) * 100))}%</span>${ready ? ` · <span class="hl">Ready for the ${RANKS[r + 1]} trial</span>` : ''}${!isS && MAGIC_ID[k].group !== 'attack' ? ' · ' + esc(MAGIC_ID[k].note) : ''}</p>
      ${blk ? why(blk) : ''}${t && t.ready && t.reason ? why(t.reason) : ''}
    </div>
    <div class="skill-acts">
      ${btn('Practice', isS ? 'sword' : 'magic', { data: { k }, disabled: !!blk || L.ap <= 0, cost: '1' })}
      ${t && t.ready ? btn(`${t.label} · ${Math.round(t.chance * 100)}%`, 'trial', { data: { k }, disabled: !!t.reason || L.ap <= 0, cost: '1', cls: 'gold', tip: 'rank:' + t.next + ':' + k }) : ''}
    </div>
  </div>`;
}
function timeline(L, segs, maxAge) {
  const W = (a) => clamp(a / maxAge * 100, 0, 100);
  return `<div class="tline"><div class="tl-track">${segs.map(s => `<span class="tl-seg ${s.c}" style="left:${W(s.from)}%;width:${Math.max(0.5, W(s.to + 1) - W(s.from))}%"><em>${esc(s.l)}</em></span>`).join('')}<i class="tl-now" style="left:${W(Math.min(L.age + .5, maxAge))}%"><b>${L.age}</b></i></div>
    <div class="tl-ticks">${[0, ...segs.map(s => s.to + 1)].filter((v, i, a) => a.indexOf(v) === i && v <= maxAge).map(v => `<span style="left:${W(v)}%">${v}</span>`).join('')}</div></div>`;
}
function manaTimeline(L) { const [a, b] = manaWin(L); return timeline(L, [{ from: 0, to: a, l: 'Critical', c: 's1' }, { from: a + 1, to: b, l: 'Second', c: 's2' }, { from: b + 1, to: b + 6, l: 'Fixed', c: 's3' }], b + 7); }
function auraTimeline(L) { const w = auraWin(L); return timeline(L, [{ from: 0, to: w[0] - 1, l: 'Too young', c: 's0' }, { from: w[0], to: w[1] - 1, l: 'Conditioning', c: 's2' }, { from: w[1], to: w[2], l: 'Prime', c: 's1' }, { from: w[2] + 1, to: w[3], l: 'Final', c: 's2' }, { from: w[3] + 1, to: w[3] + 6, l: 'Fixed', c: 's3' }], w[3] + 7); }
function stageAt(L, a) { const rc = RACE[L.race]; if (a <= 2) return 0; if (a <= 5) return 1; if (a <= 10) return 2; if (a <= 14) return 3; if (a < Math.max(18, rc.coming)) return 4; const f = a / Math.max(40, L.lifespan); return f > .62 ? 7 : f > .42 ? 6 : 5; }
const LOG_F = { all: null, story: ['big', 'event', 'quiet', 'love', 'bad', 'good', '', 'letter', 'world'], deeds: ['ach', 'earn', 'goal', 'rank', 'trait'], acts: ['act', 'social'] };
function logHtml(L, f, max) {
  const allow = LOG_F[f || 'all'];
  let items = L.log.filter(e => !allow || allow.includes(e.k || ''));
  if (max) items = items.slice(-max);
  const groups = [];
  for (let i = items.length - 1; i >= 0; i--) { const e = items[i]; if (!groups.length || groups[groups.length - 1].a !== e.a) groups.push({ a: e.a, y: e.y || (L.year - (L.age - e.a)), items: [] }); groups[groups.length - 1].items.push(e); }
  let out = '', lastSt = null;
  for (const g of groups) {
    const st = stageAt(L, g.a);
    if (lastSt !== null && st !== lastSt) out += `<li class="lg-ch"><span>Chapter ${ROMANS[lastSt + 1]} · ${STAGE_ORDER[lastSt]}</span></li>`;
    lastSt = st;
    out += `<li class="lg${g.a === L.age ? ' now' : ''}"><h4><span>Age ${g.a}</span><small>Year ${g.y}</small></h4>${g.items.slice().reverse().map(e => `<p class="le k-${e.k || 'n'}"><i></i><span>${e.h ? `<b class="le-h">${esc(e.h)}.</b> ` : ''}${esc(e.t)}</span></p>`).join('')}</li>`;
  }
  if (lastSt !== null) out += `<li class="lg-ch"><span>Chapter ${ROMANS[lastSt + 1]} · ${STAGE_ORDER[lastSt]}</span></li>`;
  return out ? `<ol class="log">${out}</ol>` : '<p class="empty">Nothing recorded yet.</p>';
}
function counsel(L) {
  const out = [];
  const [a, b] = manaWin(L), ph = manaPhase(L);
  if (L.age < 1) out.push({ t: 'The world is new. Listen and babble to learn your first words. From age 1 you can cycle your mana, and capacity grows fastest in the first years of life.', page: 'body', icon: 'sun' });
  if (ph === 1 && !manaBlock(L)) out.push({ t: `Your mana is in its critical growth window for ${a - L.age + 1} more year${a - L.age ? 's' : ''}. Capacity gained now lasts a lifetime.`, page: 'mana', icon: 'drop' });
  else if (ph === 2) out.push({ t: `Your second mana window closes after age ${b}. Gains are smaller, but still permanent.`, page: 'mana', icon: 'drop' });
  if (!L.mana.chantless && L.age >= 1 && L.age <= 5) out.push({ t: 'Chantless casting is easiest to discover before age 6. Every mana session moves you closer.', page: 'mana', icon: 'sparkle' });
  const aw = auraWin(L), aph = auraPhase(L);
  if (L.aura.compat > 0 && aph === 2) out.push({ t: `Your Battle Aura is in its prime growth window until ${aw[2]}.`, page: 'aura', icon: 'flame' });
  if (!L.sword.styleChosen && L.age >= Math.max(4, styleAge() - 3) && L.age < styleAge()) out.push({ t: `At ${styleAge()} you will choose a sword style. Fundamentals you train now carry over.`, page: 'sword', icon: 'sword' });
  const tr = [...MAGIC.map(m => m.id), ...STYLES.map(s => s.id)].map(k => [k, trialInfo(L, k)]).find(([k, t]) => t && t.ready && !t.reason);
  if (tr) out.push({ t: `You are ready to attempt the ${tr[1].label.toLowerCase()} in ${STYLE[tr[0]] ? STYLE[tr[0]].name : MAGIC_ID[tr[0]].name + ' magic'} (${Math.round(tr[1].chance * 100)}% chance).`, page: STYLE[tr[0]] ? 'sword' : 'magic', icon: 'crown' });
  if (L.stress >= 55) out.push({ t: `Stress is high (${Math.round(L.stress)}). Rest or meditate: low stress next year means extra actions.`, page: 'body', icon: 'alert' });
  if (L.hp < maxHp(L) * .5) out.push({ t: 'Your health is low. Rest, and stay out of danger this year.', page: 'body', icon: 'heart' });
  if (L.flags.displaced) out.push({ t: 'You are far from home. Earn gold and find a way back to Fittoa.', page: 'travel', icon: 'ship' });
  if ((L.arc.labyrinth || 0) >= 1 && (L.arc.labyrinth || 0) < 99 && L.town !== 'rapan') out.push({ t: 'Someone you love waits in the Teleport Labyrinth beneath Rapan, on the Begaritt Continent.', page: 'travel', icon: 'map' });
  if (L.age >= 15 && !L.job && L.jobBoard.length) out.push({ t: `${L.jobBoard.length} employer${L.jobBoard.length > 1 ? 's are' : ' is'} hiring in ${TOWN[L.town].name} this year.`, page: 'work', icon: 'work' });
  if (L.age >= 15 && !L.guild.reg && guildStatus(L).ok) out.push({ t: 'The Adventurer Guild here will register you. Quests pay in gold, fame, and experience.', page: 'guild', icon: 'shield' });
  if (!L.edu.school && L.age >= 6 && L.age <= 14 && SCHOOLS.some(s => schoolStatus(L, s).ok)) out.push({ t: 'A school would accept you this year. Education compounds.', page: 'school', icon: 'book2' });
  if (L.sp > 0 && L.people.some(p => p.alive && !p.lost)) out.push({ t: `You have ${L.sp} social point${L.sp > 1 ? 's' : ''} left this year. Relationships shape every story arc.`, page: 'relations', icon: 'people' });
  const wk = WORKS.find(w => !workBlock(L, w.id) && L.gold >= w.cost * 2.5);
  if (wk) out.push({ t: `Your purse is heavy (${fmt(L.gold)} gold). Funding ${workLc(wk)} would raise your fame and grant a lasting bonus.`, page: 'market', icon: 'castle' });
  if (L.ap > 0 && !out.length) out.push({ t: 'A quiet stretch. Explore your surroundings: chance encounters are where many stories begin.', page: 'location', icon: 'map' });
  return out.slice(0, 6);
}
function arcCanBegin(L, a) {
  const e = EVENTS.find(x => x.arc === a.id && x.ch === 1); if (!e) return false;
  return ageHi(L, e.ages) <= e.ages[1];
}
function goalRow(L, g) {
  const r = g.check(L); const done = (L.goalsDone || []).includes(g.id);
  const cur = Math.min(r[0], r[1]);
  return `<div class="goal${done ? ' done' : ''}"><span class="g-ic">${icon(done ? 'check' : 'target')}</span><div class="g-main"><b data-tip="goal:${g.id}">${esc(g.name)}</b><small>${esc(g.desc)}</small>${done ? '' : `<div class="g-prog">${bar(cur, r[1], 'gold')}<span class="num">${fmt(cur)} / ${fmt(r[1])}</span></div>`}</div><div class="g-rw">${rwTags(g.rw)}</div></div>`;
}
function personBody(L, p) {
  const acts = p.alive && !p.lost ? SOCIAL.filter(a => { try { return a.cond(L, p); } catch (e) { return false; } }) : [];
  const knowLikes = p.op >= 40 || isFamily(p);
  const likes = { talk: 'Long talks', gift: 'Gifts', time: 'Time together', train: 'Training together' }[p.likes];
  const body = `<div class="pbody">
      <div class="pport">${npcPortrait(p, false)}</div>
      <div class="pinfo">
        ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ''}
        <dl class="kv">
          <div><dt>Relationship</dt><dd>${relLabel(p)} <span class="num muted">(${p.op > 0 ? '+' : ''}${p.op})</span></dd></div>
          <div><dt>Personality</dt><dd>${p.tags.map(t => esc(cap1(t))).join(', ')}</dd></div>
          ${p.age >= Math.max(15, (RACE[p.race] || RACE.human).coming) ? `<div><dt>Looks</dt><dd>${esc(beautyWord(npcLooks(p), p.sex))}</dd></div>` : ''}
          <div><dt>Enjoys</dt><dd>${knowLikes ? likes : '<span class="muted">Get closer to find out</span>'}</dd></div>
          ${p.job ? `<div><dt>Occupation</dt><dd>${esc(p.job)}</dd></div>` : ''}
          ${p.skill ? `<div><dt>Skill</dt><dd>${rankBadge(p.skill.r, p.skill.k)} <span data-tip="skill:${p.skill.k}">${STYLE[p.skill.k] ? STYLE[p.skill.k].name : MAGIC_ID[p.skill.k].name + ' Magic'}</span></dd></div>` : ''}
          ${p.role === 'party' ? `<div><dt>Combat power</dt><dd class="num">${p.power || 10}</dd></div>` : ''}
          <div><dt>Known since</dt><dd>${p.met === 0 ? 'Birth' : 'Age ' + (p.met ?? '?')}</dd></div>
        </dl>
        ${p.traits && p.traits.length && (isFamily(p) || p.role === 'spouse') ? `<p class="lbl">Traits</p><div class="chips">${p.traits.map(t => traitChip(t)).join('')}</div>` : ''}
        ${p.away && TOWN[p.away] ? `<p class="note">${icon('map')}Lives in ${esc(TOWN[p.away].name)} now. You keep in touch by letter.</p>` : ''}
        ${p.news && p.news.length ? `<p class="lbl">Their news</p><ul class="mem news">${p.news.slice().reverse().map(m => `<li><span class="num">Age ${m.a}</span>${esc(m.t)}</li>`).join('')}</ul>` : ''}
        ${p.mem && p.mem.length ? `<p class="lbl">Shared memories</p><ul class="mem">${p.mem.slice().reverse().map(m => `<li><span class="num">Age ${m.a}</span>${esc(m.t)}</li>`).join('')}</ul>` : ''}
        ${p.lost ? `<p class="note">${icon('alert')}Missing. No one knows where ${p.sex === 'f' ? 'she' : 'he'} is.</p>` : ''}
        ${p.alive && !p.lost ? `<p class="lbl">Spend a social point</p><div class="btn-grid">${acts.map(a => btn(a.name, 'social', { data: { id: p.id, act: a.id }, disabled: L.sp <= 0, cost: (a.note ? a.note(L) + ' · ' : '') + '1' })).join('')}</div>${L.sp <= 0 ? why('No social points left this year') : ''}` : (!p.alive ? '<p class="muted">Remembered.</p>' : '')}
      </div></div>`;
  return body;
}
/* person rows render their body only when opened (keeps long family lists fast) */
function personAcc(L, p) {
  const id = 'p.' + p.id;
  const open = !!UI.open[id];
  return `<section class="acc pacc${open ? ' is-open' : ''}${p.alive ? '' : ' gone'}" data-acc="${id}">
    <button class="acc-bar" data-a="acc" data-id="${id}" aria-expanded="${open}"><span class="chev">${icon('chev')}</span><span class="pmini">${npcPortrait(p)}</span>
      <span class="pname"><b>${esc(p.name)} ${esc(p.sur || '')}</b><small>${ROLE_NAMES[p.role] || p.role} · ${p.alive ? 'Age ' + p.age : 'Died at ' + p.age} · ${RACE[p.race].name}${p.canon ? ' · <em class="canon">Notable</em>' : ''}${p.lost ? ' · <em class="lost">Missing</em>' : ''}</small></span>
      <span class="prel">${p.alive ? `<small>${relLabel(p)}</small>${bar(p.op + 100, 200, 'op' + (p.op < 0 ? ' neg' : ''))}` : '<small>Remembered</small>'}</span></button>
    ${open ? `<div class="acc-body">${personBody(L, p)}</div>` : `<div class="acc-body" hidden data-lazy="p:${p.id}"></div>`}</section>`;
}
function lazyBody(key) { const L = UI.L; if (!L) return ''; if (key.startsWith('p:')) { const p = person(L, key.slice(2)); return p ? personBody(L, p) : ''; } return ''; }
function peopleGroup(L, title, list, empty) { return list.length ? `<h3 class="sect">${title}<small>${list.length}</small></h3><div class="stack">${list.map(p => personAcc(L, p)).join('')}</div>` : (empty ? `<h3 class="sect">${title}</h3><p class="empty">${empty}</p>` : ''); }
function workRow(L, w) {
  const done = (L.works || {})[w.id] != null, blk = workBlock(L, w.id);
  return `<div class="row item work${done ? ' own' : ''}"><span class="wk-ic">${icon(w.icon)}</span><div class="r-main"><b>${esc(w.name)}</b><small>${esc(w.desc)}</small><div class="mini-fx">${w.eff.split(' · ').map(t => `<span class="g">${esc(t)}</span>`).join('')}<span class="g lp">+${w.lp} Legacy Points when this life ends</span></div></div>
    <div class="r-side"><span class="price num">${fmt(w.cost)} g</span>${done ? `<span class="tagc on">Funded at ${L.works[w.id]}</span>` : btn('Fund', 'fund', { data: { id: w.id }, disabled: !!blk || L.ap <= 0, cls: 'small', cost: '1' })}${blk && !done ? `<small class="r-why">${esc(blk)}</small>` : ''}</div></div>`;
}
function itemRow(L, it) {
  const blk = itemBlock(L, it.id); const own = L.gear[it.slot] === it.id;
  const lines = fxLines(it.fx || {}); if (it.power) lines.unshift({ t: `Power +${it.power}`, good: true });
  return `<div class="row item${own ? ' own' : ''}"><div class="r-main"><b data-tip="item:${it.id}">${esc(it.name)}</b><small>${esc(it.desc)}</small>${lines.length ? `<div class="mini-fx">${lines.map(l => `<span class="${l.good ? 'g' : 'b'}">${esc(l.t)}</span>`).join('')}</div>` : ''}</div>
    <div class="r-side"><span class="price num">${it.unique ? '—' : fmt(it.price) + ' g'}</span>${own ? '<span class="tagc on">Owned</span>' : btn('Buy', 'buyitem', { data: { id: it.id }, disabled: !!blk, cls: 'small', tip: 'item:' + it.id })}${blk && !own ? `<small class="r-why">${esc(blk)}</small>` : ''}</div></div>`;
}

/* ---------- OVERVIEW HUBS: cultivation and social life, as dropdowns in the main column ---------- */
function subAcc(id, ic, title, sum, quick, body, open) {
  const o = UI.open[id] !== undefined ? UI.open[id] : !!open;
  return `<section class="acc sub${o ? ' is-open' : ''}" data-acc="${id}"><div class="sub-head"><button class="acc-bar" data-a="acc" data-id="${id}" aria-expanded="${o}"><span class="chev">${icon('chev')}</span>${icon(ic, 'acc-ic')}<span class="acc-title">${title}</span>${sum ? `<span class="acc-sum">${sum}</span>` : ''}</button>${quick ? `<div class="sub-quick">${quick}</div>` : ''}</div><div class="acc-body"${o ? '' : ' hidden'}>${body}</div></section>`;
}
function skillMini(L, k) {
  const isS = !!STYLE[k];
  const nm = isS ? STYLE[k].name : MAGIC_ID[k].name;
  const xp = skillXp(L, k), r = rankOf(L, k), lo = RANK_XP[r], hi = RANK_XP[Math.min(7, r + 1)];
  const blk = isS ? swordBlock(L, k) : magicBlock(L, k);
  const t = trialInfo(L, k);
  const prim = isS && L.sword.primary === k;
  return `<div class="smini${blk ? ' locked' : ''}"><div class="sm-name"><b data-tip="skill:${k}">${nm}</b>${prim ? '<span class="flag">Primary</span>' : ''}${rankBadge(r, k)}</div>
    <div class="sm-prog">${bar(r >= 7 ? 1 : Math.max(0, xp - lo), r >= 7 ? 1 : hi - lo, 'xp')}<span class="num">${r >= 7 ? 'Mastered' : xp <= 0 ? 'Not started' : `${fmt(xp)} / ${fmt(hi)}`}</span></div>
    <div class="sm-acts">${t && t.ready ? btn(`${RANKS[t.next]} trial · ${Math.round(t.chance * 100)}%`, 'trial', { data: { k }, disabled: !!t.reason || L.ap <= 0, cost: '1', cls: 'gold small', tip: 'rank:' + t.next + ':' + k }) : ''}${btn('Practice', isS ? 'sword' : 'magic', { data: { k }, disabled: !!blk || L.ap <= 0, cost: '1', cls: 'small' })}</div>
    ${blk ? `<small class="sm-why">${icon('lock')}${esc(blk)}</small>` : t && t.ready && t.reason ? `<small class="sm-why">${icon('lock')}${esc(t.reason)}</small>` : ''}</div>`;
}
const fullPage = (v, label) => `<div class="hub-more">${btn(label, 'page', { data: { v }, cls: 'ghost small', icon: 'chev' })}</div>`;
function cultivationHub(L) {
  const noAp = L.ap <= 0;
  // mana
  const mb = manaBlock(L), ph = manaPhase(L);
  const mana = subAcc('ovc.mana', 'drop', 'Mana', `${fmt(L.mana.cap)} · ${ph === 1 ? 'critical window' : ph === 2 ? 'second window' : 'capacity fixed'}`,
    btn('Practice', 'mana', { data: { push: 0 }, disabled: !!mb || noAp, cost: '1', cls: 'small', tip: 'mana:cap' }),
    `${manaTimeline(L)}
    <div class="actrow"><div><b>Practice safely</b><small>Steady growth with no risk. Builds a little control.</small></div>${btn('Practice', 'mana', { data: { push: 0 }, disabled: !!mb || noAp, cost: '1' })}</div>
    <div class="actrow warn"><div><b>Push to exhaustion</b><small>About 80% more growth, but you collapse and lose health.</small></div>${btn('Push', 'mana', { data: { push: 1 }, disabled: !!mb || noAp, cost: '1', cls: 'danger' })}</div>
    <div class="meter-row"><span data-tip="mana:ctrl">Control</span>${bar(L.mana.ctrl, 100, 'mana')}<b class="num">${Math.round(L.mana.ctrl)}</b></div>
    <div class="meter-row"><span data-tip="mana:chant">Silent casting</span>${L.mana.chantless ? '<b class="ok">Discovered</b>' : bar(L.mana.chant, 100, 'gold') + `<b class="num">${Math.round(L.mana.chant)}%</b>`}</div>
    ${why(mb)}${fullPage('mana', 'Full Mana page')}`, L.age <= manaWin(L)[1]);
  // magic
  const openM = MAGIC.filter(m => !magicBlock(L, m.id) || skillXp(L, m.id) > 0), lockedM = MAGIC.filter(m => !openM.includes(m));
  const mk = openM.filter(m => !magicBlock(L, m.id)).sort((a, b) => skillXp(L, b.id) - skillXp(L, a.id))[0];
  const magic = subAcc('ovc.magic', 'wand', 'Magic', bestMagic(L) ? `Best: ${RANKS[bestMagic(L)]}${mk ? ' · ' + mk.name : ''}` : (mk ? 'Untrained' : 'Locked for now'),
    mk ? btn('Practice', 'magic', { data: { k: mk.id }, disabled: noAp, cost: '1', cls: 'small', tip: 'skill:' + mk.id }) : '',
    `${openM.map(m => skillMini(L, m.id)).join('') || '<p class="muted">No school of magic is open to you yet.</p>'}
    ${lockedM.length ? `<p class="note">${icon('lock')}<span>Not yet open: ${lockedM.map(m => `<span data-tip="skill:${m.id}">${esc(m.name)}</span> (${esc(magicBlock(L, m.id))})`).join(' · ')}</span></p>` : ''}${fullPage('magic', 'Full Magic page')}`,
    L.age > manaWin(L)[1] && bestMagic(L) >= bestSword(L) && bestMagic(L) > 0);
  // sword
  const sb = swordBlock(L, null), sk = L.sword.styleChosen ? L.sword.primary : '';
  const sword = subAcc('ovc.sword', 'sword', 'Swordsmanship', L.sword.styleChosen ? `Best: ${RANKS[bestSword(L)]} · ${STYLE[sk].short}` : `Fundamentals · style at ${styleAge()}`,
    btn('Practice', 'sword', { data: { k: sk }, disabled: !!(sk ? swordBlock(L, sk) : sb) || noAp, cost: '1', cls: 'small', tip: 'skill:' + (sk || 'fund') }),
    `${L.sword.styleChosen ? STYLES.map(st => skillMini(L, st.id)).join('') + `<p class="note">${icon('info')}${hasFlag(L, 'noStylePenalty') ? 'You train every style at full speed.' : 'Styles other than your primary train at 70% speed.'}</p>`
      : `<div class="smini${sb ? ' locked' : ''}"><div class="sm-name"><b data-tip="skill:fund">Fundamentals</b></div><div class="sm-prog">${bar(Math.min(L.sword.fund, 450), 450, 'xp')}<span class="num">${fmt(L.sword.fund)} XP</span></div><div class="sm-acts">${btn('Practice', 'sword', { data: { k: '' }, disabled: !!sb || noAp, cost: '1', cls: 'small' })}</div>${sb ? `<small class="sm-why">${icon('lock')}${esc(sb)}</small>` : ''}</div><p class="note">${icon('info')}Fundamentals carry over to the style you choose at ${styleAge()}.</p>`}
    ${fullPage('sword', 'Full Swordsmanship page')}`, L.sword.styleChosen && bestSword(L) > bestMagic(L));
  // aura
  const ab = auraBlock(L), st = L.aura.stage, next = AURA_CAP[Math.min(6, st + 1)];
  const aura = subAcc('ovc.aura', 'flame', 'Battle Aura', L.aura.compat <= 0 && L.aura.known ? 'Cannot awaken' : AURA_STAGES[st],
    btn('Train', 'aura', { data: {}, disabled: !!ab || noAp, cost: '1', cls: 'small', tip: 'aura:' + st }),
    `<div class="meter-row"><span data-tip="aura:${st}">${esc(AURA_STAGES[st])}</span>${bar(L.aura.cap, st >= 6 ? (L.aura.cap || 1) : next, 'aura')}<b class="num">${fmt(L.aura.cap)}${st < 6 ? ' / ' + fmt(next) : ''}</b></div>
    ${auraTimeline(L)}
    <div class="actrow"><div><b>Train your aura</b><small>${L.aura.compat <= 0 && L.aura.known ? 'Your body cannot carry aura, but training still builds strength.' : 'Conditioning, sparring, and breathing drills.'}</small></div>${btn('Train', 'aura', { disabled: !!ab || noAp, cost: '1' })}</div>${why(ab)}${fullPage('aura', 'Full Battle Aura page')}`, false);
  // body and mind
  const restFirst = L.stress >= 30 || L.hp < maxHp(L) * .6;
  const body = subAcc('ovc.body', 'fist', 'Body and Mind', `Health ${Math.round(L.hp)} · Stress ${Math.round(L.stress)}`,
    restFirst ? btn('Rest', 'rest', { disabled: noAp, cost: '1', cls: 'small', tip: 'term:stress' }) : btn(L.age < 2 ? 'Babble' : 'Study', 'study', { disabled: noAp, cost: '1', cls: 'small', tip: 'term:reading' }),
    `<div class="meter-row"><span data-tip="term:hp">Health</span>${bar(L.hp, maxHp(L), 'hp')}<b class="num">${Math.round(L.hp)} / ${maxHp(L)}</b></div>
    <div class="meter-row"><span data-tip="term:stress">Stress</span>${bar(L.stress, 100, 'stress')}<b class="num">${Math.round(L.stress)}</b></div>
    <div class="actrow"><div><b>Train your body</b><small>Strength and Agility.</small></div>${btn('Train', 'body', { disabled: noAp, cost: '1' })}</div>
    <div class="actrow"><div><b>${L.age < 2 ? 'Listen and babble' : 'Study'}</b><small>${L.age < 2 ? 'Your first words come from listening.' : 'Reading and Intelligence.'}</small></div>${btn(L.age < 2 ? 'Babble' : 'Study', 'study', { disabled: noAp, cost: '1' })}</div>
    <div class="actrow calm"><div><b>Rest</b><small>About −22 stress and +12 health. Calm, healthy years grant extra actions.</small></div>${btn('Rest', 'rest', { disabled: noAp, cost: '1' })}</div>
    <div class="attrs mini">${['str', 'agi', 'int', 'cha'].map(k => `<div class="attr" data-tip="stat:${k}"><span><i class="st-ic sm">${icon(STAT_IC[k])}</i>${STAT_FULL[k]}</span>${bar(L.st[k], 20, 'gold')}<b class="st-v num">${whole(L.st[k])}</b></div>`).join('')}</div>
    ${fullPage('body', 'Full Body and Mind page')}`, false);
  return mana + magic + sword + aura + body;
}
function socialHub(L) {
  const live = L.people.filter(p => p.alive);
  const famRoles = ['mother', 'father', 'guardian', 'twin', 'sibling', 'spouse', 'partner', 'child', 'grandchild', 'descendant'];
  const fam = L.people.filter(p => famRoles.includes(p.role) && (p.alive || ['mother', 'father', 'spouse', 'child'].includes(p.role)));
  const rel = live.filter(p => ['friend', 'rival', 'other', 'ex'].includes(p.role));
  const men = live.filter(p => ['mentor', 'student', 'party'].includes(p.role));
  const adult = L.age >= Math.max(18, RACE[L.race].coming);
  const list = (arr, empty) => arr.length ? `<div class="stack">${arr.map(p => personAcc(L, p)).join('')}</div>` : `<p class="empty">${empty}</p>`;
  const noSp = L.sp <= 0;
  const meet = `<div class="btn-row">${btn('Make a friend', 'meet', { data: { k: 'friend' }, disabled: noSp || L.age < 3, cost: '1', costIcon: false, cls: 'small', icon: 'people' })}${adult ? btn('Look for love', 'meet', { data: { k: 'love' }, disabled: noSp, cost: '1', costIcon: false, cls: 'small', icon: 'heart' }) : ''}${L.guild.reg ? btn('Meet adventurers', 'meet', { data: { k: 'adventurer' }, disabled: noSp, cost: '1', costIcon: false, cls: 'small', icon: 'shield' }) : ''}</div>`;
  const best = (arr) => { const b = arr.filter(p => p.alive).sort((a, c) => c.op - a.op)[0]; return b ? `closest: ${esc(b.name)}` : ''; };
  return `<p class="hub-note">${icon('info')}<span>Open anyone to talk, train, gift, or spend time. Each costs a social point${noSp ? '. You have none left this year.' : `; you have <b>${L.sp}</b> left this year.`}</span></p>` +
    subAcc('ovs.family', 'home', 'Family', [`${fam.filter(p => p.alive).length} living`, best(fam)].filter(Boolean).join(' · '), '', list(fam, 'You were raised without a family.') + fullPage('family', 'Full Family page'), L.age < 15) +
    subAcc('ovs.rel', 'people', 'Friends and Rivals', [`${rel.length} ${rel.length === 1 ? 'person' : 'people'}`, best(rel)].filter(Boolean).join(' · '),
      btn('Meet', 'meet', { data: { k: 'friend' }, disabled: noSp || L.age < 3, cost: '1', costIcon: false, cls: 'small', tip: 'term:sp' }), meet + list(rel, 'No friends yet. Meet someone new.') + fullPage('relations', 'Full Relationships page'), L.age >= 15) +
    subAcc('ovs.men', 'hat', 'Mentors, Students, and Party', men.length ? `${men.length} ${men.length === 1 ? 'person' : 'people'}` : 'None yet', '', list(men, 'No mentor, student, or party member yet. Hire a tutor in Education, or register at the Adventurer Guild.') + fullPage('mentors', 'Full Mentors and Party page'), false);
}
const NEWS_VER = 10;
function newsCard(L) {
  if ((META.newsSeen || 0) >= NEWS_VER) return '';
  const it = (ic, t, d, a, data) => `<li>${icon(ic)}<span><b>${t}</b> ${d}</span>${a ? `<button class="link" data-a="${a}"${Object.entries(data || {}).map(([k, v]) => ` data-${k}="${v}"`).join('')}>Open ${icon('chev')}</button>` : ''}</li>`;
  return `<section class="guide news"><div class="guide-h">${icon('sparkle')}<b>New in this version</b><button class="link" data-a="newsdone">Got it, hide this</button></div>
    <ul class="news-l">${it('mirror', 'Portraits reborn.', 'Painted faces, 14 real hairstyles, and Looks you can see. The beautiful shine and sparkle, plain faces look plain.', 'sheet', { type: 'profile' })}
    ${it('people', 'Genetics.', 'Your parents’ blood shifts your coloring, features and Looks at birth, and your children take after you and your partner.', '', null)}
    ${it('sword', 'Scars and age.', 'Hard fights can leave scars, a lost eye means a patch, and the years bring silver hair and laugh lines.', '', null)}
    ${it('sparkle', 'The barber and the bathhouse.', 'Change your hairstyle any time from your profile. Grooming in town gives Looks a small, lasting lift.', 'sheet', { type: 'barber' })}
    ${it('target', 'Year Plan.', 'Queue your training once and leftover actions spend themselves when you age up.', 'sheet', { type: 'plan' })}</ul></section>`;
}
function guideCard(L) {
  if (META.settings.guideDone || L.age > 20) return '';
  return `<section class="guide"><div class="guide-h">${icon('compass')}<b>How a year works</b><button class="link" data-a="guidedone">Got it, hide this</button></div>
    <ol><li><b>Spend actions</b> <i class="dia"></i> on training in <em>Cultivation</em>. Calm, healthy years give extra actions.</li>
    <li><b>Spend social points</b> <i class="dia sp"></i> on people in <em>Social Life</em>: talk, train together, give gifts.</li>
    <li><b>Hover</b> any trait, skill, rank, or number for a full explanation. On a phone, tap it.</li>
    <li><b>Age Up</b> when you are done (or press Space). Story events arrive as titled cards with choices.</li></ol></section>`;
}

/* ---------- PAGE DEFINITIONS ---------- */
const PAGES = {
  overview: { title: 'Overview', lede: (L) => `${lifeStage(L)}. ${L.age === 0 ? 'Your story begins.' : 'The year ahead is yours to shape.'}`, render(L) {
    const C = counsel(L);
    const active = ARCS.map(a => ({ a, s: arcStatus(L, a) })).filter(x => x.s.stage > 0 && !x.s.done && !x.s.closed);
    const doneArcs = ARCS.filter(a => arcStatus(L, a).done);
    const latent = ARCS.filter(a => arcStatus(L, a).stage === 0 && arcCanBegin(L, a)).slice(0, 3);
    const goals = GOALS.filter(g => !(L.goalsDone || []).includes(g.id)).map(g => { let r = [0, 1]; try { r = g.check(L); } catch (e) {} return { g, f: r[1] ? r[0] / r[1] : 0 }; }).sort((x, y) => y.f - x.f).slice(0, 5);
    const job = L.job ? JOB[L.job.id] : null; const sp = L.spouse && person(L, L.spouse), pt = L.partner && person(L, L.partner);
    const cultSum = bestRankAll(L) ? `Best rank: ${RANKS[bestRankAll(L)]}` : (L.ap > 0 ? `${L.ap} action${L.ap === 1 ? '' : 's'} to spend` : 'All actions spent');
    return `${pendingBanner(L)}${guideCard(L) || newsCard(L)}${apStrip(L)}${yearReview(L)}${worldStrip(L)}
    ${acc('ov.cult', 'Cultivation', cultivationHub(L), { open: true, icon: 'flame', sum: cultSum, cls: 'hub' })}
    ${acc('ov.social', 'Social Life', socialHub(L), { open: true, icon: 'people', sum: `${L.sp} social point${L.sp === 1 ? '' : 's'} left`, cls: 'hub' })}
    ${acc('ov.counsel', 'Counsel for the Year', `<ul class="counsel">${C.map(c => `<li>${icon(c.icon)}<span>${esc(c.t)}</span>${c.page ? `<button class="link" data-a="page" data-v="${c.page}">${esc(NAV_OF[c.page].name)} ${icon('chev')}</button>` : ''}</li>`).join('')}</ul>`, { open: true, icon: 'feather', sum: `${C.length} note${C.length === 1 ? '' : 's'}` })}
    ${acc('ov.story', 'The Story So Far', `${active.length ? `<div class="arcs-mini">${active.map(({ a, s }) => `<div class="arcm"><span class="arcm-k">${esc(a.name)}</span><b>Chapter ${ROMANS[s.stage + 1]}: ${esc(s.next[0])}</b><small>${esc(s.next[1])}</small></div>`).join('')}</div>` : '<p class="muted">No story is underway yet. Turning points arrive with time, place, and the choices you make.</p>'}
      ${doneArcs.length ? `<p class="lbl">Completed</p><div class="chips">${doneArcs.map(a => `<span class="tagc on" data-tip="arc:${a.id}">${esc(a.name)}</span>`).join('')}</div>` : ''}
      ${latent.length ? `<p class="lbl">Stories that could begin</p><ul class="latent">${latent.map(a => `<li data-tip="arc:${a.id}"><b>${esc(a.name)}</b><span>${esc(a.chapters[0][1])}</span></li>`).join('')}</ul>` : ''}
      <div class="btn-row">${btn('All story arcs', 'page', { data: { v: 'arcs' }, cls: 'ghost small', icon: 'flag' })}</div>`, { open: true, icon: 'flag', sum: active.length ? `${active.length} underway` : 'None underway' })}
    ${acc('ov.goals', 'Goals Within Reach', `${goals.map(x => goalRow(L, x.g)).join('')}<div class="btn-row">${btn('All goals', 'page', { data: { v: 'goals' }, cls: 'ghost small', icon: 'target' })}</div>`, { open: false, icon: 'target', sum: `${(L.goalsDone || []).length} of ${GOALS.length} complete` })}
    ${acc('ov.windows', 'Growth Windows', `<p class="lbl">Mana capacity</p>${manaTimeline(L)}${L.aura.compat > 0 || !L.aura.known ? `<p class="lbl">Battle Aura</p>${auraTimeline(L)}` : '<p class="muted">Your body cannot carry Battle Aura.</p>'}${!L.sword.styleChosen ? `<p class="note">${icon('sword')}You choose a sword style at age ${styleAge()}.</p>` : ''}`, { open: false, icon: 'hourglass' })}
    ${acc('ov.standing', 'Standing in the World', `<dl class="kv cols">
      <div><dt data-tip="term:fame">Fame</dt><dd>${FAME_NAMES[fameTier(L.fame)]} <span class="num muted">${fmt(L.fame)}</span></dd></div>
      <div><dt data-tip="term:power">Combat power</dt><dd class="num">${power(L)}</dd></div>
      <div><dt>Gold</dt><dd class="num">${fmt(L.gold)}</dd></div>
      <div><dt data-tip="term:funds">Family funds</dt><dd class="num">${fmt(L.family.funds)}</dd></div>
      <div><dt>Occupation</dt><dd>${job ? `<span data-tip="job:${job.id}">${esc(job.ladder[L.job.lvl])}</span>` : 'None'}</dd></div>
      <div><dt>Schooling</dt><dd>${L.edu.school ? `<span data-tip="school:${L.edu.school}">${esc(SCHOOL[L.edu.school].name)}</span>` : L.edu.done.length ? 'Graduated' : 'None'}</dd></div>
      <div><dt data-tip="term:guild">Guild</dt><dd>${L.guild.reg ? 'Rank ' + GUILD_RANKS[L.guild.rank] : 'Unregistered'}</dd></div>
      <div><dt>Residence</dt><dd>${L.gear.home ? esc(ITEM[L.gear.home].name) : (L.age < 15 ? 'Family home' : 'None')}</dd></div>
      <div><dt>${sp ? 'Spouse' : 'Partner'}</dt><dd>${sp ? esc(sp.name) : pt ? esc(pt.name) : '—'}</dd></div>
      <div><dt>Children</dt><dd class="num">${L.people.filter(p => p.role === 'child').length}</dd></div>
      <div><dt>Epithet</dt><dd>${L.epithet ? '“' + esc(L.epithet) + '”' : '—'}</dd></div>
      <div><dt>Continents</dt><dd class="num">${L.visited.length} of 5</dd></div></dl>`, { open: false, icon: 'scales' })}`;
  } },
  journal: { title: 'Journal', lede: 'Every year of your life, in your own hand.', render(L) {
    const f = UI.logF; const seg = [['all', 'Everything'], ['story', 'Story'], ['deeds', 'Deeds'], ['acts', 'Daily life']];
    return `${acc('jr.chart', 'Your Life in Numbers', lifeStats(L), { open: true, icon: 'chart', sum: `Age ${L.age}` })}${acc('jr.mile', 'Milestones', memoriesHtml(L), { open: false, icon: 'feather', sum: `${(L.mile || []).length} so far` })}<div class="segs">${seg.map(s => `<button class="${f === s[0] ? 'on' : ''}" data-a="logf" data-v="${s[0]}">${s[1]}</button>`).join('')}</div><div class="journal">${logHtml(L, f)}</div>`;
  } },
  arcs: { title: 'Story Arcs', lede: 'The turning points of your life, as they echo the great tales of this world.', render(L) {
    return ARCS.map(a => { const s = arcStatus(L, a); const n = a.chapters.length;
      const sum = s.done ? 'Complete' : s.closed ? 'Closed' : s.stage ? `Chapter ${ROMANS[s.stage]} of ${ROMANS[n]}` : 'Not begun';
      const ach = ACHIEVEMENTS.find(x => x.id === 'arc_' + a.id || (a.id === 'labyrinth' && x.id === 'arc_labyrinth') || (a.id === 'displaced' && x.id === 'displaced'));
      const rows = a.chapters.map((ch, i) => {
        const state = s.done || i < s.stage ? 'done' : (!s.closed && i === s.stage) ? 'next' : 'future';
        return `<li class="${state}"><span class="ch-n">${ROMANS[i + 1]}</span><div><b>${state === 'future' ? 'Unwritten' : esc(ch[0])}</b>${state === 'next' ? `<small>${esc(ch[1])}</small>` : ''}</div>${state === 'done' ? icon('check') : ''}</li>`;
      }).join('');
      return acc('arc.' + a.id, esc(a.name), `<p class="lede-s">${esc(a.blurb)}</p><ol class="chapters">${rows}</ol>${s.closed ? '<p class="note">This chapter of your life closed before the story could finish.</p>' : ''}${ach ? `<p class="reward-line">Completing it: <span data-tip="ach:${ach.id}">${esc(ach.name)}</span> ${rwTags(RW[ach.rw])}</p>` : ''}`, { open: s.stage > 0 && !s.done && !s.closed, sum, badge: s.done ? icon('check') : '', badgeCls: 'ok' });
    }).join('');
  } },
  goals: { title: 'Goals', lede: 'Ambitions for this life. Each pays Legacy Points, gold, or experience the moment you reach it.', render(L) {
    const groups = [...new Set(GOALS.map(g => g.grp))];
    const done = (L.goalsDone || []).length;
    return `<p class="summary-line"><b class="num">${done}</b> of ${GOALS.length} goals complete this life</p>` + groups.map((grp, i) => { const gs = GOALS.filter(g => g.grp === grp); const d = gs.filter(g => (L.goalsDone || []).includes(g.id)).length;
      return acc('goals.' + grp, grp, gs.map(g => goalRow(L, g)).join(''), { open: i < 2, sum: `${d} / ${gs.length}` }); }).join('');
  } },
  achievements: { title: 'Achievements', lede: 'Deeds remembered across every life you live. Each pays out once, the first time.', render(L) {
    const n = ACHIEVEMENTS.filter(a => META.ach[a.id]).length; const cats = [...new Set(ACHIEVEMENTS.map(a => a.cat))];
    const lpGot = ACHIEVEMENTS.filter(a => META.ach[a.id]).reduce((t, a) => t + (RW[a.rw] || RW.s).lp, 0), lpAll = ACHIEVEMENTS.reduce((t, a) => t + (RW[a.rw] || RW.s).lp, 0);
    const head = `<div class="ach-head"><div class="ach-tot"><small>Unlocked across all your lives</small><b class="num">${n}<i> of ${ACHIEVEMENTS.length}</i></b>${bar(n, ACHIEVEMENTS.length, 'ach')}<p>${fmt(lpGot)} of ${fmt(lpAll)} base Legacy Points claimed${L ? ` · ${L.achLife.length} this life` : ''}</p></div>
      <div class="ach-cats">${cats.map(c => { const as = ACHIEVEMENTS.filter(a => a.cat === c); const got = as.filter(a => META.ach[a.id]).length; return `<button class="ach-cat${got === as.length ? ' full' : ''}" data-a="jumpacc" data-v="ach.${c}">${icon(ACH_CAT_IC[c] || 'trophy')}<span><b>${esc(c)}</b><small class="num">${got} / ${as.length}</small></span>${bar(got, as.length, 'ach')}</button>`; }).join('')}</div></div>`;
    return head + cats.map((c, i) => { const as = ACHIEVEMENTS.filter(a => a.cat === c); const got = as.filter(a => META.ach[a.id]).length;
      return acc('ach.' + c, c, as.map(a => { const g = META.ach[a.id]; const tl = L && L.achLife.includes(a.id);
        return `<div class="achv${g ? ' got' : ''}"><span class="a-ic">${icon(g ? 'trophy' : 'lock')}</span><div class="a-main"><b data-tip="ach:${a.id}">${esc(a.name)}</b><small>${esc(a.desc)}</small></div><div class="a-rw">${rwTags(RW[a.rw])}${tl ? '<span class="tagc on">This life</span>' : ''}</div></div>`; }).join(''), { open: i < 2, sum: `${got} / ${as.length}`, icon: ACH_CAT_IC[c] || 'trophy' }); }).join('');
  } },
  mana: { title: 'Mana', lede: 'The well every spell draws from. It grows fastest in early childhood, and almost never after.', render(L) {
    const ph = manaPhase(L), mb = manaBlock(L), pot = L.mana.revealed ? potGrade(L.mana.pot) : 'Hidden';
    return `${apStrip(L)}
    ${acc('mana.cap', 'Mana Capacity', `<div class="bignum"><span class="num" data-tip="mana:cap">${fmt(L.mana.cap)}</span><small>${ph === 1 ? 'Critical growth window' : ph === 2 ? 'Second growth window' : 'Capacity is fixed'}</small></div>
      ${manaTimeline(L)}
      <dl class="kv cols"><div><dt data-tip="mana:pot">Potential</dt><dd>${pot}</dd></div><div><dt>Next Saint gate</dt><dd class="num">${L.mana.cap >= 600 ? 'Met' : fmt(600)}</dd></div></dl>
      <div class="actrow"><div><b>Practice safely</b><small>Steady growth with no risk. Builds a little control.</small></div>${btn('Practice', 'mana', { data: { push: 0 }, disabled: !!mb || L.ap <= 0, cost: '1' })}</div>
      <div class="actrow warn"><div><b>Push to exhaustion</b><small>About 80% more growth, but you collapse afterward and lose health. Repeated pushes in one year hurt more.</small></div>${btn('Push', 'mana', { data: { push: 1 }, disabled: !!mb || L.ap <= 0, cost: '1', cls: 'danger' })}</div>${why(mb)}`, { open: true, icon: 'drop', sum: fmt(L.mana.cap) })}
    ${acc('mana.ctrl', 'Control and Efficiency', `<div class="meter-row"><span data-tip="mana:ctrl">Control</span>${bar(L.mana.ctrl, 100, 'mana')}<b class="num">${Math.round(L.mana.ctrl)}</b></div>
      <div class="meter-row"><span data-tip="mana:eff">Efficiency</span>${bar(L.mana.eff, 100, 'mana')}<b class="num">${Math.round(L.mana.eff)}</b></div>
      <div class="meter-row"><span data-tip="mana:chant">Chantless casting</span>${L.mana.chantless ? '<b class="ok">Discovered</b>' : bar(L.mana.chant, 100, 'gold') + `<b class="num">${Math.round(L.mana.chant)}%</b>`}</div>
      <p class="note">${icon('info')}Control and efficiency keep improving for life. Chantless casting is all but impossible to discover after childhood.</p>`, { open: true, icon: 'sparkle' })}
    ${acc('mana.about', 'On the Nature of Mana', `<p>${esc(MANA_DESC.cap)}</p><p>${esc(MANA_DESC.pot)}</p><p>${esc(MANA_DESC.chant)}</p>`, { open: false, icon: 'book' })}`;
  } },
  magic: { title: 'Magic', lede: 'Nine schools, seven ranks. Saint and above must be earned through trials.', render(L) {
    const g = (ids) => ids.map(k => skillRow(L, k)).join('');
    const best = (ids) => { const r = Math.max(...ids.map(k => rankOf(L, k))); return r ? 'Best: ' + RANKS[r] : 'Untrained'; };
    return `${apStrip(L)}
    ${acc('magic.attack', 'Attack Magic', g(['fire', 'water', 'earth', 'wind']), { open: true, icon: 'flame', sum: best(['fire', 'water', 'earth', 'wind']) })}
    ${acc('magic.holy', 'Holy Magic', g(['heal', 'barrier', 'detox']), { open: true, icon: 'heart', sum: best(['heal', 'barrier', 'detox']) })}
    ${acc('magic.special', 'Summoning and Gravity', g(['summon', 'gravity']), { open: L.age >= 10, icon: 'star', sum: best(['summon', 'gravity']) })}
    ${acc('magic.ranks', 'The Seven Ranks', `<ol class="ranks">${RANKS.slice(1).map((r, i) => `<li>${rankBadge(i + 1)}<span>${esc(RANK_DESC[i + 1])}</span><small class="num">${fmt(RANK_XP[i + 1])} XP${i + 1 >= 4 ? ' + trial' : ''}</small></li>`).join('')}</ol>`, { open: false, icon: 'crown' })}`;
  } },
  sword: { title: 'Swordsmanship', lede: 'Three great schools divide the world’s swordsmen: the Sword God, the Water God, and the North God.', render(L) {
    const sb = swordBlock(L, null);
    const fund = `<div class="skill"><div class="skill-main"><div class="skill-name"><b data-tip="skill:fund">Fundamentals</b></div><div class="skill-prog">${bar(Math.min(L.sword.fund, 450), 450, 'xp')}<span class="num">${fmt(L.sword.fund)} XP</span></div><p class="skill-meta">Carries over to the style you choose at ${styleAge()}.</p>${why(sb)}</div><div class="skill-acts">${btn('Practice', 'sword', { data: { k: '' }, disabled: !!sb || L.ap <= 0, cost: '1' })}</div></div>`;
    return `${apStrip(L)}
    ${L.sword.styleChosen ? acc('sword.styles', 'Your Styles', STYLES.map(s => skillRow(L, s.id)).join('') + `<p class="note">${icon('info')}${hasFlag(L, 'noStylePenalty') ? 'You train every style at full speed.' : 'Styles other than your primary train at 70% speed.'}</p>`, { open: true, icon: 'sword', sum: 'Best: ' + RANKS[bestSword(L)] })
      : acc('sword.fund', 'Fundamentals', fund + `<div class="styles-pre">${STYLES.map(s => `<div class="spre" data-tip="style:${s.id}"><b>${s.name}</b><small>${s.phil}</small><p>${esc(s.note)}</p></div>`).join('')}</div>`, { open: true, icon: 'sword', sum: `Style choice at ${styleAge()}` })}
    ${acc('sword.titles', 'Holders of the Sword God Titles', `<ul class="titles">${STYLES.map(s => `<li><span data-tip="style:${s.id}">${s.short} Style</span><b>${esc(META.world.gods[s.id])}</b>${rankOf(L, s.id) >= 6 ? '<em>You may challenge</em>' : ''}</li>`).join('')}</ul><p class="note">${icon('info')}God rank in a style means defeating its current holder in a duel.</p>`, { open: false, icon: 'crown' })}
    ${acc('sword.schools', 'The Three Schools', STYLES.map(s => `<p><b>${s.name}.</b> ${esc(SKILL_DESC[s.id])}</p>`).join(''), { open: false, icon: 'book' })}`;
  } },
  aura: { title: 'Battle Aura', lede: 'The swordsman’s answer to mana: power that flows through the body itself.', render(L) {
    const ab = auraBlock(L), st = L.aura.stage, next = AURA_CAP[Math.min(6, st + 1)];
    const compat = L.aura.compat <= 0 ? (L.aura.known ? 'None' : 'Unknown') : (st > 0 || L.mana.revealed ? potGrade(L.aura.compat) : 'Unknown');
    return `${apStrip(L)}
    ${acc('aura.main', 'Your Aura', `<div class="bignum"><span class="num">${fmt(L.aura.cap)}</span><small>${st < 6 ? `${fmt(next)} needed for ${AURA_STAGES[st + 1]}` : 'Legendary'}</small></div>
      ${bar(L.aura.cap, st >= 6 ? (L.aura.cap || 1) : next, 'aura')}
      <ol class="ladder">${AURA_STAGES.map((a, i) => `<li class="${i < st ? 'past' : i === st ? 'cur' : ''}" data-tip="aura:${i}"><span class="num">${i}</span><b>${a}</b><small class="num">${i ? fmt(AURA_CAP[i]) : ''}</small></li>`).join('')}</ol>
      <dl class="kv cols"><div><dt>Compatibility</dt><dd>${compat}</dd></div><div><dt>Control</dt><dd class="num">${Math.round(L.aura.ctrl)}</dd></div></dl>
      ${auraTimeline(L)}
      <div class="actrow"><div><b>Train your aura</b><small>${L.aura.compat <= 0 && L.aura.known ? 'Your body cannot carry aura, but training still builds strength.' : 'Conditioning, sparring, and breathing drills. Builds capacity during your windows and control after.'}</small></div>${btn('Train', 'aura', { disabled: !!ab || L.ap <= 0, cost: '1' })}</div>${why(ab)}`, { open: true, icon: 'flame', sum: AURA_STAGES[st] })}
    ${acc('aura.about', 'About Battle Aura', AURA_DESC.map((d, i) => `<p><b>${AURA_STAGES[i]}.</b> ${esc(d)}</p>`).join(''), { open: false, icon: 'book' })}`;
  } },
  body: { title: 'Body & Mind', lede: 'Strength, wits, and the stamina to keep going when others stop.', render(L) {
    const stats = ['str', 'agi', 'int', 'cha', 'looks', 'luck'];
    return `${apStrip(L)}
    ${acc('body.train', 'Daily Practice', `
      <div class="actrow"><div><b>Train your body</b><small>Strength and Agility. A sturdy body raises combat power and sword growth.</small></div>${btn('Train', 'body', { disabled: L.ap <= 0, cost: '1' })}</div>
      <div class="actrow"><div><b>${L.age < 2 ? 'Listen and babble' : 'Study'}</b><small>${L.age < 2 ? 'Your first words come from listening.' : 'Reading and Intelligence. Reading unlocks magic study without a tutor.'}</small></div>${btn(L.age < 2 ? 'Babble' : 'Study', 'study', { disabled: L.ap <= 0, cost: '1' })}</div>
      <div class="actrow calm"><div><b>Rest</b><small>About −22 stress and +12 health. Low stress and good health grant extra actions next year.</small></div>${btn('Rest', 'rest', { disabled: L.ap <= 0, cost: '1' })}</div>`, { open: true, icon: 'fist' })}
    ${acc('body.attr', 'Attributes', `<div class="attrs">${stats.map(k => `<div class="attr" data-tip="stat:${k}"><span><i class="st-ic sm">${icon(STAT_IC[k])}</i>${STAT_FULL[k]}</span>${bar(L.st[k], 20, 'gold')}<b class="st-v num">${whole(L.st[k])}</b><small>${esc(STAT_DESC[k])}</small></div>`).join('')}
      <div class="attr" data-tip="term:reading"><span><i class="st-ic sm">${icon('book')}</i>Reading</span>${bar(L.read, 100, 'xp')}<b class="st-v num">${whole(L.read)}</b><small>Literacy and scholarship.</small></div></div>`, { open: true, icon: 'user' })}
    ${acc('body.health', 'Health and Wellness', `<div class="meter-row"><span data-tip="term:hp">Health</span>${bar(L.hp, maxHp(L), 'hp')}<b class="num">${Math.round(L.hp)} / ${maxHp(L)}</b></div>
      <div class="meter-row"><span data-tip="term:stress">Stress</span>${bar(L.stress, 100, 'stress')}<b class="num">${Math.round(L.stress)}</b></div>
      ${L.injuries.length ? `<p class="lbl">Lasting injuries</p><ul class="plain">${L.injuries.map(i => `<li>${esc(cap1(i))}</li>`).join('')}</ul>` : ''}
      <table class="tbl"><thead><tr><th>Wellness</th><th>Health</th><th>Stress</th><th>Bonus</th></tr></thead><tbody><tr${L.well === 1 ? ' class="on"' : ''}><td>Sound</td><td>60%+</td><td>40 or less</td><td>+1 action</td></tr><tr${L.well === 2 ? ' class="on"' : ''}><td>Hale</td><td>80%+</td><td>25 or less</td><td>+2 actions</td></tr><tr${L.well === 3 ? ' class="on"' : ''}><td>Thriving</td><td>92%+</td><td>10 or less</td><td>+3 actions</td></tr></tbody></table>
      <p class="note">${icon('info')}Children gain at most +1 until age 5 and +2 until 14. Wellness is measured when the year begins.</p>`, { open: true, icon: 'heart' })}`;
  } },
  family: { title: 'Family', lede: 'Blood, marriage, and the people who raised you.', render(L) {
    const live = L.people.filter(p => p.alive || ['mother', 'father', 'spouse', 'child'].includes(p.role));
    const by = (roles) => live.filter(p => roles.includes(p.role));
    return `${apStrip(L)}${peopleGroup(L, 'Parents and Guardians', by(['mother', 'father', 'guardian']), 'You were raised without parents.')}${peopleGroup(L, 'Siblings', by(['twin', 'sibling']))}${peopleGroup(L, 'Spouse and Partner', by(['spouse', 'partner']), L.age >= Math.max(18, RACE[L.race].coming) ? 'No one yet. Look for love in Relationships.' : '')}${peopleGroup(L, 'Children', by(['child']))}${peopleGroup(L, 'Grandchildren and Descendants', by(['grandchild', 'descendant']))}`;
  } },
  relations: { title: 'Relationships', lede: 'Friends, rivals, and everyone else whose story crosses yours.', render(L) {
    const live = L.people.filter(p => p.alive);
    const adult = L.age >= Math.max(18, RACE[L.race].coming);
    const meet = `<div class="actrow"><div><b>Make a friend</b><small>Meet someone new in ${TOWN[L.town].name}.</small></div>${btn('Meet', 'meet', { data: { k: 'friend' }, disabled: L.sp <= 0 || L.age < 3, cost: '1', costIcon: false })}</div>
      ${adult ? `<div class="actrow"><div><b>Look for love</b><small>Meet an adult who might become more than a friend.</small></div>${btn('Meet', 'meet', { data: { k: 'love' }, disabled: L.sp <= 0, cost: '1', costIcon: false })}</div>` : ''}
      ${L.guild.reg ? `<div class="actrow"><div><b>Meet adventurers</b><small>Find skilled fighters who might join your party.</small></div>${btn('Meet', 'meet', { data: { k: 'adventurer' }, disabled: L.sp <= 0, cost: '1', costIcon: false })}</div>` : ''}
      ${L.age < 3 ? why('From age 3') : ''}<p class="note">${icon('info')}Meeting people costs social points, not actions. ${adult ? '' : `Dating and marriage open at ${Math.max(18, RACE[L.race].coming)}.`}</p>`;
    const gone = L.people.filter(p => !p.alive && !['mother', 'father', 'spouse', 'child'].includes(p.role));
    return `${apStrip(L)}${acc('rel.meet', 'Meet People', meet, { open: true, icon: 'people' })}
      ${peopleGroup(L, 'Friends', live.filter(p => p.role === 'friend'), 'No friends yet.')}${peopleGroup(L, 'Rivals', live.filter(p => p.role === 'rival'))}${peopleGroup(L, 'Acquaintances', live.filter(p => ['other', 'ex'].includes(p.role)))}
      ${gone.length ? acc('rel.gone', 'Remembered', `<div class="stack">${gone.map(p => personAcc(L, p)).join('')}</div>`, { open: false, icon: 'skull', sum: String(gone.length) }) : ''}`;
  } },
  mentors: { title: 'Mentors & Party', lede: 'Those who teach you, those you teach, and those who fight beside you.', render(L) {
    const live = L.people.filter(p => p.alive);
    const party = live.filter(p => p.role === 'party');
    return `${apStrip(L)}${peopleGroup(L, 'Mentors', live.filter(p => p.role === 'mentor'), 'No mentor yet. Hire a tutor in Education, or ask a skilled friend.')}
      ${peopleGroup(L, 'Students', live.filter(p => p.role === 'student'))}
      ${peopleGroup(L, 'Party', party, L.guild.reg ? 'Your party is empty. Meet adventurers and invite them.' : 'Register at the Adventurer Guild to form a party.')}
      ${party.length ? `<p class="note">${icon('info')}Party strength adds ${Math.round(partyPower(L) * .4 * (1 + (mods(L).party || 0)))} to your combat power.</p>` : ''}`;
  } },
  work: { title: 'Occupation', lede: (L) => `Honest work in ${TOWN[L.town].name}. Pay arrives at the end of each year.`, render(L) {
    let cur = '';
    if (L.job) { const j = JOB[L.job.id]; const pi = promoInfo(L);
      cur = acc('work.job', esc(j.ladder[L.job.lvl]), `<p class="muted">${esc(j.name)} · ${esc(j.cat)} · ${L.job.yrs} year${L.job.yrs === 1 ? '' : 's'} in this role · <b class="num">${fmt(salary(L))}</b> gold a year</p>
        <div class="meter-row"><span>Performance</span>${bar(L.job.perf, 100, 'gold')}<b class="num">${Math.round(L.job.perf)}</b></div>
        <p class="ladder-line">${j.ladder.map((t, i) => `<span class="${i === L.job.lvl ? 'on' : i < L.job.lvl ? 'past' : ''}">${esc(t)}</span>`).join('<i>›</i>')}</p>
        <div class="btn-row">${btn('Work hard', 'workhard', { disabled: L.ap <= 0, cost: '1' })}${pi && !pi.top ? btn('Ask for a promotion', 'promo', { disabled: !pi.ok || L.ap <= 0, cost: '1', cls: 'gold' }) : ''}${btn('Quit', 'confirm', { data: { c: 'quit' }, cls: 'ghost' })}</div>
        ${pi && !pi.top && !pi.ok ? why(pi.reason) : pi && pi.top ? '<p class="note">You have reached the top of this ladder.</p>' : ''}`, { open: true, icon: 'work', sum: fmt(salary(L)) + ' gold / yr' }); }
    const board = L.age < 12 ? `<p class="empty">${icon('lock')}Part-time work opens at 12, full careers at 15.</p>` : L.jobBoard.length ? L.jobBoard.map(id => { const j = JOB[id]; const rq = jobReqs(L, j); const ok = rq.every(x => x.ok);
      return `<div class="row post"><div class="r-main"><b data-tip="job:${id}">${esc(j.ladder[0])}</b><small>${esc(j.name)} · ${esc(j.cat)} · ${fmt(j.pay[0])}–${fmt(j.pay[j.pay.length - 1])} gold a year${j.risk ? ' · dangerous' : ''}</small><ul class="reqs">${rq.map(x => `<li class="${x.ok ? 'ok' : 'no'}">${icon(x.ok ? 'check' : 'close')}${esc(x.l)}</li>`).join('')}</ul></div><div class="r-side">${btn(L.job ? 'Switch' : 'Apply', 'apply', { data: { id }, disabled: !ok, cls: 'small' })}</div></div>`; }).join('') : `<p class="empty">No openings this year. The board refreshes every year, or travel to a bigger town.</p>`;
    return `${apStrip(L)}${cur}${acc('work.board', `Openings in ${TOWN[L.town].name}`, board, { open: true, icon: 'scroll', sum: L.age >= 12 ? `${L.jobBoard.length} posted` : 'Closed' })}`;
  } },
  school: { title: 'Education', lede: 'Schools, tutors, and the great academies of the world.', render(L) {
    let cur = '';
    if (L.edu.school) { const s = SCHOOL[L.edu.school];
      cur = acc('school.cur', esc(s.name), `<p class="muted">${esc(s.note)} ${L.edu.free ? 'Scholarship.' : s.cost ? s.cost + ' gold a year.' : 'Free.'} Year ${L.edu.yrs + 1}${s.years ? ' of ' + s.years : ''}.</p>
        ${s.id === 'ranoa' ? `<p class="lbl">Focus element</p><div class="segs">${['fire', 'water', 'earth', 'wind'].map(e => `<button class="${(L.edu.focus || bestElement(L)) === e ? 'on' : ''}" data-a="focus" data-v="${e}">${MAGIC_ID[e].name}</button>`).join('')}</div>` : ''}
        <p class="note">${icon('info')}Schooling trains you automatically at the end of each year.</p><div class="btn-row">${btn('Leave school', 'confirm', { data: { c: 'leaveschool' }, cls: 'ghost' })}</div>`, { open: true, icon: 'book2', sum: 'Enrolled' }); }
    const ts = tutorStatus(L);
    const tutor = L.age < 15 ? acc('school.tutor', 'Home Tutor', `<p class="muted">60 gold to hire from family funds, then 40 a year. Tutors teach until you turn 14. Family funds: <b class="num">${fmt(L.family.funds)}</b>.</p>
      <div class="chips">${['water', 'fire', 'earth', 'wind', 'heal', 'sg', 'wg', 'ng'].map(k => `<button class="chip" data-a="tutor" data-k="${k}" data-tip="skill:${k}" ${ts.ok ? '' : 'disabled'}>${STYLE[k] ? STYLE[k].short + ' Style' : MAGIC_ID[k].name}</button>`).join('')}</div>${why(ts.ok ? '' : ts.why)}`, { open: true, icon: 'hat' }) : '';
    const list = SCHOOLS.map(s => { const st = schoolStatus(L, s); const isCur = L.edu.school === s.id; const done = L.edu.done.includes(s.id);
      return `<div class="row"><div class="r-main"><b data-tip="school:${s.id}">${esc(s.name)}</b><small>${esc(s.note)} ${s.cost ? s.cost + ' gold a year' : 'Free'}${s.years ? ' · ' + s.years + ' years' : ''} · ages ${s.age[0]}–${s.age[1] > 90 ? 'any' : s.age[1]}</small>${!isCur && !done && !st.ok ? `<small class="r-why">${esc(st.why)}</small>` : ''}</div><div class="r-side">${isCur ? '<span class="tagc on">Enrolled</span>' : done ? '<span class="tagc">Graduated</span>' : btn(st.note || 'Enroll', 'enroll', { data: { id: s.id }, disabled: !st.ok || !!L.edu.school, cls: 'small' })}</div></div>`; }).join('');
    return `${cur}${tutor}${acc('school.list', 'Schools and Academies', list, { open: true, icon: 'castle' })}`;
  } },
  guild: { title: 'Adventurer Guild', lede: 'Quests, ranks from F to S, and the companions who walk into danger with you.', render(L) {
    const gs = guildStatus(L);
    if (!L.guild.reg) return `${apStrip(L)}${acc('guild.reg', 'Registration', `<p>Register to take quests, climb the ranks, and form a party. Registration is free.</p>${btn('Register', 'register', { disabled: !gs.ok, cls: 'primary' })}${why(gs.ok ? '' : gs.why)}`, { open: true, icon: 'shield' })}`;
    const next = L.guild.rank < 6 ? GUILD_PTS[L.guild.rank + 1] : null;
    const party = L.people.filter(p => p.alive && p.role === 'party');
    const board = TOWN[L.town].tags.includes('guild') ? (L.quests.length ? L.quests.map(q => { const p = questChance(L, q); const lab = riskLabel(p);
      return `<div class="row quest r-${lab.toLowerCase()}"><div class="r-main"><b>${esc(q.title)}</b><small>${cap1(q.type)} · ${fmt(q.gold)} gold · ${q.pts} points${q.fame ? ' · fame' : ''}</small><span class="risk">${lab} · ${Math.round(p * 100)}% success</span></div><div class="r-side"><span class="rk g">${GUILD_RANKS[q.rank]}</span>${btn('Take quest', 'quest', { data: { id: q.id }, disabled: L.ap <= 0, cost: '1', cls: 'small' + (p < .3 ? ' danger' : '') })}</div></div>`; }).join('') : '<p class="empty">The board is empty until next year.</p>') : `<p class="empty">${icon('lock')}There is no guild hall in ${TOWN[L.town].name}. Travel to a town with one.</p>`;
    return `${apStrip(L)}
      ${acc('guild.rank', `Rank ${GUILD_RANKS[L.guild.rank]}`, `${next ? `<div class="meter-row"><span>Guild points</span>${bar(L.guild.pts, next, 'gold')}<b class="num">${L.guild.pts} / ${next}</b></div><p class="note">${icon('info')}Rank ${GUILD_RANKS[L.guild.rank + 1]} also needs combat power ${Math.ceil(QUEST_DANGER[L.guild.rank + 1] * 0.75)} (yours: ${power(L)}).</p>` : '<p class="note">S rank. There is nowhere higher.</p>'}`, { open: true, icon: 'shield', sum: `Power ${power(L)}` })}
      ${acc('guild.party', 'Your Party', party.length ? `<ul class="plain">${party.map(p => `<li><span data-tip="person:${p.id}">${esc(p.name)}</span> <span class="muted">· power ${p.power || 10}${p.skill ? ' · ' + RANKS[p.skill.r] + ' ' + (STYLE[p.skill.k] ? STYLE[p.skill.k].short : MAGIC_ID[p.skill.k].name) : ''}</span></li>`).join('')}</ul>` : '<p class="muted">No one yet. Meet adventurers in Relationships and invite them.</p>', { open: false, icon: 'people', sum: `${party.length} of 5` })}
      ${acc('guild.board', 'Quest Board', board, { open: true, icon: 'scroll', sum: `${L.quests.length} posted` })}`;
  } },
  activities: { title: 'Activities', lede: (L) => `Ways to spend a day in ${TOWN[L.town].name}. Each costs one action.`, render(L) {
    const grps = [...new Set(ACTIVITIES.map(a => a.grp))];
    return apStrip(L) + grps.map(g => acc('act.' + g, g, ACTIVITIES.filter(a => a.grp === g).map(a => { const b = activityBlock(L, a.id);
      return `<div class="actrow${b ? ' dim' : ''}"><div><b data-tip="act:${a.id}">${esc(a.name)}</b><small>${esc(a.note)}${b ? ` <span class="r-why">${esc(b)}</span>` : ''}</small></div>${btn('Go', 'activity', { data: { id: a.id }, disabled: !!b || L.ap <= 0, cost: '1' })}</div>`; }).join(''), { open: true, icon: { 'Around town': 'castle', 'Training grounds': 'sword', 'Reflection': 'moon', 'Crafts and charity': 'gem' }[g] || 'sun' })).join('');
  } },
  market: { title: 'Market & Property', lede: (L) => `Shops of ${TOWN[L.town].name}. Selling returns half the price; upgrading trades in your old item automatically.`, render(L) {
    const eq = `<div class="gear-grid">${SLOTS_GEAR.map(([k, n]) => { const id = L.gear[k]; const it = id && ITEM[id];
      return `<div class="gear-slot${it ? '' : ' empty'}"><small class="lbl0">${n}</small><b${it ? ` data-tip="item:${id}"` : ''}>${it ? esc(it.name) : 'Empty'}</b>${it ? btn(it.unique ? 'Put away' : `Sell · ${fmt(sellValue(L, k))} g`, 'sellitem', { data: { slot: k }, cls: 'small ghost' }) : ''}</div>`; }).join('')}</div>`;
    const shops = SLOTS_GEAR.map(([k, n]) => acc('mkt.' + k, { weapon: 'Weaponsmith', staff: 'Mage’s Foci', armor: 'Armorer', trinket: 'Curios and Charms', home: 'Property', mount: 'Stables' }[k], ITEMS.filter(it => it.slot === k && !it.unique).map(it => itemRow(L, it)).join(''), { open: k === 'weapon' || k === 'staff', icon: { weapon: 'sword', staff: 'wand', armor: 'shield', trinket: 'gem', home: 'home', mount: 'map' }[k] })).join('');
    const nW = Object.keys(L.works || {}).length;
    const works = L.age >= 16 ? acc('mkt.works', 'Patronage', `<p class="muted">Great works paid from your own purse. Each one costs an action to oversee, raises your fame, grants a lasting bonus for the rest of this life, and adds to your legacy when it ends. Spending gold here earns more Legacy Points than hoarding it.</p><div class="stack">${WORKS.map(w => workRow(L, w)).join('')}</div>`, { open: L.age >= 18 && L.gold >= 800 && nW < WORKS.length, icon: 'castle', sum: `${nW} of ${WORKS.length} funded` }) : '';
    return `<p class="summary-line">Purse: <b class="num">${fmt(L.gold)}</b> gold${L.age < 15 ? ' · <span class="muted">Children shop with their own coin</span>' : ''}</p>${acc('mkt.gear', 'Your Equipment', eq, { open: true, icon: 'user' })}${works}${shops}`;
  } },
  location: { title: 'Location', lede: (L) => { const t = TOWN[L.town], c = CONT[t.cont].name; return t.realm === c ? `${t.name}, ${c}.` : `${t.realm}, ${c}.`; }, render(L) {
    const t = TOWN[L.town], eb = exploreBlock(L);
    return `${apStrip(L)}
      ${acc('loc.map', 'World Map', worldMap(L, UI.mapSel || L.town) + mapLegend(L) + mapPanel(L, UI.mapSel || L.town), { open: true, icon: 'globe', sum: `${(L.towns || []).length} places visited` })}
      ${acc('loc.news', 'Word from Afar', worldNewsList(L), { open: false, icon: 'scroll', sum: activeWorld(L).length ? `${activeWorld(L).length} active` : `${((META.world || {}).news || []).length} reports` })}
      ${acc('loc.here', esc(t.name), `<p class="place-note">${esc(t.note)}</p><dl class="kv cols"><div><dt>Settlement</dt><dd>${SIZE_NAMES[t.size]}</dd></div><div><dt>Realm</dt><dd>${esc(t.realm)}</dd></div><div><dt>Continent</dt><dd>${CONT[t.cont].name}</dd></div><div><dt>Notable</dt><dd>${t.tags.map(x => TAG_NAMES[x]).filter(Boolean).join(', ') || 'Nothing in particular'}</dd></div></dl>
        <div class="actrow"><div><b>Explore</b><small>Wander the streets and the wilds beyond. Many stories begin with a chance encounter.</small></div>${btn('Explore', 'explore', { disabled: !!eb || L.ap <= 0, cost: '1' })}</div>${why(eb)}
        ${L.flags.displaced ? `<p class="note warn">${icon('alert')}You were scattered here by the Displacement Incident. Fittoa is far away.</p>` : ''}`, { open: true, icon: 'map', sum: SIZE_NAMES[t.size] })}
      ${acc('loc.rumors', 'Talk of the Town', `<ul class="rumors">${rumors(L).slice(0, 4).map(r => `<li>${icon('feather')}<span>${esc(r)}</span></li>`).join('')}</ul>`, { open: true, icon: 'feather' })}
      ${acc('loc.cont', CONT[t.cont].name, `<p>${esc(CONT[t.cont].blurb)}</p><p class="lbl">Settlements</p><ul class="plain">${TOWNS.filter(x => x.cont === t.cont).map(x => `<li><span data-tip="town:${x.id}">${esc(x.name)}</span> <span class="muted">· ${esc(x.realm)}</span>${x.id === L.town ? ' <span class="tagc on">Here</span>' : ''}</li>`).join('')}</ul>`, { open: false, icon: 'globe' })}`;
  } },
  travel: { title: 'Travel', lede: (L) => L.age < 15 && !L.flags.displaced ? 'Children cannot travel alone. The road opens at 15.' : 'Every journey costs one action and some coin. Crossing a sea costs far more.', render(L) {
    const here = TOWN[L.town];
    return `${apStrip(L)}${acc('tr.map', 'Choose a Destination', worldMap(L, UI.mapSel || L.town) + mapPanel(L, UI.mapSel || L.town), { open: true, icon: 'globe', sum: 'Tap any town' })}${L.flags.displaced ? `<p class="note warn">${icon('alert')}You are displaced. Reach any town in Fittoa to finish the journey home.</p>` : ''}` + CONTINENTS.map(c => acc('tr.' + c.id, c.name, `<p class="muted">${esc(c.blurb)}</p>` + TOWNS.filter(t => t.cont === c.id).map(t => { const ti = travelInfo(L, t.id); const isHere = t.id === L.town;
      return `<div class="row${isHere ? ' here' : ''}"><div class="r-main"><b data-tip="town:${t.id}">${esc(t.name)}</b><small>${esc(t.realm)} · ${SIZE_NAMES[t.size]} · ${esc(t.note)}</small></div><div class="r-side">${isHere ? '<span class="tagc on">You are here</span>' : ti.ok ? btn(`Travel · ${ti.cost} g`, 'travel', { data: { id: t.id }, disabled: L.ap <= 0, cost: '1', cls: 'small' }) : `<small class="r-why">${esc(ti.why)}</small>`}</div></div>`; }).join(''), { open: c.id === here.cont, icon: 'globe', sum: L.visited.includes(c.id) ? 'Visited' : '' })).join('');
  } },
  powers: { title: 'Powers & Legends', lede: 'The strongest beings alive, and the names the world remembers.', render(L) {
    const seven = META.world.seven;
    return `${acc('pow.seven', 'The Seven Great Powers', `<ol class="seven">${seven.map(s => `<li class="${s.player ? 'you' : ''}"><span class="seat">${ROMANS[s.seat]}</span><span><b>${esc(s.title)}</b><small>${esc(s.name)}${s.player ? ' · you' : ''}</small></span><span class="num muted">${s.power}</span></li>`).join('')}</ol><p class="note">${icon('info')}Your combat power is ${power(L)}. The seventh seat needs about ${seven[6].power}.</p>`, { open: true, icon: 'crown' })}
      ${acc('pow.titles', 'Sword God Titles', `<ul class="titles">${STYLES.map(s => `<li><span data-tip="style:${s.id}">${s.short} Style</span><b>${esc(META.world.gods[s.id])}</b></li>`).join('')}</ul>`, { open: true, icon: 'sword' })}
      ${acc('pow.legends', 'Legends of Past Lives', META.world.legends.length ? `<ul class="plain">${META.world.legends.slice(0, 12).map(l => `<li><b>${esc(l.name)}</b>${l.epithet ? ` “${esc(l.epithet)}”` : ''} <span class="muted">· Year ${l.year}</span></li>`).join('')}</ul>` : '<p class="muted">No legends yet. Reach international fame and the world will remember you.</p>', { open: false, icon: 'star' })}
      ${acc('pow.you', 'Your Strength', tipHtml('term:power').replace('<div class="tt">', '<div class="tt inline">'), { open: false, icon: 'fist', sum: 'Power ' + power(L) })}`;
  } },
  codex: { title: 'Trait Codex', lede: 'Every trait in the world, from common quirks to the impossible. Rarer traits carry no drawback from Legendary up.', render(L) {
    const f = UI.codexF;
    const tabs = [['yours', 'Yours'], ...TIERS.map(t => [t.id, t.name]), ['earned', 'Earned']];
    let body = '';
    const row = (t) => { const lines = fxLines(t.fx || {}); return `<div class="trow tier-${t.tier}"><i class="gem"></i><div class="t-main"><b data-tip="trait:${t.id}">${esc(t.name)}</b><span class="t-tier">${tierName(t.tier)}</span><p>${esc(TRAIT_LORE[t.id] || '')}</p><div class="mini-fx">${(lines.length ? lines : [{ t: t.up, good: true }, ...(t.down && t.down !== 'None' ? [{ t: t.down, good: false }] : [])]).map(l => `<span class="${l.neutral ? 'n' : l.good ? 'g' : 'b'}">${esc(l.t)}</span>`).join('')}</div></div></div>`; };
    if (f === 'yours') body = L ? `<h3 class="sect">Born traits</h3>${L.traits.map(id => row(TRAIT[id])).join('')}<h3 class="sect">Earned traits</h3>${L.earned.length ? L.earned.map(id => row(TRAIT[id])).join('') : '<p class="empty">None yet. Great deeds earn traits.</p>'}` : '<p class="empty">Begin a life to see your traits here.</p>';
    else if (f === 'earned') body = EARNED_SOURCES.map(e => `<div class="row"><div class="r-main"><b>${e.traits.map(id => `<span data-tip="trait:${id}">${esc(TRAIT[id].name)}</span>`).join(', ')}</b><small>${esc(e.how)}</small></div></div>`).join('');
    else body = TRAITS.filter(t => t.tier === f).map(row).join('');
    return `<div class="segs wrap">${tabs.map(t => `<button class="${f === t[0] ? 'on' : ''}" data-a="codexf" data-v="${t[0]}"${TIER_IDX[t[0]] !== undefined ? ` data-tip="tier:${t[0]}"` : ''}>${t[1]}</button>`).join('')}</div><div class="codex">${body}</div>`;
  } },
  shop: { title: 'Legacy Shop', lede: 'What your soul carries from one life into the next. Every perk applies to every life you begin from now on.', render(L) {
    const f = UI.shopF || 'all';
    const owned = UPGRADES.filter(u => META.upg[u.id]).length;
    const nextBuy = UPGRADES.filter(u => (META.upg[u.id] || 0) < u.max).map(u => upgCost(u)).sort((x, y) => x - y)[0];
    const head = `<div class="shop-head"><div class="lp-big" data-tip="term:lp">${icon('gem')}<b class="num">${fmt(META.lp)}</b><span>Legacy Points</span></div>
      <dl class="shop-stats"><div><dt>Perks owned</dt><dd class="num">${owned} / ${UPGRADES.length}</dd></div><div><dt>Invested</dt><dd class="num">${fmt(upgSpent())} LP</dd></div><div><dt>Cheapest next</dt><dd class="num">${nextBuy !== undefined ? fmt(nextBuy) + ' LP' : 'All owned'}</dd></div></dl></div>
      <p class="note">${icon('info')}Prices run from 25 to 9,999 LP. Perks with several levels cost more for each level. Lives earn Legacy Points for years lived, ranks, fame, wealth, children, and achievements.</p>
      <div class="segs wrap">${[['all', 'All perks'], ['afford', 'Affordable now'], ['owned', 'Owned'], ['new', 'Not yet owned']].map(([k, v]) => `<button class="${f === k ? 'on' : ''}" data-a="shopf" data-v="${k}">${v}</button>`).join('')}</div>`;
    const pass = (u) => { const lv = META.upg[u.id] || 0; if (f === 'owned') return lv > 0; if (f === 'new') return lv === 0; if (f === 'afford') return lv < u.max && META.lp >= upgCost(u, lv); return true; };
    const rowOf = (u) => { const lv = META.upg[u.id] || 0, maxed = lv >= u.max, cost = upgCost(u, lv);
      return `<div class="row upg${lv ? ' own' : ''}${maxed ? ' maxed' : ''}"><div class="r-main"><b data-tip="upg:${u.id}">${esc(u.name)}</b><small>${esc(u.note)}</small></div><div class="r-side">${u.max > 1 ? `<span class="lv" data-tip="upg:${u.id}">${pips(lv, u.max)}</span>` : ''}${maxed ? `<span class="tagc on">${u.max > 1 ? 'Maxed' : 'Owned'}</span>` : btn(`${fmt(cost)} LP`, 'buy', { data: { id: u.id }, disabled: META.lp < cost, cls: 'small gold' + (META.lp >= cost ? ' can' : '') })}</div></div>`; };
    const body = UPG_CATS.map(([id, name, ic, blurb], i) => {
      const us = UPGRADES.filter(u => u.cat === id).sort((x, y) => x.cost - y.cost); const vis = us.filter(pass); if (!vis.length) return '';
      const own = us.filter(u => META.upg[u.id]).length; const can = us.filter(u => (META.upg[u.id] || 0) < u.max && META.lp >= upgCost(u)).length;
      return acc('shop.' + id, name, `<p class="lede-s">${esc(blurb)}</p>${vis.map(rowOf).join('')}`, { open: i < 2 || f !== 'all', icon: ic, sum: `${own} / ${us.length} owned${can ? ` · ${can} affordable` : ''}` });
    }).join('');
    return head + (body || '<p class="empty">Nothing matches this filter yet.</p>') +
      (META.upg.heirloom ? `<p class="note">${icon('gem')}Heirloom: ${META.heirloom ? esc(TRAIT[META.heirloom].name) + ' will try to return in your next birth.' : 'choose it on the death screen.'}</p>` : '');
  } },
  hall: { title: 'Hall of Lives', lede: 'Every life you have lived, remembered, with the families you carried forward.', render(L) { return hallPage(); } },
  settings: { title: 'Settings', lede: 'Make the world look and read the way you like.', render(L) {
    const s = META.settings;
    const opt = (key, val, label) => `<button class="${s[key] === val ? 'on' : ''}" data-a="set" data-k="${key}" data-v="${val}">${label}</button>`;
    const tog = (key, label, sub) => `<button class="toggle${s[key] !== false && s[key] ? ' on' : ''}" data-a="settog" data-k="${key}" role="switch" aria-checked="${!!s[key]}"><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span><i></i></button>`;
    return `${acc('set.look', 'Appearance', `<p class="lbl">Theme</p><div class="segs wrap">${Object.entries(THEMES).map(([k, v]) => opt('theme', k, v)).join('')}</div><p class="lbl">Accent</p><div class="segs wrap">${Object.entries(ACCENTS).map(([k, v]) => `<button class="${s.accent === k ? 'on' : ''}" data-a="set" data-k="accent" data-v="${k}"><i class="sw acc-${k}"></i>${v}</button>`).join('')}</div>`, { open: true, icon: 'sun' })}
      ${acc('set.read', 'Reading', `<p class="lbl">Story typeface</p><div class="segs">${opt('font', 'serif', 'Garamond')}${opt('font', 'sans', 'Sans serif')}</div><p class="lbl">Text weight</p><div class="segs">${opt('weight', 'regular', 'Regular')}${opt('weight', 'bold', 'Bold')}${opt('weight', 'heavy', 'Heavy')}</div><p class="lbl">Text size</p><div class="segs">${opt('size', 's', 'Small')}${opt('size', 'm', 'Medium')}${opt('size', 'l', 'Large')}${opt('size', 'xl', 'Extra large')}</div><p class="lbl">Event text</p><div class="segs">${opt('speed', 'instant', 'Instant')}${opt('speed', 'fast', 'Quick')}${opt('speed', 'normal', 'Storyteller')}</div>`, { open: true, icon: 'book' })}
      ${acc('set.perf', 'Display and Performance', `<p class="lbl">Frame rate</p><div class="segs wrap">${opt('fps', 'off', 'Off: still images')}${opt('fps', '30', '30 fps: battery saver')}${opt('fps', '60', '60 fps: smooth')}${opt('fps', 'max', 'Max: match your screen')}</div>
        <p class="note">${icon('info')}<span>Only the title screen sky and celebration sparks animate continuously. Everything else redraws only when something changes, so it uses almost no power. Lower frame rates save battery on laptops and phones; Off shows still images. Turning Animations off below also stops transitions.</span></p>`, { open: true, icon: 'bolt' })}
      ${acc('set.sound', 'Music and Sound', `<p class="lbl">Music</p><div class="segs wrap">${opt('music', 'off', 'Off')}${opt('music', 'low', 'Soft')}${opt('music', 'med', 'Medium')}${opt('music', 'high', 'Full')}</div><p class="lbl">Sound effects</p><div class="segs wrap">${opt('sfx', 'off', 'Off')}${opt('sfx', 'low', 'Soft')}${opt('sfx', 'med', 'Medium')}${opt('sfx', 'high', 'Full')}</div>
        <p class="note">${icon('info')}<span>The music is composed live in your browser as you play: gentle harp and strings that follow the season you were born in, grow tense in dangerous moments, and turn quiet at the end of a life. It pauses when you switch tabs and uses very little power.</span></p>`, { open: false, icon: 'lute', sum: META.settings.music !== 'off' ? 'Music on' : 'Off' })}
      ${acc('set.play', 'Gameplay', `<div class="toggles">${tog('tips', 'Hover explanations', 'Detailed tooltips on traits, skills, ranks, and more')}${tog('anim', 'Animations', 'Transitions, the title sky, and highlights')}${tog('confirmAge', 'Confirm before aging up')}${tog('autosave', 'Autosave', 'Save after every action')}${tog('adminLock', 'No achievements in admin-edited lives')}</div><div class="btn-row">${btn('Show the how-to-play guide again', 'guideshow', { cls: 'small', icon: 'compass' })}</div>`, { open: true, icon: 'gear' })}
      ${acc('set.saves', 'Saves', `<p class="muted">${cloudLabel()}. ${Store.cloud === 'on' ? 'Your lives follow you to any device signed in to this account.' : 'Export a save code to move your lives to another device.'}</p><div class="btn-row">${btn('Saved lives', 'sheet', { data: { type: 'slots' }, icon: 'book' })}${btn('Export save code', 'sheet', { data: { type: 'export' }, icon: 'scroll' })}${btn('Import', 'sheet', { data: { type: 'import' }, icon: 'scroll' })}</div><div class="btn-row">${btn('Reset all data', 'confirm', { data: { c: 'reset' }, cls: 'danger' })}</div>`, { open: false, icon: 'save' })}
      ${acc('set.keys', 'Keyboard', `<table class="tbl"><tbody><tr><td><kbd>Ctrl</kbd> <kbd>K</kbd> or <kbd>/</kbd></td><td>Quick jump to any page, person, skill, story, or town</td></tr><tr><td><kbd>Space</kbd></td><td>Age up, or open a waiting decision</td></tr><tr><td><kbd>1</kbd>–<kbd>9</kbd></td><td>Choose an option in a story event</td></tr><tr><td><kbd>[</kbd> <kbd>]</kbd></td><td>Previous or next page</td></tr><tr><td><kbd>J</kbd></td><td>Journal</td></tr><tr><td><kbd>Esc</kbd></td><td>Close a window or drawer</td></tr></tbody></table>`, { open: false, icon: 'key' })}`;
  } },
  admin: { title: 'Admin Menu', lede: 'A full console for bending this life and the world. Every change applies at once.', render(L) { return adminPage(L); } },
};
for (const n of NAV_FLAT) if (PAGES[n.id]) PAGES[n.id].group = n.g;
